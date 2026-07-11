import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FontCategory, FontStyle } from "@/types/font";
import { categoryLabels } from "./CategoryBadge";

export type BrowseFiltersState = {
  category: FontCategory | "all";
  weight: number | "all";
  style: FontStyle | "all";
  favoritesOnly: boolean;
  installedOnly: boolean;
  variableOnly: boolean;
};

type FontFiltersProps = {
  filters: BrowseFiltersState;
  onChange: (filters: BrowseFiltersState) => void;
};

const categories: Array<FontCategory | "all"> = ["all", "sans-serif", "serif", "display", "handwriting", "monospace"];
const weights = ["all", "300", "400", "500", "600", "700", "800"] as const;
const styles: Array<FontStyle | "all"> = ["all", "normal", "italic", "oblique"];

export function FontFilters({ filters, onChange }: FontFiltersProps) {
  const patch = (next: Partial<BrowseFiltersState>) => onChange({ ...filters, ...next });
  const activeCount = [filters.category !== "all", filters.weight !== "all", filters.style !== "all", filters.favoritesOnly, filters.installedOnly, filters.variableOnly].filter(Boolean).length;

  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button className="h-[34px]" size="sm" variant="toolbar"><Filter className="size-3.5" />Filters {activeCount ? `(${activeCount})` : ""}</Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-[14px] border-[var(--border-medium)] bg-popover/95 p-2 shadow-[0_16px_34px_rgba(0,0,0,.32)] backdrop-blur-2xl">
      <DropdownMenuLabel className="flex items-center gap-2 text-xs"><Filter className="size-3.5" />Filters {activeCount ? `(${activeCount})` : ""}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="space-y-2 p-1">
        <Select value={filters.category} onValueChange={(value) => patch({ category: value as BrowseFiltersState["category"] })}><SelectTrigger className="h-8 bg-surface text-xs"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category === "all" ? "All categories" : categoryLabels[category]}</SelectItem>)}</SelectContent></Select>
        <Select value={String(filters.weight)} onValueChange={(value) => patch({ weight: value === "all" ? "all" : Number(value) })}><SelectTrigger className="h-8 bg-surface text-xs"><SelectValue placeholder="Weight" /></SelectTrigger><SelectContent>{weights.map((weight) => <SelectItem key={weight} value={weight}>{weight === "all" ? "All weights" : weight}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.style} onValueChange={(value) => patch({ style: value as BrowseFiltersState["style"] })}><SelectTrigger className="h-8 bg-surface text-xs"><SelectValue placeholder="Style" /></SelectTrigger><SelectContent>{styles.map((style) => <SelectItem key={style} value={style}>{style === "all" ? "All styles" : style}</SelectItem>)}</SelectContent></Select>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem checked={filters.favoritesOnly} onCheckedChange={(favoritesOnly) => patch({ favoritesOnly })}>Favorites</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={filters.installedOnly} onCheckedChange={(installedOnly) => patch({ installedOnly })}>Installed</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={filters.variableOnly} onCheckedChange={(variableOnly) => patch({ variableOnly })}>Variable fonts</DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
