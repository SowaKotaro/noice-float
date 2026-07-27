import type { APIRoute, GetStaticPaths } from "astro";
import { getSortedWords, spellingLabel } from "../../lib/words";
import { wordOgImage } from "./_card";

/** 語ごとの OGP 画像。ビルド時に PNG まで焼くので実行時コストはゼロ。 */
export const getStaticPaths: GetStaticPaths = async () => {
  const words = await getSortedWords();
  return words.map((word) => ({ params: { id: word.id }, props: { word } }));
};

export const GET: APIRoute = async ({ props }) => {
  // 添えるのは読みではなく綴り。見出し語がカタカナになったので読みはほぼ同じ字面で、
  // 綴りのほうが情報量がある（食い違う語なら「JSON / Jason」と 2 つ出る）。
  const png = await wordOgImage(props.word.data.term, spellingLabel(props.word));
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
