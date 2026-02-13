# コミット手順（Conventional Commits / 日本語ガイド）

以下は、今回の変更を適切な粒度で分割してコミットするためのコマンドです。

```bash
# 0) いったんステージをクリア（作業内容は消えません）
git reset

# 1) Vite/React の土台
git add .gitignore index.html vite.config.js eslint.config.js public src/main.jsx src/App.css src/assets/react.svg
git commit -m "chore(scaffold): initialize vite react project structure"

# 2) UI・ローカルデータ管理・フィルタ機能
git add src/App.jsx src/index.css src/components src/hooks/useSongStore.js src/lib/songFilters.js src/repositories/createSongRepository.js src/repositories/localSongRepository.js src/repositories/songRepositoryFactory.js src/constants/sampleSongs.js
git commit -m "feat(ui): implement song tracker screens and local state management"

# 3) データ生成/変換スクリプトとサンプルデータ
git add data scripts/convert-csv.mjs scripts/generate-sample-csv.mjs
git commit -m "feat(data): add csv-based song data generation and conversion workflow"

# 4) Firebase連携（Firestore/Auth/App Check）と投入/変換ツール
git add src/lib/firebase.js src/lib/firebase.web.config.example.js src/repositories/firestoreSongRepository.js scripts/firebase-config-to-env.mjs scripts/upload-to-firestore.mjs firebase.json firestore.rules firestore.indexes.json .firebaserc .env.example package.json package-lock.json
git commit -m "feat(firebase): integrate firestore auth app-check and deployment configs"

# 5) 単体テスト整備
git add tests
git commit -m "test(core): add unit tests for repositories and song filtering"

# 6) ドキュメントと運用補助ファイル
git add README.md task.md tmp/firebase-config.txt
git commit -m "docs: update setup guide and firebase config workflow"

# 7) 最終確認
git status
```

## 補足
- `.env.local` はコミットしないでください（機密情報のため）。
- `.firebase/` も通常はコミット不要です。

## 各ステップの詳細

### 0) `git reset`
- 目的: 途中でステージ済みの変更が混ざっていても、分割コミットしやすい初期状態に戻す。
- 注意: ワーキングツリーの変更内容は消えない。

### 1) `chore(scaffold)`
- 対象: Vite初期構成、静的ファイル、基本エントリポイント。
- 意図: アプリ実装本体とは切り分け、土台だけを独立して追跡可能にする。
- 実行後チェック: `git show --name-only --oneline -1` で土台ファイルだけ含まれていることを確認。

### 2) `feat(ui)`
- 対象: 画面UI、ローカル状態管理、フィルタ/集計ロジック。
- 意図: ユーザー機能（表示・操作）を1つの機能コミットとしてまとめる。
- 実行後チェック: `npm run build` が通ること。

### 3) `feat(data)`
- 対象: `data/` と CSV 変換/生成スクリプト。
- 意図: データ作成パイプライン（CSV -> アプリ利用データ）を機能単位で分離する。
- 実行後チェック: `npm run data:convert` 実行で `src/constants/sampleSongs.js` が生成されること。

### 4) `feat(firebase)`
- 対象: Firebase接続、Firestoreルール、デプロイ設定、投入スクリプト、依存追加。
- 意図: クラウド同期と運用設定を一括で追跡できるコミットにする。
- 実行後チェック:
  - `npm run build` が通る
  - `firebase deploy --only firestore:rules` が実行可能な状態になっている

### 5) `test(core)`
- 対象: `tests/` 以下の単体テスト。
- 意図: 機能コミットとテストコミットを分け、レビュー時にテスト観点を見やすくする。
- 実行後チェック: `npm test` が通ること。

### 6) `docs`
- 対象: README、作業メモ、設定補助ファイル。
- 意図: 運用手順や背景説明をコード変更と分離して管理する。
- 実行後チェック: 手順通りに実行したときに不足コマンドがないこと。

### 7) `git status`
- 目的: コミット漏れ・余計な追跡ファイル（`.env.local` など）がないことを最終確認する。
- 判定:
  - 問題なし: `working tree clean`
  - 残っている場合: 次コミットに分けるか、意図を確認してから追加する
