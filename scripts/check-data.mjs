import fs from 'node:fs'
import path from 'node:path'
import { songsFromCsvFile } from './lib/song-data.mjs'

const filePath = process.argv[2] || 'data/戦隊カラオケリスト.csv'
const absPath = path.resolve(filePath)

if (!fs.existsSync(absPath)) {
  console.error(`Data file not found: ${absPath}`)
  process.exit(1)
}

const ext = path.extname(absPath).toLowerCase()
const songs =
  ext === '.csv' ? songsFromCsvFile(absPath) : JSON.parse(fs.readFileSync(absPath, 'utf8'))
if (!Array.isArray(songs)) {
  console.error('songs data must be an array')
  process.exit(1)
}

const ids = new Set()
const duplicatedIds = new Set()

songs.forEach((song) => {
  if (ids.has(song.id)) {
    duplicatedIds.add(song.id)
  }
  ids.add(song.id)
})

console.log(`Total songs: ${songs.length}`)

if (duplicatedIds.size > 0) {
  console.error(`Duplicate IDs: ${Array.from(duplicatedIds).join(', ')}`)
  process.exit(1)
}

console.log('Data check passed')
