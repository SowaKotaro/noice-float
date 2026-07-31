# そのフロート、アイス乗ってません！

エンジニアと非エンジニアで意味の食い違う語を、**両方の視点から並べて引ける辞書**です。

> 「ここ float で持ってます」と言われた非エンジニアが思い浮かべているのは、
> だいたいメロンソーダの上でゆっくり溶けていくアイスクリームである。

## 体験の核：重なる 2 枚のカード

1 つの語につき **エンジニアの意味** と **非エンジニアの意味** を 1 枚ずつカードにして、
重ねて置いています。カードのどこかをクリックすると前後が入れ替わります。

説明はどちらの視点も 1 本です。エンジニア側は**専門用語を出すが前提知識がなくても
読み通せる**あたりに技術度を揃え、**最後に一文で言い切って**締めます。

```
小数を扱うためのデータ型。数値を符号部・指数部・仮数部の 3 つに分けて表す形式で、
IEEE 754 がその表現を定めている。何ビットで持つかは言語や型によって違う。0.1 の
ように 2 進法で表しきれない値は丸め誤差を持つため、計算の結果は近似になる。
小数を正確に持つ型ではなく、近似で持つ型である。
```

カードの下には**辞書エントリ**として同じ内容の全文を静的な HTML で置いています。
カードは 2 つの意味を重ねて隠す作りなので、両方の意味を並べて読むことも、
用例を見比べることもできません。エントリはその逆で、全部を一度に並べます
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
term: "フロート"
reading: "ふろーと"
aliases: ["浮動小数点数"]

tldr: "エンジニアが float と言うときは、小数を扱うためのデータ型のこと。アイスクリームを浮かべた飲み物ではない。"

engineer:
  spelling: "float"
  description: "小数を扱うためのデータ型。数値を符号部・指数部・仮数部の 3 つに分けて表す形式で、… 小数を正確に持つ型ではなく、近似で持つ型である。"
  examples:
    - "それ float じゃなくて double だよ"

general:
  spelling: "float"
  meaning: "アイスクリームを浮かべた炭酸飲料。クリームソーダなど。"
  examples:
    - "ここのフロート美味しいんだよ"

tags: ["データ", "飲料"]
publishedAt: 2026-07-23
---

本文（任意）。もう少し長い解説やエピソードを書けます。
```

### 執筆ルール

- **`term`（見出し語）はカタカナ。** このサイトが集めているすれ違いは会話で起きる
  ものなので、語の同一性を担保しているのは綴りではなく音です。カタカナにすると
  見出し語がどちらの視点にも属さない中立な形になり、**綴りが食い違う語も同じ棚に
  置けます**（ジェイソン ＝ `JSON` / `Jason`、キャッシュ ＝ `cache` / `cash`）。
  URL は `term` ではなくファイル名なので、見出しを変えてもパーマリンクは動きません
- **英語の綴りは `engineer.spelling` / `general.spelling`。** 両側とも必須です。
  フロートのように一致することが多いので二度書きに見えますが、**一致するかどうかを
  語ごとに必ず確かめさせるため**にあえて省略を許していません（`Ruby` と `ruby` の
  ように、大文字小文字だけ違う例も実際にあります）。カードの黒い見出しチップでは
  語の隣に小さく出て、**2 枚のあいだで唯一食い違いうる部分**になります
- **`engineer.description` は 1 本。** 組み立ては **定義 → 補足 → 最後に簡潔な言い切り**。
  締めの一文はその語の核心を短く断定するもので、定義文の言い直しにはしません。
  **感想やパンチライン**（「事故る」のような煽り）、**「〜すべき」といった実践上の勧め**、
  **言語や環境で変わる指標**（`float` のビット幅、既定のポート番号、上限値の目安）は
  入れません。辞書として普遍的に成り立つ範囲で書きます。口語のノリは `examples` の担当です
- **`tldr` は 1 文の言い切り。** 「エンジニアが X と言うときは〜。〜ではない。」の形。
  この 1 文が meta description・OGP・構造化データ・ページ冒頭の 4 か所に入ります。
  AI 検索や LLM がそのまま引用するのはこの形の文なので、ここの質が効きます
- **`tags` は統制語彙。** `src/lib/tags.ts` に定義した語だけが書けます。
  新しい分野の語を足すときは先にレジストリへ登録してください
  （未定義のタグを書くと、許可語の一覧つきでビルドが止まります）
- **`examples` は 2〜3 個**が目安。エンジニア側・非エンジニア側それぞれの口語

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
  content.config.ts       スキーマ（説明文の書き方・タグは統制語彙）
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

> **ドメインは `noicefloat.dev` で行きます**（取得はまだ）。
> `astro.config.mjs` の `site` に設定してあり、canonical・OGP・sitemap・llms.txt の
> 絶対 URL はすべてここを起点にしています。変えるときに直すのは、この 1 行と
> `public/robots.txt` の `Sitemap:` 行の 2 か所だけです。

## ライセンス

コードは MIT License です（`LICENSE`）。

タイトルロゴと OGP 画像に使っている書体は Dela Gothic One（SIL OFL 1.1）です。
再配布に必要なライセンス全文は `public/fonts/OFL.txt` にあります（消さないこと）。

辞書コンテンツ（`src/content/words/` 配下の説明文）のライセンスは検討中です。
転載条件をコードと分けるか、追って決めます。
