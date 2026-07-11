import { useEffect, useMemo, useState } from "react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/app/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";
import {
  refreshGoogleFontsCache,
  searchGoogleFonts,
  type GoogleFontsSearchInput,
} from "@/lib/api/google-fonts";
import { toggleFavorite } from "@/lib/api/fonts";
import { usePreviewStore } from "@/stores/preview-store";
import type { FontFamily } from "@/types/font";
import type { ApiResult, CacheRefreshResult } from "@/types/result";
import {
  FontFilters,
  type BrowseFiltersState,
} from "./components/FontFilters";
import { FontGrid } from "./components/FontGrid";
import { FontPreviewPanel } from "./components/FontPreviewPanel";
import { mockBrowseFonts } from "./mock-fonts";

const initialFilters: BrowseFiltersState = {
  search: "",
  category: "all",
  weight: "all",
  style: "all",
  favoritesOnly: false,
  installedOnly: false,
  variableOnly: false,
};

type BrowseData = {
  fonts: FontFamily[];
  source: "backend" | "mock";
};

export function BrowsePage() {
  const [filters, setFilters] = useState<BrowseFiltersState>(initialFilters);
  const [selectedId, setSelectedId] = useState<string>();
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
  const [installedOverrides, setInstalledOverrides] = useState<Record<string, boolean>>({});
  const previewText = usePreviewStore((state) => state.text);
  const debouncedSearch = useDebouncedValue(filters.search, 240);
  const queryClient = useQueryClient();

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

  const refreshMutation = useMutation({
    mutationFn: async () => unwrapApiResult(await refreshGoogleFontsCache()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["google-fonts"] });
    },
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
      // Browser preview uses mock data; it has no Tauri command bridge.
      if (fontsQuery.data?.source !== "mock") {
        setFavoriteOverrides((current) => {
          const next = { ...current };
          delete next[variables.familyId];
          return next;
        });
      }
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
  const lastUpdated = formatLastUpdated(refreshMutation.data, fonts);
  const usingMockData = fontsQuery.data?.source === "mock";

  useEffect(() => {
    if (!selectedId && fonts[0]) {
      setSelectedId(fonts[0].id);
    }
  }, [fonts, selectedId]);

  return (
    <PageContainer>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Badge variant="glass">Google Fonts</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white md:text-6xl">
              Browse font universe.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Cached metadata, precise filtering, calm previews, no install flow yet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground">
              Updated {lastUpdated}
            </div>
            <Button
              disabled={refreshMutation.isPending}
              variant="glass"
              onClick={() => refreshMutation.mutate()}
            >
              <HugeIcon
                icon={RefreshIcon}
                className={refreshMutation.isPending ? "animate-spin" : undefined}
                size={16}
              />
              Refresh cache
            </Button>
          </div>
        </div>

        <FontFilters filters={filters} onChange={setFilters} />

        {usingMockData ? (
          <StatusPanel tone="soft">
            Backend cache unavailable in this browser session. Showing mock specimens.
          </StatusPanel>
        ) : null}

        {refreshMutation.isError ? (
          <StatusPanel tone="warning">
            Refresh failed. Add Google Fonts API key in settings or check connection.
          </StatusPanel>
        ) : null}

        {fonts.length === 0 && !fontsQuery.isLoading ? (
          <StatusPanel tone="soft">
            No families match current filters.
          </StatusPanel>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <FontGrid
            fonts={fonts}
            loading={fontsQuery.isLoading}
            previewText={previewText}
            selectedId={selectedFont?.id}
            onSelect={(font) => setSelectedId(font.id)}
            onToggleFavorite={(font) => {
              const favorite = !font.isFavorite;
              setFavoriteOverrides((current) => ({ ...current, [font.id]: favorite }));
              favoriteMutation.mutate({ familyId: font.id, favorite });
            }}
            onInstalled={(font) => {
              setInstalledOverrides((current) => ({ ...current, [font.id]: true }));
              void queryClient.invalidateQueries({ queryKey: ["google-fonts"] });
              void queryClient.invalidateQueries({ queryKey: ["installed-fonts"] });
            }}
            favoritePendingId={
              favoriteMutation.isPending ? favoriteMutation.variables?.familyId : undefined
            }
          />
          <FontPreviewPanel
            font={selectedFont}
            fonts={fonts}
            onInstalled={(font) => setInstalledOverrides((current) => ({ ...current, [font.id]: true }))}
          />
        </div>
      </section>
    </PageContainer>
  );
}

async function fetchBrowseFonts(input: GoogleFontsSearchInput): Promise<BrowseData> {
  try {
    const result = await searchGoogleFonts(input);
    return {
      fonts: unwrapApiResult(result),
      source: "backend",
    };
  } catch {
    return {
      // Keep local favorites visible after optimistic updates in browser preview.
      fonts: filterMockFonts({ ...input, favoritesOnly: undefined }),
      source: "mock",
    };
  }
}

function filterMockFonts(input: GoogleFontsSearchInput): FontFamily[] {
  const query = input.query.trim().toLowerCase();

  return mockBrowseFonts.filter((font) => {
    const matchesQuery =
      query.length === 0 || font.family.toLowerCase().includes(query);
    const matchesCategory =
      !input.categories?.length || input.categories.includes(font.category);
    const matchesWeight =
      !input.weights?.length ||
      font.variants.some((variant) => input.weights?.includes(variant.weight));
    const matchesStyle =
      !input.styles?.length ||
      font.variants.some((variant) => input.styles?.includes(variant.style));
    const matchesFavorite = !input.favoritesOnly || font.isFavorite;
    const matchesInstalled = !input.installedOnly || font.isInstalled;
    const matchesVariable =
      !input.variableOnly ||
      font.variants.some((variant) => Boolean(variant.variableAxes));

    return (
      matchesQuery &&
      matchesCategory &&
      matchesWeight &&
      matchesStyle &&
      matchesFavorite &&
      matchesInstalled &&
      matchesVariable
    );
  });
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

type StatusPanelProps = {
  children: string;
  tone: "soft" | "warning";
};

function StatusPanel({ children, tone }: StatusPanelProps) {
  const className =
    tone === "warning"
      ? "border-orange-300/20 bg-orange-400/10 text-orange-100"
      : "border-white/10 bg-white/[0.04] text-muted-foreground";

  return (
    <div className={`rounded-[18px] border px-4 py-3 text-sm ${className}`}>
      {children}
    </div>
  );
}
