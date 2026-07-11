export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace"
  | "symbol"
  | "other";

export type FontStyle = "normal" | "italic" | "oblique";

export type InstallScope = "user" | "system";

export type FontSource = "google" | "local" | "localImport" | "system";
export type FontProviderKind = "system" | "managed" | "remote";
export type FontSourceBadge = { providerId: string; label: string; kind: FontProviderKind };

export type FontFileFormat = "ttf" | "otf" | "woff" | "woff2" | "ttc" | "unknown";

export type FontVariant = {
  id: string;
  label: string;
  weight: number;
  style: FontStyle;
  stretch?: string;
  variableAxes?: Record<string, number>;
};

export type FontFile = {
  id: string;
  familyId: string;
  variantId?: string;
  fileName: string;
  format: FontFileFormat;
  path?: string;
  url?: string;
  checksum?: string;
  sizeBytes?: number;
};

export type FontMetadata = {
  designer?: string;
  foundry?: string;
  license?: string;
  version?: string;
  copyright?: string;
  description?: string;
  languages?: string[];
  glyphCount?: number;
  dateAdded?: string;
  lastModified?: string;
};

export type FontFamily = {
  id: string;
  family: string;
  category: FontCategory;
  source: FontSource;
  variants: FontVariant[];
  files: FontFile[];
  metadata?: FontMetadata;
  subsets?: string[];
  isFavorite: boolean;
  isInstalled: boolean;
};

export type UnifiedFont = {
  id: string;
  family: string;
  normalizedFamily: string;
  category: FontCategory;
  variants: FontVariant[];
  files: FontFile[];
  metadata?: FontMetadata;
  sources: FontSourceBadge[];
  isFavorite: boolean;
  isInstalled: boolean;
  isManaged: boolean;
  isReadonly: boolean;
};

export type InstalledFont = {
  id: string;
  family: string;
  postScriptName?: string;
  fullName?: string;
  category: FontCategory;
  style: FontStyle;
  weight: number;
  source: FontSource;
  scope: InstallScope;
  files: FontFile[];
  metadata?: FontMetadata;
  installedAt?: string;
  isManaged: boolean;
  isDuplicate: boolean;
};

export type InstallResult = {
  success: boolean;
  familyId: string;
  scope: InstallScope;
  installedFiles: FontFile[];
  skippedFiles: FontFile[];
  message?: string;
};

export type UninstallResult = {
  success: boolean;
  familyId: string;
  removedFiles: FontFile[];
  skippedFiles: FontFile[];
  message?: string;
};
