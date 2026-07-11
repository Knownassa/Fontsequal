import { tauriInvoke } from "@/lib/tauri";
import type { UnifiedFont } from "@/types/font";
import type { ApiResult } from "@/types/result";
export const listUnifiedFonts = (): Promise<ApiResult<UnifiedFont[]>> => tauriInvoke("list_unified_fonts");
export const searchUnifiedFonts = (query: string, limit = 200): Promise<ApiResult<UnifiedFont[]>> => tauriInvoke("search_unified_fonts", { query, limit });
export const refreshFontProvider = (providerId: string): Promise<ApiResult<void>> => tauriInvoke("refresh_font_provider", { providerId });
export const refreshAllFontSources = (): Promise<ApiResult<void>> => tauriInvoke("refresh_all_font_sources");
