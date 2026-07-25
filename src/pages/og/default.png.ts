import type { APIRoute } from "astro";
import { defaultOgImage } from "./_card";

/** トップ・タグページ・404 が使う既定の OGP 画像。 */
export const GET: APIRoute = async () => {
  const png = await defaultOgImage();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
