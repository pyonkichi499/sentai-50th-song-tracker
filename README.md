# Sentai 50th Song Tracker

スーパー戦隊の OP/ED 歌唱状況を管理するアプリです。

## 構成（Firebase 完結）
- フロント: Vite + React
- 認証: Firebase Auth（匿名認証）
- データ: Cloud Firestore
- 配信: Firebase Hosting
- 原本データ: `data/戦隊カラオケリスト.csv`（唯一のソース）

`VITE_DATA_SOURCE` のデフォルトは `firestore` です。

## 主な機能
- 曲の歌唱チェック（リアルタイム同期）
- 戦隊別グループ表示 / 一覧表示
- 戦隊単位の一括チェック（全曲歌唱・未歌唱へ戻す）
- フィルタ（歌唱状態 / OP・ED / 検索）
- 並び順切り替え（戦隊順 / 更新順）

## セットアップ
```bash
npm install
```

設定は `src/lib/firebase.web.config.js` を使うのが最短です。

`src/lib/firebase.web.config.js` に Firebase コンソールの `firebaseConfig` を貼ってください。
App Check を使う場合は `.env.local` に `VITE_RECAPTCHA_V3_SITE_KEY` も設定してください。

### 補足: `.env.local` を使いたい場合
コンソールで表示された `firebaseConfig` のコードをファイルに貼って変換できます。

```bash
# 例: firebase-config.txt にコンソール出力を貼る
npm run firebase:config:to-env -- firebase-config.txt .env.local
```

## ローカル起動
```bash
npm run dev
```

CSV更新後の反映まで含めてローカル起動する場合:
```bash
# 初回だけ（または認証切れ時）
gcloud auth application-default login
export FIREBASE_PROJECT_ID=<your-project-id>

# 変換・検証・Firestore反映・開発サーバ起動を一括実行
npm run local:start:fresh
```

## 更新時の実行コマンド早見表
普段はこの3つだけ使えば十分です。

- `npm run start`
  - ローカル起動（既存データ維持）

- `npm run start:fresh`
  - CSV反映 + ローカル起動（やり直し用）
  - `data/reading-tasks.json` がある場合は読み補正も自動再適用

- `npm run release`
  - 検証 + Firestore同期 + Hosting/Rules デプロイ（本番反映）

詳細運用が必要なときだけ、以下の個別コマンドを使ってください。
`local:prepare`, `check:all`, `deploy:data`, `deploy:app`, `data:readings:extract`, `data:readings:apply`

## Firestore 初期データ投入
```bash
# 原本CSV -> data/songs.json
npm run data:convert:official

# データ検証（重複IDチェック）
npm run data:check

# ADC でログイン（ローカル開発向け）
gcloud auth application-default login
export FIREBASE_PROJECT_ID=<your-project-id>

# Firestore に投入（data/songs.json を読み込み）
npm run firestore:seed
```

`firestore:seed` は同期モードです。原本データに存在しない `songs` ドキュメントは削除されます。
既存曲の `sung / sungAt / sungBy` は保持され、新規曲のみ初期値で作成されます。

### 読み補正フロー（任意）
1. `npm run data:readings:extract`
2. `data/reading-tasks.prompt.txt` を外部AIへ渡し、`data/reading-tasks.json` の `proposed` を補正
3. `npm run data:readings:apply`
4. `npm run data:check`
5. `npm run deploy:data`

サービスアカウント鍵を使う場合は、追加で `GOOGLE_APPLICATION_CREDENTIALS` を指定できます。

## ルール
`firestore.rules`
- `read`: 誰でも可
- `update`: 認証済みユーザーのみ、`sung/sungAt/sungBy` のみ更新可
- `create/delete`: 禁止

## デプロイ
```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

## 補足
- Firebase の「プロジェクト名」と「プロジェクトID」は別です。
- 実際に設定やCLIで使うのはプロジェクトIDです。
- サンプル曲データはフロントに同梱していません（デプロイ対象外）。
