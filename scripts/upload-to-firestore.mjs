import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { buildSeriesRecordsFromSongs, songsFromCsvFile } from './lib/song-data.mjs'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const projectId = process.env.FIREBASE_PROJECT_ID
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const dataPath = args.find((arg) => !arg.startsWith('-')) || 'data/戦隊カラオケリスト.csv'

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
const ext = path.extname(absDataPath).toLowerCase()
const songs =
  ext === '.csv' ? songsFromCsvFile(absDataPath) : JSON.parse(fs.readFileSync(absDataPath, 'utf8'))

if (!Array.isArray(songs) || songs.length === 0) {
  console.error('songs data must be a non-empty array')
  process.exit(1)
}

let batch = db.batch()
let count = 0
let songTotal = 0
let songDeleted = 0
let songCreated = 0
let songUpdated = 0
let seriesDeleted = 0
let seriesCreated = 0
let seriesUpdated = 0
const MAX_BATCH_SIZE = 400

const flushBatch = async () => {
  if (count === 0) {
    return
  }
  if (dryRun) {
    batch = db.batch()
    count = 0
    return
  }
  await batch.commit()
  batch = db.batch()
  count = 0
}

const expectedIds = new Set(songs.map((song) => song.id).filter(Boolean))
const snapshot = await db.collection('songs').get()
const existingSongIds = new Set(snapshot.docs.map((snapshotDoc) => snapshotDoc.id))
snapshot.docs.forEach((snapshotDoc) => {
  if (expectedIds.has(snapshotDoc.id)) {
    return
  }
  batch.delete(snapshotDoc.ref)
  count += 1
  songDeleted += 1
})

await flushBatch()

for (const song of songs) {
  const { id, sung, sungAt, sungBy, ...meta } = song
  if (!id) {
    continue
  }
  const exists = existingSongIds.has(id)
  if (exists) {
    songUpdated += 1
  } else {
    songCreated += 1
  }
  const payload = exists ? meta : { ...meta, sung, sungAt, sungBy }

  const ref = db.collection('songs').doc(id)
  batch.set(ref, payload, { merge: true })
  count += 1
  songTotal += 1

  if (count === MAX_BATCH_SIZE) {
    await flushBatch()
  }
}

const seriesRecords = buildSeriesRecordsFromSongs(songs)
const expectedSeriesIds = new Set(seriesRecords.map((series) => series.id))
const seriesSnapshot = await db.collection('series').get()
const existingSeriesIds = new Set(seriesSnapshot.docs.map((snapshotDoc) => snapshotDoc.id))

seriesSnapshot.docs.forEach((snapshotDoc) => {
  if (expectedSeriesIds.has(snapshotDoc.id)) {
    return
  }
  batch.delete(snapshotDoc.ref)
  count += 1
  seriesDeleted += 1
})

await flushBatch()

for (const series of seriesRecords) {
  const { id, ...payload } = series
  if (!id) {
    continue
  }

  if (existingSeriesIds.has(id)) {
    seriesUpdated += 1
  } else {
    seriesCreated += 1
  }

  const ref = db.collection('series').doc(id)
  batch.set(ref, payload, { merge: true })
  count += 1

  if (count === MAX_BATCH_SIZE) {
    await flushBatch()
  }
}

await flushBatch()

if (dryRun) {
  console.log(
    `[dry-run] songs: create=${songCreated}, update=${songUpdated}, delete=${songDeleted}, totalInput=${songTotal}`,
  )
  console.log(
    `[dry-run] series: create=${seriesCreated}, update=${seriesUpdated}, delete=${seriesDeleted}, totalInput=${seriesRecords.length}`,
  )
} else {
  console.log(
    `Synced Firestore project ${projectId}: songs(created ${songCreated}, updated ${songUpdated}, deleted ${songDeleted}), series(created ${seriesCreated}, updated ${seriesUpdated}, deleted ${seriesDeleted})`,
  )
}
