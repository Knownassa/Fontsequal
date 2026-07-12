import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpdateProgress } from "./UpdateProgress";
import { useUpdaterStore } from "./updater.store";

export function UpdateDialog() {
  const state = useUpdaterStore();
  const close = () => state.setDialogOpen(false);
  const title = dialogTitle(state.status, state.isInstalled, state.update?.version);

  return <Dialog open={state.isDialogOpen} onOpenChange={state.setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{dialogDescription(state.status, state.isInstalled, state.update?.version)}</DialogDescription></DialogHeader>
    {state.status === "available" && state.update?.releaseNotes ? <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">{state.update.releaseNotes}</div> : null}
    {state.status === "available" && state.update?.releaseDate ? <p className="text-xs text-muted-foreground">Released {formatReleaseDate(state.update.releaseDate)}</p> : null}
    {state.status === "downloading" || state.status === "installing" ? <UpdateProgress downloadedBytes={state.downloadedBytes} totalBytes={state.totalBytes} /> : null}
    {state.status === "error" && state.error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{state.error.message}</p> : null}
    <DialogFooter>
      {state.status === "available" ? <><Button variant="glass" onClick={close}>Later</Button><Button onClick={() => void state.downloadAndInstallUpdate()}>Download and prepare update</Button></> : null}
      {state.status === "ready" && state.isInstalled ? <><Button variant="glass" onClick={close}>Restart later</Button><Button onClick={() => void state.restartApplication()}>Restart and update</Button></> : null}
      {state.status === "ready" && !state.isInstalled ? <><Button variant="glass" onClick={close}>Later</Button><Button onClick={() => void state.installUpdate()}>Install update</Button></> : null}
      {state.status === "error" ? <><Button variant="glass" onClick={close}>Close</Button><Button onClick={() => void state.checkForUpdates({ openDialogOnAvailable: true })}>Try again</Button></> : null}
      {state.status === "checking" || state.status === "downloading" || state.status === "installing" ? <Button disabled><LoaderCircle className="mr-2 size-4 animate-spin" />Working</Button> : null}
      {state.status === "upToDate" ? <Button onClick={close}>Done</Button> : null}
    </DialogFooter>
  </DialogContent></Dialog>;
}

function dialogTitle(status: string, isInstalled: boolean, version?: string): string {
  if (status === "available") return `Fontsequal ${version ?? "update"} is available`;
  if (status === "ready") return isInstalled ? "Update ready to restart" : "Update downloaded";
  if (status === "downloading") return "Downloading update";
  if (status === "installing") return "Preparing update";
  if (status === "checking") return "Checking for updates";
  if (status === "upToDate") return "You’re up to date";
  return "Update check failed";
}

function dialogDescription(status: string, isInstalled: boolean, version?: string): string {
  if (status === "available") return `Version ${version ?? ""} is ready when you are.`;
  if (status === "ready") return isInstalled ? "Restart Fontsequal when convenient to finish the update." : "The update is downloaded. Install it when you are ready.";
  if (status === "downloading") return "Fontsequal will verify the signed update before it can be installed.";
  if (status === "installing") return "Preparing the verified update. Fontsequal will not restart automatically.";
  if (status === "checking") return "This does not interrupt your work.";
  if (status === "upToDate") return "You already have the latest stable version.";
  return "No update was installed.";
}

function formatReleaseDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
