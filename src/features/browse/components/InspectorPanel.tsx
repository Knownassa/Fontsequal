import { Heart, Info, Maximize2, PackageCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToCollectionDialog } from "@/features/collections/AddToCollectionDialog";
import { FontPreviewControls } from "@/features/preview/FontPreviewControls";
import { usePreviewFont } from "@/features/preview/preview-font";
import { usePreviewStore } from "@/stores/preview-store";
import type { FontFamily } from "@/types/font";
import { InstallButton } from "./InstallButton";
import { WeightBadges } from "./WeightBadges";

type InspectorPanelProps = { font?: FontFamily; onInstalled: (font: FontFamily) => void; onToggleFavorite: (font: FontFamily) => void; onClose: () => void; onOpenViewer: () => void };

export function InspectorPanel({ font, onInstalled, onToggleFavorite, onClose, onOpenViewer }: InspectorPanelProps) {
  if (!font) return <aside className="material-inspector hidden border-l p-3 text-sm text-muted-foreground xl:block"><div className="glass-panel p-4">Select a font to inspect its family, variants, and license.</div></aside>;

  return <aside data-inspector tabIndex={-1} className="material-inspector hidden overflow-y-auto border-l p-3 outline-none xl:block">
    <InspectorSection label="Font identity"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate text-base font-semibold">{font.family}</h2><p className="mt-1 text-xs text-muted-foreground">{font.category} · {font.variants.length} styles</p></div><div className="flex gap-1"><Button aria-label="Open full preview" className="size-8" size="icon" variant="ghost" onClick={onOpenViewer}><Maximize2 className="size-4" /></Button><Button aria-label={font.isFavorite ? "Remove favorite" : "Add favorite"} className={font.isFavorite ? "text-primary" : ""} size="icon" variant="ghost" onClick={() => onToggleFavorite(font)}><Heart className="size-4" /></Button><Button aria-label="Close inspector" className="size-8" size="icon" variant="ghost" onClick={onClose}><X className="size-4" /></Button></div></div><Specimen font={font} /></InspectorSection>
    <InspectorSection label="Preview controls"><FontPreviewControls font={font} /></InspectorSection>
    <InspectorSection label="Variants"><WeightBadges variants={font.variants} /></InspectorSection>
    <InspectorSection label="Source and license"><div className="space-y-2 text-xs"><InfoRow label="Source" value={sourceLabel(font.source)} /><InfoRow label="Foundry" value={font.metadata?.foundry ?? "Unavailable"} /><InfoRow label="License" value={font.metadata?.license ?? "Unavailable"} /></div></InspectorSection>
    <InspectorSection label="Installation"><div className="flex items-center justify-between gap-2"><Badge variant="glass">{font.isInstalled ? "Installed" : "Not installed"}</Badge><InstallButton font={font} onInstalled={onInstalled} /></div></InspectorSection>
    <InspectorSection label="Actions"><div className="flex gap-2"><AddToCollectionDialog familyId={font.id} /><Button size="sm" variant="outline"><PackageCheck className="size-3.5" />Details</Button></div></InspectorSection>
  </aside>;
}

function InspectorSection({ label, children }: { label: string; children: React.ReactNode }) { return <section className="glass-panel mb-2 p-3 last:mb-0"><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>{children}</section>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="flex gap-3"><span className="w-14 shrink-0 text-muted-foreground">{label}</span><span className="min-w-0 truncate text-foreground">{value}</span></div>; }
function sourceLabel(source: FontFamily["source"]) { return source === "google" ? "Google Fonts" : source === "localImport" ? "Managed import" : source === "system" ? "System" : "Local"; }
function Specimen({ font }: { font: FontFamily }) { const text = usePreviewStore((state) => state.text); const weight = usePreviewStore((state) => state.weight); const italic = usePreviewStore((state) => state.italic); const fontSize = usePreviewStore((state) => state.fontSize); const fontName = usePreviewFont(font, weight, italic); return <p className="inset-surface mt-3 min-h-24 overflow-hidden rounded-[12px] bg-[radial-gradient(circle_at_18%_8%,var(--surface-3),transparent_48%)] p-3 leading-tight" style={{ fontFamily: fontName, fontSize: `clamp(20px, ${Math.min(fontSize, 42)}px, 42px)`, fontWeight: weight, fontStyle: italic ? "italic" : "normal" }}>{text}</p>; }
