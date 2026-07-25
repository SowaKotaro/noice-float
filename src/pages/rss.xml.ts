import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_NAME, wordPath } from "../lib/site";
import { getSortedWords } from "../lib/words";

/** 新着は公開日の降順。一覧（五十音順）とは並びが違うのでここで並べ直す。 */
export const GET: APIRoute = async (context) => {
  const words = (await getSortedWords()).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    customData: "<language>ja</language>",
    items: words.map((word) => ({
      title: `${word.data.term}（${word.data.reading}）`,
      description: word.data.tldr,
      pubDate: word.data.publishedAt,
      link: wordPath(word.id),
      categories: [...word.data.tags],
    })),
  });
};
