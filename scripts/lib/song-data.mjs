import fs from 'node:fs'

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      const next = line[index + 1]
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }

    current += char
  }

  result.push(current)
  return result.map((item) => item.trim())
}

function pickFirst(row, keys) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim()
    }
  }
  return ''
}

function toNumber(value) {
  const normalized = String(value ?? '').normalize('NFKC').trim()
  if (normalized === '') {
    return null
  }
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

function normalizeSongType(rawType) {
  const normalized = String(rawType ?? '').normalize('NFKC').replace(/\s+/g, '')
  if (normalized.startsWith('OP')) {
    return { songType: 'OP' }
  }
  if (normalized.startsWith('ED')) {
    return { songType: 'ED' }
  }
  return { songType: null }
}

function toSongRecord(row, indexBySeriesType) {
  const seriesNumber = toNumber(pickFirst(row, ['戦隊番号', '番号']))
  const seriesName = pickFirst(row, ['戦隊名', '作品名'])
  const songTitle = pickFirst(row, ['曲名'])
  const rawSongType = pickFirst(row, ['種類', 'OP／ED', 'OP/ED'])
  const { songType } = normalizeSongType(rawSongType)
  const remark = pickFirst(row, ['備考'])

  if (!seriesNumber || !seriesName || !songTitle || !['OP', 'ED'].includes(songType)) {
    return null
  }

  const key = `${seriesNumber}:${songType}`
  const songNumber = (indexBySeriesType.get(key) || 0) + 1
  indexBySeriesType.set(key, songNumber)

  return {
    id: `series_${seriesNumber}_${songType.toLowerCase()}_${songNumber}`,
    seriesNumber,
    seriesName,
    year: null,
    songTitle,
    songType,
    songNumber,
    variant: remark || null,
    artist: pickFirst(row, ['歌手']) || null,
    sung: false,
    sungAt: null,
    sungBy: [],
    videoUrl: null,
  }
}

export function songsFromCsvText(rawText) {
  const lines = String(rawText ?? '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length < 2) {
    return []
  }

  const headers = parseCsvLine(lines[0])
  const indexBySeriesType = new Map()

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line)
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']))
      return toSongRecord(row, indexBySeriesType)
    })
    .filter(Boolean)
}

export function songsFromCsvFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return songsFromCsvText(raw)
}
