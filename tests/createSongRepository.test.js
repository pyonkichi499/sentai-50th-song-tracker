import test from 'node:test'
import assert from 'node:assert/strict'
import { createSongRepository } from '../src/repositories/createSongRepository.js'

const defaultSongs = [
  {
    id: 'a_op_1',
    seriesNumber: 1,
    seriesName: 'A',
    songTitle: 'Song A',
    songType: 'OP',
    songNumber: 1,
    sung: false,
    sungAt: null,
    sungBy: [],
  },
  {
    id: 'a_ed_1',
    seriesNumber: 1,
    seriesName: 'A',
    songTitle: 'Song B',
    songType: 'ED',
    songNumber: 1,
    sung: false,
    sungAt: null,
    sungBy: [],
  },
]

function setup(overrides = {}) {
  const externalHandlers = []
  let persisted = overrides.persisted ?? null
  let published = null

  const repository = createSongRepository({
    defaultSongs,
    loadPersistedSongs: () => persisted,
    savePersistedSongs: (songs) => {
      persisted = songs
    },
    subscribeExternal: (handler) => {
      externalHandlers.push(handler)
      return () => {
        const idx = externalHandlers.indexOf(handler)
        if (idx >= 0) {
          externalHandlers.splice(idx, 1)
        }
      }
    },
    publishExternal: (message) => {
      published = message
    },
    clientId: 'client-1',
    now: () => '2026-02-12T12:00:00.000Z',
    ...overrides,
  })

  return {
    repository,
    getPersisted: () => persisted,
    getPublished: () => published,
    emitExternal(message) {
      externalHandlers.forEach((handler) => handler(message))
    },
  }
}

test('subscribe時に初期データが流れる', () => {
  const { repository } = setup()
  let received = null

  repository.subscribe((songs) => {
    received = songs
  })

  assert.equal(received.length, 2)
  assert.equal(received[0].songTitle, 'Song A')
})

test('persistedデータをマージして初期化する', () => {
  const { repository } = setup({
    persisted: [{ id: 'a_op_1', sung: true, sungAt: 'x', sungBy: ['u'] }],
  })

  let received = null
  repository.subscribe((songs) => {
    received = songs
  })

  assert.equal(received[0].sung, true)
  assert.equal(received[1].sung, false)
})

test('toggleSongで状態を反転し保存・外部配信する', () => {
  const { repository, getPersisted, getPublished } = setup()

  repository.toggleSong('a_op_1')

  const persisted = getPersisted()
  assert.equal(persisted[0].sung, true)
  assert.equal(persisted[0].sungAt, '2026-02-12T12:00:00.000Z')
  assert.deepEqual(persisted[0].sungBy, ['local-user'])

  const published = getPublished()
  assert.equal(published.source, 'client-1')
  assert.equal(Array.isArray(published.songs), true)
})

test('同じ曲を2回toggleすると未歌唱に戻る', () => {
  const { repository, getPersisted } = setup()

  repository.toggleSong('a_op_1')
  repository.toggleSong('a_op_1')

  const persisted = getPersisted()
  assert.equal(persisted[0].sung, false)
  assert.equal(persisted[0].sungAt, null)
  assert.deepEqual(persisted[0].sungBy, [])
})

test('外部更新メッセージを受信したら購読者へ通知する', () => {
  const { repository, emitExternal } = setup()
  let received = null

  repository.subscribe((songs) => {
    received = songs
  })

  emitExternal({
    source: 'other-client',
    songs: [{ id: 'a_ed_1', sung: true, sungAt: 'x', sungBy: ['z'] }],
  })

  assert.equal(received[0].sung, false)
  assert.equal(received[1].sung, true)
})

test('自分由来の外部更新メッセージは無視する', () => {
  const { repository, emitExternal } = setup()
  let received = null

  repository.subscribe((songs) => {
    received = songs
  })

  emitExternal({
    source: 'client-1',
    songs: [{ id: 'a_ed_1', sung: true, sungAt: 'x', sungBy: ['z'] }],
  })

  assert.equal(received[1].sung, false)
})
