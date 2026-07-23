# noice-float

エンジニアと非エンジニアで意味の異なる語を、両方の視点から並べて引ける辞書サイト。
タイトルは「そのフロート、アイス乗ってません！」。

- 技術選定の全体像と決定理由: `docs/tech-selection.md`
- 現在地・残タスク・保留中の判断: `docs/progress.md`

## このプロジェクト固有の絶対ルール

`src/content/words/*.md` の `engineer.levels` は、**後の要素が直前の要素の部分列**で
なければならない（順序を保った文字の削除だけで到達できること）。助詞の置換や語順の
入れ替えは不可。たとえば「32bit **を**使って」を下位段階で「32bit **で**」には
できない。

違反すると `src/content.config.ts` の `superRefine` がビルドを停止させる。

この制約があるおかげで、HTML に出力される説明文は `levels[0]` の全文ひとつだけで済み、
消える箇所だけが `<span data-show>` に切り分けられる。サイト全体の設計がこの性質に
乗っているため、崩さないこと。

説明文の変形は CSS が担当し、JavaScript は `<html data-eng="N">` を書き換えるだけ。
この役割分担も設計の要なので、React 側で表示・非表示を制御する方向へ倒さないこと。

## 主要ファイル

| パス | 役割 |
|---|---|
| `src/lib/subsequence.ts` | 部分列判定（`Intl.Segmenter` で書記素単位） |
| `src/lib/levelize.ts` | 差分から断片を切り出し、0〜10 の共通スケールへ配分 |
| `src/content.config.ts` | Zod スキーマと部分列制約の検証 |
| `src/components/LevelText.astro` | 断片を `<span data-show>` として描画 |
| `src/components/EngineerSlider.tsx` | 唯一の状態を持つ island |
| `src/styles/global.css` | 表示切替の CSS と、RetroUI テーマ（配色・影・角丸） |
| `src/components/ui/` | shadcn CLI で取り込んだ RetroUI コンポーネント。手で書き換えてよい |
| `src/components/SiteLogo.astro` | タイトルロゴ。`alt` が見出しテキストを兼ねる |

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
