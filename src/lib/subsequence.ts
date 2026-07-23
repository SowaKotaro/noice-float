/**
 * 説明文の段階は「上位段階から文字を削除するだけ」で到達できなければならない。
 * 助詞の置換や語順の入れ替えは許されず、常に部分列（subsequence）である必要がある。
 * この制約が守られている限り、HTML に出力するテキストは最上位段階の全文ひとつで済む。
 */

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

/** 書記素クラスタ単位に分割する。絵文字や結合文字を壊さないため。 */
export const toGraphemes = (text: string): string[] =>
  [...segmenter.segment(text)].map((s) => s.segment);

/** needle が haystack の部分列（順序を保った削除のみで到達できる）かを判定する。 */
export const isSubsequence = (needle: string, haystack: string): boolean => {
  const n = toGraphemes(needle);
  let i = 0;
  for (const { segment } of segmenter.segment(haystack)) {
    if (i < n.length && segment === n[i]) i++;
  }
  return i === n.length;
};

/**
 * levels が順に部分列になっているかを検証し、違反していれば理由を返す。
 * 問題がなければ null を返す。
 */
export const findSubsequenceViolation = (levels: string[]): string | null => {
  for (let i = 0; i < levels.length - 1; i++) {
    const parent = levels[i]!;
    const child = levels[i + 1]!;

    if (child.length >= parent.length) {
      return `levels[${i + 1}] は levels[${i}] より短くなければなりません。`;
    }
    if (!isSubsequence(child, parent)) {
      return (
        `levels[${i + 1}] が levels[${i}] の部分列になっていません。` +
        `文字の削除だけで到達できる必要があります（助詞の置換は不可）。\n` +
        `  levels[${i}]   : ${parent}\n` +
        `  levels[${i + 1}] : ${child}`
      );
    }
  }
  return null;
};
