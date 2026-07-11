import { cn } from "@/lib/utils";
import type { FontCategory } from "@/types/font";

const categoryLabels: Record<FontCategory, string> = {
  "sans-serif": "Sans",
  serif: "Serif",
  display: "Display",
  handwriting: "Hand",
  monospace: "Mono",
  symbol: "Symbol",
  other: "Other",
};

const categoryClasses: Record<FontCategory, string> = {
  "sans-serif": "border-blue-400/20 bg-blue-400/10 text-blue-100",
  serif: "border-orange-400/20 bg-orange-400/10 text-orange-100",
  display: "border-purple-400/20 bg-purple-400/10 text-purple-100",
  handwriting: "border-green-400/20 bg-green-400/10 text-green-100",
  monospace: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  symbol: "border-white/15 bg-white/8 text-white/80",
  other: "border-white/15 bg-white/8 text-white/80",
};

type CategoryBadgeProps = {
  category: FontCategory;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium",
        categoryClasses[category],
        className,
      )}
    >
      {categoryLabels[category]}
    </span>
  );
}

export { categoryLabels };
