import { tauriInvoke } from "@/lib/tauri";
import type { AppSettings, UpdateSettingsInput } from "@/types/settings";
import type { ApiResult } from "@/types/result";

export function getSettings(): Promise<ApiResult<AppSettings>> {
  return tauriInvoke("get_settings");
}

export function updateSettings(
  input: UpdateSettingsInput,
): Promise<ApiResult<AppSettings>> {
  return tauriInvoke("update_settings", { input });
}

export const settingsApiExamples = {
  get: () => getSettings(),
  setComfortableDensity: () => updateSettings({ previewDensity: "comfortable" }),
  useSystemTheme: () => updateSettings({ theme: "system" }),
};
