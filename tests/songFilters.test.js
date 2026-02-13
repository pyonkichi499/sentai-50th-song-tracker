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
    songTitle: 'Blue Ending',
    songType: 'ED',
    songNumber: 1,
    artist: 'Singer B',
    variant: null,
    year: 2002,
    sung: false,
  },
  {
    id: 'a_op_1',
    seriesNumber: 1,
    seriesName: 'A戦隊',
    songTitle: 'Alpha Opening',
    songType: 'OP',
    songNumber: 1,
    artist: 'Singer A',
    variant: null,
    year: 2001,
    sung: true,
  },
  {
    id: 'a_ed_1',
    seriesNumber: 1,
    seriesName: 'A戦隊',
    songTitle: 'Alpha Ending',
    songType: 'ED',
    songNumber: 1,
    artist: 'Singer A',
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

test('filterAndSortSongs filters by search text and sorts by series/type/number', () => {
  const result = filterAndSortSongs({ songs, filter: 'all', typeFilter: 'all', searchText: 'a戦隊' })
  assert.deepEqual(
    result.map((song) => song.id),
    ['a_ed_1', 'a_op_1'],
  )
})

test('countSung counts only sung songs', () => {
  assert.equal(countSung(songs), 1)
})

test('uniqueSeriesCount counts unique series keys', () => {
  assert.equal(uniqueSeriesCount(songs), 2)
})
