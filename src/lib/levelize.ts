import { diffArrays } from "diff";
import { toGraphemes } from "./subsequence";

/**
 * サイト全体で共有するエンジニア度の目盛り数。
 * 語ごとに段階数（levels の長さ）が異なるため、各語の段階をこの 0〜GLOBAL_MAX の
 * 共通スケールへ配分する。10 が最もエンジニア寄り、0 が最も平易。
 */
export const GLOBAL_MAX = 10;

/** localStorage のキー。head のインラインスクリプトからも同じ値を参照する。 */
export const STORAGE_KEY = "nf:eng";

/** 初訪問時はもっともエンジニア寄りから始め、引き下げてもらう。 */
export const DEFAULT_LEVEL = GLOBAL_MAX;

/**
 * text は showFrom 以上のエンジニア度でのみ表示される。
 * showFrom が 0 の断片は常に表示されるため、span で包む必要がない。
 */
export type Segment = { text: string; showFrom: number };

/** グローバル値 g のとき、段階数 n の語がどの段階を表示するか。 */
const stageForGlobal = (g: number, n: number): number =>
  Math.round(((GLOBAL_MAX - g) / GLOBAL_MAX) * (n - 1));

/** survival 段階まで生き残る文字が、最初に姿を現すグローバル値。 */
const showFromFor = (survival: number, n: number): number => {
  for (let g = 0; g <= GLOBAL_MAX; g++) {
    if (stageForGlobal(g, n) <= survival) return g;
  }
  return GLOBAL_MAX;
};

/**
 * 段階ごとの完成文から、最上位段階の全文を断片に切り分ける。
 *
 * levels[0] の各文字について「どの段階まで生き残るか」を隣接段階の差分から求め、
 * 同じ運命をたどる隣り合った文字をひとつの断片にまとめる。
 * 結果として出力されるテキストは levels[0] の全文と完全に一致するため、
 * HTML には全文がちょうど一度だけ現れる。
 */
export const levelize = (levels: string[]): Segment[] => {
  const graphemes = toGraphemes(levels[0]!);
  const n = levels.length;

  // 既定では最後の段階まで生き残るものとして扱う。
  const survival = new Array<number>(graphemes.length).fill(n - 1);
  let alive = graphemes.map((_, i) => i);

  for (let step = 0; step < n - 1; step++) {
    const current = alive.map((i) => graphemes[i]!);
    const next = toGraphemes(levels[step + 1]!);
    const nextAlive: number[] = [];
    let cursor = 0;

    for (const change of diffArrays(current, next)) {
      // 部分列制約を満たしていれば added は現れない（スキーマ側で検証済み）。
      if (change.added) continue;

      for (let k = 0; k < change.value.length; k++) {
        const index = alive[cursor]!;
        if (change.removed) {
          survival[index] = step;
        } else {
          nextAlive.push(index);
        }
        cursor++;
      }
    }
    alive = nextAlive;
  }

  const segments: Segment[] = [];
  for (let i = 0; i < graphemes.length; i++) {
    const showFrom = showFromFor(survival[i]!, n);
    const last = segments[segments.length - 1];
    if (last && last.showFrom === showFrom) {
      last.text += graphemes[i]!;
    } else {
      segments.push({ text: graphemes[i]!, showFrom });
    }
  }
  return segments;
};

/** data-show 属性の値。showFrom 以上のすべての目盛りを列挙する。 */
export const showAttr = (showFrom: number): string =>
  Array.from({ length: GLOBAL_MAX - showFrom + 1 }, (_, i) => showFrom + i).join(" ");
