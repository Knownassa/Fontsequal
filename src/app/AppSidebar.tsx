import { Link } from "@tanstack/react-router";
import {
  FolderHeartIcon,
  GlobalSearchIcon,
  LibraryIcon,
  Settings02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HugeIcon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/browse", label: "Browse", shortcut: "B", icon: GlobalSearchIcon },
  { to: "/installed", label: "Installed", shortcut: "I", icon: LibraryIcon },
  { to: "/collections", label: "Collections", shortcut: null, icon: FolderHeartIcon },
  { to: "/settings", label: "Settings", shortcut: ",", icon: Settings02Icon },
] as const;

type AppSidebarProps = {
  activePath: string;
};

export function AppSidebar({ activePath }: AppSidebarProps) {
  return (
    <aside className="relative z-10 p-3 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[292px] lg:p-4">
      <div className="flex h-full min-h-[220px] flex-col gap-5 rounded-[24px] border border-white/10 bg-sidebar/80 p-4 shadow-card backdrop-blur-2xl lg:min-h-[calc(100vh-2rem)]">
        <div className="flex items-center gap-3 px-1">
          <div className="grid size-11 shrink-0 place-items-center rounded-[16px] border border-white/10 bg-white/[0.06] text-base font-semibold shadow-soft-glow">
            F
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">Fontsequal</p>
            <p className="truncate text-xs text-muted-foreground">
              Local font manager
            </p>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex gap-2 lg:flex-col" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group inline-flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full",
                    isActive &&
                      "border border-border bg-accent text-accent-foreground shadow-sm",
                  )}
                >
                  <HugeIcon icon={Icon} size={20} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.shortcut ? (
                    <kbd className="hidden rounded border border-border/80 bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
                      {item.shortcut}
                    </kbd>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="rounded-[18px] border border-white/10 bg-white/[0.045] p-3 shadow-card">
          <div className="flex items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-md bg-neon-green/15 text-neon-green">
              <HugeIcon icon={SparklesIcon} size={17} />
            </div>
            <div>
              <p className="text-sm font-medium">Mock workspace</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Browse, installs, collections, and settings are ready for real
                font data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
