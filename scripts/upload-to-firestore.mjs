import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const projectId = process.env.FIREBASE_PROJECT_ID
const dataPath = process.argv[2] || 'data/songs.json'

if (!projectId) {
  console.error('Set FIREBASE_PROJECT_ID')
  process.exit(1)
}
const absDataPath = path.resolve(dataPath)

if (!fs.existsSync(absDataPath)) {
  console.error(`Data file not found: ${absDataPath}`)
  process.exit(1)
}

if (!getApps().length) {
  if (serviceAccountPath) {
    const absServiceAccountPath = path.resolve(serviceAccountPath)
    if (!fs.existsSync(absServiceAccountPath)) {
      console.error(`Service account file not found: ${absServiceAccountPath}`)
      process.exit(1)
    }

    const serviceAccount = JSON.parse(fs.readFileSync(absServiceAccountPath, 'utf8'))
    initializeApp({
      credential: cert(serviceAccount),
      projectId,
    })
  } else {
    initializeApp({
      credential: applicationDefault(),
      projectId,
    })
  }
}

const db = getFirestore()
const songs = JSON.parse(fs.readFileSync(absDataPath, 'utf8'))

if (!Array.isArray(songs) || songs.length === 0) {
  console.error('songs JSON must be a non-empty array')
  process.exit(1)
}

let batch = db.batch()
let count = 0
let total = 0

for (const song of songs) {
  const { id, ...payload } = song
  if (!id) {
    continue
  }

  const ref = db.collection('songs').doc(id)
  batch.set(ref, payload, { merge: true })
  count += 1
  total += 1

  if (count === 400) {
    await batch.commit()
    batch = db.batch()
    count = 0
  }
}

if (count > 0) {
  await batch.commit()
}

console.log(`Uploaded ${total} song documents to Firestore project ${projectId}`)
