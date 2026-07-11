import type { InstallScope } from "./font";

export type AppTheme = "dark" | "light" | "system";

export type PreviewDensity = "compact" | "comfortable" | "spacious";

export type AppSettings = {
  theme: AppTheme;
  previewText: string;
  previewDensity: PreviewDensity;
  defaultInstallScope: InstallScope;
  confirmManagedUninstalls: boolean;
  autoRefreshGoogleFonts: boolean;
  googleFontsApiKey?: string;
  googleFontsCacheTtlHours: number;
  libraryPaths: string[];
  updatedAt?: string;
};

export type UpdateSettingsInput = Partial<AppSettings>;
