/**
 * 語コレクションの取得と並び。
 *
 * **並び順は読み（かな）の五十音順で一本化する。** 一覧・前後ナビ・sitemap・
 * llms.txt が別々に並べ替えると「一覧の隣」と「次の語」がずれるので、
 * 並べ替えはここでしか書かない。
 */

import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type Word = CollectionEntry<"words">;

export const getSortedWords = async (): Promise<Word[]> =>
  (await getCollection("words")).sort((a, b) =>
    a.data.reading.localeCompare(b.data.reading, "ja"),
  );

/** 五十音順で見た前後の語。端は undefined（先頭の前・末尾の次は作らない）。 */
export const neighbors = (words: Word[], id: string) => {
  const i = words.findIndex((word) => word.id === id);
  return { prev: words[i - 1], next: words[i + 1] };
};

/**
 * 英語の綴り。2 視点で一致していれば 1 つ、食い違っていれば併記する。
 *
 *   フロート     → `float`
 *   ジェイソン   → `JSON / Jason`
 */
export const spellingLabel = (word: Word): string => {
  const { engineer, general } = word.data;
  return engineer.spelling === general.spelling
    ? engineer.spelling
    : `${engineer.spelling} / ${general.spelling}`;
};

/**
 * 見出し語に綴りを添えた表示名（`フロート（float）`）。
 *
 * 見出し語がカタカナになったぶん、英語の綴りで探しに来た人が着地できるよう
 * **`<title>`・RSS・OGP はこの形で出す**。`h1` とパンくずは `term` だけ
 * （中立な見出し語のまま揃える）。
 */
export const termLabel = (word: Word): string =>
  `${word.data.term}（${spellingLabel(word)}）`;

/**
 * エンジニア側の説明の全文（`description` ＋ 「要は」の 1 行）。
 *
 * カードと辞書エントリはこの 2 つを続けて出しているので、**JSON-LD の
 * description と FAQ の答えも同じ 2 つ**にする。片方だけにすると
 * 「ページに書いてあるとおりを機械可読で渡す」という前提が崩れる。
 * 言い直しの 1 行は専門用語がなく、そのまま引用されやすい形でもある。
 */
export const engineerText = (word: Word): string =>
  `${word.data.engineer.description}\n${word.data.engineer.gist}`;

/** その語の最終更新日。`updatedAt` があればそれ、なければ公開日。 */
export const lastModified = (word: Word): Date =>
  word.data.updatedAt ?? word.data.publishedAt;

/** `<time datetime>` 用の YYYY-MM-DD。 */
export const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
