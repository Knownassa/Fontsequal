import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdaterStore } from "./updater.store";

export function UpdateAvailableBadge() {
  const status = useUpdaterStore((state) => state.status);
  const update = useUpdaterStore((state) => state.update);
  const setDialogOpen = useUpdaterStore((state) => state.setDialogOpen);

  if (status !== "available" && status !== "downloading" && status !== "ready" && status !== "installing") return null;

  const label = status === "ready" ? "Update ready" : status === "downloading" || status === "installing" ? "Updating" : `Update ${update?.version ?? "available"}`;
  return <Button className="hidden h-7 gap-1 px-2 text-xs md:inline-flex" size="sm" variant="toolbar" onClick={() => setDialogOpen(true)}><Download className="size-3" />{label}</Button>;
}
