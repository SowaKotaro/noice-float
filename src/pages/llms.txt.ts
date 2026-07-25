import type { APIRoute } from "astro";
import { buildLlmsTxt } from "../lib/plaintext";
import { getSortedWords } from "../lib/words";

/** llmstxt.org の慣習に沿った案内ファイル。中身は `src/lib/plaintext.ts`。 */
export const GET: APIRoute = async ({ site }) => {
  const words = await getSortedWords();
  return new Response(buildLlmsTxt(words, site), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
