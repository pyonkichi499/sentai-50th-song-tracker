# 開発用 Firebase プロジェクト作成 + 本番 Firestore コピー手順

このドキュメントは、このリポジトリで以下を実現する手順です。

- 開発用の Firebase プロジェクトを新規作成する
- 本番 Firestore のデータを開発用 Firestore にコピーする
- ローカル開発から「エミュレータ」ではなく「開発用クラウド Firestore」に接続する

## 現在の構成（このリポジトリ）

- 本番: Cloud Firestore
- ローカル開発: Firestore/Auth Emulator（`npm run start` はエミュレータ接続）

根拠:

- `package.json` の `start` -> `local:start`
- `local:start` は `VITE_USE_FIREBASE_EMULATOR=true` で起動
- `src/lib/firebase.js` で `VITE_USE_FIREBASE_EMULATOR=true` のとき emulator に接続

## 先に決めること

- 開発用 Firebase プロジェクトID（例: `sentai-50th-song-tracker-dev`）
- Firestore リージョン（本番と同じ `asia-northeast1` 推奨）

## 1. 開発用 Firebase プロジェクトを作成

1. Firebase Console で新規プロジェクトを作成
2. Firestore Database を有効化（`(default)` DB）
3. Web アプリを作成
4. Web app の Firebase config を控える

必要な値:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

## 2. ローカルアプリから dev クラウドへ接続する設定を作る

このリポジトリにはテンプレート `./.env.dev.example` を追加してあります。

1. テンプレートをコピー

```bash
cp .env.dev.example .env.dev.local
```

2. `Firebase Console > Project settings > Your apps > Web app` の値を入力

3. `VITE_USE_FIREBASE_EMULATOR=false` のままにする

補足:

- `.env.dev.local` は `.gitignore` 済み（秘密情報をコミットしない）
- `vite --mode dev` 実行時に読み込まれる

## 3. Firebase CLI のプロジェクトエイリアスを分ける

`.firebaserc` は Firebase CLI の操作先（deploy/emulator）を決めます。

テンプレート `./.firebaserc.dev.example.json` を参考に、手元の `.firebaserc` を更新してください。

例:

```json
{
  "projects": {
    "default": "sentai-50th-song-tracker-dev",
    "dev": "sentai-50th-song-tracker-dev",
    "prod": "sentai-50th-song-tracker"
  }
}
```

## 4. 開発用 Firestore に rules / indexes を先に適用

Firestore の export/import では indexes 定義は移送されません。先に適用します。

```bash
firebase deploy --project sentai-50th-song-tracker-dev --only firestore:rules,firestore:indexes
```

## 5. Firestore コピー用ツール（gcloud）を準備

Firebase CLI ではなく `gcloud firestore export/import` を使います。

```bash
gcloud auth login
```

必要に応じて:

```bash
gcloud components update
```

注意:

- Firestore managed export/import は課金が有効である必要があります

## 6. エクスポート用 Cloud Storage バケットを作成（本番側推奨）

本番プロジェクト側でバケットを作る例です。

```bash
gcloud config set project sentai-50th-song-tracker
gsutil mb -l asia-northeast1 gs://sentai-50th-song-tracker-firestore-export
```

注意:

- Requester Pays バケットは不可

## 7. dev 側 Firestore service agent にバケット権限を付与

1. dev プロジェクト番号を取得

```bash
gcloud projects describe sentai-50th-song-tracker-dev --format='value(projectNumber)'
```

2. 取得したプロジェクト番号を使って service agent を特定

- 形式: `service-<PROJECT_NUMBER>@gcp-sa-firestore.iam.gserviceaccount.com`

3. バケット権限を付与（公式例は `roles/storage.admin`）

```bash
gsutil iam ch serviceAccount:service-<DEV_PROJECT_NUMBER>@gcp-sa-firestore.iam.gserviceaccount.com:roles/storage.admin \
  gs://sentai-50th-song-tracker-firestore-export
```

## 8. 本番 Firestore をエクスポート

```bash
gcloud config set project sentai-50th-song-tracker
gcloud firestore export gs://sentai-50th-song-tracker-firestore-export/manual-$(date +%Y%m%d-%H%M) \
  --database='(default)'
```

進捗確認:

```bash
gcloud firestore operations list
```

## 9. dev Firestore にインポート

```bash
gcloud config set project sentai-50th-song-tracker-dev
gcloud firestore import gs://sentai-50th-song-tracker-firestore-export/manual-YYYYMMDD-HHMM/ \
  --database='(default)'
```

## 10. ローカルから dev クラウドに接続して確認

方法A（推奨）:

```bash
npm run start:dev
```

方法B（既存 `npm run start` を使う場合）:

- `npm run start` はエミュレータ接続固定なので、dev クラウド接続には使わない

## 11. 重要な注意点

- `npm run firestore:seed:prod` / `firestore:seed:local` は JSON からの投入であり、Firestore の完全コピーではない
- export/import は Cloud Functions を起動しない
- export/import は課金対象（export は read、import は write）
- export/import は既存ドキュメントを完全同期しない（対象外データが残ることがある）
- dev を本番スナップショットに揃えたい場合は、空の dev DB から始めるのが安全

## トラブルシュート

### ローカルでデータが見えない

- `VITE_USE_FIREBASE_EMULATOR=false` になっているか確認
- `VITE_FIREBASE_PROJECT_ID` が dev プロジェクトか確認
- Firebase Console で dev プロジェクトの Firestore にデータが入っているか確認
- Firestore Rules で read が拒否されていないか確認

### import が失敗する

- バケット権限（dev 側 Firestore service agent）を確認
- バケットが Requester Pays になっていないか確認
- `--database='(default)'` を付け忘れていないか確認

## 参考（公式）

- Firestore export/import (Firebase docs): https://firebase.google.com/docs/firestore/manage-data/export-import
- Firestore export/import (Google Cloud docs): https://docs.cloud.google.com/firestore/docs/manage-data/export-import
- Firestore databases 管理（複数DBの説明）: https://firebase.google.com/docs/firestore/manage-databases
