import { beforeEach, describe, expect, mock, test } from "bun:test";

const updaterService = {
  checkForUpdate: mock<() => Promise<unknown>>(),
  getCurrentVersion: mock<() => Promise<string>>(),
  isDesktopTauri: mock<() => boolean>(),
  normalizeUpdaterError: mock((error: unknown) => ({
    message: "Update failed safely.",
    diagnostic: error instanceof Error ? error.message : String(error),
  })),
  readDownloadEvent: mock((event: { event: string; data?: { chunkLength?: number; contentLength?: number } }, downloadedBytes: number) => {
    if (event.event === "Started") return { downloadedBytes: 0, totalBytes: event.data?.contentLength, finished: false };
    if (event.event === "Progress") return { downloadedBytes: downloadedBytes + (event.data?.chunkLength ?? 0), finished: false };
    return { downloadedBytes, finished: true };
  }),
  relaunchApplication: mock<() => Promise<void>>(),
  toUpdateDetails: mock((update: { version: string }) => ({ currentVersion: "1.0.0", version: update.version })),
};

mock.module("./updater.service", () => ({
  checkForUpdate: () => updaterService.checkForUpdate(),
  getCurrentVersion: () => updaterService.getCurrentVersion(),
  isDesktopTauri: () => updaterService.isDesktopTauri(),
  normalizeUpdaterError: (error: unknown) => updaterService.normalizeUpdaterError(error),
  readDownloadEvent: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }, downloadedBytes: number) => updaterService.readDownloadEvent(event, downloadedBytes),
  relaunchApplication: () => updaterService.relaunchApplication(),
  toUpdateDetails: (update: { version: string }) => updaterService.toUpdateDetails(update),
}));

const { useUpdaterStore } = await import("./updater.store");

type DownloadEvent = { event: string; data?: { chunkLength?: number; contentLength?: number } };
type DownloadHandler = (event: DownloadEvent) => void;

function makeUpdate(overrides: Partial<Record<"download" | "downloadAndInstall" | "install" | "close", unknown>> = {}) {
  return {
    version: "2.0.0",
    download: mock<(onEvent: DownloadHandler) => Promise<void>>().mockResolvedValue(),
    downloadAndInstall: mock<(onEvent: DownloadHandler) => Promise<void>>().mockResolvedValue(),
    install: mock<() => Promise<void>>().mockResolvedValue(),
    close: mock<() => Promise<void>>().mockResolvedValue(),
    ...overrides,
  };
}

beforeEach(() => {
  updaterService.checkForUpdate.mockReset();
  updaterService.getCurrentVersion.mockReset();
  updaterService.isDesktopTauri.mockReset();
  updaterService.normalizeUpdaterError.mockReset();
  updaterService.readDownloadEvent.mockReset();
  updaterService.relaunchApplication.mockReset();
  updaterService.toUpdateDetails.mockReset();
  updaterService.isDesktopTauri.mockReturnValue(true);
  updaterService.getCurrentVersion.mockResolvedValue("1.0.0");
  updaterService.checkForUpdate.mockResolvedValue(null);
  updaterService.normalizeUpdaterError.mockImplementation((error: unknown) => ({
    message: "Update failed safely.",
    diagnostic: error instanceof Error ? error.message : String(error),
  }));
  updaterService.readDownloadEvent.mockImplementation((event, downloadedBytes) => {
    if (event.event === "Started") return { downloadedBytes: 0, totalBytes: event.data?.contentLength, finished: false };
    if (event.event === "Progress") return { downloadedBytes: downloadedBytes + (event.data?.chunkLength ?? 0), finished: false };
    return { downloadedBytes, finished: true };
  });
  updaterService.relaunchApplication.mockResolvedValue();
  updaterService.toUpdateDetails.mockImplementation((update: { version: string }) => ({ currentVersion: "1.0.0", version: update.version }));
  useUpdaterStore.getState().resetUpdaterState();
});

describe("updater store", () => {
  test("handles both available and absent updates", async () => {
    const update = makeUpdate();
    updaterService.checkForUpdate.mockResolvedValueOnce(update);

    await useUpdaterStore.getState().checkForUpdates({ openDialogOnAvailable: true });

    expect(useUpdaterStore.getState()).toMatchObject({
      status: "available",
      currentVersion: "1.0.0",
      update: { version: "2.0.0" },
      isDialogOpen: true,
    });

    updaterService.checkForUpdate.mockResolvedValueOnce(null);
    await useUpdaterStore.getState().checkForUpdates();

    expect(useUpdaterStore.getState()).toMatchObject({ status: "upToDate", currentVersion: "1.0.0", update: undefined });
    expect(update.close).toHaveBeenCalledTimes(1);
  });

  test("surfaces a safe error when checking fails", async () => {
    updaterService.checkForUpdate.mockRejectedValueOnce(new Error("check failed"));

    await useUpdaterStore.getState().checkForUpdates();

    expect(useUpdaterStore.getState()).toMatchObject({ status: "error", error: { message: "Update failed safely.", diagnostic: "check failed" } });
  });

  test("tracks download progress when content length is absent", async () => {
    const update = makeUpdate({
      download: mock(async (onEvent: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }) => void) => {
        onEvent({ event: "Started", data: {} });
        onEvent({ event: "Progress", data: { chunkLength: 24 } });
        onEvent({ event: "Finished" });
      }),
    });
    updaterService.checkForUpdate.mockResolvedValueOnce(update);

    await useUpdaterStore.getState().checkForUpdates();
    await useUpdaterStore.getState().downloadUpdate();

    expect(useUpdaterStore.getState()).toMatchObject({ status: "ready", downloadedBytes: 24, totalBytes: undefined });
  });

  test("downloads, installs, tracks progress, and closes the primary update path", async () => {
    const update = makeUpdate({
      downloadAndInstall: mock(async (onEvent: DownloadHandler) => {
        onEvent({ event: "Started", data: { contentLength: 100 } });
        onEvent({ event: "Progress", data: { chunkLength: 40 } });
        onEvent({ event: "Finished" });
      }),
    });
    updaterService.checkForUpdate.mockResolvedValueOnce(update);

    await useUpdaterStore.getState().checkForUpdates();
    await useUpdaterStore.getState().downloadAndInstallUpdate();

    expect(update.downloadAndInstall).toHaveBeenCalledTimes(1);
    expect(update.close).toHaveBeenCalledTimes(1);
    expect(useUpdaterStore.getState()).toMatchObject({
      status: "ready",
      isInstalled: true,
      downloadedBytes: 40,
      totalBytes: 100,
    });
  });

  test("reports a failed primary download and install", async () => {
    const update = makeUpdate({
      downloadAndInstall: mock<(onEvent: DownloadHandler) => Promise<void>>().mockRejectedValue(new Error("combined update failed")),
    });
    updaterService.checkForUpdate.mockResolvedValueOnce(update);

    await useUpdaterStore.getState().checkForUpdates();
    await useUpdaterStore.getState().downloadAndInstallUpdate();

    expect(update.close).not.toHaveBeenCalled();
    expect(useUpdaterStore.getState()).toMatchObject({ status: "error", error: { diagnostic: "combined update failed" } });
  });

  test("reports install and relaunch failures", async () => {
    const update = makeUpdate({ install: mock<() => Promise<void>>().mockRejectedValue(new Error("install failed")) });
    updaterService.checkForUpdate.mockResolvedValueOnce(update);

    await useUpdaterStore.getState().checkForUpdates();
    await useUpdaterStore.getState().downloadUpdate();
    await useUpdaterStore.getState().installUpdate();

    expect(useUpdaterStore.getState()).toMatchObject({ status: "error", error: { diagnostic: "install failed" } });

    useUpdaterStore.setState({ status: "ready", isInstalled: true });
    updaterService.relaunchApplication.mockRejectedValueOnce(new Error("relaunch failed"));
    await useUpdaterStore.getState().restartApplication();

    expect(useUpdaterStore.getState()).toMatchObject({ status: "error", error: { diagnostic: "relaunch failed" } });
  });

  test("ignores duplicate check operations while one is pending", async () => {
    let resolveCheck: (update: unknown) => void = () => undefined;
    updaterService.checkForUpdate.mockImplementationOnce(() => new Promise((resolve) => { resolveCheck = resolve; }));

    const first = useUpdaterStore.getState().checkForUpdates();
    await Promise.resolve();
    await Promise.resolve();
    const second = useUpdaterStore.getState().checkForUpdates();
    resolveCheck(null);
    await Promise.all([first, second]);

    expect(updaterService.checkForUpdate).toHaveBeenCalledTimes(1);
    expect(useUpdaterStore.getState().status).toBe("upToDate");
  });

  test("dismisses an available update and closes its handle", async () => {
    const update = makeUpdate();
    updaterService.checkForUpdate.mockResolvedValueOnce(update);
    await useUpdaterStore.getState().checkForUpdates({ openDialogOnAvailable: true });

    useUpdaterStore.getState().dismissAvailableUpdate();

    expect(update.close).toHaveBeenCalledTimes(1);
    expect(useUpdaterStore.getState()).toMatchObject({
      status: "idle",
      update: undefined,
      downloadedBytes: 0,
      totalBytes: undefined,
      isDialogOpen: false,
    });
  });

  test("installs successfully, closes the handle, and restarts once", async () => {
    const update = makeUpdate();
    updaterService.checkForUpdate.mockResolvedValueOnce(update);

    await useUpdaterStore.getState().checkForUpdates();
    await useUpdaterStore.getState().downloadUpdate();
    await useUpdaterStore.getState().installUpdate();

    expect(update.close).toHaveBeenCalledTimes(1);
    expect(useUpdaterStore.getState()).toMatchObject({ status: "ready", isInstalled: true });

    await useUpdaterStore.getState().restartApplication();

    expect(updaterService.relaunchApplication).toHaveBeenCalledTimes(1);
  });
});
