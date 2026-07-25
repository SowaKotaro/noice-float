/**
 * 複数ページで使い回す装飾クラス。
 *
 * 見出しラベルは「紙に貼った黒いラベル」の見立てで、わずかに傾けて置く
 * （`AGENTS.md` の紙面の作りに合わせたもの）。トップ・語ページ・タグページで
 * 同じものを使うため、各ページで文字列を複製しないようここに置いてある。
 */

export const LABEL =
  "inline-block -rotate-2 transform bg-black px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] sm:text-sm";

/** 白い小チップ。カード内の `CHIP` と同じ見た目（`MeaningCards.tsx` 由来）。 */
export const CHIP =
  "inline-block border-2 border-black bg-white px-2 py-0.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:text-sm";

/** 書類らしい白い箱。カードと同じ 4px 枠 ＋ 10px のオフセット影。 */
export const PAPER =
  "border-4 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]";
