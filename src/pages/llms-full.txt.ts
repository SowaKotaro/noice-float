import type { APIRoute } from "astro";
import { buildLlmsFullTxt } from "../lib/plaintext";
import { getSortedWords } from "../lib/words";

/** 全語の全文を 1 ファイルに。1000 語まで増えても 1MB に届かない見込み。 */
export const GET: APIRoute = async ({ site }) => {
  const words = await getSortedWords();
  return new Response(buildLlmsFullTxt(words, site), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
