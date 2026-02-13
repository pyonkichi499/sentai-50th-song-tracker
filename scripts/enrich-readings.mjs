import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import kuromoji from 'kuromoji'
import { toHiragana } from 'wanakana'

const inputPath = process.argv[2] || 'data/songs.json'
const outputPath = process.argv[3] || inputPath
const absInput = path.resolve(inputPath)
const absOutput = path.resolve(outputPath)

if (!fs.existsSync(absInput)) {
  console.error(`Input not found: ${absInput}`)
  process.exit(1)
}

function katakanaToHiragana(text) {
  return String(text ?? '').replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  )
}

const ENGLISH_CHAR_TO_HIRAGANA = {
  a: 'えー',
  b: 'びー',
  c: 'しー',
  d: 'でぃー',
  e: 'いー',
  f: 'えふ',
  g: 'じー',
  h: 'えいち',
  i: 'あい',
  j: 'じぇー',
  k: 'けー',
  l: 'える',
  m: 'えむ',
  n: 'えぬ',
  o: 'おー',
  p: 'ぴー',
  q: 'きゅー',
  r: 'あーる',
  s: 'えす',
  t: 'てぃー',
  u: 'ゆー',
  v: 'ぶい',
  w: 'だぶりゅー',
  x: 'えっくす',
  y: 'わい',
  z: 'ぜっと',
}

function englishToHiraganaFallback(text) {
  const heuristicallyRomaji = text
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/tion\b/g, 'shon')
    .replace(/sion\b/g, 'jon')
    .replace(/qu/g, 'kw')
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'kk')
    .replace(/th/g, 's')
    .replace(/l/g, 'r')
    .replace(/v/g, 'b')
    .replace(/er\b/g, 'aa')
    .replace(/ar\b/g, 'aa')
    .replace(/or\b/g, 'oo')
    .replace(/ir\b/g, 'ia')
    .replace(/ur\b/g, 'aa')
    .replace(/\bst/g, 'sut')
    .replace(/\bsp/g, 'sup')
    .replace(/\bsk/g, 'suk')
    .replace(/([^aeioun])\b/g, '$1u')

  const converted = toHiragana(heuristicallyRomaji, { passRomaji: false })
  return converted.replace(/[a-z]/g, (char) => ENGLISH_CHAR_TO_HIRAGANA[char] || '')
}

function forceHiragana(text) {
  const base = katakanaToHiragana(String(text ?? '').normalize('NFKC'))
  if (!/[\p{Script=Latin}]/u.test(base)) {
    return base
  }

  const converted = base.replace(
    /[\p{Script=Latin}0-9][\p{Script=Latin}0-9'._-]*/gu,
    (token) => englishToHiraganaFallback(token),
  )
  return katakanaToHiragana(converted)
}

function buildTokenizer(dicPath) {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((error, tokenizer) => {
      if (error) {
        reject(error)
        return
      }
      resolve(tokenizer)
    })
  })
}

function toReading(text, tokenizer) {
  const source = String(text ?? '').trim()
  if (source === '') {
    return null
  }

  const tokens = tokenizer.tokenize(source)
  const reading = tokens
    .map((token) => {
      if (token.reading && token.reading !== '*') {
        return token.reading
      }
      return token.surface_form || ''
    })
    .join('')

  const normalized = forceHiragana(reading).toLowerCase()
  return normalized || null
}

const raw = fs.readFileSync(absInput, 'utf8')
const songs = JSON.parse(raw)
if (!Array.isArray(songs)) {
  console.error('Input JSON must be an array')
  process.exit(1)
}

const dicPath = path.resolve('node_modules/kuromoji/dict')
if (!fs.existsSync(dicPath)) {
  console.error(`Dictionary not found: ${dicPath}`)
  process.exit(1)
}

const tokenizer = await buildTokenizer(dicPath)
const enriched = songs.map((song) => ({
  ...song,
  songTitleReading: toReading(song.songTitle, tokenizer),
  seriesNameReading: toReading(song.seriesName, tokenizer),
  artistReading: toReading(song.artist, tokenizer),
}))

fs.mkdirSync(path.dirname(absOutput), { recursive: true })
fs.writeFileSync(absOutput, `${JSON.stringify(enriched, null, 2)}\n`)
console.log(`Enriched readings for ${enriched.length} songs -> ${absOutput}`)
