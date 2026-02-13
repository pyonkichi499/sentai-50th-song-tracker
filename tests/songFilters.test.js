import test from 'node:test'
import assert from 'node:assert/strict'
import {
  countSung,
  filterAndSortSongs,
  uniqueSeriesCount,
} from '../src/lib/songFilters.js'

const songs = [
  {
    id: 'b_ed_1',
    seriesNumber: 2,
    seriesName: 'B戦隊',
    eraBucket: 'reiwa',
    seriesNameReading: 'びーせんたい',
    songTitle: 'Blue Ending',
    songTitleReading: 'ぶるーえんでぃんぐ',
    songType: 'ED',
    songNumber: 1,
    artist: 'Singer B',
    artistReading: 'しんがーびー',
    variant: null,
    year: 2002,
    sung: false,
  },
  {
    id: 'a_op_1',
    seriesNumber: 1,
    seriesName: 'A戦隊',
    eraBucket: 'showa',
    seriesNameReading: 'えーせんたい',
    songTitle: 'Alpha Opening',
    songTitleReading: 'あるふぁおーぷんにんぐ',
    songType: 'OP',
    songNumber: 1,
    artist: 'Singer A',
    artistReading: 'しんがーえー',
    variant: null,
    year: 2001,
    sung: true,
  },
  {
    id: 'a_ed_1',
    seriesNumber: 1,
    seriesName: 'A戦隊',
    eraBucket: 'showa',
    seriesNameReading: 'えーせんたい',
    songTitle: 'Alpha Ending',
    songTitleReading: 'あるふぁえんでぃんぐ',
    songType: 'ED',
    songNumber: 1,
    artist: 'Singer A',
    artistReading: 'しんがーえー',
    variant: '後期',
    year: 2001,
    sung: false,
  },
]

test('filterAndSortSongs filters by sung status', () => {
  const result = filterAndSortSongs({ songs, filter: 'sung', typeFilter: 'all', searchText: '' })
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'a_op_1')
})

test('filterAndSortSongs filters by song type', () => {
  const result = filterAndSortSongs({ songs, filter: 'all', typeFilter: 'ED', searchText: '' })
  assert.equal(result.length, 2)
  assert.equal(result.every((song) => song.songType === 'ED'), true)
})

test('filterAndSortSongs filters by era buckets with multi selection', () => {
  const result = filterAndSortSongs({
    songs,
    filter: 'all',
    typeFilter: 'all',
    eraFilters: ['showa', 'extra'],
    searchText: '',
  })

  assert.deepEqual(
    result.map((song) => song.id),
    ['a_op_1', 'a_ed_1'],
  )
})

test('filterAndSortSongs filters by search text and sorts by series/type/number', () => {
  const result = filterAndSortSongs({ songs, filter: 'all', typeFilter: 'all', searchText: 'a戦隊' })
  assert.deepEqual(
    result.map((song) => song.id),
    ['a_op_1', 'a_ed_1'],
  )
})

test('filterAndSortSongs supports fuzzy match for typos', () => {
  const result = filterAndSortSongs({
    songs,
    filter: 'all',
    typeFilter: 'all',
    searchText: 'alpha openin',
  })

  assert.equal(result.length > 0, true)
  assert.equal(result.some((song) => song.id === 'a_op_1'), true)
})

test('filterAndSortSongs avoids unrelated fuzzy hits for short japanese keyword', () => {
  const result = filterAndSortSongs({
    songs,
    filter: 'all',
    typeFilter: 'all',
    searchText: 'ラッキー',
  })

  assert.deepEqual(result.map((song) => song.id), [])
})

test('filterAndSortSongs matches kana variants (katakana title with hiragana query)', () => {
  const customSongs = [
    {
      id: 'go_onger_op_1',
      seriesNumber: 32,
      seriesName: '炎神戦隊ゴーオンジャー',
      seriesNameReading: 'えんじんせんたいごーおんじゃー',
      songTitle: 'ゴーオンジャー',
      songTitleReading: 'ごーおんじゃー',
      songType: 'OP',
      songNumber: 1,
      artist: '高橋秀幸',
      artistReading: 'たかはしひでゆき',
      variant: null,
      year: null,
      sung: false,
      sungAt: null,
      sungBy: [],
    },
  ]

  const result = filterAndSortSongs({
    songs: customSongs,
    filter: 'all',
    typeFilter: 'all',
    searchText: 'ごーおんじゃー',
  })

  assert.deepEqual(result.map((song) => song.id), ['go_onger_op_1'])
})

test('filterAndSortSongs can match kanji title by generated reading field', () => {
  const customSongs = [
    {
      id: 'denjiman_op_1',
      seriesNumber: 4,
      seriesName: '電子戦隊デンジマン',
      seriesNameReading: 'でんしせんたいでんじまん',
      songTitle: 'ああ電子戦隊デンジマン',
      songTitleReading: 'ああでんしせんたいでんじまん',
      songType: 'OP',
      songNumber: 1,
      artist: '成田賢',
      artistReading: 'なりたけん',
      variant: null,
      year: null,
      sung: false,
      sungAt: null,
      sungBy: [],
    },
  ]

  const result = filterAndSortSongs({
    songs: customSongs,
    filter: 'all',
    typeFilter: 'all',
    searchText: 'でんしせんたい',
  })

  assert.deepEqual(result.map((song) => song.id), ['denjiman_op_1'])
})

test('countSung counts only sung songs', () => {
  assert.equal(countSung(songs), 1)
})

test('uniqueSeriesCount counts unique series keys', () => {
  assert.equal(uniqueSeriesCount(songs), 2)
})

test('filterAndSortSongs can sort by last updated timestamp', () => {
  const withUpdatedAt = [
    { ...songs[0], sungAt: '2026-02-01T10:00:00.000Z' },
    { ...songs[1], sungAt: null },
    { ...songs[2], sungAt: '2026-02-02T10:00:00.000Z' },
  ]

  const result = filterAndSortSongs({
    songs: withUpdatedAt,
    filter: 'all',
    typeFilter: 'all',
    searchText: '',
    sortMode: 'updated',
  })

  assert.deepEqual(
    result.map((song) => song.id),
    ['a_ed_1', 'b_ed_1', 'a_op_1'],
  )
})
