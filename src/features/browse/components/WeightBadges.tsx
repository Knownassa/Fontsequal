import type { FontVariant } from "@/types/font";

type WeightBadgesProps = {
  variants: FontVariant[];
};

export function WeightBadges({ variants }: WeightBadgesProps) {
  const weights = Array.from(new Set(variants.map((variant) => variant.weight)))
    .sort((a, b) => a - b)
    .slice(0, 6);
  const remaining = Math.max(0, variants.length - weights.length);

  return (
    <div className="flex min-h-7 flex-wrap items-center gap-1.5">
      {weights.map((weight) => (
        <span
          key={weight}
          className="grid h-6 min-w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-[11px] font-medium text-white/72"
        >
          {weight}
        </span>
      ))}
      {remaining > 0 ? (
        <span className="text-[11px] text-muted-foreground">+{remaining}</span>
      ) : null}
    </div>
  );
}
