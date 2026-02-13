import fs from 'node:fs'
import path from 'node:path'
import { songsFromCsvFile } from './lib/song-data.mjs'

const inputPath = process.argv[2] || 'data/戦隊カラオケリスト.csv'
const outputPath = process.argv[3] || 'data/songs.json'

const absInput = path.resolve(inputPath)
const absOutput = path.resolve(outputPath)

if (!fs.existsSync(absInput)) {
  console.error(`Input not found: ${absInput}`)
  process.exit(1)
}

const songs = songsFromCsvFile(absInput)

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
