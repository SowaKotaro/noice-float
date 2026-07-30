/**
 * 語を Markdown のテキストに起こす。
 *
 * LLM 系のクローラは JavaScript を実行しないし、装飾の多い HTML より
 * 素の Markdown のほうを正確に読む。このサイトの本体は
 * 「タップで裏返るカード」という LLM から見て最悪の形式なので、
 * **同じ内容の読みやすい版を別 URL で併設する**。
 *
 *   /llms.txt          … サイトの案内と全語へのリンク（llmstxt.org の慣習）
 *   /llms-full.txt     … 全語の全文を 1 ファイルに
 *   /words/<語>.md     … 語ごとの Markdown 版
 *
 * この 3 つはすべてここの関数から作る（内容がずれないようにするため）。
 */

import { SITE_DESCRIPTION, SITE_NAME, absolute, wordPath } from "./site";
import { isoDate, lastModified, spellingLabel, type Word } from "./words";

/** 語 1 つぶんの Markdown。見出しレベルは埋め込み先に合わせて動かせる。 */
export const wordToMarkdown = (
  word: Word,
  site: URL | undefined,
  depth: 1 | 2 = 1,
): string => {
  const h = "#".repeat(depth);
  const { term, reading, aliases, tldr, engineer, general, tags } = word.data;
  const lines: string[] = [];

  lines.push(`${h} ${term}（${reading}）`, "");
  lines.push(`> ${tldr}`, "");

  if (aliases.length > 0) lines.push(`**別名**: ${aliases.join("、")}`, "");
  if (tags.length > 0) lines.push(`**分野**: ${tags.map((t) => `#${t}`).join(" ")}`, "");
  lines.push(`**URL**: ${absolute(wordPath(word.id), site)}`, "");

  // 綴りは視点ごとに違いうる（ジェイソン ＝ JSON / Jason）ので、見出し語ではなく
  // それぞれの節の見出しに添える。
  lines.push(`${h}# エンジニアが言う「${term}」（${engineer.spelling}）`, "");
  lines.push(engineer.description, "");
  if (engineer.examples.length > 0) {
    lines.push("使う場面:", "");
    engineer.examples.forEach((example) => lines.push(`- 「${example}」`));
    lines.push("");
  }

  lines.push(`${h}# ふつうに言う「${term}」（${general.spelling}）`, "");
  lines.push(general.meaning, "");
  if (general.examples.length > 0) {
    lines.push("使う場面:", "");
    general.examples.forEach((example) => lines.push(`- 「${example}」`));
    lines.push("");
  }

  const body = word.body?.trim();
  if (body) lines.push(`${h}# 補足`, "", body, "");

  lines.push(`最終更新: ${isoDate(lastModified(word))}`, "");
  return lines.join("\n");
};

/** サイト全体の前書き。llms.txt / llms-full.txt で共通。 */
export const siteIntro = (): string =>
  [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "同じ語がエンジニアと非エンジニアで別のものを指してしまう——という",
    "すれ違いを集めた辞書です。1 つの語について、エンジニア側の説明と",
    "日常側の説明を 1 つずつ、そして両方の使用例を載せています。",
    "",
  ].join("\n");

export const buildLlmsTxt = (words: Word[], site: URL | undefined): string =>
  [
    siteIntro(),
    "## ことば一覧",
    "",
    ...words.map(
      (word) =>
        `- [${word.data.term}（${spellingLabel(word)}）](${absolute(
          wordPath(word.id),
          site,
        )}): ${word.data.tldr}`,
    ),
    "",
    "## 全文",
    "",
    `- [全語の全文](${absolute("/llms-full.txt", site)}): 上の語すべての本文を 1 ファイルにまとめたもの`,
    "",
    "## 語ごとの Markdown 版",
    "",
    // ラベルは term ではなく id にする（`Ruby.md` と書いて実体が
    // `ruby.md` だと、リンクを踏まずに名前だけ拾われたときに 404 を招く）。
    ...words.map(
      (word) => `- [${word.id}.md](${absolute(`/words/${word.id}.md`, site)})`,
    ),
    "",
  ].join("\n");

export const buildLlmsFullTxt = (words: Word[], site: URL | undefined): string =>
  [
    siteIntro(),
    "---",
    "",
    ...words.map((word) => `${wordToMarkdown(word, site, 2)}\n---\n`),
  ].join("\n");
