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
              ? "border-primary/40 bg-accent text-accent-foreground"
              : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
