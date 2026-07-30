import { useRef, useState } from "react";
import { CornerRightDown, Smile, Terminal } from "lucide-react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

/*
 * `@/lib/utils` の `cn`（= twMerge + clsx）ではなく **clsx を直接**使っている。
 * tailwind-merge はクラスの衝突を実行時に解決するためにクラス名の一覧表を
 * 抱えており、これがそのままクライアントバンドルに乗る（gzip でおよそ 8KB）。
 * このコンポーネントが渡すのは静的な定数と排他的な三項演算子だけで、
 * **同じプロパティのクラスが同時に当たることがない**ので衝突解決は要らない。
 * 島の外（`buttonVariants` など astro 側）は従来どおり `cn` でよい。
 */

/**
 * 意味カード。`refs/NeoBrutalismCards.tsx` の見た目を踏襲している。
 *
 * 参考のまま：配色（#4ECDC4 / #FFD166 / 黒枠・白面）、影のオフセット
 * （前面 10px・ホバー 14px・背面 4px・チップ 2px）、前後の位置差
 * （背面は右下へ 4/6 ＋ rotate-3）、イージング
 * （duration-500 / cubic-bezier(0.34,1.56,0.64,1)）、上に飛び出すタブ、
 * 黒帯の見出しチップ、白チップ、下段の透かしとバッジ。
 *
 * 参考から変えた点は 3 つだけ（いずれもユーザー指示）。
 *   1. 寸法を一回り大きく（320px / sm 560px 幅、高さは下限のみ）
 *   2. 2 枚を absolute ではなく**グリッドの同じセルに重ねる**。セルの高さが
 *      背の高い方に合うので、本文が長くてもカードが伸びる＝スクロールバーが出ない
 *   3. タブは角丸をやめて**付箋**に（角ばった形・少し傾ける・影で浮かせる）
 *
 * **2 枚は同じ骨格**（参考の ENGINEER カード側）で、違うのは色・付箋・アイコン・
 * 綴り・本文だけ。構造は下の `card()` 一か所で描いているので、
 * 差を付けたくなったら CARDS の表に足すこと。
 *
 *   見出しチップ（アイコン＋語＋綴り）／読みチップ／本文／下段（透かし＋バッジ）
 *   ENGINEER … 本文＝エンジニア視点の説明
 *   GENERAL  … 本文＝ふつうの意味
 *
 * かつて ENGINEER 側のチップ列は 3 段階（さらっと / しっかり / がっつり）の
 * 切替ボタンだったが、説明を 1 本にまとめたのでなくなった。跡地は GENERAL と
 * 同じ読みチップにしてある（2 枚の骨格を揃えるため）。
 *
 * 見出しの語（カタカナ）は 2 枚で同じで、**その隣の綴りだけが視点ごとに違う**
 * （フロートはどちらも `float`、ジェイソンなら `JSON` と `Jason`）。
 * この 1 語の差がサイトの主題そのものなので、両側に対称に出す。
 *
 * 下段左の透かしは付箋と同じラベル（ENGINEER / GENERAL）。
 *
 * `href` を渡すと一覧用の静的プレビューになる（島として動かさない）。
 * このときカード全体が語ページへのリンクになり、ボタン類は span で出す。
 */

type Side = "engineer" | "general";

interface CardStyle {
  bg: string;
  /** 付箋のラベルであり、下段左の透かしでもある。 */
  label: string;
  /** 付箋の位置と傾き。手で貼ったように少しだけ傾ける。 */
  tab: string;
  icon: LucideIcon;
}

const CARDS: Record<Side, CardStyle> = {
  engineer: {
    bg: "bg-[#4ECDC4]",
    label: "ENGINEER",
    tab: "right-5 sm:right-8 rotate-[2deg]",
    icon: Terminal,
  },
  general: {
    bg: "bg-[#FFD166]",
    label: "GENERAL",
    tab: "left-5 sm:left-8 rotate-[-2deg]",
    icon: Smile,
  },
};

const OTHER: Record<Side, Side> = { engineer: "general", general: "engineer" };

// 参考の位置・影の指定をそのまま定数化したもの。
// 2 枚は「グリッドの同じセルに重ねる」（参考の absolute inset-0 から変えた唯一の点）。
// こうするとセルの高さが背の高い方に合い、本文が長くてもカードが伸びて収まる
// ＝カード内にスクロールバーが出ない。見た目（重なり・傾き・影）は参考のまま。
// `select-none` は**付けない**。辞書なので定義文をコピーできる必要がある
// （参考ファイルはドラッグ中の選択を嫌って全体に付けていたが、ここでは
// 「選択があるときは入替を起こさない」という判定で代わりにしている。下の `flip`）。
const CARD_BASE =
  "col-start-1 row-start-1 border-4 border-black transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between p-5 sm:p-7";
const CARD_FRONT =
  "z-10 translate-x-0 translate-y-0 rotate-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]";
const CARD_BACK =
  "z-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
// 付箋。角は丸めず（角ばらせる）、手で貼ったように少し傾け、影で浮かせる。
// 高さと `-top-*` は、**背面に回ったカードでもラベルが前面カードの上端より
// 上に残る**ように決めてある（背面は右下へ 16/24px ずれるので、その分の逃げが要る）。
// 下端 8px はカードに重ねて、貼り付いている感じを出している。
const TAB_BASE =
  "absolute -top-16 sm:-top-20 w-32 sm:w-36 h-18 sm:h-22 border-4 border-black flex items-start justify-center pt-3 sm:pt-3.5 font-black text-sm sm:text-base tracking-widest z-[-1] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] select-none";
// 入替バッジ。2 枚とも同じ形・同じ並び（ラベル → アイコン）で、行き先の名前だけが違う。
const BADGE =
  "shrink-0 whitespace-nowrap text-xs sm:text-sm font-black flex items-center gap-1.5 bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group-active:shadow-none group-active:translate-y-[2px] group-active:translate-x-[2px]";
const CHIP =
  "px-2 py-0.5 border-2 border-black font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
// 綴りを語の隣に並べるので inline-flex。`items-baseline` にしないのは、
// 見出し側が flex でその先頭がアイコン（置換要素＝ベースラインは下端）なので、
// ベースライン合わせにすると綴りが数 px 沈むため。
const HEAD_CHIP =
  "mb-3 inline-flex w-fit items-center gap-2 -rotate-2 transform border-2 border-transparent bg-black px-3 py-1 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]";
// 見出しの語に添える英語の綴り。**見出し要素（h1）の外に置く**ので、
// `h1` のテキストは中立な見出し語（カタカナ）だけになり、`<title>` とずれない。
const HEAD_SPELLING = "text-xs font-black tracking-wider text-white/60 sm:text-sm";
const BODY_TEXT =
  "border-b-4 border-black/20 pb-2 text-sm leading-relaxed font-bold text-black sm:text-base";

interface Props {
  /** 見出し語（カタカナ）。2 枚で共通。 */
  term: string;
  reading: string;
  engineer: { spelling: string; description: string; examples: string[] };
  general: { spelling: string; meaning: string; examples: string[] };
  defaultFront?: Side;
  /** 渡すと一覧用の静的プレビュー（カード全体がこの URL へのリンク）になる。 */
  href?: string;
  /**
   * GENERAL カードの語名が使う見出しレベル。語ページはページの主題そのものなので
   * h1、それ以外（トップの代表例など）はページに h1 が別にあるので h2。
   */
  heading?: "h1" | "h2";
}

export default function MeaningCards({
  term,
  reading,
  engineer,
  general,
  defaultFront = "engineer",
  href,
  heading,
}: Props) {
  const [front, setFront] = useState<Side>(defaultFront);

  // 入替バッジの実体。押した瞬間にそのバッジは背面へ回って
  // `tabIndex={-1}` になるので、**新しく前面に来た側のバッジへ焦点を移す**。
  // これをやらないとキーボード操作でフォーカスが行方不明になる。
  const badges = useRef<Partial<Record<Side, HTMLButtonElement | null>>>({});

  const preview = href !== undefined;
  const engineerFront = front === "engineer";
  const examples = engineerFront ? engineer.examples : general.examples;
  const spelling: Record<Side, string> = {
    engineer: engineer.spelling,
    general: general.spelling,
  };

  const flip = (moveFocus = false) => {
    // 本文をドラッグして選択しただけのときは入れ替えない
    // （カード全体がクリック対象なので、選択と入替が衝突する）。
    if (!moveFocus && (window.getSelection()?.toString() ?? "") !== "") return;

    const next = OTHER[front];
    setFront(next);
    if (moveFocus) {
      // 再描画のあとで焦点を移す。
      requestAnimationFrame(() => badges.current[next]?.focus());
    }
  };

  // 語名の見出しは GENERAL 側が持つ（語ページでは h1、それ以外は h2）。
  // ENGINEER 側の同じ位置は見出しではないので p。
  const GeneralHeading = heading ?? (preview ? "h2" : "h1");

  const card = (side: Side) => {
    const style = CARDS[side];
    const Icon = style.icon;
    const isFront = front === side;
    const Heading = side === "general" ? GeneralHeading : "p";

    return (
      <div
        className={clsx(
          CARD_BASE,
          style.bg,
          isFront ? CARD_FRONT : CARD_BACK,
        )}
      >
        {/* 付箋 (ENGINEER は右上、GENERAL は左上) */}
        <div className={clsx(TAB_BASE, style.bg, style.tab)}>{style.label}</div>

        <div className="flex h-full flex-col justify-between">
          <div>
            <div className={HEAD_CHIP}>
              <Heading className="flex items-center gap-2 text-xl font-black tracking-wider sm:text-2xl">
                <Icon size={22} /> {term}
              </Heading>
              <span className={HEAD_SPELLING}>{spelling[side]}</span>
            </div>

            {/* 参考の技術スタックのチップ列にあたる位置。2 枚とも読みを置く。 */}
            <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
              <span className={clsx(CHIP, "bg-white")}>{reading}</span>
            </div>

            <p className={BODY_TEXT}>
              {side === "engineer" ? engineer.description : general.meaning}
            </p>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <p
              aria-hidden="true"
              className="text-2xl font-black tracking-tighter text-black/20 select-none sm:text-5xl"
            >
              {style.label}
            </p>
            <Badge
              preview={preview}
              onFlip={() => flip(true)}
              focusable={isFront}
              target={OTHER[side]}
              ref={(node) => {
                badges.current[side] = node;
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // カードコンテナ：上に飛び出す付箋のスペースを確保するため mt-24 を追加。
  // 高さは min-h（下限）だけを指定し、本文が長ければグリッドが伸びる。
  const stackClass =
    "relative grid w-[320px] min-h-[280px] sm:w-[560px] sm:min-h-[300px] cursor-pointer group mt-24";

  const stack = (
    <>
      {card("engineer")}
      {card("general")}
    </>
  );

  if (preview) {
    // `stackClass` の grid を消さないよう、ここで display を足さないこと
    // （2 枚は同じセルに重ねている）。
    return (
      <a href={href} className={stackClass}>
        {stack}
      </a>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={stackClass} onClick={() => flip()}>
        {stack}
      </div>

      {/* どちらが前面に来たかを読み上げる。カードは見た目でしか
          前後が分からないので、視覚以外にも伝わるようにしておく。 */}
      <p aria-live="polite" className="sr-only">
        {engineerFront ? "エンジニア" : "ふつう"}の意味が前面です
      </p>

      {examples.length > 0 && (
        <div className="mt-16 w-[320px] sm:w-[560px]">
          <p className="mb-3 inline-block -rotate-2 transform bg-black px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] sm:text-sm">
            用例 / {engineerFront ? "ENGINEER" : "GENERAL"}
          </p>
          <ul className="flex flex-col items-start gap-2">
            {examples.map((example) => (
              <li key={example} className={clsx(CHIP, "bg-white")}>
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * 下段右のバッジ。2 枚で共通の形にしてあり、行き先の名前だけが入れ替わる。
 * 前面なら押せて前後が入れ替わる（背面のものは焦点から外す）。
 */
function Badge({
  preview,
  onFlip,
  focusable,
  target,
  ref,
}: {
  preview: boolean;
  onFlip: () => void;
  focusable: boolean;
  /** 押したときに前面へ出る側。 */
  target: Side;
  /** 入替後に焦点を移すため、親がボタンの実体を掴んでおく。 */
  ref?: (node: HTMLButtonElement | null) => void;
}) {
  const content = (
    <>
      TAP FOR {CARDS[target].label}
      <CornerRightDown size={16} strokeWidth={3} />
    </>
  );

  if (preview) return <span className={BADGE}>{content}</span>;

  const JA: Record<Side, string> = {
    engineer: "エンジニア",
    general: "ふつう",
  };

  return (
    <button
      type="button"
      ref={ref}
      onClick={(event) => {
        event.stopPropagation();
        onFlip();
      }}
      tabIndex={focusable ? 0 : -1}
      aria-label={`${JA[target]}の意味を前面に出す`}
      className={clsx(BADGE, "cursor-pointer")}
    >
      {content}
    </button>
  );
}
