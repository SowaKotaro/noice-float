/**
 * OGP 画像のレイアウトと描画。ビルド時にしか動かない（成果物は PNG だけ）。
 *
 * `_` 始まりのファイルなので Astro はルートとして扱わない。
 *
 * ## 画像に載せるもの・載せないもの
 *
 * **説明文は載せない。** 載せると任意の漢字が必要になり、同梱フォントを
 * 数 MB 級にするか、語を足すたびにサブセットを作り直すかの二択になる。
 * 代わりに載せるのは「語そのもの」と「2 つの意味がある」という構図で、
 * 説明文は OGP の description（＝`tldr`）が担当する。
 * この住み分けのおかげで、フォントは ASCII ＋ かな ＋ 固定文言だけで足りる。
 *
 * 見た目は `AGENTS.md` の紙面の語彙どおり（紫の下地・黒 8px 枠・
 * ぼかし 0 のオフセット影・ENGINEER は #4ECDC4／GENERAL は #FFD166）。
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

/**
 * OGP 画像に出る固定文言をすべてここに集める。
 * `scripts/subset-og-font.py` がこの文字列を読んでフォントを削るので、
 * **ここに無い文字を下のレイアウトへ書くと豆腐になる**。文言を足したら
 * `python3 scripts/subset-og-font.py` を実行し直すこと。
 */
export const OG_FIXED_TEXT = `そのフロート、アイス乗ってません！エンジニアの意味ふつうの意味エンジニアと非エンジニアで意味の違うことば辞典`;

const WIDTH = 1200;
const HEIGHT = 630;

const BLACK = "#000000";
const VIOLET = "#C4B5FD";
const ENGINEER = "#4ECDC4";
const GENERAL = "#FFD166";

let fontCache: Buffer | null = null;

/**
 * フォントはプロジェクトルートからの相対で読む。
 * このファイルはビルド時に `dist/.prerender/` へまとめられるので、
 * `import.meta.url` 起点だと出力先を指してしまい見つからない
 * （`npm run build` は必ずルートで動かす前提）。
 */
const FONT_PATH = "src/assets/fonts/dela-gothic-one-og.ttf";

const font = async () => {
  fontCache ??= await readFile(join(process.cwd(), FONT_PATH));
  return fontCache;
};

/**
 * サブセットに無い文字が混ざっていないか確かめる。
 * 豆腐は生成に成功してしまい画像を見るまで気付けないので、ビルドログに出す。
 */
const warnMissingGlyphs = (text: string, where: string) => {
  const covered = new Set(
    (OG_FIXED_TEXT + "、。「」・！？…—〜／").split(""),
  );
  const missing = [...new Set(text.split(""))].filter((ch) => {
    const code = ch.codePointAt(0)!;
    const isAscii = code >= 0x20 && code <= 0x7e;
    const isKana = code >= 0x3041 && code <= 0x30ff;
    return !isAscii && !isKana && !covered.has(ch);
  });

  if (missing.length > 0) {
    console.warn(
      `[og] ${where}: OG フォントに無い文字 ${missing.join("")} があります。` +
        ` scripts/subset-og-font.py の対象に足して作り直してください。`,
    );
  }
};

/** satori に渡すノード。JSX を使わずに済むよう素のオブジェクトで組む。 */
type Node = { type: string; props: Record<string, unknown> };

const div = (style: Record<string, unknown>, children?: unknown): Node => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

/** 黒枠 ＋ ぼかし 0 のオフセット影。サイトのカードと同じ作り。 */
const paper = (bg: string, offset = 10) => ({
  background: bg,
  border: `8px solid ${BLACK}`,
  boxShadow: `${offset}px ${offset}px 0px 0px ${BLACK}`,
});

const titleChip = (text: string) =>
  div(
    {
      ...paper("#FFFFFF", 8),
      padding: "10px 24px",
      fontSize: 30,
      color: BLACK,
      alignSelf: "flex-start",
      // サイトの見出しラベルと同じ「紙に貼った」傾き。
      transform: "rotate(-2deg)",
    },
    text,
  );

/** 下段の 2 枚。「同じ語に 2 つの意味がある」という構図をここで見せる。 */
const senses = () =>
  div({ gap: 28, width: "100%" }, [
    div(
      {
        ...paper(ENGINEER),
        flex: 1,
        padding: "26px 30px",
        fontSize: 38,
        color: BLACK,
        alignItems: "center",
        justifyContent: "center",
      },
      "エンジニアの意味",
    ),
    div(
      {
        ...paper(GENERAL),
        flex: 1,
        padding: "26px 30px",
        fontSize: 38,
        color: BLACK,
        alignItems: "center",
        justifyContent: "center",
      },
      "ふつうの意味",
    ),
  ]);

const layout = (headline: string, reading: string | null) =>
  div(
    {
      width: WIDTH,
      height: HEIGHT,
      flexDirection: "column",
      justifyContent: "space-between",
      background: VIOLET,
      padding: 56,
      fontFamily: "Dela Gothic One",
    },
    [
      titleChip("そのフロート、アイス乗ってません！"),

      // 語と読みは横並び（読みは語の足元にそろえる）。
      // 縦に積むと下段の 2 枚とぶつかるので、この段は 1 行に収めている。
      div({ alignItems: "flex-end", gap: 24, maxWidth: WIDTH - 112 }, [
        div(
          {
            ...paper("#FFFFFF", 12),
            padding: "14px 36px",
            // 語の長さで字を詰める。長い語でも 1 行に収める狙い。
            fontSize: headline.length > 16 ? 54 : headline.length > 10 ? 72 : 104,
            color: BLACK,
          },
          headline,
        ),
        reading
          ? div(
              {
                ...paper("#FFFFFF", 6),
                padding: "6px 18px",
                marginBottom: 10,
                fontSize: 30,
                color: BLACK,
              },
              reading,
            )
          : null,
      ]),

      senses(),
    ],
  );

const render = async (node: Node): Promise<Buffer> => {
  const svg = await satori(node as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Dela Gothic One",
        data: await font(),
        weight: 400,
        style: "normal",
      },
    ],
  });

  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
      .render()
      .asPng(),
  );
};

/** 語ページ用。語と読みを載せる。 */
export const wordOgImage = (term: string, reading: string) => {
  warnMissingGlyphs(term + reading, `語「${term}」`);
  return render(layout(term, reading));
};

/** トップと、語ページ以外すべての既定画像。 */
export const defaultOgImage = () =>
  render(layout("エンジニアと非エンジニアで意味の違うことば辞典", null));
