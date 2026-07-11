import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/app/PageContainer";
import { searchGoogleFonts, type GoogleFontsSearchInput } from "@/lib/api/google-fonts";
import { toggleFavorite } from "@/lib/api/fonts";
import { usePreviewStore } from "@/stores/preview-store";
import { useLibraryStore } from "@/stores/library-store";
import type { FontFamily } from "@/types/font";
import type { ApiResult, CacheRefreshResult } from "@/types/result";
import { type BrowseFiltersState } from "./components/FontFilters";
import { VirtualizedFontGrid } from "./components/VirtualizedFontGrid";
import { FontDetailDrawer } from "./components/FontDetailDrawer";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewToolbar } from "./components/PreviewToolbar";
import { FontViewerDialog } from "@/features/preview/FontViewerDialog";

const initialFilters: BrowseFiltersState = {
  category: "all",
  weight: "all",
  style: "all",
  favoritesOnly: false,
  installedOnly: false,
  variableOnly: false,
};

export function BrowsePage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [filters, setFilters] = useState<BrowseFiltersState>({ ...initialFilters, favoritesOnly });
  const [selectedId, setSelectedId] = useState<string>();
  const [drawerId, setDrawerId] = useState<string>();
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
  const [installedOverrides, setInstalledOverrides] = useState<Record<string, boolean>>({});
  const previewText = usePreviewStore((state) => state.text);
  const query = useLibraryStore((state) => state.query);
  const view = useLibraryStore((state) => state.view);
  const debouncedSearch = useDebouncedValue(query, 240);
  const queryClient = useQueryClient();
  const isWideLayout = useMediaQuery("(min-width: 1280px)");

  const searchInput = useMemo<GoogleFontsSearchInput>(
    () => ({
      query: debouncedSearch,
      categories: filters.category === "all" ? undefined : [filters.category],
      weights: filters.weight === "all" ? undefined : [filters.weight],
      styles: filters.style === "all" ? undefined : [filters.style],
      favoritesOnly: filters.favoritesOnly || undefined,
      installedOnly: filters.installedOnly || undefined,
      variableOnly: filters.variableOnly || undefined,
      limit: 48,
    }),
    [debouncedSearch, filters],
  );

  const fontsQuery = useQuery({
    queryKey: ["google-fonts", "browse", searchInput],
    queryFn: () => fetchBrowseFonts(searchInput),
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ familyId, favorite }: { familyId: string; favorite: boolean }) =>
      unwrapApiResult(await toggleFavorite({ familyId, favorite })),
    onSuccess: (font) => {
      setFavoriteOverrides((current) => ({
        ...current,
        [font.id]: font.isFavorite,
      }));
      void queryClient.invalidateQueries({ queryKey: ["google-fonts"] });
    },
    onError: (_, variables) => {
      setFavoriteOverrides((current) => {
        const next = { ...current };
        delete next[variables.familyId];
        return next;
      });
    },
  });

  const fonts = (fontsQuery.data?.fonts ?? [])
    .map((font) => ({
      ...font,
      isFavorite: favoriteOverrides[font.id] ?? font.isFavorite,
      isInstalled: installedOverrides[font.id] ?? font.isInstalled,
    }))
    .filter((font) => !filters.favoritesOnly || font.isFavorite);
  const selectedFont = fonts.find((font) => font.id === selectedId) ?? fonts[0];
  const lastUpdated = formatLastUpdated(undefined, fonts);

  useEffect(() => {
    if (!selectedId && fonts[0]) {
      setSelectedId(fonts[0].id);
    }
  }, [fonts, selectedId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button, [contenteditable='true']")) return;
      const index = fonts.findIndex((font) => font.id === selectedFont?.id);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        const next = fonts[(Math.max(index, 0) + 1) % fonts.length];
        if (next) setSelectedId(next.id);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        const next = fonts[(Math.max(index, 0) - 1 + fonts.length) % fonts.length];
        if (next) setSelectedId(next.id);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (isWideLayout) { setInspectorOpen(true); window.setTimeout(() => document.querySelector<HTMLElement>("[data-inspector]")?.focus(), 0); }
        else if (selectedFont) setDrawerId(selectedFont.id);
      }
      if (event.key === " ") {
        event.preventDefault();
        if (selectedFont) setViewerOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fonts, isWideLayout, selectedFont]);

  return (
    <PageContainer className="max-w-none px-4 py-4 lg:px-6">
      <section className="space-y-3">
        <PreviewToolbar filters={filters} onFiltersChange={setFilters} />

        {fontsQuery.isError ? <StatusPanel tone="warning">Font data is unavailable. Check the local font service or Google Fonts connection.</StatusPanel> : null}

        {fonts.length === 0 && !fontsQuery.isLoading && !fontsQuery.isError ? (
          <StatusPanel tone="soft">
            No families match current filters.
          </StatusPanel>
        ) : null}

        <div className={inspectorOpen ? "grid xl:grid-cols-[minmax(0,1fr)_296px]" : "grid"}>
          <div className="min-w-0 pr-0 xl:pr-4">
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{fonts.length} families</span><span>{lastUpdated}</span></div>
            <VirtualizedFontGrid
            fonts={fonts}
            loading={fontsQuery.isLoading}
            previewText={previewText}
            selectedId={selectedFont?.id}
            onSelect={(font) => {
              setSelectedId(font.id);
              if (isWideLayout) setInspectorOpen(true);
              else setDrawerId(font.id);
            }}
            onToggleFavorite={(font) => {
              const favorite = !font.isFavorite;
              setFavoriteOverrides((current) => ({ ...current, [font.id]: favorite }));
              favoriteMutation.mutate({ familyId: font.id, favorite });
            }}
            favoritePendingId={
              favoriteMutation.isPending ? favoriteMutation.variables?.familyId : undefined
            }
            view={view}
          />
          </div>
          {inspectorOpen ? <InspectorPanel
            font={selectedFont}
            onInstalled={(font) => setInstalledOverrides((current) => ({ ...current, [font.id]: true }))}
            onClose={() => setInspectorOpen(false)}
            onOpenViewer={() => setViewerOpen(true)}
            onToggleFavorite={(font) => {
              const favorite = !font.isFavorite;
              setFavoriteOverrides((current) => ({ ...current, [font.id]: favorite }));
              favoriteMutation.mutate({ familyId: font.id, favorite });
            }}
          /> : null}
        </div>
        {!isWideLayout ? (
          <FontDetailDrawer
            font={fonts.find((font) => font.id === drawerId)}
            open={Boolean(drawerId)}
            onOpenChange={(open) => !open && setDrawerId(undefined)}
            onInstalled={(font) => {
              setInstalledOverrides((current) => ({ ...current, [font.id]: true }));
              void queryClient.invalidateQueries({ queryKey: ["google-fonts"] });
              void queryClient.invalidateQueries({ queryKey: ["installed-fonts"] });
            }}
          />
        ) : null}
        <FontViewerDialog font={selectedFont} open={viewerOpen} onOpenChange={setViewerOpen} />
      </section>
    </PageContainer>
  );
}

async function fetchBrowseFonts(input: GoogleFontsSearchInput): Promise<{ fonts: FontFamily[] }> {
  return { fonts: unwrapApiResult(await searchGoogleFonts(input)) };
}

function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (result.ok) {
    return result.data;
  }

  throw new Error(result.error);
}

function formatLastUpdated(
  refreshResult: CacheRefreshResult | undefined,
  fonts: FontFamily[],
) {
  const value =
    refreshResult?.refreshedAt ??
    fonts
      .map((font) => font.metadata?.lastModified)
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1);

  if (!value) {
    return "not synced";
  }

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue * 1000)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

type StatusPanelProps = {
  children: string;
  tone: "soft" | "warning";
};

function StatusPanel({ children, tone }: StatusPanelProps) {
  const className =
    tone === "warning"
      ? "border-amber-500/30 bg-amber-500/10 text-foreground"
      : "border-border bg-muted/50 text-muted-foreground";

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${className}`}>
      {children}
    </div>
  );
}
