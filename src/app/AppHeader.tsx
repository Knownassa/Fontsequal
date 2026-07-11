import { Settings2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ImportFontsDialog } from "@/features/import/ImportFontsDialog";
import { SearchCommand } from "./SearchCommand";
import { ThemeToggle } from "./ThemeToggle";

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="window-toolbar flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b px-2 sm:grid sm:h-12 sm:grid-cols-[minmax(140px,1fr)_minmax(220px,440px)_minmax(140px,1fr)] sm:px-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-sm font-semibold">Fontsequal</span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="truncate text-xs text-muted-foreground">{title}</span>
      </div>

      <SearchCommand className="order-3 basis-full sm:order-none sm:basis-auto" />

      <div className="ml-auto flex items-center justify-end gap-1 sm:ml-0">
        <div className="hidden sm:block"><ImportFontsDialog compact /></div>
        <Button aria-label="Settings" className="size-7" size="icon" variant="ghost" onClick={() => void navigate({ to: "/settings" })}><Settings2 className="size-4" /></Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
