/**
 * JSON-LD（schema.org）の組み立て。
 *
 * 辞書には **`DefinedTerm` / `DefinedTermSet`** というそのものずばりの型がある。
 * このサイトの肝は「1 つの語に 2 つの意味がある」ことなので、語ページでは
 * **`DefinedTerm` を 2 ノード出す**（エンジニア用語集と日常語の 2 つの
 * `DefinedTermSet` にそれぞれ属させる）。1 ノードに 2 つの意味を詰め込むと
 * 「float とは何か」に対して機械が答えを 1 つに決められない。
 *
 * `@graph` に並べて 1 つの script で出す（`Layout.astro` が受け取る）。
 */

import type { CollectionEntry } from "astro:content";
import { SITE_DESCRIPTION, SITE_NAME, absolute, tagPath, wordPath } from "./site";

type Word = CollectionEntry<"words">;

/** 用語集そのもの。2 つの世界ぶんあり、`@id` で語ノードから参照する。 */
export const termSetId = (world: "engineer" | "general", site: URL | undefined) =>
  absolute(`/#termset-${world}`, site);

export const websiteNode = (site: URL | undefined) => ({
  "@type": "WebSite",
  "@id": absolute("/#website", site),
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: absolute("/", site),
  inLanguage: "ja",
});

export const termSetNodes = (site: URL | undefined) => [
  {
    "@type": "DefinedTermSet",
    "@id": termSetId("engineer", site),
    name: "エンジニアが使う意味",
    description: "IT エンジニアが業務で使うときの意味。",
    inLanguage: "ja",
    isPartOf: { "@id": absolute("/#website", site) },
  },
  {
    "@type": "DefinedTermSet",
    "@id": termSetId("general", site),
    name: "ふつうに使う意味",
    description: "エンジニアでない人が日常で使うときの意味。",
    inLanguage: "ja",
    isPartOf: { "@id": absolute("/#website", site) },
  },
];

/**
 * 語ページの中心。同じ URL に 2 つの `DefinedTerm` がぶら下がる形にする。
 *
 * `description` は両側ともカードに出ている説明そのもの
 * （エンジニア側は `engineer.description`、ふつう側は `general.meaning`）。
 */
export const wordNodes = (word: Word, site: URL | undefined) => {
  const url = absolute(wordPath(word.id), site);
  const { term, reading, aliases, engineer, general } = word.data;

  return [
    {
      "@type": "DefinedTerm",
      "@id": `${url}#engineer`,
      name: term,
      // 綴りは視点ごとに違いうる（ジェイソン ＝ JSON / Jason）ので、
      // `name` は中立な見出し語のまま、その視点の綴りを別名の先頭に置く。
      alternateName: [engineer.spelling, reading, ...aliases],
      description: engineer.description,
      inDefinedTermSet: { "@id": termSetId("engineer", site) },
      url,
      inLanguage: "ja",
    },
    {
      "@type": "DefinedTerm",
      "@id": `${url}#general`,
      name: term,
      alternateName: [general.spelling, reading, ...aliases],
      description: general.meaning,
      inDefinedTermSet: { "@id": termSetId("general", site) },
      url,
      inLanguage: "ja",
    },
  ];
};

/**
 * 「エンジニアと一般で何が違うのか」を Q&A の形でも出しておく。
 * AI 検索と AI Overviews は質問文と答えの対を強く好むので、
 * ページに書いてあるとおりの内容を機械可読な形で重ねて渡す狙い。
 */
export const wordFaqNode = (word: Word, site: URL | undefined) => ({
  "@type": "FAQPage",
  "@id": `${absolute(wordPath(word.id), site)}#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: `エンジニアが「${word.data.term}」と言うとき、どういう意味ですか？`,
      acceptedAnswer: { "@type": "Answer", text: word.data.engineer.description },
    },
    {
      "@type": "Question",
      name: `「${word.data.term}」のふつうの意味は何ですか？`,
      acceptedAnswer: { "@type": "Answer", text: word.data.general.meaning },
    },
  ],
});

/** パンくず。`items` は [表示名, パス] の並び（末尾が現在地）。 */
export const breadcrumbNode = (
  items: [name: string, path: string][],
  site: URL | undefined,
) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: absolute(path, site),
  })),
});

/** トップの語一覧。`DefinedTermSet` に全語をぶら下げる。 */
export const wordListNode = (words: Word[], site: URL | undefined) => ({
  "@type": "ItemList",
  "@id": absolute("/#wordlist", site),
  name: "ことば一覧",
  numberOfItems: words.length,
  itemListElement: words.map((word, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: word.data.term,
    url: absolute(wordPath(word.id), site),
  })),
});

export const tagCollectionNode = (
  tag: string,
  words: Word[],
  site: URL | undefined,
) => ({
  "@type": "CollectionPage",
  "@id": absolute(tagPath(tag), site),
  name: `#${tag} の語`,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: words.length,
    itemListElement: words.map((word, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: word.data.term,
      url: absolute(wordPath(word.id), site),
    })),
  },
});
