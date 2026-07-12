import { describe, expect, test } from "bun:test";
import { calculateProgress, normalizeReleaseNotes, normalizeUpdaterError, readDownloadEvent } from "./updater.service";

describe("updater safety helpers", () => {
  test("calculates bounded progress only when a content length is available", () => {
    expect(calculateProgress(25, 100)).toBe(25);
    expect(calculateProgress(150, 100)).toBe(100);
    expect(calculateProgress(25)).toBeUndefined();
    expect(calculateProgress(25, 0)).toBeUndefined();
  });

  test("normalizes release notes for text-only display", () => {
    expect(normalizeReleaseNotes("  First line\r\nSecond\u0000 line  ")).toBe("First line\nSecond line");
    expect(normalizeReleaseNotes(" \n ")).toBeUndefined();
  });

  test("keeps verification and network failures user-safe", () => {
    expect(normalizeUpdaterError(new Error("signature verification failed")).message).toBe("The update could not be verified. No changes were made.");
    expect(normalizeUpdaterError(new Error("network timeout")).message).toBe("Could not reach the update service. Check your connection and try again.");
    expect(normalizeUpdaterError(new Error("token=should-not-appear")).diagnostic).toContain("token=[redacted]");
  });

  test("models download events without requiring a content length", () => {
    expect(readDownloadEvent({ event: "Started", data: {} }, 99)).toEqual({ downloadedBytes: 0, totalBytes: undefined, finished: false });
    expect(readDownloadEvent({ event: "Progress", data: { chunkLength: 12 } }, 7)).toEqual({ downloadedBytes: 19, finished: false });
    expect(readDownloadEvent({ event: "Finished" }, 19)).toEqual({ downloadedBytes: 19, finished: true });
  });
});
