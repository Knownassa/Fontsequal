export type UpdaterStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "ready"
  | "installing"
  | "upToDate"
  | "error";

export type UpdateDetails = {
  currentVersion: string;
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
};

export type UpdaterError = {
  message: string;
  diagnostic: string;
};

export type CheckForUpdatesOptions = {
  openDialogOnAvailable?: boolean;
};

export type UpdaterState = {
  status: UpdaterStatus;
  currentVersion?: string;
  update?: UpdateDetails;
  downloadedBytes: number;
  totalBytes?: number;
  isInstalled: boolean;
  error?: UpdaterError;
  isDialogOpen: boolean;
  loadCurrentVersion: () => Promise<void>;
  checkForUpdates: (options?: CheckForUpdatesOptions) => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  downloadAndInstallUpdate: () => Promise<void>;
  restartApplication: () => Promise<void>;
  dismissAvailableUpdate: () => void;
  resetUpdaterState: () => void;
  setDialogOpen: (open: boolean) => void;
};
