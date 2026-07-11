import { cn } from "@/lib/utils";
import type { FontFamily } from "@/types/font";
import { CategoryBadge } from "./CategoryBadge";
import { FavoriteButton } from "./FavoriteButton";
import { FontCardPreview } from "./FontCardPreview";

type FontCardProps = {
  font: FontFamily;
  previewText: string;
  selected: boolean;
  onSelect: (font: FontFamily) => void;
  onToggleFavorite: (font: FontFamily) => void;
  favoritePending?: boolean;
  view?: "grid" | "list";
};

export function FontCard({
  font,
  previewText,
  selected,
  onSelect,
  onToggleFavorite,
  favoritePending,
  view = "grid",
}: FontCardProps) {
  return (
    <article
      aria-current={selected || undefined}
      className={cn(
        "glass-card group relative p-3 hover:bg-[var(--surface-3)]",
        selected && "selected-surface",
      )}
    >
      <button
        aria-label={`Preview ${font.family}`}
        className={cn("block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", view === "list" ? "flex w-full items-center gap-4" : "w-full")}
        type="button"
        onClick={() => onSelect(font)}
      >
        <FontCardPreview className={view === "list" ? "min-h-16 w-48 shrink-0" : undefined} font={font} previewText={previewText} />
        {view === "list" ? <div className="min-w-0"><h3 className="truncate text-sm font-semibold">{font.family}</h3><p className="mt-1 text-xs text-muted-foreground">{font.category} · {font.variants.length} styles</p></div> : null}
      </button>
      {view === "grid" ? <div className="flex items-start justify-between gap-3 px-1 pb-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold tracking-normal">
              {font.family}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <CategoryBadge className="h-5 px-2 text-[10px]" category={font.category} />
              {font.isInstalled ? (
                <span className="text-[11px] text-muted-foreground">Installed</span>
              ) : null}
            </div>
          </div>
        </div>
        <FavoriteButton
          active={font.isFavorite}
          disabled={favoritePending}
          onClick={() => onToggleFavorite(font)}
        />
      </div> : <FavoriteButton active={font.isFavorite} disabled={favoritePending} onClick={() => onToggleFavorite(font)} />}
    </article>
  );
}
