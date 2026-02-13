import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSeriesRecordsFromSongs } from '../scripts/lib/song-data.mjs'

test('buildSeriesRecordsFromSongs creates unique sorted series records', () => {
  const songs = [
    {
      id: 'series_49_op_1',
      seriesId: 'series_49',
      seriesNumber: 49,
      seriesName: 'ナンバーワン戦隊ゴジュウジャー',
      seriesType: 'main',
      eraBucket: 'reiwa',
    },
    {
      id: 'series_1_op_1',
      seriesId: 'series_1',
      seriesNumber: 1,
      seriesName: '秘密戦隊ゴレンジャー',
      seriesType: 'main',
      eraBucket: 'showa',
    },
    {
      id: 'series_1_ed_1',
      seriesId: 'series_1',
      seriesNumber: 1,
      seriesName: '秘密戦隊ゴレンジャー',
      seriesType: 'main',
      eraBucket: 'showa',
    },
  ]

  assert.deepEqual(buildSeriesRecordsFromSongs(songs), [
    {
      id: 'series_1',
      seriesNumber: 1,
      seriesName: '秘密戦隊ゴレンジャー',
      seriesType: 'main',
      eraBucket: 'showa',
    },
    {
      id: 'series_49',
      seriesNumber: 49,
      seriesName: 'ナンバーワン戦隊ゴジュウジャー',
      seriesType: 'main',
      eraBucket: 'reiwa',
    },
  ])
})
