import fs from 'node:fs'
import path from 'node:path'

const inputPath = process.argv[2] || 'data/songs.example.csv'
const outputPath = process.argv[3] || 'src/constants/sampleSongs.js'

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      const next = line[i + 1]
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function toSongRecord(row, indexBySeriesType) {
  const seriesNumber = Number(row['戦隊番号'])
  const seriesName = row['戦隊名']
  const songTitle = row['曲名']
  const songType = row['種類']

  if (!seriesNumber || !seriesName || !songTitle || !['OP', 'ED'].includes(songType)) {
    return null
  }

  const key = `${seriesNumber}:${songType}`
  const songNumber = (indexBySeriesType.get(key) || 0) + 1
  indexBySeriesType.set(key, songNumber)

  const seriesSlug = slugify(seriesName) || `series_${seriesNumber}`
  const id = `${seriesSlug}_${songType.toLowerCase()}_${songNumber}`

  return {
    id,
    seriesNumber,
    seriesName,
    year: row['放送年'] ? Number(row['放送年']) : null,
    songTitle,
    songType,
    songNumber,
    variant: row['備考'] || null,
    artist: row['歌手'] || null,
    sung: false,
    sungAt: null,
    sungBy: [],
    videoUrl: null,
  }
}

const absInput = path.resolve(inputPath)
const absOutput = path.resolve(outputPath)

if (!fs.existsSync(absInput)) {
  console.error(`Input not found: ${absInput}`)
  process.exit(1)
}

const raw = fs.readFileSync(absInput, 'utf8').replace(/^\uFEFF/, '')
const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0)

if (lines.length < 2) {
  console.error('CSV must include header and at least one data row')
  process.exit(1)
}

const headers = parseCsvLine(lines[0])
const indexBySeriesType = new Map()

const songs = lines
  .slice(1)
  .map((line) => {
    const values = parseCsvLine(line)
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
    return toSongRecord(row, indexBySeriesType)
  })
  .filter(Boolean)

if (songs.length === 0) {
  console.error('No valid records were generated. Check required columns.')
  process.exit(1)
}

const asJson = path.extname(absOutput).toLowerCase() === '.json'
const output = asJson
  ? `${JSON.stringify(songs, null, 2)}\n`
  : `export const sampleSongs = ${JSON.stringify(songs, null, 2)}\n`
fs.mkdirSync(path.dirname(absOutput), { recursive: true })
fs.writeFileSync(absOutput, output)

console.log(`Generated ${songs.length} songs -> ${absOutput}`)
