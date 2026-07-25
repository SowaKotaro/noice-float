import type { APIRoute, GetStaticPaths } from "astro";
import { wordToMarkdown } from "../../lib/plaintext";
import { getSortedWords } from "../../lib/words";

/**
 * 語ごとの Markdown 版（`/words/float.md`）。
 * HTML 版は `[...id].astro` が `/words/float/` に出すので衝突しない。
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const words = await getSortedWords();
  return words.map((word) => ({ params: { id: word.id }, props: { word } }));
};

export const GET: APIRoute = ({ props, site }) =>
  new Response(wordToMarkdown(props.word, site), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
