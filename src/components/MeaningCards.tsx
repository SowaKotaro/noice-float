import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * エンジニア視点とふつう視点の 2 枚を、書類が重なったように前後に並べる。
 * 2 枚とも本文を持つ完全なカードで、前面のカードが手前に、背面がその奥にずれて重なる。
 * 背面カード（または前面カードの見出しの ⇄）をクリックすると前後が入れ替わり、
 * transform のトランジションで「シュッ」と滑って入れ替わる。
 *
 * エンジニアカードでは 3 段階（さらっと / しっかり / がっつり）のボタンで説明文を切り替える。
 * 背面にいる間はボタンは無効化され、カード面クリックが前面化に使われる。
 */

const LEVELS = ["さらっと", "しっかり", "がっつり"] as const;

type Side = "engineer" | "general";

const TITLE: Record<Side, string> = { engineer: "エンジニア", general: "ふつう" };
const BG: Record<Side, string> = { engineer: "bg-engineer", general: "bg-general" };

// 前面／背面の位置。この差分を transition-transform でアニメーションさせる。
const POS_FRONT = "z-20 translate-x-0 translate-y-0 rotate-[-1.2deg] scale-100";
const POS_BACK = "z-10 translate-x-4 translate-y-6 rotate-[2.4deg] scale-[0.97]";

interface Props {
  engineer: { levels: string[]; examples: string[] };
  general: { meaning: string; examples: string[] };
  /** 0=さらっと, 1=しっかり, 2=がっつり。 */
  defaultLevel?: number;
  defaultFront?: Side;
}

function ExampleList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4 border-t-2 pt-3">
      <p className="font-head mb-1.5 text-xs font-black opacity-60">用例</p>
      <ul className="space-y-1">
        {items.map((example, i) => (
          <li key={i} className="text-sm">
            「{example}」
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MeaningCards({
  engineer,
  general,
  defaultLevel = 1,
  defaultFront = "engineer",
}: Props) {
  const [front, setFront] = useState<Side>(defaultFront);
  const [level, setLevel] = useState(defaultLevel);

  const other = (side: Side): Side =>
    side === "engineer" ? "general" : "engineer";

  const body = (side: Side, isFront: boolean) => {
    if (side === "engineer") {
      return (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {LEVELS.map((label, i) => (
              <Button
                key={label}
                type="button"
                size="sm"
                variant={i === level ? "default" : "outline"}
                aria-pressed={i === level}
                disabled={!isFront}
                onClick={() => setLevel(i)}
              >
                {label}
              </Button>
            ))}
          </div>
          <p className="leading-relaxed">{engineer.levels[level]}</p>
          <ExampleList items={engineer.examples} />
        </>
      );
    }
    return (
      <>
        <p className="leading-relaxed">{general.meaning}</p>
        <ExampleList items={general.examples} />
      </>
    );
  };

  const card = (side: Side) => {
    const isFront = front === side;
    const base = cn(
      "col-start-1 row-start-1 border-4 p-5 shadow-lg transition-transform duration-200 ease-out",
      isFront ? POS_FRONT : POS_BACK,
      BG[side],
    );

    // 前面：見出しの ⇄ を押すと自分を背面へ送る（＝相手を前面に）。本文は操作可能。
    if (isFront) {
      return (
        <section key={side} className={base}>
          <button
            type="button"
            onClick={() => setFront(other(side))}
            aria-label={`${TITLE[other(side)]}を前面に出す`}
            className="font-head mb-3 flex items-center gap-1.5 text-sm font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {TITLE[side]}
            <span aria-hidden="true" className="opacity-60">⇄</span>
          </button>
          {body(side, true)}
        </section>
      );
    }

    // 背面：カード面のどこを押しても前面化。中のボタンは無効化してあるので邪魔しない。
    return (
      <section
        key={side}
        role="button"
        tabIndex={0}
        onClick={() => setFront(side)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFront(side);
          }
        }}
        aria-label={`${TITLE[side]}の意味を前面に出す`}
        className={cn(base, "cursor-pointer")}
      >
        <h2 className="font-head mb-3 text-sm font-black">{TITLE[side]}</h2>
        {body(side, false)}
      </section>
    );
  };

  return (
    <div className="relative grid pr-4 pb-6">
      {card("engineer")}
      {card("general")}
    </div>
  );
}
