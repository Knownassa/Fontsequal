import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FontFamily } from "@/types/font";
import { CategoryBadge } from "./CategoryBadge";
import { FavoriteButton } from "./FavoriteButton";
import { FontCardPreview } from "./FontCardPreview";
import { InstallButton } from "./InstallButton";
import { AddToCollectionDialog } from "@/features/collections/AddToCollectionDialog";
import { WeightBadges } from "./WeightBadges";

type FontCardProps = {
  font: FontFamily;
  previewText: string;
  selected: boolean;
  onSelect: (font: FontFamily) => void;
  onToggleFavorite: (font: FontFamily) => void;
  onInstalled: (font: FontFamily) => void;
  favoritePending?: boolean;
};

export function FontCard({
  font,
  previewText,
  selected,
  onSelect,
  onToggleFavorite,
  onInstalled,
  favoritePending,
}: FontCardProps) {
  const hasVariable = font.variants.some((variant) => variant.variableAxes);

  return (
    <article
      aria-current={selected || undefined}
      className={cn(
        "group relative rounded-[22px] border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_18px_60px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.065]",
        selected && "border-blue-300/35 bg-blue-400/[0.07]",
      )}
    >
      <button
        aria-label={`Preview ${font.family}`}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        type="button"
        onClick={() => onSelect(font)}
      >
        <FontCardPreview font={font} previewText={previewText} />
      </button>
      <div className="space-y-3 p-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-normal text-white">
              {font.family}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CategoryBadge category={font.category} />
              {font.isInstalled ? (
                <Badge className="h-6 rounded-full" variant="glass">
                  Installed
                </Badge>
              ) : null}
              {hasVariable ? (
                <Badge className="h-6 rounded-full" variant="glass">
                  Variable
                </Badge>
              ) : null}
            </div>
          </div>
          <FavoriteButton
            active={font.isFavorite}
            disabled={favoritePending}
            onClick={() => onToggleFavorite(font)}
          />
        </div>

        <WeightBadges variants={font.variants} />

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2"><Button size="sm" variant="glass" onClick={() => onSelect(font)}>Preview</Button><AddToCollectionDialog familyId={font.id} /></div>
          <InstallButton font={font} onInstalled={onInstalled} />
        </div>
      </div>
    </article>
  );
}
