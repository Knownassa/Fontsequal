import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePreviewStore } from "@/stores/preview-store";
import type { FontFamily } from "@/types/font";
import { usePreviewFont } from "./preview-font";

type FontCompareViewProps = {
  fonts: FontFamily[];
};

export function FontCompareView({ fonts }: FontCompareViewProps) {
  const compareFontIds = usePreviewStore((state) => state.compareFontIds);
  const setCompareFontIds = usePreviewStore((state) => state.setCompareFontIds);
  const selectedFonts = compareFontIds
    .map((id) => fonts.find((font) => font.id === id))
    .filter((font): font is FontFamily => Boolean(font));
  const availableFonts = fonts.filter((font) => !compareFontIds.includes(font.id));

  return (
    <section className="space-y-4 border-y border-l bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Compare</p>
          <h2 className="mt-1 text-base font-semibold">Compare families</h2>
        </div>
        <Select
          disabled={selectedFonts.length >= 4 || availableFonts.length === 0}
          value=""
          onValueChange={(id) => setCompareFontIds([...compareFontIds, id])}
        >
          <SelectTrigger className="h-9 w-full bg-background sm:w-40">
            <SelectValue placeholder="Add family" />
          </SelectTrigger>
          <SelectContent>
            {availableFonts.map((font) => (
              <SelectItem key={font.id} value={font.id}>{font.family}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedFonts.length < 2 ? (
        <div className="rounded-md border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          Add {selectedFonts.length === 0 ? "two" : "one more"} family to begin comparison.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {selectedFonts.map((font) => (
            <CompareSpecimen
              key={font.id}
              font={font}
              onRemove={() => setCompareFontIds(compareFontIds.filter((id) => id !== font.id))}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CompareSpecimen({ font, onRemove }: { font: FontFamily; onRemove: () => void }) {
  const text = usePreviewStore((state) => state.text);
  const fontSize = usePreviewStore((state) => state.fontSize);
  const letterSpacing = usePreviewStore((state) => state.letterSpacing);
  const lineHeight = usePreviewStore((state) => state.lineHeight);
  const weight = usePreviewStore((state) => state.weight);
  const italic = usePreviewStore((state) => state.italic);
  const fontName = usePreviewFont(font, weight, italic);

  return (
    <article className="overflow-hidden rounded-md border bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <p className="truncate text-sm font-semibold">{font.family}</p>
        <Button size="sm" type="button" variant="glass" onClick={onRemove}>Remove</Button>
      </div>
      <p
        className="min-h-40 whitespace-pre-wrap break-words p-4 text-foreground"
        style={{
          fontFamily: fontName,
          fontSize: `clamp(18px, ${fontSize}px, 72px)`,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
          letterSpacing: `${letterSpacing}px`,
          lineHeight,
        }}
      >
        {text}
      </p>
    </article>
  );
}
