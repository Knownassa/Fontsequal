import { cn } from "@/lib/utils";
import type { FontVariant } from "@/types/font";

type WeightSelectorProps = {
  variants: FontVariant[];
  value: number;
  onChange: (weight: number) => void;
};

export function WeightSelector({ variants, value, onChange }: WeightSelectorProps) {
  const weights = [...new Set(variants.map((variant) => variant.weight))].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap gap-1.5">
      {weights.map((weight) => (
        <button
          key={weight}
          aria-pressed={weight === value}
          className={cn(
            "min-w-11 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
            weight === value
              ? "border-violet-300/40 bg-violet-400/15 text-white"
              : "border-white/10 bg-black/20 text-white/65 hover:border-white/20 hover:text-white",
          )}
          type="button"
          onClick={() => onChange(weight)}
        >
          {weight}
        </button>
      ))}
    </div>
  );
}
