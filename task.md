# スーパー戦隊OP/ED管理アプリ 基本設計書

## プロジェクト概要

### 目的
スーパー戦隊50周年記念として、全戦隊のOP/ED曲を歌う会の進捗管理

### 要件
- 身内（5-10人）で使用
- 全員で同じデータを共有
- リアルタイム同期
- レスポンシブ対応（スマホ/PC）

### 主要機能
- 曲リスト表示
- 進捗バー
- フィルタリング（歌唱状態、OP/ED、検索）
- チェックボックスで歌唱管理
- 統計表示

---

## 技術スタック

フロントエンド: Vite + React 19 + CSS Modules ではない素の CSS（`src/index.css`）
バックエンド: Cloud Firestore
ホスティング: Firebase Hosting


### 選定理由
- **Vite**: 高速ビルド、現代的な開発体験
- **React**: コンポーネント思考、豊富なエコシステム
- **素のCSS**: 依存を増やさずに運用できるシンプル構成
- **Firestore**: リアルタイム同期、サーバーレス、無料枠が大きい

---

## データ構造

### Firestoreコレクション: songs

javascript
{
  // 識別子
  id: "gorenger_op_1",  // ドキュメントID
  
  // 戦隊情報
  seriesNumber: 1,                       // 戦隊番号（必須）
  seriesName: "秘密戦隊ゴレンジャー",     // 戦隊名（必須）
  year: 1975,                            // 放送年（任意）
  
  // 曲情報
  songTitle: "進め！ゴレンジャー",        // 曲名（必須）
  songType: "OP",                        // "OP" or "ED"（必須）
  songNumber: 1,                         // 同戦隊内の曲番号（自動生成）
  variant: null,                         // "前期", "後期"など（任意）
  artist: "ささきいさお",                 // 歌手（任意）
  
  // 歌唱管理
  sung: false,                           // 歌ったかどうか
  sungAt: null,                          // 歌った日時（ISO 8601）
  sungBy: [],                            // 歌った人の配列
  
  // その他
  videoUrl: null                         // YouTube URLなど（任意）
}


### データ提供フォーマット（CSV）

**必須カラム（4つ）:**
- 戦隊番号
- 戦隊名
- 曲名
- 種類（OP/ED）

**任意カラム（3つ）:**
- 放送年
- 歌手
- 備考

### データ変換フロー

CSV提供
  ↓
convert-csv.js（スクリプト）
  - songNumber自動付与
  - ID自動生成
  - 初期値設定
  ↓
songs.json
  ↓
upload-to-firestore.js（スクリプト）
  ↓
Firestore


---

## アーキテクチャ

### ディレクトリ構成

sentai-song-manager/
├── src/
│   ├── main.jsx                 # エントリーポイント
│   ├── App.jsx                  # メインコンポーネント
│   ├── index.css                # アプリ全体スタイル
│   ├── components/              # UIコンポーネント群
│   ├── hooks/                   # カスタムフック
│   ├── lib/                     # ライブラリ・初期化
│   └── constants/               # 定数定義
├── scripts/                     # データ変換・投入スクリプト
├── data/                        # 元データ・変換後データ
├── firestore.rules              # セキュリティルール
├── firebase.json                # Firebase設定
├── package.json
├── vite.config.js
└── tailwind.config.js


### データフロー

Firestore
  ↓ onSnapshot（リアルタイムリスナー）
App.jsx [songs] state
  ↓ useMemo（filter/search/sort）
filteredSongs
  ↓ props
Components
  ↓ onClick
updateDoc
  ↓
Firestore
  ↓ リアルタイム同期
全ユーザーの画面更新


---

## コンポーネント設計

### コンポーネント構成

App（親）
├── Header（タイトル）
├── ProgressBar（進捗バー）
├── FilterBar（フィルターボタン群）
├── SearchBox（検索）
├── SongList（曲リストコンテナ）
│   ├── SongItem（個別曲）×N
│   └── SeriesGroup（戦隊別グループ）×M
│       └── SongItem ×N
└── StatsPanel（統計表示）


### 状態管理

**App.jsx の状態:**
- songs: 全曲データ（Firestoreから取得）
- filter: 歌唱状態フィルター（'all' | 'sung' | 'unsung'）
- typeFilter: OP/EDフィルター（'all' | 'OP' | 'ED'）
- searchText: 検索文字列
- viewMode: 表示モード（'list' | 'grouped'）
- loading: ローディング状態

### フィルタリング方針

1. 歌唱状態でフィルター
2. OP/EDでフィルター
3. 検索文字列でフィルター
4. 戦隊番号順にソート

すべて useMemo で最適化

---

## セキュリティ設計

### Firestoreセキュリティルール

javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /songs/{songId} {
      // 読み取り: 誰でもOK
      allow read: if true;
      
      // 更新: sung, sungAt, sungBy のみ変更可能
      allow update: if request.resource.data.diff(resource.data)
        .affectedKeys().hasOnly(['sung', 'sungAt', 'sungBy']);
      
      // 作成・削除: 禁止
      allow create, delete: if false;
    }
  }
}


**方針:**
- 認証不要（身内限定のため）
- データの追加・削除は禁止（初期データのみ）
- 歌唱状態の更新のみ許可

---

## レスポンシブ設計

### レイアウト方針（実装）

**スマホ:**
- 1カラム表示
- 縦スクロール

**タブレット:**
- 2カラムグリッド
- md:grid-cols-2

**PC:**
- 3カラムグリッド
- lg:grid-cols-3

---

## 実装手順

### Phase 1: 環境構築
1. Viteプロジェクト作成
2. 依存関係インストール（React, Firebase, Tailwind）
3. Tailwind設定
4. Firebase初期化

### Phase 2: データ準備
1. CSVデータ受領
2. 変換スクリプト作成（CSV → JSON）
3. Firestore投入スクリプト作成
4. データ投入

### Phase 3: コンポーネント実装
1. Firebase接続（lib/firebase.js）
2. 基本コンポーネント作成
3. 状態管理実装
4. フィルタリング・検索実装

### Phase 4: スタイリング
1. `src/index.css` でレスポンシブスタイル適用
2. レスポンシブ対応
3. アニメーション追加

### Phase 5: デプロイ
1. ビルド確認
2. Firebaseホスティング設定
3. デプロイ

---

## 開発環境セットアップ

### 必要なツール
- Node.js v18以上
- npm or yarn
- Firebase CLI（グローバルインストール）

### 初期化コマンド

bash
# プロジェクト作成
npm create vite@latest sentai-song-manager -- --template react
cd sentai-song-manager

# 依存関係
npm install
npm install firebase
npm install -D tailwindcss postcss autoprefixer
npm install csv-parser

# Tailwind初期化
npx tailwindcss init -p

# Firebase CLI
npm install -g firebase-tools
firebase login
firebase init


---

## デプロイ手順

### 開発サーバー

bash
npm run dev
# http://localhost:5173


### ビルド

bash
npm run build
# dist/ に出力


### Firebase デプロイ

bash
firebase deploy
# Hosting + Firestore rules


---

## 費用見積もり

### Firebase無料枠（Spark プラン）
- **Hosting**: 10GB転送/月
- **Firestore読み取り**: 50,000回/日
- **Firestore書き込み**: 20,000回/日
- **Firestoreストレージ**: 1GB

### 想定使用量（10人、月4回使用）
- **Hosting**: <0.1GB/月
- **読み取り**: ~200回/月
- **書き込み**: ~100回/月
- **ストレージ**: <0.01GB

**結論: 完全無料で運用可能**

---

## 重要な設計判断

### 1. テーブル正規化しない理由
- データ量が小さい（~100曲）
- 戦隊情報の重複はわずか
- クエリが単純になる
- Firestoreのベストプラクティス（非正規化推奨）

### 2. 認証不要の理由
- 身内限定（5-10人）
- URLを知っている人のみアクセス
- セキュリティルールで書き込み制限

### 3. リアルタイム同期の理由
- 複数人が同時に使用
- チェック状態を即座に共有
- Firestoreの強み

### 4. サーバーレスの理由
- 保守が不要
- スケーリング自動
- コストが最小

---

## トラブルシューティング

### Firestoreエラー
- セキュリティルール確認
- インデックス作成（自動提案される）

### ビルドエラー
- Node.jsバージョン確認
- node_modules 削除して再インストール

### デプロイエラー
- Firebase CLI ログイン確認
- プロジェクトID確認

---

## 拡張可能性

### 将来追加できる機能
- ユーザー認証（Google/匿名ログイン）
- YouTube動画埋め込み
- 難易度評価
- コメント機能
- CSV/JSONエクスポート
- 印刷用レイアウト
- PWA対応（オフライン動作）

### 技術的拡張
- TypeScript化
- テスト追加（Vitest）
- CI/CD（GitHub Actions）
- バックアップ自動化

---

## 参考リンク

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)

---

## 連絡事項

### データ提供者への依頼内容
必須カラム4つ（戦隊番号、戦隊名、曲名、種類）をCSV形式で提供してもらう

### 開発者への引き継ぎ
- 上記設計に基づいて実装を進める
- 詳細な実装判断は開発者に委ねる
- 不明点があれば基本方針に立ち返る
