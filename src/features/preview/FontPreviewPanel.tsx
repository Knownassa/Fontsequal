import { useEffect } from "react";
import { InstallButton } from "@/features/browse/components/InstallButton";
import type { FontFamily } from "@/types/font";
import { usePreviewStore } from "@/stores/preview-store";
import { FontCompareView } from "./FontCompareView";
import { FontPreviewControls } from "./FontPreviewControls";
import { usePreviewFont } from "./preview-font";

type FontPreviewPanelProps = {
  font?: FontFamily;
  availableFonts?: FontFamily[];
  onInstalled?: (font: FontFamily) => void;
};

export function FontPreviewPanel({ font, availableFonts = [], onInstalled }: FontPreviewPanelProps) {
  const compareFontIds = usePreviewStore((state) => state.compareFontIds);
  const setCompareFontIds = usePreviewStore((state) => state.setCompareFontIds);

  useEffect(() => {
    if (font && !compareFontIds.includes(font.id)) {
      setCompareFontIds([font.id, ...compareFontIds]);
    }
  }, [compareFontIds, font, setCompareFontIds]);

  if (!font) {
    return (
      <aside className="hidden border-l bg-card p-5 text-sm text-muted-foreground xl:block">
        Select a family to inspect its preview and variants.
      </aside>
    );
  }

  return (
    <aside className="hidden space-y-5 border-l bg-card py-5 pl-5 xl:block">
      <section className="overflow-hidden border-y border-l bg-card">
        <div className="flex items-start justify-between gap-3 border-b px-4 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Selected family</p>
            <h2 className="mt-1 text-xl font-semibold">{font.family}</h2>
          </div>
          <InstallButton font={font} onInstalled={onInstalled} />
        </div>
        <Specimen font={font} />
        <div className="border-t p-4">
          <FontPreviewControls font={font} />
        </div>
      </section>
      <FontCompareView fonts={availableFonts.length ? availableFonts : [font]} />
    </aside>
  );
}

function Specimen({ font }: { font: FontFamily }) {
  const text = usePreviewStore((state) => state.text);
  const fontSize = usePreviewStore((state) => state.fontSize);
  const letterSpacing = usePreviewStore((state) => state.letterSpacing);
  const lineHeight = usePreviewStore((state) => state.lineHeight);
  const weight = usePreviewStore((state) => state.weight);
  const italic = usePreviewStore((state) => state.italic);
  const fontName = usePreviewFont(font, weight, italic);

  return (
    <div className="relative overflow-hidden bg-muted/45 p-5 sm:p-6">
      <span className="pointer-events-none absolute right-5 top-2 text-8xl font-semibold leading-none text-foreground/[0.05]">Aa</span>
      <p
        className="relative min-h-52 whitespace-pre-wrap break-words text-foreground"
        style={{
          fontFamily: fontName,
          fontSize: `clamp(22px, ${fontSize}px, 120px)`,
          fontWeight: weight,
          fontStyle: italic ? "italic" : "normal",
          letterSpacing: `${letterSpacing}px`,
          lineHeight,
        }}
      >
        {text}
      </p>
    </div>
  );
}
