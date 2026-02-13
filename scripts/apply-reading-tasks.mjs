import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const songsPath = process.argv[2] || 'data/songs.json'
const tasksPath = process.argv[3] || 'data/reading-tasks.json'
const outputPath = process.argv[4] || songsPath

const absSongsPath = path.resolve(songsPath)
const absTasksPath = path.resolve(tasksPath)
const absOutputPath = path.resolve(outputPath)

if (!fs.existsSync(absSongsPath)) {
  console.error(`Songs file not found: ${absSongsPath}`)
  process.exit(1)
}
if (!fs.existsSync(absTasksPath)) {
  console.error(`Tasks file not found: ${absTasksPath}`)
  process.exit(1)
}

const songs = JSON.parse(fs.readFileSync(absSongsPath, 'utf8'))
const taskData = JSON.parse(fs.readFileSync(absTasksPath, 'utf8'))
if (!Array.isArray(songs)) {
  console.error('songs JSON must be an array')
  process.exit(1)
}
if (!taskData || !Array.isArray(taskData.items)) {
  console.error('tasks JSON must include items array')
  process.exit(1)
}

function normalizeReading(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .toLowerCase()
    .trim()
}

const editableFields = new Set(['songTitleReading', 'seriesNameReading', 'artistReading'])
const updates = new Map()

for (const item of taskData.items) {
  if (!item || typeof item.id !== 'string' || !Array.isArray(item.fields)) {
    continue
  }
  const fieldMap = updates.get(item.id) || {}
  for (const field of item.fields) {
    if (!field || !editableFields.has(field.field)) {
      continue
    }
    const normalized = normalizeReading(field.proposed)
    if (!normalized) {
      continue
    }
    fieldMap[field.field] = normalized
  }
  if (Object.keys(fieldMap).length > 0) {
    updates.set(item.id, fieldMap)
  }
}

let touched = 0
const merged = songs.map((song) => {
  const next = updates.get(song.id)
  if (!next) {
    return song
  }
  touched += 1
  return { ...song, ...next }
})

fs.mkdirSync(path.dirname(absOutputPath), { recursive: true })
fs.writeFileSync(absOutputPath, `${JSON.stringify(merged, null, 2)}\n`)
console.log(`Applied reading updates to ${touched} songs -> ${absOutputPath}`)
