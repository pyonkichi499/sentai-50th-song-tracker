import fs from 'node:fs'

const series = [
  { number: 1, name: '秘密戦隊ゴレンジャー', year: 1975, op: '進め!ゴレンジャー', opArtist: "ささきいさお・堀江美都子・コロムビアゆりかご会", ed: '秘密戦隊ゴレンジャー', edArtist: "ささきいさお・こおろぎ'73" },
  { number: 2, name: 'ジャッカー電撃隊', year: 1977, op: 'ジャッカー電撃隊', opArtist: "ささきいさお・こおろぎ'73", ed: 'いつか、花は咲くだろう', edArtist: 'ささきいさお' },
  { number: 3, name: 'バトルフィーバーJ', year: 1979, op: 'バトルフィーバーJ', opArtist: 'MoJo', ed: '勇者が行く', edArtist: 'MoJo' },
  { number: 4, name: '電子戦隊デンジマン', year: 1980, op: 'ああ電子戦隊デンジマン', opArtist: '成田賢', ed: 'デンジマンにまかせろ!', edArtist: '成田賢' },
  { number: 5, name: '太陽戦隊サンバルカン', year: 1981, op: '太陽戦隊サンバルカン', opArtist: "串田アキラ・こおろぎ'73", ed: '若さはプラズマ', edArtist: "串田アキラ・こおろぎ'73" },
  { number: 6, name: '大戦隊ゴーグルファイブ', year: 1982, op: '大戦隊ゴーグルV', opArtist: "MoJo・こおろぎ'73", ed: 'ストップ・ザ・バトル', edArtist: "MoJo・こおろぎ'73" },
  { number: 7, name: '科学戦隊ダイナマン', year: 1983, op: '科学戦隊ダイナマン', opArtist: "MoJo・こおろぎ'73", ed: '夢をかなえてダイナマン', edArtist: "MoJo・こおろぎ'73" },
  { number: 8, name: '超電子バイオマン', year: 1984, op: '超電子バイオマン', opArtist: '宮内タカユキ', ed: 'バイオミック・ソルジャー', edArtist: '宮内タカユキ' },
  { number: 9, name: '電撃戦隊チェンジマン', year: 1985, op: '電撃戦隊チェンジマン', opArtist: 'KAGE(影山ヒロノブ)', ed: 'NEVER STOP チェンジマン', edArtist: 'KAGE(影山ヒロノブ)' },
  { number: 10, name: '超新星フラッシュマン', year: 1986, op: '超新星フラッシュマン', opArtist: '北原拓', ed: 'ファイティングポーズ、フラッシュマン!', edArtist: '北原拓' },
  { number: 11, name: '光戦隊マスクマン', year: 1987, op: '光戦隊マスクマン', opArtist: '影山ヒロノブ', ed: '愛のソルジャー', edArtist: '影山ヒロノブ' },
  { number: 12, name: '超獣戦隊ライブマン', year: 1988, op: '超獣戦隊ライブマン', opArtist: '嶋大輔', ed: 'あしたに生きるぜ!', edArtist: '嶋大輔' },
  { number: 13, name: '高速戦隊ターボレンジャー', year: 1989, op: '高速戦隊ターボレンジャー', opArtist: '佐藤健太', ed: 'ジグザグ青春ロード', edArtist: '佐藤健太' },
  { number: 14, name: '地球戦隊ファイブマン', year: 1990, op: '地球戦隊ファイブマン', opArtist: '鈴木けんじ', ed: 'ファイブマン、愛のテーマ', edArtist: '鈴木けんじ' },
  { number: 15, name: '鳥人戦隊ジェットマン', year: 1991, op: '鳥人戦隊ジェットマン', opArtist: '影山ヒロノブ', ed: 'こころはタマゴ', edArtist: '影山ヒロノブ' },
  { number: 16, name: '恐竜戦隊ジュウレンジャー', year: 1992, op: '恐竜戦隊ジュウレンジャー', opArtist: '佐藤健太', ed: '冒険してラッパピーヤ!', edArtist: 'ピタゴラス' },
  { number: 17, name: '五星戦隊ダイレンジャー', year: 1993, op: '五星戦隊ダイレンジャー', opArtist: 'NEW JACK拓郎', ed: '俺たち無敵さ!!ダイレンジャー', edArtist: 'NEW JACK拓郎' },
  { number: 18, name: '忍者戦隊カクレンジャー', year: 1994, op: 'シークレットカクレンジャー', opArtist: 'トゥー・チー・チェン', ed: 'ニンジャ!摩天楼キッズ', edArtist: 'トゥー・チー・チェン' },
  { number: 19, name: '超力戦隊オーレンジャー', year: 1995, op: 'オーレ!オーレンジャー', opArtist: '速水けんたろう', ed: '緊急発進!!オーレンジャー', edArtist: '速水けんたろう' },
  { number: 20, name: '激走戦隊カーレンジャー', year: 1996, op: '激走戦隊カーレンジャー', opArtist: '高山成孝', ed: '天国サンバ', edArtist: '高山成孝' },
  { number: 21, name: '電磁戦隊メガレンジャー', year: 1997, op: '電磁戦隊メガレンジャー', opArtist: '風雅なおと', ed: '気のせいかな', edArtist: '風雅なおと' },
  { number: 22, name: '星獣戦隊ギンガマン', year: 1998, op: '星獣戦隊ギンガマン', opArtist: '希砂未竜', ed: 'はだしの心で', edArtist: '希砂未竜' },
  { number: 23, name: '救急戦隊ゴーゴーファイブ', year: 1999, op: '救急戦隊ゴーゴーファイブ', opArtist: '石原慎一', ed: 'この星を この街を', edArtist: '高山成孝' },
  { number: 24, name: '未来戦隊タイムレンジャー', year: 2000, op: 'JIKU 〜未来戦隊タイムレンジャー〜', opArtist: '佐々木久美', ed: '時の彼方へ', edArtist: 'NAT\'S' },
  { number: 25, name: '百獣戦隊ガオレンジャー', year: 2001, op: 'ガオレンジャー吼えろ!!', opArtist: '山形ユキオ', ed: "ヒーリン'ユー", edArtist: 'Salia' },
  { number: 26, name: '忍風戦隊ハリケンジャー', year: 2002, op: 'ハリケンジャー参上!', opArtist: '高取ヒデアキ', ed: 'いま 風のなかで', edArtist: '影山ヒロノブ' },
  { number: 27, name: '爆竜戦隊アバレンジャー', year: 2003, op: '爆竜戦隊アバレンジャー', opArtist: '遠藤正明', ed: 'We are the ONE 〜僕らはひとつ〜', edArtist: '串田アキラ' },
  { number: 28, name: '特捜戦隊デカレンジャー', year: 2004, op: '特捜戦隊デカレンジャー', opArtist: 'サイキックラバー', ed: 'ミッドナイト デカレンジャー', edArtist: 'ささきいさお' },
  { number: 29, name: '魔法戦隊マジレンジャー', year: 2005, op: '魔法戦隊マジレンジャー', opArtist: '岩崎貴文', ed: '呪文降臨〜マジカル・フォース', edArtist: 'Sister MAYO' },
  { number: 30, name: '轟轟戦隊ボウケンジャー', year: 2006, op: '轟轟戦隊ボウケンジャー', opArtist: 'NoB', ed: '冒険者 ON THE ROAD', edArtist: 'サイキックラバー' },
  { number: 31, name: '獣拳戦隊ゲキレンジャー', year: 2007, op: '獣拳戦隊ゲキレンジャー', opArtist: '谷本貴義', ed: '道(タオ)', edArtist: '水木一郎' },
  { number: 32, name: '炎神戦隊ゴーオンジャー', year: 2008, op: '炎神戦隊ゴーオンジャー', opArtist: '高橋秀幸', ed: '炎神ファーストラップ -Type Normal-', edArtist: 'Project.R' },
  { number: 33, name: '侍戦隊シンケンジャー', year: 2009, op: '侍戦隊シンケンジャー', opArtist: 'サイキックラバー', ed: '四六時夢中 シンケンジャー', edArtist: '高取ヒデアキ' },
  { number: 34, name: '天装戦隊ゴセイジャー', year: 2010, op: '天装戦隊ゴセイジャー', opArtist: 'NoB', ed: 'ガッチャ☆ゴセイジャー', edArtist: '高橋秀幸(Project.R)' },
  { number: 35, name: '海賊戦隊ゴーカイジャー', year: 2011, op: '海賊戦隊ゴーカイジャー', opArtist: '松原剛志(Project.R)', ed: 'スーパー戦隊 ヒーローゲッター', edArtist: 'Project.R' },
  { number: 36, name: '特命戦隊ゴーバスターズ', year: 2012, op: 'バスターズ レディーゴー!', opArtist: '高橋秀幸(Project.R)', ed: 'キズナ〜ゴーバスターズ!', edArtist: '謎の新ユニットSTA☆MEN' },
  { number: 37, name: '獣電戦隊キョウリュウジャー', year: 2013, op: 'VAMOLA!キョウリュウジャー', opArtist: '鎌田章吾', ed: 'みんな集まれ!キョウリュウジャー', edArtist: '高取ヒデアキ' },
  { number: 38, name: '烈車戦隊トッキュウジャー', year: 2014, op: '烈車戦隊トッキュウジャー', opArtist: '伊勢大貴', ed: 'ビュンビュン!トッキュウジャー', edArtist: 'Project.R' },
  { number: 39, name: '手裏剣戦隊ニンニンジャー', year: 2015, op: 'さぁ行け!ニンニンジャー!', opArtist: '大西洋平', ed: 'なんじゃモンじゃ!ニンジャ祭り!', edArtist: '伊勢大貴' },
  { number: 40, name: '動物戦隊ジュウオウジャー', year: 2016, op: '動物戦隊ジュウオウジャー', opArtist: '高取ヒデアキ(Project.R)', ed: 'レッツ!ジュウオウダンス', edArtist: '大西洋平(Project.R)' },
  { number: 41, name: '宇宙戦隊キュウレンジャー', year: 2017, op: 'LUCKYSTAR', opArtist: '幡野智宏(Project.R)', ed: 'キュータマダンシング!', edArtist: '松原剛志(Project.R)' },
  { number: 42, name: '快盗戦隊ルパンレンジャーVS警察戦隊パトレンジャー', year: 2018, op: 'ルパンレンジャーVSパトレンジャー', opArtist: 'Project.R(吉田達彦・吉田仁美)', ed: 'ルパンレンジャーVSパトレンジャー', edArtist: 'Project.R(吉田達彦・吉田仁美)' },
  { number: 43, name: '騎士竜戦隊リュウソウジャー', year: 2019, op: '騎士竜戦隊リュウソウジャー', opArtist: '幡野智宏', ed: 'ケボーン!リュウソウジャー', edArtist: 'Sister MAYO' },
  { number: 44, name: '魔進戦隊キラメイジャー', year: 2020, op: '魔進戦隊キラメイジャー', opArtist: '大西洋平', ed: 'キラフル ミラクル キラメイジャー', edArtist: '出口たかし' },
  { number: 45, name: '機界戦隊ゼンカイジャー', year: 2021, op: '全力全開!ゼンカイジャー', opArtist: 'つるの剛士', ed: '全力全開!ゼンカイジャー', edArtist: 'つるの剛士' },
  { number: 46, name: '暴太郎戦隊ドンブラザーズ', year: 2022, op: '俺こそオンリーワン', opArtist: 'MORISAKI WIN', ed: "Don't Boo!ドンブラザーズ", edArtist: 'MORISAKI WIN' },
  { number: 47, name: '王様戦隊キングオージャー', year: 2023, op: '全力キング', opArtist: '古川貴之', ed: 'Try & Fight', edArtist: '鎌田章吾' },
  { number: 48, name: '爆上戦隊ブンブンジャー', year: 2024, op: '爆上戦隊ブンブンジャー', opArtist: '遠藤正明', ed: 'コツコツ-PON-PON', edArtist: 'ブンドリオ・ブンデラス(CV:松本梨香)' },
  { number: 49, name: 'ナンバーワン戦隊ゴジュウジャー', year: 2025, op: 'WINNER!ゴジュウジャー!', opArtist: 'Wienners', ed: 'ビリビリBe-lie-ving', edArtist: '金子みゆ' },
]

const header = '戦隊番号,戦隊名,曲名,種類,放送年,歌手,備考'
const rows = [header]

const extraSongsBySeries = {
  1: [
    { title: '見よ!!ゴレンジャー', type: 'ED', artist: "ささきいさお・こおろぎ'73", note: '追加ED' },
  ],
  5: [
    { title: '1たす2たすサンバルカン', type: 'ED', artist: '串田アキラ・コロムビアゆりかご会', note: '追加ED' },
  ],
  19: [
    { title: '虹色クリスタルスカイ', type: 'ED', artist: '速水けんたろう', note: '追加ED' },
  ],
  32: [
    { title: '炎神ラップ -Type S-', type: 'ED', artist: 'Project.R with 炎神キッズ', note: '前期ED' },
    { title: '炎神セカンドラップ -TURBO CUSTOM-', type: 'ED', artist: 'Project.R', note: '後期ED' },
  ],
  35: [
    {
      title: 'スーパー戦隊 ヒーローゲッター 〜Now & Forever edition〜',
      type: 'ED',
      artist: 'Project.R',
      note: '特別版',
    },
  ],
  44: [
    {
      title: 'キラメイ音頭',
      type: 'ED',
      artist: '出口たかし',
      note: '後期ED',
    },
  ],
  49: [
    { title: 'ナンバーワン戦隊ゴジュウジャー', type: 'OP', artist: 'Wienners', note: 'OP別バージョン' },
  ],
}

series.forEach(({ number, name, year, op, opArtist, ed, edArtist }) => {
  rows.push(`${number},${name},${op},OP,${year},${opArtist},`)
  rows.push(`${number},${name},${ed},ED,${year},${edArtist},`)

  const extraSongs = extraSongsBySeries[number] || []
  extraSongs.forEach(({ title, type, artist, note }) => {
    rows.push(`${number},${name},${title},${type},${year},${artist},${note ?? ''}`)
  })
})

fs.writeFileSync('data/songs.example.csv', `${rows.join('\n')}\n`)
console.log(`Generated data/songs.example.csv (${rows.length - 1} songs)`)
