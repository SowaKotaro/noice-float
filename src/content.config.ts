import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { TAG_NAMES } from "./lib/tags";

const words = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/words" }),
  schema: z.object({
    /**
     * 見出し語。**カタカナで書く**。
     *
     * このサイトが集めているすれ違いは「会話で起きる」ものなので、
     * 語の同一性を担保しているのは綴りではなく音。見出しをカタカナにすると
     * 見出し語がどちらの視点にも属さない中立な形になり、綴りが食い違う語
     * （ジェイソン ＝ JSON / Jason）も同じ棚に置ける。
     *
     * 英語の綴りは `engineer.spelling` / `general.spelling` が持つ。
     * URL は `term` ではなくファイル名（`word.id`）なので、ここを変えても
     * パーマリンクは動かない。
     */
    term: z.string(),
    reading: z.string(),
    /** `term`・`spelling`・`reading` 以外の呼ばれ方（和名・関連表記など）。 */
    aliases: z.array(z.string()).default([]),

    /**
     * 語を 1 文で言い切った要約。「エンジニアが X と言うときは〜。〜ではない。」の形。
     *
     * ここが meta description・OGP・JSON-LD の description・語ページ冒頭の
     * 4 か所すべてに入る**唯一の出どころ**。AI 検索や LLM は断定的な 1 文を
     * そのまま引用するので、この 1 文の質がそのまま被引用率になる。
     * 必須にしてあるのは、語を足すときに書き忘れないようにするため。
     */
    tldr: z.string(),

    engineer: z.object({
      /**
       * この視点で書くときの綴り。両側とも必須にしてあるのは、
       * 一致するかどうかを語ごとに必ず確かめさせるため
       * （フロートはどちらも `float`、ジェイソンは `JSON` と `Jason`）。
       */
      spelling: z.string(),
      /**
       * エンジニア視点の説明。**1 本だけ**。技術度は「専門用語を出すが、
       * 前提知識のない人でも読み通せる」あたりに揃える。
       *
       * 組み立ては 定義 → 補足 → **最後に簡潔な言い切り** の 3 つ。
       *   1. 何であるかを最初の一文で言う（辞書の定義文）
       *   2. 仕組み・成り立ち・対になる語を淡々と足す
       *   3. その語の核心を短く断定して締める（一段抽象を上げる。
       *      定義文の言い直しにはしない）
       *
       * 次のものは**入れない**。辞書として普遍的に成り立つ範囲で書く。
       *   - 感想やパンチライン（「事故る」「死ぬぞ」のような煽り）
       *   - 「〜すべき」「〜が定石」のような実践上の勧め
       *   - 言語・環境・プロジェクトで変わる指標（float のビット幅、
       *     既定のポート番号、上限値の目安、特定製品だけの挙動など）。
       *     実装によって違うこと自体は「実装による」と書けばよい
       */
      description: z.string(),
      /** エンジニアがその語を使う場面の口語。辞書らしく 2〜3 個が目安。 */
      examples: z.array(z.string()).default([]),
    }),

    /** 一般側は段階を持たず、意味ひとつ。 */
    general: z.object({
      /** この視点で書くときの綴り。詳細は `engineer.spelling`。 */
      spelling: z.string(),
      meaning: z.string(),
      /** 非エンジニアがその語を使う場面の口語。辞書らしく 2〜3 個が目安。 */
      examples: z.array(z.string()).default([]),
    }),

    /**
     * 分野ファセット。何の分野の語かだけを表す（tech / daily の 2 世界）。
     * 許可語は src/lib/tags.ts のレジストリで統制。未定義タグはビルドを止める。
     */
    tags: z.array(z.enum(TAG_NAMES)).default([]),
    publishedAt: z.coerce.date(),
    /** 説明を書き直したときだけ入れる。sitemap の lastmod と `<time>` に出る。 */
    updatedAt: z.coerce.date().optional(),
  }),
});

export const collections = { words };
