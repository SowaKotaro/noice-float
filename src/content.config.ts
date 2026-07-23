import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { findSubsequenceViolation } from "./lib/subsequence";
import { TAG_NAMES } from "./lib/tags";

const words = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/words" }),
  schema: z
    .object({
      term: z.string(),
      reading: z.string(),
      aliases: z.array(z.string()).default([]),

      engineer: z.object({
        category: z.string(),
        /** 先頭ほどエンジニア寄り。各要素は直前の要素の部分列でなければならない。 */
        levels: z.array(z.string()).min(1),
        /** エンジニアがその語を使う場面の口語。辞書らしく 2〜3 個が目安。 */
        examples: z.array(z.string()).default([]),
      }),

      /** 一般側はスライダーで変化しない。 */
      general: z.object({
        category: z.string(),
        meaning: z.string(),
        /** 非エンジニアがその語を使う場面の口語。辞書らしく 2〜3 個が目安。 */
        examples: z.array(z.string()).default([]),
      }),

      /** 許可語は src/lib/tags.ts のレジストリで統制。未定義タグはビルドを止める。 */
      tags: z.array(z.enum(TAG_NAMES)).default([]),
      publishedAt: z.coerce.date(),
    })
    .superRefine((data, ctx) => {
      const violation = findSubsequenceViolation(data.engineer.levels);
      if (violation) {
        ctx.addIssue({
          code: "custom",
          message: violation,
          path: ["engineer", "levels"],
        });
      }
    }),
});

export const collections = { words };
