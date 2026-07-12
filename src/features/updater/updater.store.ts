import { create } from "zustand";
import type { Update } from "@tauri-apps/plugin-updater";
import {
  checkForUpdate,
  getCurrentVersion,
  isDesktopTauri,
  normalizeUpdaterError,
  readDownloadEvent,
  relaunchApplication,
  toUpdateDetails,
} from "./updater.service";
import type { UpdaterState } from "./updater.types";

let pendingUpdate: Update | null = null;
let operationInFlight = false;

function releasePendingUpdate(): void {
  const update = pendingUpdate;
  pendingUpdate = null;
  if (update) void update.close().catch(() => undefined);
}

export const useUpdaterStore = create<UpdaterState>((set, get) => ({
  status: "idle",
  downloadedBytes: 0,
  isInstalled: false,
  isDialogOpen: false,

  loadCurrentVersion: async () => {
    if (!isDesktopTauri()) return;
    try {
      set({ currentVersion: await getCurrentVersion() });
    } catch (error) {
      if (import.meta.env.DEV) console.warn("[updater] version lookup failed", normalizeUpdaterError(error).diagnostic);
    }
  },

  checkForUpdates: async (options) => {
    if (!isDesktopTauri() || operationInFlight) return;
    operationInFlight = true;
    releasePendingUpdate();
    set({ status: "checking", error: undefined, downloadedBytes: 0, totalBytes: undefined, isInstalled: false });

    try {
      const currentVersion = await getCurrentVersion();
      const update = await checkForUpdate();
      if (!update) {
        set({ status: "upToDate", currentVersion, update: undefined });
        return;
      }

      pendingUpdate = update;
      set({
        status: "available",
        currentVersion,
        update: toUpdateDetails(update),
        isDialogOpen: options?.openDialogOnAvailable ?? false,
      });
    } catch (error) {
      const normalized = normalizeUpdaterError(error);
      if (import.meta.env.DEV) console.warn("[updater] update check failed", normalized.diagnostic);
      set({ status: "error", error: normalized });
    } finally {
      operationInFlight = false;
    }
  },

  downloadUpdate: async () => {
    const update = pendingUpdate;
    if (!update || operationInFlight || get().status !== "available") return;
    operationInFlight = true;
    set({ status: "downloading", error: undefined, downloadedBytes: 0, totalBytes: undefined, isInstalled: false });

    try {
      await update.download((event) => {
        set((state) => ({ ...readDownloadEvent(event, state.downloadedBytes) }));
      });
      set({ status: "ready" });
    } catch (error) {
      const normalized = normalizeUpdaterError(error);
      if (import.meta.env.DEV) console.warn("[updater] download failed", normalized.diagnostic);
      set({ status: "error", error: normalized });
    } finally {
      operationInFlight = false;
    }
  },

  installUpdate: async () => {
    const update = pendingUpdate;
    if (!update || operationInFlight || get().status !== "ready" || get().isInstalled) return;
    operationInFlight = true;
    set({ status: "installing", error: undefined });

    try {
      await update.install();
      releasePendingUpdate();
      set({ status: "ready", isInstalled: true });
    } catch (error) {
      const normalized = normalizeUpdaterError(error);
      if (import.meta.env.DEV) console.warn("[updater] install failed", normalized.diagnostic);
      set({ status: "error", error: normalized });
    } finally {
      operationInFlight = false;
    }
  },

  downloadAndInstallUpdate: async () => {
    const update = pendingUpdate;
    if (!update || operationInFlight || get().status !== "available") return;
    operationInFlight = true;
    set({ status: "downloading", error: undefined, downloadedBytes: 0, totalBytes: undefined, isInstalled: false });

    try {
      await update.downloadAndInstall((event) => {
        set((state) => ({ ...readDownloadEvent(event, state.downloadedBytes) }));
      });
      releasePendingUpdate();
      set({ status: "ready", isInstalled: true });
    } catch (error) {
      const normalized = normalizeUpdaterError(error);
      if (import.meta.env.DEV) console.warn("[updater] download and install failed", normalized.diagnostic);
      set({ status: "error", error: normalized });
    } finally {
      operationInFlight = false;
    }
  },

  restartApplication: async () => {
    if (operationInFlight || get().status !== "ready" || !get().isInstalled) return;
    operationInFlight = true;
    try {
      await relaunchApplication();
    } catch (error) {
      const normalized = normalizeUpdaterError(error);
      if (import.meta.env.DEV) console.warn("[updater] relaunch failed", normalized.diagnostic);
      set({ status: "error", error: normalized });
    } finally {
      operationInFlight = false;
    }
  },

  dismissAvailableUpdate: () => {
    releasePendingUpdate();
    set({ status: "idle", update: undefined, downloadedBytes: 0, totalBytes: undefined, isInstalled: false, error: undefined, isDialogOpen: false });
  },

  resetUpdaterState: () => {
    releasePendingUpdate();
    set({ status: "idle", update: undefined, downloadedBytes: 0, totalBytes: undefined, isInstalled: false, error: undefined, isDialogOpen: false });
  },

  setDialogOpen: (isDialogOpen) => set({ isDialogOpen }),
}));
