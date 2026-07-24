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
**見出しチップ（アイコン＋語）／チップ列／本文／下段（透かし＋バッジ）**。
違うのは色・タブ・アイコン・透かし・チップ列・本文だけで、構造は
`MeaningCards.tsx` の `card()` 一か所で描いている。差を付けたくなったら
`CARDS` の表に足すこと（**片方だけレイアウトを変えない**）。

| | ENGINEER | GENERAL |
|---|---|---|
| チップ列 | 3 段階の切替ボタン | 読み（切替はない） |
| 本文 | `engineer.levels[n]` | `general.meaning` |
| アイコン | `Terminal` | `Smile` |

下段左の透かしは付箋と同じラベル（`ENGINEER` / `GENERAL`）。`CARDS` の `label` が
付箋・透かし・下段バッジの行き先表示を兼ねているので、片方だけずれることはない。

**下段右のバッジは 2 枚で完全に共通**（`Badge`）。形も並びも同じで、
文言だけが `TAP FOR ENGINEER` / `TAP FOR GENERAL` と行き先で入れ替わる。
片方だけ別の文言やアイコンにしないこと。

語名は両方の見出しチップに出る。見出し要素（語ページの `h1`・一覧の `h2`）は
GENERAL 側が持ち、ENGINEER 側の同じ位置は `p`。カードのどこをクリックしても前後が
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

## 主要ファイル

| パス | 役割 |
|---|---|
| `src/content.config.ts` | Zod スキーマ（`engineer.levels` は 3 段階、タグは統制語彙） |
| `refs/NeoBrutalismCards.tsx` | デザインの原典。見た目で迷ったらこれに合わせる |
| `src/components/MeaningCards.tsx` | 重なる意味カード＋段階切替。唯一の状態を持つ island（`href` を渡すと一覧用の静的プレビュー） |
| `src/lib/tags.ts` | タグの統制語彙（tech/daily の 2 世界）。未定義タグはビルド停止 |
| `src/components/ui/` | shadcn CLI で取り込んだ RetroUI コンポーネント。手で書き換えてよい |
| `src/components/SiteLogo.astro` | タイトルロゴ。`alt` が見出しテキストを兼ねる |
| `scripts/recolor-logo.py` | ロゴを参考パレットへ塗り替える。入力は `noicefloat-logo-source.png`（元の配色。触らない） |
| `src/styles/global.css` | RetroUI テーマ（配色・影・角丸） |

`global.css` の CSS 変数は**参考の配色に合わせて書き換えてある**（`--background` は
violet-300、`--engineer` は `#4ECDC4`、`--general` は `#FFD166`、`--border` は純黒）。
カードまわりは参考のマークアップをそのまま使っているので `bg-[#4ECDC4]` のような
リテラルが並ぶ。**これは意図的**（かつては「配色をハードコードせず変数で書く」ルールが
あったが、「参考をそのまま真似する」方針に置き換わった）。カード以外の部品を足すときは
変数側（`bg-engineer` / `bg-general` / `bg-card`）を使えば同じ色が出る。

紙面は**ドットの下敷きの上に書類を置く**構成。ドットは `body` に敷いてあり、色は `--dot`。
カードのオフセット影が浮いて見えるのはこの下敷きのおかげ。見出しラベルは
**黒帯をわずかに傾けて**置く（用例ラベルなど）。紙に貼ったラベルの見立て。

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
