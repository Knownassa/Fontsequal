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
  onInstalled: (font: FontFamily) => void;
  favoritePendingId?: string;
};

export function FontGrid({
  fonts,
  previewText,
  loading,
  selectedId,
  onSelect,
  onToggleFavorite,
  onInstalled,
  favoritePendingId,
}: FontGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-3"
          >
            <Skeleton className="h-32 rounded-[18px]" />
            <div className="space-y-2 px-2 pb-2">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-6 w-4/5 rounded-full" />
              <Skeleton className="h-7 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {fonts.map((font) => (
        <FontCard
          key={font.id}
          font={font}
          previewText={previewText}
          selected={font.id === selectedId}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          onInstalled={onInstalled}
          favoritePending={font.id === favoritePendingId}
        />
      ))}
    </div>
  );
}
