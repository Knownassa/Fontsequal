import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";
import type { UpdateDetails, UpdaterError } from "./updater.types";

const MAX_RELEASE_NOTE_LENGTH = 12_000;
const MAX_DIAGNOSTIC_LENGTH = 240;

export function isDesktopTauri(): boolean {
  return isTauri();
}

export async function getCurrentVersion(): Promise<string> {
  return getVersion();
}

export async function checkForUpdate(): Promise<Update | null> {
  return check();
}

export async function relaunchApplication(): Promise<void> {
  await relaunch();
}

export function toUpdateDetails(update: Update): UpdateDetails {
  return {
    currentVersion: update.currentVersion,
    version: update.version,
    releaseDate: update.date,
    releaseNotes: normalizeReleaseNotes(update.body),
  };
}

export function calculateProgress(downloadedBytes: number, totalBytes?: number): number | undefined {
  if (!totalBytes || totalBytes <= 0) return undefined;
  return Math.min(100, Math.max(0, Math.round((downloadedBytes / totalBytes) * 100)));
}

export function normalizeReleaseNotes(notes: string | undefined): string | undefined {
  if (!notes) return undefined;

  const normalized = notes
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();

  if (!normalized) return undefined;
  return normalized.slice(0, MAX_RELEASE_NOTE_LENGTH);
}

export function normalizeUpdaterError(error: unknown): UpdaterError {
  const diagnostic = redactDiagnostic(error instanceof Error ? error.message : String(error));
  const lowerCase = diagnostic.toLowerCase();

  if (/(signature|verification|verified|public key)/.test(lowerCase)) {
    return { message: "The update could not be verified. No changes were made.", diagnostic };
  }
  if (/(network|connection|timeout|timed out|offline|dns|http)/.test(lowerCase)) {
    return { message: "Could not reach the update service. Check your connection and try again.", diagnostic };
  }
  if (/(json|metadata|manifest|parse)/.test(lowerCase)) {
    return { message: "The update information was invalid. No changes were made.", diagnostic };
  }
  return { message: "The update could not be completed. Please try again.", diagnostic };
}

export function readDownloadEvent(
  event: DownloadEvent,
  downloadedBytes: number,
): { downloadedBytes: number; totalBytes?: number; finished: boolean } {
  if (event.event === "Started") {
    return { downloadedBytes: 0, totalBytes: event.data.contentLength, finished: false };
  }
  if (event.event === "Progress") {
    return { downloadedBytes: downloadedBytes + event.data.chunkLength, finished: false };
  }
  return { downloadedBytes, finished: true };
}

function redactDiagnostic(value: string): string {
  return value
    .replace(/(authorization|token|password|secret)=?\s*[^\s,;]+/gi, "$1=[redacted]")
    .slice(0, MAX_DIAGNOSTIC_LENGTH);
}
