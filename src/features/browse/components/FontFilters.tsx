import { AiSearchIcon, FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HugeIcon } from "@/components/ui/huge-icon";
import type { FontCategory, FontStyle } from "@/types/font";
import { categoryLabels } from "./CategoryBadge";

export type BrowseFiltersState = {
  search: string;
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

const categories: Array<FontCategory | "all"> = [
  "all",
  "sans-serif",
  "serif",
  "display",
  "handwriting",
  "monospace",
];

const weights = ["all", "300", "400", "500", "600", "700", "800"] as const;
const styles: Array<FontStyle | "all"> = ["all", "normal", "italic", "oblique"];

export function FontFilters({ filters, onChange }: FontFiltersProps) {
  const patch = (next: Partial<BrowseFiltersState>) => {
    onChange({ ...filters, ...next });
  };

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_18px_60px_rgba(0,0,0,.24)]">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_160px_140px_140px]">
        <label className="relative block">
          <HugeIcon
            icon={AiSearchIcon}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="h-11 rounded-full border-white/10 bg-black/20 pl-10"
            placeholder="Search Google Fonts"
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
          />
        </label>

        <Select
          value={filters.category}
          onValueChange={(value) =>
            patch({ category: value as BrowseFiltersState["category"] })
          }
        >
          <SelectTrigger className="h-11 rounded-full border-white/10 bg-black/20">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All categories" : categoryLabels[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(filters.weight)}
          onValueChange={(value) =>
            patch({ weight: value === "all" ? "all" : Number(value) })
          }
        >
          <SelectTrigger className="h-11 rounded-full border-white/10 bg-black/20">
            <SelectValue placeholder="Weight" />
          </SelectTrigger>
          <SelectContent>
            {weights.map((weight) => (
              <SelectItem key={weight} value={weight}>
                {weight === "all" ? "All weights" : weight}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.style}
          onValueChange={(value) =>
            patch({ style: value as BrowseFiltersState["style"] })
          }
        >
          <SelectTrigger className="h-11 rounded-full border-white/10 bg-black/20">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style} value={style}>
                {style === "all" ? "All styles" : style}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 font-medium text-white/70">
          <HugeIcon icon={FilterHorizontalIcon} size={15} />
          Filters
        </span>
        <FilterSwitch
          checked={filters.favoritesOnly}
          label="Favorites"
          onCheckedChange={(favoritesOnly) => patch({ favoritesOnly })}
        />
        <FilterSwitch
          checked={filters.installedOnly}
          label="Installed"
          onCheckedChange={(installedOnly) => patch({ installedOnly })}
        />
        <FilterSwitch
          checked={filters.variableOnly}
          label="Variable"
          onCheckedChange={(variableOnly) => patch({ variableOnly })}
        />
      </div>
    </div>
  );
}

type FilterSwitchProps = {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

function FilterSwitch({ checked, label, onCheckedChange }: FilterSwitchProps) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span>{label}</span>
    </label>
  );
}
