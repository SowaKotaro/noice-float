/**
 * タグの統制語彙。
 *
 * タグはこのサイトの「分野ファセット」——絞り込みと回遊のための軸。
 * 1 つの語は 2 つの世界にまたがるので、タグも 2 つの世界に分かれる：
 *   tech  … エンジニア世界での分野（データ・Web など）
 *   daily … 日常世界での分野（飲料・食べ物など）
 * float なら tech の「データ」と daily の「飲料」の両方を持つ。
 * この world は表示色にも使い、エンジニアパネル＝緑／ふつうパネル＝ピンクと揃える。
 *
 * ここに定義した語だけが content の `tags` に書ける。未定義のタグを書くと
 * `src/content.config.ts` の検証でビルドが止まる（部分列制約と同じ思想）。
 *
 * 注意・ネタ・すれ違いの型（別物か語源が同じか等）はタグに載せない。
 * それらは本文で語る。タグはあくまで「どの分野の語か」だけを担う。
 */

export type TagWorld = "tech" | "daily";

export interface TagDef {
  /** tech = エンジニア世界の分野, daily = 日常世界の分野 */
  world: TagWorld;
  /** ツールチップに出す一文。 */
  description: string;
}

export const TAGS = {
  // エンジニア世界の分野
  データ: { world: "tech", description: "数値・文字列・型など、値の扱いに関する語" },
  プログラミング: { world: "tech", description: "コードを書くうえで出てくる語" },
  Web: { world: "tech", description: "ブラウザ・HTTP・フロントエンドまわりの語" },
  インフラ: { world: "tech", description: "サーバー・ネットワーク・運用まわりの語" },
  セキュリティ: { world: "tech", description: "攻撃・防御・認証まわりの語" },

  // 日常世界の分野
  飲料: { world: "daily", description: "飲み物" },
  食べ物: { world: "daily", description: "食品・料理" },
  動物: { world: "daily", description: "生き物" },
  日用品: { world: "daily", description: "身の回りの道具" },
} as const satisfies Record<string, TagDef>;

export type TagName = keyof typeof TAGS;

/** Zod の `z.enum` に渡すためのタプル。順序はこのオブジェクトの定義順。 */
export const TAG_NAMES = Object.keys(TAGS) as [TagName, ...TagName[]];
