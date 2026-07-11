import { useEffect, useMemo, useState } from "react";
import { RefreshIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContainer } from "@/app/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstalledFonts, scanSystemFonts, uninstallFont } from "@/lib/api/fonts";
import type { ApiResult } from "@/types/result";
import type { InstalledFont } from "@/types/font";
import { ImportFontsDialog } from "@/features/import/ImportFontsDialog";

type InstalledFilters = {
  managed: boolean;
  external: boolean;
  duplicates: boolean;
  fileType: "all" | "ttf" | "otf";
  recentOnly: boolean;
};

export function InstalledPage({ duplicatesOnly = false }: { duplicatesOnly?: boolean }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<InstalledFilters>({ managed: false, external: false, duplicates: duplicatesOnly, fileType: "all", recentOnly: false });
  const [selectedId, setSelectedId] = useState<string>();
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [pendingUninstall, setPendingUninstall] = useState<InstalledFont[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(120);
  const debouncedSearch = useDebouncedValue(search, 180);
  const fontsQuery = useQuery({
    queryKey: ["installed-fonts"],
    queryFn: async () => unwrap(await getInstalledFonts()),
  });
  const scanMutation = useMutation({
    mutationFn: async () => unwrap(await scanSystemFonts()),
    onSuccess: (fonts) => {
      queryClient.setQueryData(["installed-fonts"], fonts);
      setSelectedId(fonts[0]?.id);
    },
  });
  const uninstallMutation = useMutation({
    mutationFn: async (targets: InstalledFont[]) => {
      for (const font of targets) {
        const familyId = font.files.find((file) => file.path)?.familyId;
        if (!familyId) throw new Error("Managed font path unavailable.");
        await unwrap(await uninstallFont({ familyId, scope: "user" }));
      }
    },
    onSuccess: () => {
      setPendingUninstall(null);
      setBatchIds([]);
      toast.success("Managed font files removed.");
      void queryClient.invalidateQueries({ queryKey: ["installed-fonts"] });
      void queryClient.invalidateQueries({ queryKey: ["google-fonts"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Uninstall failed."),
  });

  const fonts = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return (fontsQuery.data ?? []).filter((font) => {
      const matchesSearch = !needle || [font.family, font.fullName, font.postScriptName, font.files[0]?.path]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(needle));
      const matchesManaged = !filters.managed || font.isManaged;
      const matchesExternal = !filters.external || !font.isManaged;
      const matchesDuplicates = !filters.duplicates || font.isDuplicate;
      const matchesType = filters.fileType === "all" || font.files.some((file) => file.format === filters.fileType);
      const installedAt = font.installedAt ? new Date(font.installedAt).getTime() : 0;
      const matchesRecent = !filters.recentOnly || (installedAt > 0 && Date.now() - installedAt < 30 * 86_400_000);
      return matchesSearch && matchesManaged && matchesExternal && matchesDuplicates && matchesType && matchesRecent;
    });
  }, [debouncedSearch, filters, fontsQuery.data]);
  const visibleFonts = fonts.slice(0, visibleCount);

  const selected = fonts.find((font) => font.id === selectedId) ?? fonts[0];
  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

  return (
    <PageContainer className="max-w-none px-4 py-4 lg:px-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div><h2 className="text-sm font-semibold">Installed fonts</h2><p className="mt-1 text-xs text-muted-foreground">Read-only scan. System files stay untouched.</p></div>
          <div className="flex flex-wrap gap-2"><ImportFontsDialog /><Button disabled={scanMutation.isPending} variant="raised" onClick={() => scanMutation.mutate()}>
            <HugeIcon icon={RefreshIcon} className={scanMutation.isPending ? "animate-spin" : undefined} size={16} />
            Rescan fonts
          </Button></div>
        </div>

        {scanMutation.isError ? <Status>Scan failed. Existing local results remain available.</Status> : null}

        {!fontsQuery.isLoading && fonts.length === 0 ? <InstalledEmpty onRescan={() => scanMutation.mutate()} pending={scanMutation.isPending} /> : <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_296px]">
          <section className="glass-panel p-3">
            <label className="relative block">
              <HugeIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input className="h-8 bg-surface pl-9" placeholder="Search local fonts" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Filter checked={filters.managed} label="Managed" onChange={(managed) => setFilters((current) => ({ ...current, managed }))} />
              <Filter checked={filters.external} label="External" onChange={(external) => setFilters((current) => ({ ...current, external }))} />
              <Filter checked={filters.duplicates} label="Duplicates" onChange={(duplicates) => setFilters((current) => ({ ...current, duplicates }))} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2"><Select value={filters.fileType} onValueChange={(fileType) => setFilters((current) => ({ ...current, fileType: fileType as InstalledFilters["fileType"] }))}><SelectTrigger className="h-9"><SelectValue placeholder="File type" /></SelectTrigger><SelectContent><SelectItem value="all">All files</SelectItem><SelectItem value="ttf">TTF</SelectItem><SelectItem value="otf">OTF</SelectItem></SelectContent></Select><Filter checked={filters.recentOnly} label="Recent 30d" onChange={(recentOnly) => setFilters((current) => ({ ...current, recentOnly }))} /></div>

            <div className="mt-4 space-y-2">
              {fontsQuery.isLoading ? <InstalledSkeletons /> : null}
              <FontSection title="Managed by Fontsequal" fonts={visibleFonts.filter((font) => font.isManaged)} selected={selected?.id} batchIds={batchIds} setBatchIds={setBatchIds} setSelectedId={setSelectedId} />
              <FontSection title="System fonts" fonts={visibleFonts.filter((font) => !font.isManaged && font.source === "system")} selected={selected?.id} batchIds={batchIds} setBatchIds={setBatchIds} setSelectedId={setSelectedId} />
              <FontSection title="External user fonts" fonts={visibleFonts.filter((font) => !font.isManaged && font.source !== "system")} selected={selected?.id} batchIds={batchIds} setBatchIds={setBatchIds} setSelectedId={setSelectedId} />
              <FontSection title="Duplicates" fonts={visibleFonts.filter((font) => font.isDuplicate)} selected={selected?.id} batchIds={batchIds} setBatchIds={setBatchIds} setSelectedId={setSelectedId} />
            </div>
            {fonts.length > visibleFonts.length ? <Button className="mt-3 w-full" variant="glass" onClick={() => setVisibleCount((count) => count + 120)}>Load more ({fonts.length - visibleFonts.length})</Button> : null}
            {batchIds.length ? <Button className="mt-4 w-full" variant="glass" onClick={() => setPendingUninstall(fonts.filter((font) => batchIds.includes(font.id) && font.isManaged))}>Review uninstall ({batchIds.length})</Button> : null}
          </section>

          <FontDetails font={selected} onUninstall={(font) => setPendingUninstall([font])} />
        </div>}
      </section>
      <UninstallDialog fonts={pendingUninstall ?? []} open={Boolean(pendingUninstall)} pending={uninstallMutation.isPending} onOpenChange={(open) => !open && !uninstallMutation.isPending && setPendingUninstall(null)} onConfirm={() => pendingUninstall && uninstallMutation.mutate(pendingUninstall)} />
    </PageContainer>
  );
}

function FontRow({ font, selected, checked, onCheckedChange, onSelect }: { font: InstalledFont; selected: boolean; checked: boolean; onCheckedChange: (checked: boolean) => void; onSelect: () => void }) {
  return (
    <div className={`glass-control flex px-3 py-2 ${selected ? "selected-surface" : "hover:bg-[var(--control-hover)]"}`}>
      {font.isManaged ? <input aria-label={`Select ${font.family} for uninstall`} checked={checked} className="mr-3 mt-1 size-4 accent-primary" type="checkbox" onChange={(event) => onCheckedChange(event.target.checked)} /> : null}
      <button aria-current={selected || undefined} className="min-w-0 flex-1 text-left" type="button" onClick={onSelect}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{font.family}</p>
          <p className="mt-1 text-xs text-muted-foreground">{font.weight} · {font.style}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {font.isManaged ? <Badge className="h-5 px-2 text-[10px]" variant="glass">Managed</Badge> : <Badge className="h-5 px-2 text-[10px]" variant="glass">External</Badge>}
          {font.isDuplicate ? <Badge className="h-5 border-border bg-muted px-2 text-[10px] text-foreground">Dupe</Badge> : null}
        </div>
      </div>
      </button>
    </div>
  );
}

function FontSection({ title, fonts, selected, batchIds, setBatchIds, setSelectedId }: { title: string; fonts: InstalledFont[]; selected?: string; batchIds: string[]; setBatchIds: React.Dispatch<React.SetStateAction<string[]>>; setSelectedId: (id: string) => void }) { if (!fonts.length) return null; return <div className="space-y-2"><p className="px-1 pt-3 text-[10px] font-medium uppercase tracking-[.16em] text-muted-foreground">{title} · {fonts.length}</p>{fonts.map((font) => <FontRow key={`${title}-${font.id}`} font={font} selected={font.id === selected} checked={batchIds.includes(font.id)} onCheckedChange={(checked) => setBatchIds((current) => checked ? [...current, font.id] : current.filter((id) => id !== font.id))} onSelect={() => setSelectedId(font.id)} />)}</div>; }

function FontDetails({ font, onUninstall }: { font?: InstalledFont; onUninstall: (font: InstalledFont) => void }) {
  if (!font) {
    return <section className="glass-panel p-5 text-sm text-muted-foreground">Rescan fonts to populate local library.</section>;
  }
  const managedFile = font.files.find((file) => file.path);
  const path = managedFile?.path ?? "Path unavailable";

  return (
    <section className="glass-panel space-y-4 p-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Font details</p>
        <h2 className="mt-1 text-xl font-semibold tracking-normal">{font.family}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{font.fullName ?? font.postScriptName ?? "Local font"}</p>
      </div>
      <p className="inset-surface min-h-36 rounded-[12px] bg-[radial-gradient(circle_at_18%_8%,var(--surface-3),transparent_48%)] p-5 text-5xl font-semibold leading-none text-foreground">Fontsequal</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail label="Style" value={`${font.weight} · ${font.style}`} />
        <Detail label="PostScript" value={font.postScriptName ?? "Unavailable"} />
        <Detail label="Status" value={font.isManaged ? "Managed by Fontsequal" : "External / system"} />
        <Detail label="SHA-256" value={managedFile?.checksum ?? "Unavailable"} />
      </div>
      <Detail label="Path" value={path} long />
      {font.isDuplicate ? <Status>Duplicate hash detected. No files were changed.</Status> : null}
      {font.isManaged ? <Button variant="destructive" onClick={() => onUninstall(font)}>Uninstall managed font</Button> : <Status>External font — cannot uninstall from Fontsequal.</Status>}
    </section>
  );
}

function Filter({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <label className="glass-control flex flex-col gap-1 px-2 py-2 text-[10px] text-muted-foreground"><Switch checked={checked} onCheckedChange={onChange} /><span>{label}</span></label>;
}
function Detail({ label, value, long = false }: { label: string; value: string; long?: boolean }) {
  return <div className={`inset-surface p-3 ${long ? "" : ""}`}><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-1 break-all text-sm text-foreground">{value}</p></div>;
}
function Status({ children }: { children: string }) { return <div className="glass-panel px-4 py-3 text-sm text-foreground">{children}</div>; }
function InstalledEmpty({ pending, onRescan }: { pending: boolean; onRescan: () => void }) { return <div className="glass-panel mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center"><div className="inset-surface grid size-12 place-items-center rounded-[12px] text-lg">Aa</div><h3 className="mt-4 text-sm font-semibold">No installed fonts found</h3><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Scan your local library to show managed, system, and external font files.</p><Button className="mt-4" disabled={pending} size="sm" variant="raised" onClick={onRescan}>{pending ? "Scanning" : "Rescan fonts"}</Button></div>; }
function InstalledSkeletons() { return <>{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-md" />)}</>; }
function unwrap<T>(result: ApiResult<T>): T { if (result.ok) return result.data; throw new Error(result.error); }
function useDebouncedValue<T>(value: T, delay: number) { const [debounced, setDebounced] = useState(value); useEffect(() => { const id = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(id); }, [delay, value]); return debounced; }

function UninstallDialog({ fonts, open, pending, onOpenChange, onConfirm }: { fonts: InstalledFont[]; open: boolean; pending: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  const managed = fonts.filter((font) => font.isManaged);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Remove {managed.length} managed font{managed.length === 1 ? "" : "s"}?</DialogTitle><DialogDescription>Only Fontsequal-managed user files will be removed. System and external fonts remain untouched.</DialogDescription></DialogHeader><div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border p-3 text-sm">{managed.map((font) => <p key={font.id}>{font.family} · {font.weight} {font.style}</p>)}</div><DialogFooter><Button variant="glass" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!managed.length || pending} variant="destructive" onClick={onConfirm}>{pending ? "Removing" : "Remove fonts"}</Button></DialogFooter></DialogContent></Dialog>;
}
