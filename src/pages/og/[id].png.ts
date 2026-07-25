import type { APIRoute, GetStaticPaths } from "astro";
import { getSortedWords } from "../../lib/words";
import { wordOgImage } from "./_card";

/** 語ごとの OGP 画像。ビルド時に PNG まで焼くので実行時コストはゼロ。 */
export const getStaticPaths: GetStaticPaths = async () => {
  const words = await getSortedWords();
  return words.map((word) => ({ params: { id: word.id }, props: { word } }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await wordOgImage(props.word.data.term, props.word.data.reading);
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
