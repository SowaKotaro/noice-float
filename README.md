# そのフロート、アイス乗ってません！

エンジニアと非エンジニアで意味の食い違う語を、**両方の視点から並べて引ける辞書**です。

> 「ここ float で持ってます」と言われた非エンジニアが思い浮かべているのは、
> だいたいメロンソーダの上でゆっくり溶けていくアイスクリームである。

## 体験の核：重なる 2 枚のカード

1 つの語につき **エンジニアの意味** と **ふつうの意味** を 1 枚ずつカードにして、
重ねて置いています。カードのどこかをクリックすると前後が入れ替わります。

エンジニア側のカードには **3 段階の切り替え**が付いています。

```
さらっと   小数を扱うための型。ただし、計算するとわずかな誤差が出ることがある。
しっかり   数値を符号部・指数部・仮数部に分けて表す、32bit の浮動小数点数型。…
がっつり   IEEE 754 で定義された 32bit の浮動小数点数型。符号部 1bit・指数部 8bit …
```

読み手の側で「どこまで踏み込むか」を選べるようにしたものです。
ふつう側の説明は 1 つで、段階を持ちません。

カードの下には**辞書エントリ**として同じ内容の全文を静的な HTML で置いています。
カードは 2 つの意味を重ねて隠す作りなので、3 段階を見比べることも両方の意味を
同時に読むこともできません。エントリはその逆で、全部を一度に並べます
（クローラと LLM に全文が届くのもここです）。

## 開発

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/ に静的ファイルを出力
npm run preview   # ビルド結果をローカルで確認
npm run check     # 型と Astro テンプレートの検査
```

## 語を追加する

`src/content/words/<語>.md` を作ります。frontmatter だけで 1 語が成立します。

```yaml
---
term: "float"
reading: "ふろーと"
aliases: ["フロート", "浮動小数点数"]

tldr: "エンジニアが float と言うときは、小数を扱うためのデータ型のこと。アイスクリームを浮かべた飲み物ではない。"

engineer:
  levels:
    - "小数を扱うための型。ただし、計算するとわずかな誤差が出ることがある。"
    - "数値を符号部・指数部・仮数部に分けて表す、32bit の浮動小数点数型。…"
    - "IEEE 754 で定義された 32bit の浮動小数点数型。…"
  examples:
    - "それ float じゃなくて double だよ"

general:
  meaning: "アイスクリームを浮かべた炭酸飲料。クリームソーダなど。"
  examples:
    - "ここのフロート美味しいんだよ"

tags: ["データ", "飲料"]
publishedAt: 2026-07-23
---

本文（任意）。もう少し長い解説やエピソードを書けます。
```

### 執筆ルール

- **`engineer.levels` はちょうど 3 個。** 順に さらっと / しっかり / がっつり
  （後ろほど技術度が高い）。**各段階は独立した全文**でよく、前段を削って作る
  といった制約はありません。3 個でなければビルドが止まります
- **`tldr` は 1 文の言い切り。** 「エンジニアが X と言うときは〜。〜ではない。」の形。
  この 1 文が meta description・OGP・構造化データ・ページ冒頭の 4 か所に入ります。
  AI 検索や LLM がそのまま引用するのはこの形の文なので、ここの質が効きます
- **`tags` は統制語彙。** `src/lib/tags.ts` に定義した語だけが書けます。
  新しい分野の語を足すときは先にレジストリへ登録してください
  （未定義のタグを書くと、許可語の一覧つきでビルドが止まります）
- **`examples` は 2〜3 個**が目安。エンジニア側・ふつう側それぞれの口語

制約はすべて `src/content.config.ts` の Zod スキーマが検証します。
書き間違いは実行時ではなくビルド時に落ちます。

## 生成されるもの

語を 1 つ足すと、以下がすべて自動で増えます。手で触る必要はありません。

| 出力 | 内容 |
|---|---|
| `/words/<語>/` | 語ページ（HTML） |
| `/words/<語>.md` | 同じ内容の Markdown 版（LLM 向け） |
| `/og/<語>.png` | OGP 画像（satori + resvg でビルド時に生成） |
| `/tags/<分野>/` | その語が属する分野ページ |
| `/sitemap-index.xml` | サイトマップ |
| `/rss.xml` | 新着フィード |
| `/llms.txt`・`/llms-full.txt` | LLM 向けの案内と全文 |

## ディレクトリ構成

```
src/
  content/words/          語ごとの Markdown
  content.config.ts       スキーマ（levels は 3 個・タグは統制語彙）
  lib/
    site.ts               サイト定数と絶対 URL の組み立て
    schema.ts             JSON-LD（DefinedTerm / FAQPage / BreadcrumbList）
    plaintext.ts          llms.txt と Markdown 版の生成
    words.ts              語の取得・並び（五十音順）・前後
    tags.ts               タグの統制語彙
    ui.ts                 複数ページで使う装飾クラス
  components/
    MeaningCards.tsx      重なる 2 枚のカード（唯一の島）
    WordEntry.astro       カードの下に置く静的な全文
    SiteLogo.astro        文字組みのタイトルロゴ
    SiteHeader.astro      共通ヘッダー
  layouts/Layout.astro    head（canonical・OGP・JSON-LD）と共通の枠
  pages/
    index.astro           トップ（代表例カード＋語一覧＋分野）
    words/[...id].astro   語ページ
    words/[id].md.ts      語の Markdown 版
    tags/[tag].astro      分野ページ
    og/                   OGP 画像の生成
    rss.xml.ts / llms.txt.ts / llms-full.txt.ts
scripts/
  subset-logo-font.py     ロゴ用フォントのサブセット（ブラウザへ配る woff2）
  subset-og-font.py       OGP 用フォントのサブセット（ビルド時に読む ttf）
docs/
  tech-selection.md       技術選定の全体像と決定理由
  progress.md             現在地・残タスク
```

## 技術スタック

Astro 7 / React 19（島は意味カードだけ）/ TypeScript / Tailwind CSS v4

完全な静的サイトです。サーバーサイドの実行環境を必要としません。
ブラウザへ配る JavaScript は意味カードのぶんだけで、それ以外のページは
JavaScript なしで完全に読めます。

## デプロイ

さくら VPS（Ubuntu）+ nginx で静的配信します。ローカルでビルドして `dist/` を
rsync する方式のため、サーバー側に Node.js は不要です。

> **ドメインは未取得です。** `astro.config.mjs` の `site` に暫定で
> `https://noicefloat.dev` を置いてあります。canonical・OGP・sitemap・llms.txt の
> 絶対 URL はすべてここを起点にしているので、確定したらこの 1 行を直すだけで
> サイト全体が追従します。

## ライセンス

コードは MIT License です（`LICENSE`）。

タイトルロゴと OGP 画像に使っている書体は Dela Gothic One（SIL OFL 1.1）です。
再配布に必要なライセンス全文は `public/fonts/OFL.txt` にあります（消さないこと）。

辞書コンテンツ（`src/content/words/` 配下の説明文）のライセンスは検討中です。
転載条件をコードと分けるか、追って決めます。
