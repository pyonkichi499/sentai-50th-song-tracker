# Sentai 50th Song Tracker

スーパー戦隊の OP/ED 歌唱状況を管理するアプリです。

## 構成（Firebase 完結）
- フロント: Vite + React
- 認証: Firebase Auth（匿名認証）
- データ: Cloud Firestore
- 配信: Firebase Hosting

`VITE_DATA_SOURCE` のデフォルトは `firestore` です。

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

## Firestore 初期データ投入
```bash
# CSV -> JSON
npm run data:convert:json

# ADC でログイン（ローカル開発向け）
gcloud auth application-default login
export FIREBASE_PROJECT_ID=<your-project-id>

# Firestore に投入
npm run firestore:seed
```

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
- `VITE_DATA_SOURCE=local` にするとローカル保存モードで起動できます（デバッグ用途）。
