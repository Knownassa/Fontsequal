import { Skeleton } from "@/components/ui/skeleton";
import type { FontFamily } from "@/types/font";
import { FontCard } from "./FontCard";

type FontGridProps = {
  fonts: FontFamily[];
  previewText: string;
  loading: boolean;
  selectedId?: string;
  onSelect: (font: FontFamily) => void;
  onToggleFavorite: (font: FontFamily) => void;
  favoritePendingId?: string;
  view?: "grid" | "list";
};

export function FontGrid({
  fonts,
  previewText,
  loading,
  selectedId,
  onSelect,
  onToggleFavorite,
  favoritePendingId,
  view = "grid",
}: FontGridProps) {
  if (loading) {
    return (
      <div className={view === "grid" ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-3" : "space-y-2"}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="glass-card space-y-4 p-3"
          >
            <Skeleton className="h-32 rounded-md" />
            <div className="space-y-2 px-2 pb-2">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={view === "grid" ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-3" : "space-y-2"}>
      {fonts.map((font) => (
        <FontCard
          key={font.id}
          font={font}
          previewText={previewText}
          selected={font.id === selectedId}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          favoritePending={font.id === favoritePendingId}
          view={view}
        />
      ))}
    </div>
  );
}
