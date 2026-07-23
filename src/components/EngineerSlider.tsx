import { useStore } from "@nanostores/react";
import { GLOBAL_MAX } from "@/lib/levelize";
import { applyEngineerLevel, engineerLevel } from "@/stores/engineerLevel";
import { Slider } from "@/components/ui/slider";

export default function EngineerSlider() {
  const level = useStore(engineerLevel);

  // ストアは localStorage の生文字列を保持する。Radix は数値の配列を扱うため、
  // 境界はこの島の内側だけに閉じる。
  const handleChange = ([next]: number[]) => {
    const value = String(next);
    engineerLevel.set(value);
    applyEngineerLevel(value);
  };

  return (
    <div className="bg-card w-full max-w-md border-4 p-4 shadow-lg">
      <div className="mb-3 flex items-baseline justify-between">
        <span id="eng-label" className="font-head text-sm font-black tracking-wide">
          エンジニア度
        </span>
        <span className="bg-accent text-accent-foreground border-2 px-2 text-sm font-black tabular-nums">
          {level}
        </span>
      </div>

      <Slider
        aria-labelledby="eng-label"
        min={0}
        max={GLOBAL_MAX}
        step={1}
        value={[Number(level)]}
        onValueChange={handleChange}
      />

      <div className="text-muted-foreground mt-2 flex justify-between text-xs font-bold">
        <span>ふつうの人</span>
        <span>エンジニア</span>
      </div>
    </div>
  );
}
