import test from 'node:test'
import assert from 'node:assert/strict'
import { classifySeries } from '../scripts/lib/series-meta.mjs'

test('classifySeries returns main/showa for 1-12', () => {
  assert.deepEqual(classifySeries(1), {
    seriesId: 'series_1',
    seriesType: 'main',
    eraBucket: 'showa',
  })
  assert.deepEqual(classifySeries(12), {
    seriesId: 'series_12',
    seriesType: 'main',
    eraBucket: 'showa',
  })
})

test('classifySeries returns expected bucket boundaries', () => {
  assert.deepEqual(classifySeries(13), {
    seriesId: 'series_13',
    seriesType: 'main',
    eraBucket: 'heisei_20c',
  })
  assert.deepEqual(classifySeries(24), {
    seriesId: 'series_24',
    seriesType: 'main',
    eraBucket: 'heisei_20c',
  })
  assert.deepEqual(classifySeries(25), {
    seriesId: 'series_25',
    seriesType: 'main',
    eraBucket: 'heisei_21c',
  })
  assert.deepEqual(classifySeries(42), {
    seriesId: 'series_42',
    seriesType: 'main',
    eraBucket: 'heisei_21c',
  })
  assert.deepEqual(classifySeries(43), {
    seriesId: 'series_43',
    seriesType: 'main',
    eraBucket: 'reiwa',
  })
  assert.deepEqual(classifySeries(49), {
    seriesId: 'series_49',
    seriesType: 'main',
    eraBucket: 'reiwa',
  })
  assert.deepEqual(classifySeries(50), {
    seriesId: 'series_50',
    seriesType: 'extra',
    eraBucket: 'extra',
  })
  assert.deepEqual(classifySeries(55), {
    seriesId: 'series_55',
    seriesType: 'extra',
    eraBucket: 'extra',
  })
})

test('classifySeries returns unknown for invalid values', () => {
  assert.deepEqual(classifySeries(null), {
    seriesId: null,
    seriesType: 'unknown',
    eraBucket: 'unknown',
  })
  assert.deepEqual(classifySeries('abc'), {
    seriesId: null,
    seriesType: 'unknown',
    eraBucket: 'unknown',
  })
  assert.deepEqual(classifySeries(999), {
    seriesId: 'series_999',
    seriesType: 'unknown',
    eraBucket: 'unknown',
  })
})
