# noice-float

エンジニアと非エンジニアで意味の異なる語を、両方の視点から並べて引ける辞書サイト。
タイトルは「そのフロート、アイス乗ってません！」。

- 技術選定の全体像と決定理由: `docs/tech-selection.md`
- 現在地・残タスク・保留中の判断: `docs/progress.md`

## このプロジェクト固有の設計ルール

**見た目は `refs/NeoBrutalismCards.tsx` をそのまま踏襲する。**
配色・カード寸法・背景・影のオフセット・傾き・イージング・タブ・下段の装飾は、
参考ファイルの値をそのまま使う。**勝手に「このサイト向けに調整」しないこと**
（この方針自体がユーザーの明示的な指示）。参考の数値は
`src/components/MeaningCards.tsx` の冒頭コメントに一覧してある。

具体的には次の値が参考由来で、変えてはいけない。

- **配色** … 下地 violet-300 `#C4B5FD` ＋ ドット `#00000033`（20px 間隔）、
  ENGINEER `#4ECDC4`、GENERAL `#FFD166`、差し色 `#FF6B6B`、枠線と文字は純黒・面は純白
- **重なり** … 前面 `rotate-0` ＋ `shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]`
  （ホバーで左上へ 1・影 14px）、背面 `translate-x-4 translate-y-4 sm:6 rotate-3` ＋ 影 4px。
  入替は `duration-500` ＋ `cubic-bezier(0.34,1.56,0.64,1)`

参考から意図的に変えたのは次の 3 点だけ（いずれもユーザー指示）。**これも勝手に戻さない。**

- **寸法**は一回り大きく `w-[320px] sm:w-[560px]`。高さは `min-h-*`（下限）だけ
- **2 枚は `absolute inset-0` ではなくグリッドの同じセルに重ねる**
  （`col-start-1 row-start-1`）。セルの高さが背の高い方に合うので、本文が長ければ
  カードが伸びる ＝ **カード内にスクロールバーを出さない**。
  そのため `<a>` などに `block` を足して `grid` を打ち消さないこと（縦並びに崩れる）
- **タブは付箋**にした。角丸なし（角ばらせる）、`rotate-[±2deg]` で手貼り感、
  影 3px で浮かせる。`-top-16 sm:-top-20 w-32 sm:w-36 h-18 sm:h-22 z-[-1]`。
  高さと `-top-*` は**背面に回ってもラベルが前面カードの上端より上に残る**よう
  決めてある（背面は右下へ 16/24px ずれるので、その分の逃げが要る）。
  ENGINEER が右、GENERAL が左。ラベルは参考どおり英語
- **中身の枠** … 黒帯の見出しチップ（`-rotate-2`）、白チップ（`border-2` ＋ 影 2px）、
  下段の透かしとバッジ

**2 枚のカードは同じ骨格**にする（参考の ENGINEER カード側の構造）。上から
**見出しチップ（アイコン＋語＋綴り）／チップ列／本文／下段（透かし＋バッジ）**。
違うのは色・タブ・アイコン・透かし・綴り・チップ列・本文だけで、構造は
`MeaningCards.tsx` の `card()` 一か所で描いている。差を付けたくなったら
`CARDS` の表に足すこと（**片方だけレイアウトを変えない**）。

| | ENGINEER | GENERAL |
|---|---|---|
| 綴り | `engineer.spelling` | `general.spelling` |
| チップ列 | 3 段階の切替ボタン | 読み（切替はない） |
| 本文 | `engineer.levels[n]` | `general.meaning` |
| アイコン | `Terminal` | `Smile` |

下段左の透かしは付箋と同じラベル（`ENGINEER` / `GENERAL`）。`CARDS` の `label` が
付箋・透かし・下段バッジの行き先表示を兼ねているので、片方だけずれることはない。

**下段右のバッジは 2 枚で完全に共通**（`Badge`）。形も並びも同じで、
文言だけが `TAP FOR ENGINEER` / `TAP FOR GENERAL` と行き先で入れ替わる。
片方だけ別の文言やアイコンにしないこと。

**見出し語（`term`）はカタカナ**で、両方の見出しチップに同じものが出る。
その隣に小さく出る**英語の綴りだけが視点ごとに違いうる**
（フロートはどちらも `float`、`Ruby` と `ruby` のように大文字小文字だけ違う例もある）。
理由は下の「見出し語の表記」。

見出し要素（語ページの `h1`・一覧の `h2`）は GENERAL 側が持ち、ENGINEER 側の同じ位置は
`p`。**綴りの `span` は見出し要素の外に置く**（中に入れると `h1` のテキストが
「ジェイソン Jason」になり `<title>` とずれる）。カードのどこをクリックしても前後が
入れ替わる（参考と同じ）。段階チップとバッジだけは `stopPropagation` して入替を起こさない。

デフォルト前面は語ページ・一覧とも**エンジニア**。一覧は `href` を渡した静的プレビューで、
同じコンポーネントを島にせず描画している（ボタン類は `span` になる）。

エンジニア視点の説明は **`engineer.levels` に必ず 3 段階**で用意する。
順に **さらっと / しっかり / がっつり**（後ろほど技術度が高い）。各段階は独立した全文で、
**部分列などの制約はない**（自然な日本語でよい）。カード内の 3 つのボタンで
`levels[0..2]` を切り替える。`src/content.config.ts` が `length(3)` を検証し、
3 個でなければビルドが止まる。

> 旧方式（部分列制約＋`data-eng`/`data-show` の CSS 切替＋グローバルスライダー）は
> 廃止した。切替は MeaningCards 島の React 状態が担う。過去メモに出てくる
> `subsequence.ts` / `levelize.ts` / `LevelText.astro` / `EngineerSlider.tsx` は
> もう存在しない。

## 見出し語の表記（2026-07-26）

**`term`（見出し語）はカタカナ、英語の綴りは `engineer.spelling` /
`general.spelling` が視点ごとに持つ。**

このサイトが集めているすれ違いは**会話で起きる**（タイトルからしてツッコミの台詞）。
つまり語の同一性を担保しているのは綴りではなく音で、`float` も口に出せば
「ふろーと」で衝突する。見出しをカタカナにすると**見出し語がどちらの視点にも
属さない中立な形**になり、次の 2 つが同時に片付く。

- **綴りが食い違う語を同じ棚に置ける。** ジェイソン ＝ `JSON` / `Jason`、
  キャッシュ ＝ `cache` / `cash`、シンク ＝ `sync` / `sink`、ルート ＝ `root` / `route`。
  日本語話者にしか起きない誤解なので、この軸はサイトの独自性でもある
- **`h1` が `<title>`・パンくずと一致する。** 見出し語がエンジニア側の綴りだった頃は、
  `h1` を持つ GENERAL カードに何を出すかが決まらなかった

**`spelling` は両側とも必須**にしてある。一致することが多く二度書きに見えるが、
一致するかどうかを語ごとに必ず確かめさせるため（`Ruby` と `ruby` のように
大文字小文字だけ違う例が既にある）。省略時フォールバックを足さないこと。

綴りの行き先は次のとおり。**`term` だけで済ませる場所と併記する場所を混ぜないこと。**

| 場所 | 出るもの |
|---|---|
| `h1` / 一覧の `h2` / パンくず / 前後ナビ | `term` だけ（中立な見出し語） |
| カードの見出しチップ | `term` ＋ その視点の `spelling`（見出し要素の**外**） |
| `<title>` / RSS / OGP 画像 | `termLabel()` ＝ `フロート（float）`、食い違えば `（JSON / Jason）` |
| `WordEntry` の各節見出し / `*.md` の各節見出し | `term` ＋ その節の `spelling` |
| JSON-LD | `name` は `term`、`alternateName` の先頭がその視点の `spelling` |

併記の文字列は **`src/lib/words.ts` の `spellingLabel()` / `termLabel()` でしか作らない**
（`term` と綴りを各所で連結すると、食い違う語だけ表示がばらける）。

URL は `term` ではなく**ファイル名（`word.id`）**なので、見出しを変えても
パーマリンクは動かない。`id` は英語の綴りに合わせる（`float.md` / `ruby.md`）。

## 主要ファイル

| パス | 役割 |
|---|---|
| `src/content.config.ts` | Zod スキーマ（`term` はカタカナ、`spelling` は両側必須、`engineer.levels` は 3 段階、タグは統制語彙） |
| `refs/NeoBrutalismCards.tsx` | デザインの原典。見た目で迷ったらこれに合わせる |
| `src/components/MeaningCards.tsx` | 重なる意味カード＋段階切替。唯一の状態を持つ island（`href` を渡すと一覧用の静的プレビュー） |
| `src/lib/tags.ts` | タグの統制語彙（tech/daily の 2 世界）。未定義タグはビルド停止 |
| `src/components/WordEntry.astro` | カードの下に置く**静的な全文**（3 段階すべて・両方の用例・別名）。島の外なので JS なしで読める |
| `src/lib/site.ts` | サイト定数と**絶対 URL の唯一の出どころ**。起点は `astro.config.mjs` の `site` |
| `src/lib/schema.ts` | JSON-LD。`DefinedTerm` を 2 ノード（エンジニア／ふつう）＋ `FAQPage` ＋ パンくず |
| `src/lib/plaintext.ts` | `llms.txt` / `llms-full.txt` / `/words/<語>.md` の生成。3 つとも同じ関数から作る |
| `src/lib/words.ts` | 語の取得と**並び順の一本化**（読みの五十音順）。前後ナビと、綴り併記（`spellingLabel` / `termLabel`）もここ |
| `src/lib/ui.ts` | 複数ページで使う装飾クラス（黒ラベル・白チップ・白い箱） |
| `src/pages/og/_card.ts` | OGP 画像のレイアウト。`_` 始まりなのでルートにならない |
| `src/components/ui/` | shadcn CLI で取り込んだ RetroUI コンポーネント。手で書き換えてよい |
| `src/components/SiteLogo.astro` | タイトルロゴ。**画像ではなく文字組みの吹き出し**。寸法は全部 em で、親の font-size だけで拡縮する（版は 1 つだけ） |
| `src/components/SiteHeader.astro` | 全ページ共通ヘッダー（sticky）。小さいロゴ＋「ことば一覧」 |
| `scripts/subset-logo-font.py` | ロゴ書体（Dela Gothic One）をロゴの文字だけに削って woff2 にする |
| `scripts/subset-og-font.py` | 上とは別物。**OGP 画像用の ttf**（satori は woff2 を読めない）。ブラウザには配らない |
| `public/fonts/` | 上の出力 ＋ `OFL.txt`（再配布に必要なライセンス全文。消さないこと） |
| `scripts/recolor-logo.py` | 旧・画像ロゴの塗り替え。**現在サイトからは参照していない**（OGP 用に残してある） |
| `src/styles/global.css` | RetroUI テーマ（配色・影・角丸） |

**タイトルロゴは画像をやめて文字で組んである**（ユーザー指示）。
**吹き出しの形**で、中に「そのフロート、／アイス乗ってません！」を 2 行に組み、
**2 語をサイトのカードと同じ色でマーカー**してある。次の 5 点が設計の core。

- **形が吹き出しなのは、この見出しが「勘違いを指摘するツッコミの台詞」だから。**
  尻尾は左下（画面の左に喋り手がいる見立て。ヘッダーではロゴの位置そのもの）。
  サイト唯一の吹き出しなので、これがロゴの形として効く
- **マーカーの色に意味がある。** `フロート`＝`#4ECDC4`（エンジニア視点の float）、
  `アイス`＝`#FFD166`（ふつうの人の float）、`！`＝`#FF6B6B`（オチ・少し傾ける）。
  **タイトルそのものが「2 つの世界」の図解になっている**。色を入れ替えると意味が消える
- **マーカーは枠線なしの塗りだけ**。輪郭は吹き出しの黒枠だけにする（入れ子の枠は重い）。
  文字は 3 つとも黒。カードと同じ「黒文字 ＋ 色面」の作り
- **影は `box-shadow` ではなく `drop-shadow`**。box-shadow だと四角い本体の影しか出ず
  尻尾に影が付かない。ぼかしは 0 のままなので見た目はサイトのオフセット影と同じ
- **版は 1 つだけ**（ヘッダーもトップも同じコンポーネント）。文字の大小を 4 段に抑えて
  あるので 16px でも 54px でも成立する。**ヘッダー用の別版を作らないこと**
- **寸法はすべて em**。基準（親の font-size）は**いちばん大きい `フロート` の大きさ**。
  全体は 幅 7.88em × 高さ 3.62em（約 2.2 : 1）。置く側は font-size を決めるだけでよい
  （ヘッダー 16/18px、トップの見出し 34/54px）。px を混ぜるとヘッダー側で破綻する
- **マーカーの `pt` 0.02 と `pb` 0.13 が非対称なのは意図的**（光学的中央合わせ）。
  和文の字面はベースライン +0.88〜−0.12、行内のベースラインは上から 0.936em なので、
  上下同じ値にすると下に寄って見える。詳細は `SiteLogo.astro` の `HL` のコメント
- **書体は Dela Gothic One**（重めのポップなゴシック / SIL OFL 1.1）。ロゴの 17 文字だけに
  削った 1.9KB の woff2 を自己ホストしている（`scripts/subset-logo-font.py`）

**トップの一覧は見出し語だけ**を並べる（意味は語ページで読む）。ただし float は
サイトの根幹なので、一覧の上に**操作できる切り替わりカードを代表例として 1 枚**置いてある。

`global.css` の CSS 変数は**参考の配色に合わせて書き換えてある**（`--background` は
violet-300、`--engineer` は `#4ECDC4`、`--general` は `#FFD166`、`--border` は純黒）。
カードまわりは参考のマークアップをそのまま使っているので `bg-[#4ECDC4]` のような
リテラルが並ぶ。**これは意図的**（かつては「配色をハードコードせず変数で書く」ルールが
あったが、「参考をそのまま真似する」方針に置き換わった）。カード以外の部品を足すときは
変数側（`bg-engineer` / `bg-general` / `bg-card`）を使えば同じ色が出る。

紙面は**ドットの下敷きの上に書類を置く**構成。ドットは `body` に敷いてあり、色は `--dot`。
カードのオフセット影が浮いて見えるのはこの下敷きのおかげ。見出しラベルは
**黒帯をわずかに傾けて**置く（用例ラベルなど）。紙に貼ったラベルの見立て。

## SEO / LLMO まわりの決めごと

**カードは JS で切り替わるので、HTML に文字として出るのは 1 段階ぶんだけ。**
残りは `<astro-island props="...">` の**属性値の中**にしかなく、クローラも
LLM も本文として読まない。だから **`WordEntry.astro` が全文を静的に出す**。
ここは SEO 用の重複ではなく「カードが構造上できないこと（3 段階の見比べ・
両方の意味の同時表示）をやる場所」。**片方だけ直して内容がずれないようにすること。**

- **絶対 URL は `src/lib/site.ts` でしか作らない。** ドメインは未取得で、
  `astro.config.mjs` の `site` に暫定値が入っている。各ページで文字列連結すると
  ドメイン確定時に直し漏れる
- **`tldr` は 1 語 1 文の言い切り**（「エンジニアが X と言うときは〜。〜ではない。」）。
  meta description・OGP・JSON-LD の description・ページ冒頭の 4 か所に**同じ文**が入る。
  出どころは 1 つ（frontmatter）なのでずれない。必須項目
- **語の並び順は `src/lib/words.ts` の五十音順に一本化**。一覧・前後ナビ・
  llms.txt が別々に並べ替えると「一覧の隣」と「次の語」がずれる
- **OGP 画像に説明文は載せない。** 載せると任意の漢字が要り、同梱フォントが
  数 MB になる。画像は「語」と「2 つの意味がある」という構図だけを見せ、
  説明は OGP の description が担当する。この住み分けのおかげで
  OG フォントは ASCII ＋ かな ＋ 固定文言だけで 38KB に収まっている。
  **固定文言を足したら `src/pages/og/_card.ts` の `OG_FIXED_TEXT` に書き、
  `python3 scripts/subset-og-font.py` を実行し直す**（忘れると豆腐になる。
  ビルドログに警告は出る）。語ごとに出るのは**見出し語（カタカナ）と綴り**で、
  サブセットは ASCII とかな全域を無条件に入れているので、見出し語をカタカナに
  しても綴りが `JSON / Jason` になっても**焼き直しは要らない**
- **島の中では `cn`（tailwind-merge）を使わない。** クラス衝突の解決表が
  そのままクライアントへ行く（gzip 8KB）。`MeaningCards.tsx` は `clsx` 直呼び。
  島の外（`buttonVariants` など astro 側）は `cn` のままでよい
- **カードに `select-none` を戻さないこと。** 辞書なので定義文はコピーできる
  必要がある。ドラッグ選択と入替の衝突は「選択があるときは入れ替えない」という
  判定で処理している（`MeaningCards.tsx` の `flip`）

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
