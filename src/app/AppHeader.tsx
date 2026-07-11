import type { RefObject } from "react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchCommand } from "./SearchCommand";
import { ThemeToggle } from "./ThemeToggle";

type AppHeaderProps = {
  searchRef: RefObject<HTMLInputElement>;
  title: string;
};

export function AppHeader({ searchRef, title }: AppHeaderProps) {
  return (
    <header className="z-20 flex shrink-0 flex-col gap-4 px-3 pb-2 pt-3 md:flex-row md:items-center md:justify-between lg:px-4 lg:pl-0">
      <div className="min-w-[160px]">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Typography workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal">{title}</h1>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 md:max-w-3xl md:justify-end">
        <SearchCommand ref={searchRef} className="min-w-0 flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="glass" size="icon" aria-label="Refresh">
              <HugeIcon icon={RefreshIcon} size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
        <ThemeToggle />
      </div>
    </header>
  );
}
