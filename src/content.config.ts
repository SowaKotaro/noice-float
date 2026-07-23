import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { TAG_NAMES } from "./lib/tags";

const words = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/words" }),
  schema: z.object({
    term: z.string(),
    reading: z.string(),
    aliases: z.array(z.string()).default([]),

    engineer: z.object({
      /**
       * エンジニア視点の説明を必ず 3 段階で。順に さらっと / しっかり / がっつり
       * （後ろほど技術度が高い）。各段階は独立した全文で、部分列などの制約はない。
       * カード内のボタンで levels[0..2] を切り替える。
       */
      levels: z.array(z.string()).length(3),
      /** エンジニアがその語を使う場面の口語。辞書らしく 2〜3 個が目安。 */
      examples: z.array(z.string()).default([]),
    }),

    /** 一般側は段階を持たず、意味ひとつ。 */
    general: z.object({
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
  }),
});

export const collections = { words };
