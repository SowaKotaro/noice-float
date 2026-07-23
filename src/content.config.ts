import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { findSubsequenceViolation } from "./lib/subsequence";

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
      }),

      /** 一般側はスライダーで変化しない。 */
      general: z.object({
        category: z.string(),
        meaning: z.string(),
      }),

      tags: z.array(z.string()).default([]),
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
