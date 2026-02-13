import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const inputPath = process.argv[2]
const outputPath = process.argv[3] || '.env.local'

if (!inputPath) {
  console.error('Usage: node scripts/firebase-config-to-env.mjs <input-file> [output-file]')
  process.exit(1)
}

const absInputPath = path.resolve(inputPath)
const absOutputPath = path.resolve(outputPath)

if (!fs.existsSync(absInputPath)) {
  console.error(`Input file not found: ${absInputPath}`)
  process.exit(1)
}

const raw = fs.readFileSync(absInputPath, 'utf8')

function extractObjectLiteral(text) {
  const marker = 'firebaseConfig'
  const markerIndex = text.indexOf(marker)

  const startIndex =
    markerIndex === -1 ? text.indexOf('{') : text.indexOf('{', markerIndex)
  if (startIndex === -1) {
    return text.trim()
  }

  let depth = 0
  let inSingle = false
  let inDouble = false
  let inTemplate = false
  let escaped = false

  for (let i = startIndex; i < text.length; i += 1) {
    const char = text[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (!inDouble && !inTemplate && char === "'") {
      inSingle = !inSingle
      continue
    }

    if (!inSingle && !inTemplate && char === '"') {
      inDouble = !inDouble
      continue
    }

    if (!inSingle && !inDouble && char === '`') {
      inTemplate = !inTemplate
      continue
    }

    if (inSingle || inDouble || inTemplate) {
      continue
    }

    if (char === '{') {
      depth += 1
    }

    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return text.slice(startIndex, i + 1)
      }
    }
  }

  return text.trim()
}

function parseFirebaseConfig(text) {
  const objectLiteral = extractObjectLiteral(text)

  try {
    const parsed = vm.runInNewContext(`(${objectLiteral})`, Object.create(null), {
      timeout: 300,
    })

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Parsed value is not an object')
    }

    return parsed
  } catch (error) {
    console.error('Failed to parse firebaseConfig. Paste the Firebase console snippet as-is.')
    console.error(`Details: ${error.message}`)
    process.exit(1)
  }
}

function toEnv(config) {
  const map = [
    ['apiKey', 'VITE_FIREBASE_API_KEY'],
    ['authDomain', 'VITE_FIREBASE_AUTH_DOMAIN'],
    ['projectId', 'VITE_FIREBASE_PROJECT_ID'],
    ['storageBucket', 'VITE_FIREBASE_STORAGE_BUCKET'],
    ['messagingSenderId', 'VITE_FIREBASE_MESSAGING_SENDER_ID'],
    ['appId', 'VITE_FIREBASE_APP_ID'],
  ]

  const lines = ['VITE_DATA_SOURCE=firestore']

  map.forEach(([sourceKey, envKey]) => {
    const value = config[sourceKey] ?? ''
    lines.push(`${envKey}=${JSON.stringify(String(value))}`)
  })

  return `${lines.join('\n')}\n`
}

const config = parseFirebaseConfig(raw)
const envBody = toEnv(config)
fs.writeFileSync(absOutputPath, envBody)

console.log(`Wrote Firebase env config to ${absOutputPath}`)
