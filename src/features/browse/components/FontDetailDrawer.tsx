import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { uninstallFont } from "@/lib/api/fonts";
import type { FontFamily } from "@/types/font";
import { FontPreviewControls } from "@/features/preview/FontPreviewControls";
import { InstallButton } from "./InstallButton";
import { WeightBadges } from "./WeightBadges";
import { FontCardPreview } from "./FontCardPreview";
import { usePreviewStore } from "@/stores/preview-store";

type Props = { font?: FontFamily; open: boolean; onOpenChange: (open: boolean) => void; onInstalled: (font: FontFamily) => void };
export function FontDetailDrawer({ font, open, onOpenChange, onInstalled }: Props) {
  const queryClient = useQueryClient();
  const previewText = usePreviewStore((state) => state.text);
  const uninstall = useMutation({ mutationFn: async () => { if (!font) return; const result = await uninstallFont({ familyId: font.id, scope: "user" }); if (!result.ok) throw new Error(result.error); }, onSuccess: () => { toast.success("Managed font removed."); onOpenChange(false); queryClient.invalidateQueries({ queryKey: ["installed-fonts"] }); queryClient.invalidateQueries({ queryKey: ["google-fonts"] }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Uninstall failed.") });
  if (!font) return null;
  const isSystem = font.source === "system" || font.source === "local";
  const isManaged = font.source === "localImport";
  const source = isManaged ? "Managed" : isSystem ? "System" : font.source === "google" ? "Google" : "Remote";
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent><div className="space-y-6"><div className="pr-10"><p className="text-[11px] font-medium uppercase tracking-[.18em] text-muted-foreground">{source} provider</p><SheetTitle className="mt-2 text-3xl font-semibold">{font.family}</SheetTitle><SheetDescription className="mt-2 text-sm text-muted-foreground">{font.metadata?.foundry ?? "Font metadata"}</SheetDescription></div><div className="flex flex-wrap gap-2"><Badge variant="glass">{font.category}</Badge><Badge variant="glass">{source}</Badge>{font.isInstalled ? <Badge variant="glass">Installed</Badge> : null}{isManaged ? <Badge variant="glass">Managed by Fontsequal</Badge> : null}{isSystem ? <Badge variant="glass">Read-only</Badge> : null}</div>{isSystem ? <div className="rounded-md border border-primary/30 bg-accent p-4 text-sm text-foreground">System font — read-only in Fontsequal</div> : null}<div className="rounded-md border bg-muted/45 p-4"><p className="text-[11px] font-medium uppercase tracking-[.16em] text-muted-foreground">Available variants</p><div className="mt-3"><WeightBadges variants={font.variants} /></div></div><FontCardPreview font={font} previewText={previewText} /><div className="rounded-md border bg-card p-4"><p className="mb-4 text-[11px] font-medium uppercase tracking-[.16em] text-muted-foreground">Fine tune preview</p><FontPreviewControls font={font} /></div><div className="flex gap-2">{!isSystem && !font.isInstalled ? <InstallButton font={font} onInstalled={onInstalled} /> : null}{isManaged ? <Button disabled={uninstall.isPending} variant="destructive" onClick={() => uninstall.mutate()}>{uninstall.isPending ? "Removing" : "Uninstall"}</Button> : null}</div><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">License</dt><dd className="mt-1 text-foreground">{font.metadata?.license ?? "Unavailable"}</dd></div><div><dt className="text-muted-foreground">Variants</dt><dd className="mt-1 text-foreground">{font.variants.length}</dd></div></dl></div></SheetContent></Sheet>;
}
