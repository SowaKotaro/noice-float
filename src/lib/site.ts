/**
 * サイト全体で使い回す定数と URL の組み立て。
 *
 * **絶対 URL はここでしか作らない。** 起点は `astro.config.mjs` の `site` なので、
 * ドメインが決まったらあの 1 行を直すだけで canonical・OGP・sitemap・llms.txt が
 * すべて追従する。各ページで文字列連結しないこと。
 */

export const SITE_NAME = "そのフロート、アイス乗ってません！";

export const SITE_DESCRIPTION =
  "エンジニアと非エンジニアで意味の食い違う語を、両方の視点から並べて引ける辞書。" +
  "float は小数の型で、アイスの浮いた飲み物。同じ語の 2 つの意味を並べて載せています。";

/** OGP の `og:site_name` と JSON-LD の Organization/WebSite 名に使う。 */
export const SITE_LOCALE = "ja_JP";

/**
 * ページタイトル。トップだけはサイト名そのものにする（`X - X` を避けるため）。
 */
export const pageTitle = (title?: string) =>
  title ? `${title} - ${SITE_NAME}` : SITE_NAME;

/**
 * 相対パスを絶対 URL にする。`site` が未設定だとビルドを止めたいので、
 * `Astro.site` を必須の引数として受け取る。
 */
export const absolute = (path: string, site: URL | undefined): string => {
  if (!site) {
    throw new Error(
      "astro.config.mjs の `site` が未設定です。canonical と OGP の絶対 URL が作れません。",
    );
  }
  return new URL(path, site).href;
};

/** 語ページの URL パス。末尾スラッシュはビルド出力（ディレクトリ）に合わせる。 */
export const wordPath = (id: string) => `/words/${id}/`;

/** タグページの URL パス。タグは日本語なのでエンコードして使う。 */
export const tagPath = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;

/** 語ごとの OGP 画像。ビルド時に satori で生成している（`src/pages/og/`）。 */
export const ogImagePath = (id: string) => `/og/${id}.png`;
