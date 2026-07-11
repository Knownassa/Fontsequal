import { Link } from "@tanstack/react-router";
import {
  FolderHeartIcon,
  GlobalSearchIcon,
  LibraryIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { FolderPlus, PanelLeftClose, PanelLeftOpen, ScanSearch, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { HugeIcon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";
import { listCollections } from "@/lib/api/collections";

const navItems = [
  { to: "/browse", label: "Browse", shortcut: "B", icon: GlobalSearchIcon },
  { to: "/installed", label: "Installed", shortcut: "I", icon: LibraryIcon },
  { to: "/favorites", label: "Favorites", shortcut: null, icon: FolderHeartIcon },
] as const;

type AppSidebarProps = {
  activePath: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function AppSidebar({ activePath, collapsed, onToggleCollapsed }: AppSidebarProps) {
  const collections = useQuery({ queryKey: ["collections"], queryFn: async () => {
    const result = await listCollections();
    return result.ok ? result.data : [];
  }}).data ?? [];

  return (
    <aside className="material-sidebar z-10 flex min-h-[56px] min-w-0 overflow-hidden border-b transition-all duration-200 lg:min-h-0 lg:border-b-0 lg:border-r">
      {collapsed ? <CollapsedSidebar activePath={activePath} onExpand={onToggleCollapsed} /> : <div className="flex w-full min-w-max items-center gap-2 overflow-x-auto p-2 transition-opacity duration-150 lg:min-w-[232px] lg:flex-col lg:items-stretch lg:gap-4 lg:overflow-y-auto lg:overflow-x-hidden lg:p-3">
        <div className="flex shrink-0 items-center gap-3 px-2 py-1">
          <div className="glass-panel grid size-8 shrink-0 place-items-center rounded-[14px] text-sm font-semibold text-foreground">
            F
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold">Fontsequal</p>
          </div>
          <Button aria-label="Collapse sidebar" className="ml-auto hidden size-7 lg:inline-flex" size="icon" variant="ghost" onClick={onToggleCollapsed}><PanelLeftClose className="size-4" /></Button>
        </div>

        <NavLabel className="hidden lg:block">Library</NavLabel>
        <nav className="flex shrink-0 gap-1 lg:flex-col" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group inline-flex h-8 items-center gap-2 rounded-[9px] px-2.5 text-sm font-medium text-muted-foreground transition-[background,border-color,box-shadow] duration-150 hover:bg-[var(--control-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] lg:w-full",
                    isActive &&
                      "selected-surface text-foreground",
                  )}
                >
                  <HugeIcon icon={Icon} size={17} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.shortcut ? (
                    <kbd className="hidden text-[10px] font-medium text-muted-foreground lg:inline-flex">
                      {item.shortcut}
                    </kbd>
                  ) : null}
                </Link>
              );
            })}
        </nav>

        <div className="hidden space-y-1 lg:block">
          <NavLabel>Collections</NavLabel>
          {collections.slice(0, 6).map((collection) => <Link key={collection.id} to="/collections" className="flex h-8 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"><span className="size-1.5 rounded-full bg-muted-foreground/50" /><span className="min-w-0 flex-1 truncate">{collection.name}</span><span className="text-[10px]">{collection.fontIds.length}</span></Link>)}
          <Link to="/collections" className="flex h-8 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"><FolderPlus className="size-3.5" />New collection</Link>
        </div>

        <div className="hidden space-y-1 lg:block">
          <NavLabel>Tools</NavLabel>
          <Link to="/installed" className="flex h-8 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"><Upload className="size-3.5" />Import fonts</Link>
          <Link to="/compare" className="flex h-8 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"><ScanSearch className="size-3.5" />Compare fonts</Link>
          <Link to="/duplicates" className="flex h-8 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"><ScanSearch className="size-3.5" />Find duplicates</Link>
        </div>

        <div className="mt-auto hidden lg:block"><Separator /><Link to="/settings" className="mt-3 flex h-8 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-hover hover:text-foreground"><HugeIcon icon={Settings02Icon} size={16} />Settings</Link></div>
      </div>}
    </aside>
  );
}

function CollapsedSidebar({ activePath, onExpand }: { activePath: string; onExpand: () => void }) {
  return <div className="hidden w-full flex-col items-center gap-2 py-3 lg:flex"><Button aria-label="Expand sidebar" className="glass-panel size-9 rounded-[14px]" size="icon" variant="ghost" onClick={onExpand}><PanelLeftOpen className="size-4" /></Button><nav className="flex w-full flex-col items-center gap-2" aria-label="Collapsed primary navigation">{navItems.map((item) => { const Icon = item.icon; const active = activePath === item.to; return <Link key={item.to} to={item.to} className={cn("flex w-14 flex-col items-center gap-1 rounded-[10px] px-1 py-1.5 text-[9px] leading-none text-muted-foreground transition-colors hover:bg-[var(--control-hover)] hover:text-foreground", active && "selected-surface text-foreground")}><HugeIcon icon={Icon} size={17} /><span className="max-w-full truncate">{item.label}</span></Link>; })}<CompactLink active={activePath === "/collections"} label="Sets" to="/collections"><FolderPlus className="size-4" /></CompactLink><CompactLink active={activePath === "/compare"} label="Compare" to="/compare"><ScanSearch className="size-4" /></CompactLink></nav><div className="mt-auto"><CompactLink active={activePath === "/settings"} label="Settings" to="/settings"><HugeIcon icon={Settings02Icon} size={17} /></CompactLink></div></div>;
}

function CompactLink({ active, children, label, to }: { active: boolean; children: React.ReactNode; label: string; to: "/collections" | "/compare" | "/settings" }) { return <Link to={to} className={cn("flex w-14 flex-col items-center gap-1 rounded-[10px] px-1 py-1.5 text-[9px] leading-none text-muted-foreground transition-colors hover:bg-[var(--control-hover)] hover:text-foreground", active && "selected-surface text-foreground")}>{children}<span className="max-w-full truncate">{label}</span></Link>; }

function NavLabel({ children, className }: { children: string; className?: string }) {
  return <p className={cn("px-2.5 pb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground", className)}>{children}</p>;
}
