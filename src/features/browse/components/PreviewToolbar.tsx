import { Grid2X2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLibraryStore } from "@/stores/library-store";
import { usePreviewStore } from "@/stores/preview-store";
import { FontFilters, type BrowseFiltersState } from "./FontFilters";

type PreviewToolbarProps = { filters: BrowseFiltersState; onFiltersChange: (filters: BrowseFiltersState) => void };

export function PreviewToolbar({ filters, onFiltersChange }: PreviewToolbarProps) {
  const text = usePreviewStore((state) => state.text);
  const fontSize = usePreviewStore((state) => state.fontSize);
  const weight = usePreviewStore((state) => state.weight);
  const setText = usePreviewStore((state) => state.setText);
  const setFontSize = usePreviewStore((state) => state.setFontSize);
  const setWeight = usePreviewStore((state) => state.setWeight);
  const view = useLibraryStore((state) => state.view);
  const setView = useLibraryStore((state) => state.setView);

  return <div className="glass-panel flex flex-wrap items-center gap-2 p-2">
    <Input aria-label="Preview text" className="h-[34px] min-w-[220px] flex-1" value={text} onChange={(event) => setText(event.target.value)} />
    <label className="glass-control flex h-[34px] items-center px-2 text-xs text-muted-foreground">Size<input aria-label="Preview size" className="ml-1 w-9 bg-transparent text-right text-xs text-foreground outline-none" max={160} min={12} type="number" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value) || 12)} /></label>
    <Select value={String(weight)} onValueChange={(value) => setWeight(Number(value))}><SelectTrigger className="h-[34px] w-24 text-xs"><SelectValue /></SelectTrigger><SelectContent>{[300, 400, 500, 600, 700, 800].map((option) => <SelectItem key={option} value={String(option)}>{option}</SelectItem>)}</SelectContent></Select>
    <Select defaultValue="google"><SelectTrigger className="h-[34px] w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="google">Google Fonts</SelectItem><SelectItem value="all">All sources</SelectItem></SelectContent></Select>
    <div className="glass-control flex items-center p-0.5"><Button aria-label="Grid view" className={view === "grid" ? "selected-surface size-7" : "size-7"} size="icon" variant="segmented" onClick={() => setView("grid")}><Grid2X2 className="size-3.5" /></Button><Button aria-label="List view" className={view === "list" ? "selected-surface size-7" : "size-7"} size="icon" variant="segmented" onClick={() => setView("list")}><List className="size-3.5" /></Button></div>
    <FontFilters filters={filters} onChange={onFiltersChange} />
  </div>;
}
