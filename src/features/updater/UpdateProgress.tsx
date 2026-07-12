import { calculateProgress } from "./updater.service";

type UpdateProgressProps = {
  downloadedBytes: number;
  totalBytes?: number;
};

export function UpdateProgress({ downloadedBytes, totalBytes }: UpdateProgressProps) {
  const progress = calculateProgress(downloadedBytes, totalBytes);

  return <div aria-live="polite" className="space-y-2">
    <div aria-valuemax={totalBytes} aria-valuemin={0} aria-valuenow={downloadedBytes} aria-valuetext={progress === undefined ? "Downloading update" : `${progress}% downloaded`} className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar">
      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress ?? 18}%` }} />
    </div>
    <p className="text-xs text-muted-foreground">
      {formatBytes(downloadedBytes)} downloaded{totalBytes ? ` of ${formatBytes(totalBytes)}${progress === undefined ? "" : ` (${progress}%)`}` : ""}
    </p>
  </div>;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
