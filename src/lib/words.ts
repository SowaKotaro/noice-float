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

/**
 * 五十音の行。**見出しの並びは あかさたなはまやらわ で固定**する。
 *
 * 各行の文字列には濁点・半濁点・小書きのかなも入れてある（`じぇいそん` は
 * さ行、`ぱす` は は行、`ぞんび` は さ行）。読みの先頭 1 文字をここから引く。
 */
const KANA_ROWS = [
  ["あ", "あいうえおぁぃぅぇぉゔ"],
  ["か", "かきくけこがぎぐげごゕゖ"],
  ["さ", "さしすせそざじずぜぞ"],
  ["た", "たちつてとだぢづでどっ"],
  ["な", "なにぬねの"],
  ["は", "はひふへほばびぶべぼぱぴぷぺぽ"],
  ["ま", "まみむめも"],
  ["や", "やゆよゃゅょ"],
  ["ら", "らりるれろ"],
  ["わ", "わをんゎ"],
] as const;

export interface KanaGroup {
  /** 行の頭のかな（`あ`）。表示は `あ行`。 */
  row: string;
  words: Word[];
}

/**
 * 読みの頭で語を五十音の行にまとめる。辞書の索引の見立て。
 *
 * **並べ替えはしない**（`getSortedWords` の順を行ごとに切り分けるだけ）ので、
 * 「一覧の隣」と「次の語」はここを通しても変わらない。
 * **語が 1 つも無い行は落とす**（今は な行・わ行が空。空の見出しだけが
 * 出ていると壊れて見えるため）。読みがひらがなで始まっていなければ
 * ビルドを止める（未定義タグと同じ思想）。
 */
export const groupByKanaRow = (words: Word[]): KanaGroup[] => {
  const groups: KanaGroup[] = KANA_ROWS.map(([row]) => ({ row, words: [] }));

  for (const word of words) {
    const head = word.data.reading.slice(0, 1);
    const i = KANA_ROWS.findIndex(([, kana]) => kana.includes(head));
    if (i < 0) {
      throw new Error(
        `${word.id}: reading「${word.data.reading}」が五十音で始まっていない。reading はひらがなで書く。`,
      );
    }
    groups[i].words.push(word);
  }

  return groups.filter((group) => group.words.length > 0);
};

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
