import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Plus, Settings2, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ImportFontsDialog } from "@/features/import/ImportFontsDialog";
import { UpdateAvailableBadge } from "@/features/updater";
import { SearchCommand } from "./SearchCommand";
import { ThemeToggle } from "./ThemeToggle";

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  const navigate = useNavigate();
  const appWindow = isTauri() ? getCurrentWindow() : null;

  const runWindowCommand = (command: () => Promise<void>) => {
    void command().catch(() => undefined);
  };

  return (
    <header
      className="window-toolbar flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b px-3 sm:grid sm:h-12 sm:grid-cols-[minmax(180px,1fr)_minmax(220px,440px)_minmax(140px,1fr)]"
      onMouseDown={(event) => {
        if (
          event.button === 0 &&
          appWindow &&
          !(event.target instanceof Element && event.target.closest("button, input, select, textarea, [role='button']"))
        ) {
          runWindowCommand(() => appWindow.startDragging());
        }
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {appWindow ? <div className="flex shrink-0 items-center gap-0.5" onMouseDown={(event) => event.stopPropagation()}>
          <button
            aria-label="Close window"
            className="group grid size-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => appWindow && runWindowCommand(() => appWindow.close())}
            title="Close"
            type="button"
          >
            <span className="grid size-3.5 place-items-center rounded-full bg-[#ff5f57] text-[#4d1512]">
              <X aria-hidden="true" className="size-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" strokeWidth={3} />
            </span>
          </button>
          <button
            aria-label="Minimize window"
            className="group grid size-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => appWindow && runWindowCommand(() => appWindow.minimize())}
            title="Minimize"
            type="button"
          >
            <span className="grid size-3.5 place-items-center rounded-full bg-[#ffbd2e] text-[#5d4300]">
              <Minus aria-hidden="true" className="size-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" strokeWidth={3} />
            </span>
          </button>
          <button
            aria-label="Zoom window"
            className="group grid size-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => appWindow && runWindowCommand(() => appWindow.toggleMaximize())}
            title="Zoom"
            type="button"
          >
            <span className="grid size-3.5 place-items-center rounded-full bg-[#28c840] text-[#0d4b16]">
              <Plus aria-hidden="true" className="size-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" strokeWidth={3} />
            </span>
          </button>
        </div> : null}
        <span className="text-sm font-semibold">Fontsequal</span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="truncate text-xs text-muted-foreground">{title}</span>
      </div>

      <SearchCommand className="order-3 basis-full sm:order-none sm:basis-auto" />

      <div className="ml-auto flex items-center justify-end gap-1 sm:ml-0">
        <UpdateAvailableBadge />
        <div className="hidden sm:block"><ImportFontsDialog compact /></div>
        <Button aria-label="Settings" className="size-7" size="icon" variant="ghost" onClick={() => void navigate({ to: "/settings" })}><Settings2 className="size-4" /></Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
