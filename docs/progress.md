# 開発ログ / 引き継ぎメモ

最終更新: 2026-07-23

このファイルは、別のセッションから作業を再開するときに文脈を復元するためのものです。
背景と決定理由は `tech-selection.md`、執筆ルールは `../README.md` にあります。

---

## 現在地

**`float` 1 語が動く状態。** スライダーを引くと 5 段階で説明文が崩れ、
最下段で「小数。」に着地するところまで確認済み。

タイトルロゴと RetroUI が入り、配色もロゴから確定した。
まだフォントも検索も入っていない段階です。

---

## 完了していること

### 基盤

- Astro 7.1.3 + React 19 + Tailwind CSS v4 + TypeScript
- Content Collections（`src/content.config.ts` に glob loader で定義）

### タイトルロゴ

- `src/assets/noicefloat-logo.png` — 背景透過・余白トリム済み（1530×789 / RGBA）
- `src/components/SiteLogo.astro` — `astro:assets` の `<Image />` で webp へ変換。
  トップは `h1` の中で全幅、語ページは 240px でトップへのリンクとして置く。
  見出しテキストは `alt` が兼ねるので、別途テキストを添える必要はない
- 透過は **画像の縁とつながっている白だけ** を抜いている。バッジ内部と禁止マークの
  円内にも白があるため、「白を一律で透明化」する方式は使えない。
  再処理が必要になったら同じ方針で（連結成分ラベリング＋アンプリマルチプライ）

### RetroUI / デザインシステム

- shadcn CLI 4.14.0 が **Astro 7 + Tailwind v4 で問題なく通る**ことを確認（選定時の未検証事項）。
  `npx shadcn@latest init -y -b radix --no-monorepo --css-variables -p nova` で初期化。
  プリセット選択は対話式なので `-p` の指定と `< /dev/null` が必要
- `components.json` の `registries` に `@retroui` を登録。
  以降は `npx shadcn@latest add @retroui/<name>` で取り込める（`list @retroui` で一覧）
- `src/components/ui/slider.tsx` — RetroUI の Slider（radix-ui ベース）。
  `EngineerSlider.tsx` はこれを使う。ストアは localStorage の生文字列、Radix は数値配列なので、
  その変換は島の内側に閉じてある
- インポートエイリアス `@/*` を `tsconfig.json` に追加。`baseUrl` は TS 7 で廃止予定なので
  書かずに `paths` だけで通している

**テーマの構造**（`src/styles/global.css`）

- 見た目を決めているのは 2 つだけ。`--radius: 0` と、ぼかしのないオフセット影
  （`--shadow-lg: 6px 6px 0 0 var(--border)` など RetroUI のスケールをそのまま採用）
- 色は `:root` の CSS 変数に集約。ハードコードした `border-black` や
  `shadow-[8px_8px_0_0_#000]` は全廃し、`border-4` / `shadow-lg` / `bg-card` で書く
- **パレットはタイトルロゴの最頻色から取った**（ネイビー `#000C31` / ピンク `#FD4F97` /
  黄緑 `#BFF623` / 赤 `#FC221E`）。枠線と本文は黒ではなくロゴのネイビー。
  抽出し直したくなったら、不透明画素だけを色数で数えれば同じ値が出る
- `--engineer` / `--general` は 2 つの語義パネル専用のトークン。
  どちらの視点かを色で固定するため、汎用の accent とは分けてある

### データ構造：タグと用例

**タグ＝分野ファセット。「何の分野の語か」だけを担う**（絞り込みと回遊の軸）。
性質・ネタ・すれ違いの型はタグに載せない ── それらは本文で語る。この役割分担が肝。

- 1 語は 2 つの世界にまたがるので、タグも 2 世界に分かれる。
  `src/lib/tags.ts` の `TAGS` レジストリで、各タグに `world`（`tech` = エンジニア世界 /
  `daily` = 日常世界）と `description` を持たせる。float なら tech の `データ` と daily の `飲料`
- `world` は表示色にも使う。**tech = エンジニア緑（`bg-engineer`）/ daily = ふつうピンク（`bg-general`）**。
  `#データ`（緑）と `#飲料`（ピンク）が並ぶだけで「両方の世界に属する」というサイトの前提が一目で伝わる
- 統制語彙。`z.enum(TAG_NAMES)` で検証し、**未定義タグはビルドを止める**（部分列制約と同じ思想）。
  検証済み：不正タグを置くと許可語の一覧つきでエラーが出る
- 語ページ・一覧の両方でタグを表示（同じレジストリを引く）。`title` に description
- **`category` は廃止**した（`engineer.category` / `general.category`）。分野はタグへ一本化。
  パネル見出しは「エンジニア」「ふつう」だけになった

**用例**：`engineer.examples` / `general.examples`（`string[]`, 既定 `[]`, 目安 2〜3 個）。
語ページの各パネル下に `src/components/Examples.astro` で「用例」として表示。
スライダーの段階変形とは無関係な静的テキスト。

> タグ設計の経緯：当初は分野＋性質＋ネタを 1 配列に混ぜていたが、軸が混在して
> 分かりにくかった。「タグは分野だけ／それ以外は本文」に整理して役割を一意にした。

### エンジニア度スライダー（このプロジェクトの核）

- `src/lib/subsequence.ts` — 部分列判定。`Intl.Segmenter` で書記素単位に分割するため絵文字が壊れない
- `src/lib/levelize.ts` — jsdiff で隣接段階の差分を取り、各文字の生存段階を求めて断片へまとめる。語ごとに異なる段階数を 0〜10 の共通スケールへ配分する
- `src/content.config.ts` — Zod の `superRefine` で部分列制約を検証。違反するとビルドが止まる
- `src/styles/global.css` — 表示切替は CSS の属性セレクタ 11 行のみ
- `src/stores/engineerLevel.ts` — nanostores + localStorage でサイト全体連動
- `src/layouts/Layout.astro` — head のインラインスクリプトでハイドレーション前に反映（ちらつき防止）

### 検証済みの挙動

配信される HTML から各目盛りの表示を再構成した結果:

| 目盛り | 表示される説明文 |
|---|---|
| 10, 9 | IEEE 754 で定められた、符号部・指数部・仮数部により浮動小数点数を 32bit で表現するデータ型。 |
| 8, 7 | 符号部・指数部・仮数部により浮動小数点数を 32bit で表現するデータ型。 |
| 6〜4 | 浮動小数点数を 32bit で表現するデータ型。 |
| 3, 2 | 浮動小数点数を表現する型。 |
| 1, 0 | 小数。 |

HTML に入っているテキストは最上位段階の全文ひとつだけで、消える箇所が 8 個の
`<span data-show>` に切られている。

助詞を置換した不正データを置くとビルドが停止し、ファイル名と該当行つきで
エラーが出ることも確認済み。

---

## 未着手（おすすめの順）

1. **初回オンボーディング** — 「あなたはエンジニア？」を初回訪問時だけ出して
   スライダー初期値を決める
2. **検索・タグ絞り込み** — 依存パッケージなし。部分一致 +
   ひらがな/カタカナ・大文字小文字・全角半角の正規化
3. **フォント** — 見出しは M PLUS Rounded 1c をサブセット自己ホスト、本文は
   システムフォント、ASCII だけ `unicode-range` で等幅。
   `--font-sans` / `--font-head` の差し替えだけで済むようにしてある
4. **OGP 画像** — satori + `@resvg/resvg-js` でビルド時に静的生成
5. **執筆支援 CLI** — `npm run draft <term>`。`@anthropic-ai/sdk` で削り段階の
   候補を生成し、`isSubsequence` で機械的に検証する
6. **GA4** — プライバシーポリシー、外部送信の公表、同意バナーがセットで必要
7. **デプロイスクリプト** — rsync 先はドメイン決定後
8. **サイトマップ** — `@astrojs/sitemap`

---

## 保留中の判断

### 目盛り 11 に対して段階数が少ない件

`float` は 5 段階だが目盛りは 0〜10 なので、同じ表示が 2〜3 目盛り続く。
実機で触ってみて冗長に感じるようなら、**語ごとの段階数にスナップさせる方式**へ
変更できる。ただしサイト全体で値を共有している以上、語ごとに目盛り数を変えると
一覧ページでの一貫性が崩れるため、現行の共通スケール方式には理由がある。

一覧ページでスライダーを引くと語ごとにバラバラのタイミングで崩れるのは意図した
副作用。これが「楽しい」か「うるさい」かも実機での判断待ち。

### ロゴ右端が元画像の時点で切れている

バッジ右側のネイビー枠が、元画像のキャンバス右端で縦 200px ぶん途切れている。
透過処理の副作用ではなく、渡された画像がすでにそうなっていた。
「枠がフチまで抜けているデザイン」としても読めるため現状維持にしてあるが、
気になるなら余白を付けて生成し直すのが確実。

### 技術選定書に残っている未決事項

- ドメイン取得（`noicefloat.dev` / `noicefloat.com` が候補）
- ~~カテゴリ体系（`engineer.category` / `general.category`）~~ → `category` は廃止し、
  分野は `src/lib/tags.ts` の統制タグへ一本化した
- スライダーの UI 文言（「エンジニア度」という呼称でよいか）
- 初期投入語のリスト
- 辞書コンテンツのライセンス（コードの MIT と分けるか）

---

## 技術選定から変更した点

実装時に判明して方針を変えた箇所です。`tech-selection.md` にも反映済み。

| 項目 | 選定時 | 実際 | 理由 |
|---|---|---|---|
| Astro | 5 | **7.1.3** | 現在の最新。Content Collections は `src/content.config.ts` + glob loader 形式 |
| パッケージ管理 | pnpm | **npm** | 環境に pnpm が未導入だったため。単一パッケージなので差は小さい |
| アニメーション | View Transitions API | **CSS の `allow-discrete`** | View Transitions はルート要素を 1 枚のスナップショットとして扱うため、文字単位の移動を補間するには残る文字すべてに `view-transition-name` が必要で非現実的だった |

`<ClientRouter />` 自体はページ遷移時のスライダー位置維持のために入れてある。

---

## コマンド

```sh
npx astro dev --background   # 開発サーバー起動（http://localhost:4321）
astro dev status             # 状態確認
astro dev logs               # ログ
astro dev stop               # 停止

npm run build                # dist/ へ出力。部分列制約の検証もここで走る
npm run preview              # ビルド結果の確認
```

### 各目盛りの表示を確認したいとき

ビルド後の HTML から再構成するのが確実です。`dist/words/<語>/index.html` の
`bg-cyan-200` を含むセクション内の `<span data-show>` を拾い、
目盛りごとに `show` へ含まれるものだけを連結すると、その目盛りでの表示文が得られます。
