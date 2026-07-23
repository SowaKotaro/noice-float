import { persistentAtom } from "@nanostores/persistent";
import { DEFAULT_LEVEL, STORAGE_KEY } from "../lib/levelize";

/**
 * エンジニア度はサイト全体で共有し、localStorage に保存する。
 * encode/decode を指定しないため生の文字列として保存され、
 * head のインラインスクリプトがハイドレーション前に同じ値を読み出せる。
 */
export const engineerLevel = persistentAtom<string>(STORAGE_KEY, String(DEFAULT_LEVEL));

/**
 * 説明文の変形そのものは CSS が担うため、ここでの仕事は属性をひとつ書き換えるだけ。
 */
export const applyEngineerLevel = (value: string): void => {
  document.documentElement.dataset.eng = value;
};
