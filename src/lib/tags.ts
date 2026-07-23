/**
 * タグの統制語彙。
 *
 * ここに定義した語だけが content の `tags` に書ける。未定義のタグを書くと
 * `src/content.config.ts` の検証でビルドが止まる（部分列制約と同じ思想）。
 *
 * 2 つの軸を 1 つの配列に混ぜているが、各タグの意味と軸は description / group で
 * 自明になる。表示側もこのレジストリを引くので、タグの追加はここ 1 箇所で完結する。
 */

export type TagGroup = "field" | "trait";

export interface TagDef {
  /** field = 分野（どの領域の語か）, trait = 語の性質・ネタ（なぜ／どこですれ違うか） */
  group: TagGroup;
  /** ツールチップに出す一文。タグ名だけでは伝わらない含意を書く。 */
  description: string;
}

export const TAGS = {
  // 分野系 — どの領域の語か
  データ: { group: "field", description: "数値・文字列・型など、値の扱いに関する語" },
  プログラミング: { group: "field", description: "コードを書くうえで出てくる語" },
  Web: { group: "field", description: "ブラウザ・HTTP・フロントエンドまわりの語" },
  インフラ: { group: "field", description: "サーバー・ネットワーク・運用まわりの語" },
  セキュリティ: { group: "field", description: "攻撃・防御・認証まわりの語" },

  // 性質系 — なぜ／どこで意味がすれ違うか
  別物: { group: "trait", description: "エンジニアと一般で意味が完全に無関係" },
  語源は同じ: { group: "trait", description: "由来は共有するが、意味が分岐している" },
  落とし穴: { group: "trait", description: "仕様を知らないとハマる。初学者泣かせ" },
  日常語と衝突: {
    group: "trait",
    description: "日常でよく使う語と衝突する。外で言うと誤解される",
  },
  ドヤ注意: { group: "trait", description: "使うと知ったかぶりに見えがち" },
} as const satisfies Record<string, TagDef>;

export type TagName = keyof typeof TAGS;

/** Zod の `z.enum` に渡すためのタプル。順序はこのオブジェクトの定義順。 */
export const TAG_NAMES = Object.keys(TAGS) as [TagName, ...TagName[]];
