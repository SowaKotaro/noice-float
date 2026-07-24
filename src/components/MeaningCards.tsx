import { useState } from "react";
import { CornerRightDown, Smile, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
 * チップ列・本文だけ。構造は下の `card()` 一か所で描いているので、
 * 差を付けたくなったら CARDS の表に足すこと。
 *
 *   見出しチップ（アイコン＋語）／チップ列／本文／下段（透かし＋バッジ）
 *   ENGINEER … チップ列＝3 段階の切替、本文＝levels[n]
 *   GENERAL  … チップ列＝読み（切替はない）、本文＝ふつうの意味
 *
 * 下段左の透かしは付箋と同じラベル（ENGINEER / GENERAL）。
 *
 * `href` を渡すと一覧用の静的プレビューになる（島として動かさない）。
 * このときカード全体が語ページへのリンクになり、ボタン類は span で出す。
 */

const LEVELS = ["さらっと", "しっかり", "がっつり"] as const;

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
const CARD_BASE =
  "col-start-1 row-start-1 border-4 border-black transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col justify-between p-5 sm:p-7 select-none";
const CARD_FRONT =
  "z-10 translate-x-0 translate-y-0 rotate-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]";
const CARD_BACK =
  "z-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
// 付箋。角は丸めず（角ばらせる）、手で貼ったように少し傾け、影で浮かせる。
// 高さと `-top-*` は、**背面に回ったカードでもラベルが前面カードの上端より
// 上に残る**ように決めてある（背面は右下へ 16/24px ずれるので、その分の逃げが要る）。
// 下端 8px はカードに重ねて、貼り付いている感じを出している。
const TAB_BASE =
  "absolute -top-16 sm:-top-20 w-32 sm:w-36 h-18 sm:h-22 border-4 border-black flex items-start justify-center pt-3 sm:pt-3.5 font-black text-sm sm:text-base tracking-widest z-[-1] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";
// 入替バッジ。2 枚とも同じ形・同じ並び（ラベル → アイコン）で、行き先の名前だけが違う。
const BADGE =
  "shrink-0 whitespace-nowrap text-xs sm:text-sm font-black flex items-center gap-1.5 bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all group-active:shadow-none group-active:translate-y-[2px] group-active:translate-x-[2px]";
const CHIP =
  "px-2 py-0.5 border-2 border-black font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
const HEAD_CHIP =
  "mb-3 inline-block w-fit -rotate-2 transform border-2 border-transparent bg-black px-3 py-1 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]";
const BODY_TEXT =
  "border-b-4 border-black/20 pb-2 text-sm leading-relaxed font-bold text-black sm:text-base";

interface Props {
  term: string;
  reading: string;
  engineer: { levels: string[]; examples: string[] };
  general: { meaning: string; examples: string[] };
  /** 0=さらっと, 1=しっかり, 2=がっつり。 */
  defaultLevel?: number;
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
  defaultLevel = 1,
  defaultFront = "engineer",
  href,
  heading,
}: Props) {
  const [front, setFront] = useState<Side>(defaultFront);
  const [level, setLevel] = useState(defaultLevel);

  const preview = href !== undefined;
  const engineerFront = front === "engineer";
  const flip = () => setFront(engineerFront ? "general" : "engineer");
  const examples = engineerFront ? engineer.examples : general.examples;

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
        className={cn(
          CARD_BASE,
          style.bg,
          isFront ? CARD_FRONT : CARD_BACK,
        )}
      >
        {/* 付箋 (ENGINEER は右上、GENERAL は左上) */}
        <div className={cn(TAB_BASE, style.bg, style.tab)}>{style.label}</div>

        <div className="flex h-full flex-col justify-between">
          <div>
            <div className={HEAD_CHIP}>
              <Heading className="flex items-center gap-2 text-xl font-black tracking-wider uppercase sm:text-2xl">
                <Icon size={22} /> {term}
              </Heading>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
              {side === "engineer" ? (
                // 3 段階の切替。参考の技術スタックのチップ列にあたる。
                LEVELS.map((label, i) =>
                  preview ? (
                    <span
                      key={label}
                      className={cn(
                        CHIP,
                        i === level ? "bg-black text-white" : "bg-white",
                      )}
                    >
                      {label}
                    </span>
                  ) : (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={i === level}
                      disabled={!isFront}
                      onClick={(event) => {
                        event.stopPropagation();
                        setLevel(i);
                      }}
                      className={cn(
                        CHIP,
                        "cursor-pointer transition-all disabled:pointer-events-none",
                        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                        i === level
                          ? "bg-black text-white"
                          : "bg-white hover:bg-black/10",
                      )}
                    >
                      {label}
                    </button>
                  ),
                )
              ) : (
                // GENERAL 側に切替はないので、同じ位置に読みを置いて骨格を揃える。
                <span className={cn(CHIP, "bg-white")}>{reading}</span>
              )}
            </div>

            <p className={BODY_TEXT}>
              {side === "engineer" ? engineer.levels[level] : general.meaning}
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
              onFlip={flip}
              focusable={isFront}
              target={OTHER[side]}
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
      <div className={stackClass} onClick={flip}>
        {stack}
      </div>

      {examples.length > 0 && (
        <div className="mt-16 w-[320px] sm:w-[560px]">
          <p className="mb-3 inline-block -rotate-2 transform bg-black px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] sm:text-sm">
            用例 / {engineerFront ? "ENGINEER" : "GENERAL"}
          </p>
          <ul className="flex flex-col items-start gap-2">
            {examples.map((example) => (
              <li key={example} className={cn(CHIP, "bg-white")}>
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
}: {
  preview: boolean;
  onFlip: () => void;
  focusable: boolean;
  /** 押したときに前面へ出る側。 */
  target: Side;
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
      onClick={(event) => {
        event.stopPropagation();
        onFlip();
      }}
      tabIndex={focusable ? 0 : -1}
      aria-label={`${JA[target]}の意味を前面に出す`}
      className={cn(BADGE, "cursor-pointer")}
    >
      {content}
    </button>
  );
}
