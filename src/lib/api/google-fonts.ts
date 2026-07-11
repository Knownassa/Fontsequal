import { tauriInvoke } from "@/lib/tauri";
import type { FontCategory, FontFamily, FontStyle } from "@/types/font";
import type { ApiResult, CacheRefreshResult } from "@/types/result";

export type GoogleFontsSearchInput = {
  query: string;
  categories?: FontCategory[];
  weights?: number[];
  styles?: FontStyle[];
  favoritesOnly?: boolean;
  installedOnly?: boolean;
  variableOnly?: boolean;
  subsets?: string[];
  limit?: number;
};

export function listGoogleFonts(): Promise<ApiResult<FontFamily[]>> {
  return tauriInvoke("list_google_fonts");
}

export function refreshGoogleFontsCache(): Promise<ApiResult<CacheRefreshResult>> {
  return tauriInvoke("refresh_google_fonts_cache");
}

export function searchGoogleFonts(
  input: GoogleFontsSearchInput,
): Promise<ApiResult<FontFamily[]>> {
  return tauriInvoke("search_google_fonts", { input });
}

export const googleFontsApiExamples = {
  list: () => listGoogleFonts(),
  refresh: () => refreshGoogleFontsCache(),
  searchInter: () => searchGoogleFonts({ query: "Inter", limit: 12 }),
};
