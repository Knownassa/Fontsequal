import { tauriInvoke } from "@/lib/tauri";
import type {
  FontFamily,
  FontFile,
  InstallResult,
  InstallScope,
  InstalledFont,
  UninstallResult,
} from "@/types/font";
import type { ApiResult } from "@/types/result";

export type InstallFontInput = {
  familyId: string;
  variantIds?: string[];
  scope: InstallScope;
};

export type UninstallFontInput = {
  familyId: string;
  scope?: InstallScope;
};

export type ImportLocalFontsInput = {
  paths: string[];
  scope: InstallScope;
};

export type ToggleFavoriteInput = {
  familyId: string;
  favorite?: boolean;
};

export function getInstalledFonts(): Promise<ApiResult<InstalledFont[]>> {
  return tauriInvoke("get_installed_fonts");
}

export function scanSystemFonts(): Promise<ApiResult<InstalledFont[]>> {
  return tauriInvoke("scan_system_fonts");
}

export function installFont(
  input: InstallFontInput,
): Promise<ApiResult<InstallResult>> {
  return tauriInvoke("install_font", { input });
}

export function uninstallFont(
  input: UninstallFontInput,
): Promise<ApiResult<UninstallResult>> {
  return tauriInvoke("uninstall_font", { input });
}

export function importLocalFonts(
  input: ImportLocalFontsInput,
): Promise<ApiResult<FontFile[]>> {
  return tauriInvoke("import_local_fonts", { input });
}

export function toggleFavorite(
  input: ToggleFavoriteInput,
): Promise<ApiResult<FontFamily>> {
  return tauriInvoke("toggle_favorite", { input });
}

export const fontApiExamples = {
  installed: () => getInstalledFonts(),
  scan: () => scanSystemFonts(),
  installInterForUser: () =>
    installFont({ familyId: "inter", scope: "user", variantIds: ["regular"] }),
  favoriteInter: () => toggleFavorite({ familyId: "inter", favorite: true }),
};
