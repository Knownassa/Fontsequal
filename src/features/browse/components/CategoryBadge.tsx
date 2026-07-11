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
  "sans-serif": "border-border bg-muted text-muted-foreground",
  serif: "border-border bg-muted text-muted-foreground",
  display: "border-border bg-muted text-muted-foreground",
  handwriting: "border-border bg-muted text-muted-foreground",
  monospace: "border-border bg-muted text-muted-foreground",
  symbol: "border-border bg-muted text-muted-foreground",
  other: "border-border bg-muted text-muted-foreground",
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
