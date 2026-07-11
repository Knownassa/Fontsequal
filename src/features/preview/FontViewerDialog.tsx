import { Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FontPreviewControls } from "./FontPreviewControls";
import { usePreviewFont } from "./preview-font";
import { usePreviewStore } from "@/stores/preview-store";
import type { FontFamily } from "@/types/font";

type FontViewerDialogProps = { font?: FontFamily; open: boolean; onOpenChange: (open: boolean) => void };

export function FontViewerDialog({ font, open, onOpenChange }: FontViewerDialogProps) {
  if (!font) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="h-[min(760px,calc(100vh-2rem))] max-w-6xl gap-0 overflow-hidden p-0"><div className="flex h-full min-h-0 flex-col"><header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border-soft)] px-4"><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">Full preview</p><h2 className="truncate text-sm font-semibold">{font.family}</h2></div><Button aria-label="Close full preview" className="size-8" size="icon" variant="ghost" onClick={() => onOpenChange(false)}><X className="size-4" /></Button></header><div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_280px]"><FullSpecimen font={font} /><aside className="material-inspector min-h-0 overflow-y-auto border-l border-[var(--border-soft)] p-4"><p className="mb-3 text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">Preview controls</p><FontPreviewControls font={font} /></aside></div></div></DialogContent></Dialog>;
}

function FullSpecimen({ font }: { font: FontFamily }) {
  const text = usePreviewStore((state) => state.text); const weight = usePreviewStore((state) => state.weight); const italic = usePreviewStore((state) => state.italic); const fontSize = usePreviewStore((state) => state.fontSize); const letterSpacing = usePreviewStore((state) => state.letterSpacing); const lineHeight = usePreviewStore((state) => state.lineHeight); const fontName = usePreviewFont(font, weight, italic);
  return <section className="relative min-h-0 overflow-auto bg-[radial-gradient(circle_at_50%_10%,var(--surface-3),transparent_40%)] p-6 md:p-10"><div className="glass-panel min-h-full p-6 md:p-10"><p className="whitespace-pre-wrap break-words text-foreground" style={{ fontFamily: fontName, fontSize: `clamp(28px, ${Math.max(fontSize, 48)}px, 144px)`, fontWeight: weight, fontStyle: italic ? "italic" : "normal", letterSpacing: `${letterSpacing}px`, lineHeight }}>{text}</p></div><div className="pointer-events-none absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-[10px] border border-[var(--border-soft)] bg-[var(--surface-2)] px-3 py-2 text-xs text-muted-foreground"><Expand className="size-3.5" />Focus preview</div></section>;
}
