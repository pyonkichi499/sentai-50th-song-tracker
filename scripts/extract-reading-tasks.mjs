import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const inputPath = process.argv[2] || 'data/songs.json'
const outputJsonPath = process.argv[3] || 'data/reading-tasks.json'
const outputPromptPath = process.argv[4] || 'data/reading-tasks.prompt.txt'

const absInputPath = path.resolve(inputPath)
const absOutputJsonPath = path.resolve(outputJsonPath)
const absOutputPromptPath = path.resolve(outputPromptPath)

if (!fs.existsSync(absInputPath)) {
  console.error(`Input not found: ${absInputPath}`)
  process.exit(1)
}

const songs = JSON.parse(fs.readFileSync(absInputPath, 'utf8'))
if (!Array.isArray(songs)) {
  console.error('songs JSON must be an array')
  process.exit(1)
}

function hasLatin(text) {
  return /[A-Za-z]/.test(String(text ?? ''))
}

function normalizeHiragana(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .toLowerCase()
}

const tasks = songs
  .map((song) => {
    const fields = []
    if (hasLatin(song.songTitle)) {
      fields.push({
        field: 'songTitleReading',
        source: song.songTitle,
        current: song.songTitleReading ?? null,
      })
    }
    if (hasLatin(song.seriesName)) {
      fields.push({
        field: 'seriesNameReading',
        source: song.seriesName,
        current: song.seriesNameReading ?? null,
      })
    }
    if (hasLatin(song.artist)) {
      fields.push({
        field: 'artistReading',
        source: song.artist,
        current: song.artistReading ?? null,
      })
    }

    if (fields.length === 0) {
      return null
    }

    return {
      id: song.id,
      seriesNumber: song.seriesNumber,
      seriesName: song.seriesName,
      fields,
    }
  })
  .filter(Boolean)

const asJson = {
  description:
    'Fill `proposed` with natural hiragana readings. Keep only hiragana/chouon/punctuation as needed.',
  items: tasks.map((task) => ({
    ...task,
    fields: task.fields.map((field) => ({
      ...field,
      proposed: normalizeHiragana(field.current ?? ''),
    })),
  })),
}

const promptLines = [
  '以下のJSONの `proposed` を自然なひらがな読みに修正して返してください。',
  '制約:',
  '- 出力はJSONのみ',
  '- id と field を変更しない',
  '- proposed はひらがな中心で記述（必要なら長音符ーは可）',
  '- 既存の current は参考情報',
  '',
  JSON.stringify(asJson, null, 2),
]

fs.mkdirSync(path.dirname(absOutputJsonPath), { recursive: true })
fs.writeFileSync(absOutputJsonPath, `${JSON.stringify(asJson, null, 2)}\n`)
fs.writeFileSync(absOutputPromptPath, `${promptLines.join('\n')}\n`)

console.log(`Extracted ${tasks.length} reading tasks -> ${absOutputJsonPath}`)
console.log(`Prompt file -> ${absOutputPromptPath}`)
