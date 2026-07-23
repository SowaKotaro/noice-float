# 技術選定書：そのフロート、アイス乗ってません！

- 作成日: 2026-07-23
- 対象: エンジニアと非エンジニアで認識の異なる語を収集・公開する辞書サイト
- ステータス: 確定（実装未着手）

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| タイトル | そのフロート、アイス乗ってません！ |
| 概要 | エンジニアと非エンジニアで認識の異なる語を、両方の視点から並べて見せる辞書サイト |
| 雰囲気 | ネオブルータリズム／ポップで可愛い／ワクワクする |
| 主ターゲット | IT エンジニア（「普通に使っているが一般には伝わらない」というユーモラスな戒め） |
| 副ターゲット | 非エンジニア |
| 想定データ量 | 1000 語未満 |
| 配信環境 | さくら VPS（Ubuntu）+ nginx |
| リポジトリ | `noice-float`（GitHub パブリック） |
| ドメイン | 未取得（`noicefloat.dev` / `noicefloat.com` を候補とする） |

### 体験の核

各語は「エンジニア視点の説明」と「一般視点の説明」を併記する。さらに **エンジニア度スライダー** を備え、これを引き下げるとエンジニア側の説明文から専門的な語句が順にフェードアウトし、文字間隔が詰まって平易な文へ変化する。

`float` の場合、最上位では「IEEE 754 で定められた……」だったものが、最下位では **「小数。」** だけになる。これにより「こいつら、小数のことをフロートとか言ってるのか」という気づきを与えるのが狙い。

**この体験の気持ちよさがサイトの成否をほぼ決める。** 他のあらゆる技術判断はこれに従属する。

---

## 2. 対話で確定した前提

| 論点 | 決定 |
|---|---|
| コンテンツの収集 | 当面は管理者のみが執筆。将来の投稿開放は願望レベル |
| 閲覧者の操作 | 閲覧＋検索のみ。リアクション・コメントは不要 |
| 語の追加方法 | ローカルで Markdown を書き、コマンド一発でデプロイ |
| 検索の要件 | 単純な部分一致＋タグ絞り込み |
| フォント | 見出しは個性的、本文は軽量 |
| アクセス解析 | Google Analytics 4 |
| OGP 画像 | 語ごとにビルド時自動生成 |
| ソース管理 | GitHub パブリック＋ローカルから rsync |
| スライダーの効き範囲 | サイト全体連動＋ localStorage 保存 |
| スライダー初期値 | 初回訪問時に「あなたはエンジニア？」と尋ねて決定 |
| 段階の作り方 | 各段階が上位段階の**部分列**であり、かつ文として成立すること |
| 執筆方式 | 完成文を並べ、ビルド時に自動 diff |
| 執筆支援 | 部分列制約のビルド時検証＋ LLM による下書き生成 |
| 一般側の説明 | 固定（スライダーで変化しない） |

これらの結果、**サーバーサイドの実行環境を一切必要としない完全静的サイト**となった。VPS に Node.js は入らない。落ちるプロセスがないため、監視・再起動・バックアップの運用が発生しない。

---

## 3. 技術スタック

| レイヤ | 選定 | 備考 |
|---|---|---|
| フレームワーク | Astro 7 | 静的ビルド |
| UI ランタイム | React 19 | islands のみ |
| 言語 | TypeScript | |
| スタイル | Tailwind CSS v4 | `@tailwindcss/vite` |
| コンポーネント | RetroUI | shadcn CLI でリポジトリ内に取り込む |
| コンテンツ | Content Collections + Zod | Markdown |
| 島間の状態共有 | nanostores / `@nanostores/react` / `@nanostores/persistent` | 1KB 未満 |
| 差分計算 | jsdiff | **ビルド時のみ** |
| OGP 生成 | satori + `@resvg/resvg-js` | **ビルド時のみ** |
| フォント | `@fontsource/m-plus-rounded-1c` | サブセット自己ホスト |
| 執筆 CLI | `@anthropic-ai/sdk` | devDependency |
| 整形 | Prettier + `prettier-plugin-astro` | ESLint は省略 |
| パッケージ管理 | npm | 実行環境に pnpm が未導入だったため。単一パッケージ構成のため差は小さい |
| サイトマップ | `@astrojs/sitemap` | |

### ブラウザに届くもの

React ランタイム、nanostores、スライダー island、検索 island のみ。**説明文の変形にも検索にも実行時ライブラリを使わない。** jsdiff と satori はビルド時にしか動かないため、成果物には含まれない。

### フレームワーク選定の根拠

Next.js（static export）ではなく Astro を選んだ理由:

- 配信 JS がゼロから始まる。Next.js は全ページで React ランタイムを配る
- Content Collections + Zod により frontmatter が型検証され、**書き間違いがビルド時に落ちる**
- static export に伴う制約（Server Actions 不可、画像最適化のローダー差し替え等）を回避できる
- RetroUI は shadcn CLI 方式でコードを自リポジトリに取り込むため、Astro でも支障なく動作する

Next.js の唯一の優位点は「将来そのまま動的化できる」ことだが、投稿開放が願望レベルである以上、この保険に費用を払う価値はないと判断した。なお Astro も Node アダプタへ切り替えれば同一コードベースのまま動的化できるため、退路は確保されている。

---

## 4. アーキテクチャ

```
[ローカル]  npm run build  →  dist/  ──rsync──→  [さくら VPS]  nginx が静的配信
     ↑                                              ↓
  GitHub (public)                          Let's Encrypt / GA4
```

### ディレクトリ構成（案）

```
src/
  content/
    words/            # 語ごとの Markdown
      float.md
  components/
    EngineerSlider.tsx    # React island
    SearchPanel.tsx       # React island
    OnboardingDialog.tsx  # React island
    ui/                   # RetroUI から取り込んだコンポーネント
  layouts/
  pages/
    index.astro
    words/[slug].astro
    og/[slug].png.ts      # ビルド時 OGP 生成
  lib/
    subsequence.ts        # 部分列判定
    levelize.ts           # diff → span 変換
  stores/
    engineerLevel.ts      # nanostores
scripts/
  draft.ts                # LLM 下書き生成 CLI
```

---

## 5. データスキーマ

```yaml
---
term: "float"
reading: "ふろーと"
aliases: ["フロート", "浮動小数点数"]

engineer:
  category: "データ型"
  levels:
    - "IEEE 754 で定められた、符号部・指数部・仮数部により浮動小数点数を 32bit で表現するデータ型。"
    - "浮動小数点数を 32bit で表現するデータ型。"
    - "浮動小数点数を表現する型。"
    - "小数。"

general:
  category: "飲料"
  meaning: "アイスクリームを浮かべた飲料。"

tags: ["初心者殺し", "飲食店で言うな"]
publishedAt: 2026-07-23
---

（本文：もう少し長い解説やエピソード。任意）
```

### 制約

`levels[i+1]` は `levels[i]` の**部分列**でなければならない（順序を保った文字の削除のみで到達できること）。上記の例はこれを満たす。最下段の「小数。」は `levels[2]` の「浮動<u>小数</u>点数を表現する型<u>。</u>」から取り出されている。

この制約により、**HTML に入るテキストは `levels[0]` の全文ただ 1 つ**になる。段階ごとに別の文を出力する必要がなく、以下の利点が生じる。

- ページの HTML が段階数に比例して増えない
- 検索エンジンには常に完全な全文がインデックスされる（重複コンテンツも発生しない）
- 文字が消えて詰まる＝DOM から要素が消えるだけなので、アニメーションが素直に書ける

### 執筆上の注意

削除のみで文を成立させるため、**助詞の置換ができない**。たとえば `levels[0]` に「32bit **を**」と書いた場合、下位段階で「32bit **で**」に変えることはできない。原文を書く時点で、削っても助詞が繋がるよう設計する必要がある。

### 検証

Zod の `superRefine` で部分列制約を検証し、違反したらビルドを失敗させる。制約を守り忘れることが構造的に起きない。

```ts
export const isSubsequence = (needle: string, haystack: string): boolean => {
  const seg = new Intl.Segmenter("ja", { granularity: "grapheme" });
  const n = [...seg.segment(needle)].map((s) => s.segment);
  let i = 0;
  for (const { segment } of seg.segment(haystack)) {
    if (i < n.length && segment === n[i]) i++;
  }
  return i === n.length;
};
```

書記素単位（`Intl.Segmenter`）で扱うため、絵文字や結合文字が壊れない。

---

## 6. エンジニア度スライダーの仕様

### 処理の流れ

1. **ビルド時**：jsdiff で隣接段階の差分を取り、消える文字を `<span data-show="…">` で包む
2. **ビルド時**：語ごとに段階数が異なるため、各語の段階を**グローバル 0〜10 スケール**に配分する
3. **実行時**：スライダー island が `<html data-eng="N">` を書き換える
4. **実行時**：表示切替は CSS が担当する

### 出力される HTML

```html
<html data-eng="7">
  <p>
    <span data-show="8 9 10">IEEE 754 で定められた、符号部・指数部・仮数部により</span>浮動<span
      data-show="4 5 6 7 8 9 10"
      >動</span
    >小数<span data-show="4 5 6 7 8 9 10">点数を…</span>
  </p>
</html>
```

### CSS

レベルの数だけ以下の 1 行を並べるだけでよい（11 段階なら 11 行）。

```css
html[data-eng="7"] [data-show]:not([data-show~="7"]) {
  display: none;
}
```

**説明文の変形自体に JavaScript は不要。** React island の仕事は `<html>` の属性を 1 つ書き換えることだけ。

### アニメーション

CSS の `transition-behavior: allow-discrete` を用い、**先に opacity が 0 になってから display:none で行が詰まる**二段構えとする。

当初は `document.startViewTransition()` を使う想定だったが、実装時に見送った。View Transitions はルート要素をひとつのスナップショットとして扱うため、文字単位の移動を補間するには残る文字すべてに `view-transition-name` を与える必要があり、現実的でないため。`allow-discrete` 方式なら CSS だけで完結し、未対応環境でも `display:none` は効くため機能は保たれる。

### チラつき防止

`<head>` 内のインラインスクリプトで localStorage の値を読み、React のハイドレーション前に `<html data-eng>` を設定する。ダークモード実装と同じ手法。

### グローバル連動

スライダー値は nanostores（`@nanostores/persistent`）でサイト全体に共有し、localStorage に保存する。一覧・カード・詳細のすべてが連動する。

語ごとに段階数が異なるため、一覧ページでスライダーを引くと**語ごとにバラバラのタイミングで文字が崩れていく**。これは意図した副作用で、見ていて楽しい挙動になるはず。

ページ遷移後もスライダー位置が維持されるよう、Astro の `<ClientRouter />`（View Transitions）を併用する。

### 初回訪問時のオンボーディング

初回のみ「あなたはエンジニア？」をネオブルータリズムのダイアログで提示し、初期値を決定する。サイトのコンセプト説明も兼ねる。2 回目以降は localStorage の値を使う。

### 一般側の扱い

**固定。スライダーで変化しない。** エンジニア側だけが崩れていき、最終的に一般側の隣で「小数。」と並ぶ構図をつくる。

---

## 7. 検索

**依存パッケージなし。** 全語の `term / reading / aliases / tags / category` だけを軽量 JSON（1000 件でも 100KB 未満）に焼き、React island 側で `includes` によりフィルタする。

正規化のみ実装する:

- ひらがな ↔ カタカナ
- 英字の大文字小文字
- 全角 ↔ 半角

1000 件程度の配列走査はブラウザにとって一瞬であり、1 文字打つごとに結果が変わる即応性が得られる。Fuse.js のようなあいまい検索ライブラリは不要と判断した。

---

## 8. フォント・デザイン

| 用途 | 選定 | 転送量 |
|---|---|---|
| 見出し・ロゴ | M PLUS Rounded 1c (900) を Fontsource でサブセット自己ホスト | 必要な範囲のみ |
| 本文 | `system-ui` 起点のシステムフォントスタック | **0 バイト** |
| ASCII のみ | 等幅フォント（JetBrains Mono 等）を `unicode-range` で差し込み | 小 |

丸ゴシックの可愛さ × 極太のブルータルさが「ポップで可愛いのに主張が強い」に直結する。

ASCII だけ等幅にすることで、本文中の `float` `boolean` といった語が**コードっぽく浮かび上がる**。エンジニア向けサイトとしての体を安価に獲得できる。

RetroUI の太枠・ハードシャドウは CSS のみで表現されるため、カード・バッジ・見出しなどは island 化せず静的 HTML として焼ける。island にするのはスライダー・検索パネル・同意バナー・オンボーディングのみ。

---

## 9. OGP 画像

`src/pages/og/[slug].png.ts` として、**satori + @resvg/resvg-js** でビルド時に静的 PNG を生成する。実行時コストはゼロ。

- Vercel 専用の `@vercel/og` は VPS では使えないため不採用
- 日本語フォントの ArrayBuffer を satori に渡す必要があるが、見出し用フォントを流用する
- 語とキャッチコピーをネオブルータリズム調のレイアウトに焼き込む

---

## 10. ビルド・デプロイ・インフラ

### デプロイ

```json
{
  "scripts": {
    "deploy": "astro build && rsync -az --delete dist/ user@vps:/var/www/<domain>/"
  }
}
```

ローカルでビルドして成果物のみ転送するため、**VPS に Node.js は不要**。本番機のメモリをビルドで消費することもない。

### nginx

- 静的配信のみ（リバースプロキシなし）
- gzip / brotli 圧縮
- fingerprint 付きアセット: `Cache-Control: public, max-age=31536000, immutable`
- HTML: `Cache-Control: no-cache`

### その他

- HTTPS: certbot（Let's Encrypt）、自動更新
- ufw で 22 / 80 / 443 のみ開放

### CI

GitHub Actions による自動デプロイは行わない。ただしパブリックリポジトリであるため、**PR に対してビルドが通るかだけを確認する軽量なワークフロー**は導入する価値がある。他人の PR を安全に取り込めるようになり、CI/CD の運用負荷も発生しない。

---

## 11. 計測・法務

GA4 は Cookie を用い外部へデータを送信するため、日本では**改正電気通信事業法の外部送信規律**の対象となる。以下が必要。

- プライバシーポリシーページ（静的ページ 1 枚）
- 外部送信に関する公表（送信先・送信項目・利用目的の明記）
- Cookie 同意バナー（法的には「公表」で足りる場合もあるが、入れておく）

GA4 のタグは `defer` で読み込み、初期表示を阻害しない。同意バナーは小さな React island として実装する。

---

## 12. 執筆ワークフロー

```
語と最大エンジニア度の文を用意
  ↓
npm run draft <term>         # Claude API が削り段階の候補を生成
  ↓
人が文体と正確性を校正        # ここが本体。LLM の出力はあくまで叩き台
  ↓
npm run dev でスライダーを動かし体感を確認
  ↓
ビルド時に部分列制約を自動検証（違反はビルドエラー）
  ↓
npm run deploy
```

`scripts/draft.ts` は `@anthropic-ai/sdk` を使い、**部分列制約を満たす候補のみを出力させる**プロンプトを与える。生成された候補は `isSubsequence` で機械的に検証できるため、生成 → 検証のループを自動で回せる。

文体の面白さ（ユーモラスな戒めの温度感）は人手で入れ直す前提とする。

---

## 13. 明示的に採用しないもの

| 不採用 | 理由 |
|---|---|
| DB（SQLite / PostgreSQL） | 閲覧＋検索のみ、投稿開放は願望レベル。運用コストに見合わない |
| 認証・API サーバー | 同上 |
| Docker | 静的配信のため不要 |
| Fuse.js 等の検索ライブラリ | 1000 件未満なら部分一致で十分 |
| remark カスタム記法 | 完成文の自動 diff 方式により不要になった |
| GitHub Actions での自動デプロイ | 更新頻度に見合わない。PR のビルド確認のみ導入 |
| 通じなさ度ランキング | **辞書にランキングは存在しない**ため方針として不採用 |

---

## 14. 未決事項

- **ドメインの取得**（リポジトリ名に合わせ `noicefloat.dev` / `noicefloat.com` を想定。DNS と certbot 設定の前提）
- カテゴリ体系（`engineer.category` / `general.category` の語彙統制）
- URL 設計（`/words/float` 等）
- スライダーの UI 文言（「エンジニア度」の呼称）
- カラーパレット
- 初期投入語のリスト

---

## 15. 次のアクション

推奨は **プロジェクト初期化**。Astro + Tailwind v4 + RetroUI をセットアップし、`float` 1 語だけでスライダーが動く状態を作る。

このサイトの価値は「スライダーを引いたときの気持ちよさ」にほぼ全振りされているため、語を増やす前に体感を確かめるのが安全。とくに以下は実物で確認しないと判断できない。

- フェードアウト後に行が詰まるアニメーションの質感（`allow-discrete` の二段構え）
- グローバル 0〜10 スケールへの配分が自然に感じられるか
- 一覧ページで語ごとにバラバラ崩れる挙動が楽しいか、うるさいか
