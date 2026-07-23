# noice-float

エンジニアと非エンジニアで意味の異なる語を、両方の視点から並べて引ける辞書サイト。
タイトルは「そのフロート、アイス乗ってません！」。

- 技術選定の全体像と決定理由: `docs/tech-selection.md`
- 現在地・残タスク・保留中の判断: `docs/progress.md`

## このプロジェクト固有の設計ルール

**意味の表示は 2 枚の重なるカードで行う**（`src/components/MeaningCards.tsx`）。
書類が重なったように前後に並べる。2 枚とも本文を持つ完全なカードで、背面はずれて
のぞく。背面カード面のクリック（または前面見出しの ⇄）で前後が入れ替わり、
`transition-transform` で滑って動く。デフォルト前面はエンジニア。

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
| `src/components/MeaningCards.tsx` | 重なる意味カード＋段階切替ボタン。唯一の状態を持つ island |
| `src/lib/tags.ts` | タグの統制語彙（tech/daily の 2 世界）。未定義タグはビルド停止 |
| `src/components/ui/` | shadcn CLI で取り込んだ RetroUI コンポーネント。手で書き換えてよい |
| `src/components/SiteLogo.astro` | タイトルロゴ。`alt` が見出しテキストを兼ねる |
| `src/styles/global.css` | RetroUI テーマ（配色・影・角丸） |

配色はハードコードせず、`global.css` の CSS 変数（`bg-card` / `border-4` /
`shadow-lg` / `bg-engineer` / `bg-general`）を使うこと。値はタイトルロゴから抽出してある。

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
