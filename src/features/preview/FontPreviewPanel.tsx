import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
      <aside className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-muted-foreground">
        Select family to open preview lab.
      </aside>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_18px_60px_rgba(0,0,0,.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Typography lab</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{font.family}</h2>
          </div>
          <div className="flex items-center gap-2"><Badge variant="glass">{font.category}</Badge><InstallButton font={font} onInstalled={onInstalled} /></div>
        </div>
        <Specimen font={font} />
        <div className="border-t border-white/10 p-5">
          <FontPreviewControls font={font} />
        </div>
      </section>
      <FontCompareView fonts={availableFonts.length ? availableFonts : [font]} />
    </div>
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
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_0%,rgba(139,92,246,.22),transparent_30%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.015))] p-5 sm:p-7">
      <span className="pointer-events-none absolute right-5 top-2 text-8xl font-semibold leading-none text-white/[0.035]">Aa</span>
      <p
        className="relative min-h-52 whitespace-pre-wrap break-words text-white"
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
