import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * エンジニア視点とふつう視点の 2 枚を、書類が重なったように前後に並べる。
 * 前面カードだけが本文を出し、背面カードは見出しタブだけを上にのぞかせる。
 * タブをクリックすると前後が入れ替わる。
 *
 * エンジニアカードでは 3 段階（さらっと / しっかり / がっつり）のボタンで
 * 説明文を切り替える。かつての部分列＋CSS 方式はやめ、切替はこの島が担う。
 */

const LEVELS = ["さらっと", "しっかり", "がっつり"] as const;

type Side = "engineer" | "general";

interface Props {
  engineer: { levels: string[]; examples: string[] };
  general: { meaning: string; examples: string[] };
  /** 0=さらっと, 1=しっかり, 2=がっつり。 */
  defaultLevel?: number;
  defaultFront?: Side;
}

const TITLE: Record<Side, string> = { engineer: "エンジニア", general: "ふつう" };
const BG: Record<Side, string> = { engineer: "bg-engineer", general: "bg-general" };

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

  const back: Side = front === "engineer" ? "general" : "engineer";

  return (
    <div className="relative grid pt-9">
      {/* 背面：見出しタブだけが前面カードの上にのぞく。クリックで前面へ。 */}
      <button
        type="button"
        onClick={() => setFront(back)}
        aria-label={`${TITLE[back]}の意味を前面に出す`}
        className={cn(
          "font-head col-start-1 row-start-1 z-10 -translate-y-9 translate-x-2 rotate-[1.6deg] self-start justify-self-start",
          "border-4 px-4 py-2 text-sm font-black whitespace-nowrap shadow-lg transition-transform",
          "hover:-translate-y-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          BG[back],
        )}
      >
        {TITLE[back]} <span aria-hidden="true">▲</span>
      </button>

      {/* 前面：見出し＋本文。 */}
      <section
        className={cn(
          "col-start-1 row-start-1 z-20 rotate-[-1deg] border-4 p-5 shadow-lg transition-transform",
          BG[front],
        )}
      >
        <h2 className="font-head mb-3 text-sm font-black">{TITLE[front]}</h2>

        {front === "engineer" ? (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {LEVELS.map((label, i) => (
                <Button
                  key={label}
                  type="button"
                  size="sm"
                  variant={i === level ? "default" : "outline"}
                  aria-pressed={i === level}
                  onClick={() => setLevel(i)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <p className="leading-relaxed">{engineer.levels[level]}</p>
            <ExampleList items={engineer.examples} />
          </>
        ) : (
          <>
            <p className="leading-relaxed">{general.meaning}</p>
            <ExampleList items={general.examples} />
          </>
        )}
      </section>
    </div>
  );
}
