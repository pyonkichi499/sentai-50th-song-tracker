import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'

function runConvert(csvContent) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sentai-csv-test-'))
  const inputPath = path.join(tmpDir, 'input.csv')
  const outputPath = path.join(tmpDir, 'output.json')
  fs.writeFileSync(inputPath, csvContent, 'utf8')

  execFileSync('node', ['scripts/convert-csv.mjs', inputPath, outputPath], {
    cwd: process.cwd(),
    stdio: 'pipe',
  })

  const songs = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
  return songs
}

test('convert-csv supports legacy header format', () => {
  const songs = runConvert(`戦隊番号,戦隊名,種類,曲名,放送年,歌手,備考
1,秘密戦隊ゴレンジャー,OP,進め!ゴレンジャー,1975,ささきいさお,
1,秘密戦隊ゴレンジャー,ED,秘密戦隊ゴレンジャー,1975,ささきいさお,初期ED
`)

  assert.equal(songs.length, 2)
  assert.equal(songs[0].songType, 'OP')
  assert.equal(songs[0].year, null)
  assert.equal(songs[1].variant, '初期ED')
})

test('convert-csv supports official header format and ED variants', () => {
  const songs = runConvert(`番号,作品名,OP／ED,曲名,歌手
49,ナンバーワン戦隊ゴジュウジャー,OP,WINNER!ゴジュウジャー!,Wienners
49,ナンバーワン戦隊ゴジュウジャー,ED①,YOU BE ONE WINNER,きただにひろし
`)

  assert.equal(songs.length, 2)
  assert.equal(songs[0].seriesId, 'series_49')
  assert.equal(songs[0].seriesNumber, 49)
  assert.equal(songs[0].seriesType, 'main')
  assert.equal(songs[0].eraBucket, 'reiwa')
  assert.equal(songs[0].year, null)
  assert.equal(songs[1].songType, 'ED')
  assert.equal(songs[1].variant, null)
  assert.equal(songs[1].songNumber, 1)
})

test('convert-csv classifies extra entries as extra/extra', () => {
  const songs = runConvert(`番号,作品名,OP／ED,曲名,歌手
50,百獣戦隊ガオレンジャーVSスーパー戦隊,OP,ガオレンジャー吼えろ!!,山形ユキオ
`)

  assert.equal(songs.length, 1)
  assert.equal(songs[0].seriesId, 'series_50')
  assert.equal(songs[0].seriesType, 'extra')
  assert.equal(songs[0].eraBucket, 'extra')
})
