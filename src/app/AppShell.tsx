import { useEffect, useState } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/browse": "Browse",
  "/favorites": "Favorites",
  "/installed": "Installed",
  "/duplicates": "Find duplicates",
  "/compare": "Compare fonts",
  "/collections": "Collections",
  "/settings": "Settings",
};

export function AppShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const title = routeTitles[pathname] ?? "Browse";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCommand = event.ctrlKey || event.metaKey;

      if (!isCommand) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "k") {
        event.preventDefault();
        void navigate({ to: "/browse" }).then(() => {
          window.dispatchEvent(new Event("fontsequal:focus-font-search"));
        });
        return;
      }

      if (key === "b") {
        event.preventDefault();
        void navigate({ to: "/browse" });
        return;
      }

      if (key === "i") {
        event.preventDefault();
        void navigate({ to: "/installed" });
        return;
      }

      if (event.key === ",") {
        event.preventDefault();
        void navigate({ to: "/settings" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className={cn("grid h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-window text-foreground transition-[grid-template-columns] duration-200 lg:grid-rows-none", sidebarCollapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[232px_minmax(0,1fr)]")}>
      <AppSidebar activePath={pathname} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((current) => !current)} />

      <div className="flex min-h-0 min-w-0 flex-col">
        <AppHeader title={title} />
        <main className="min-h-0 flex-1 overflow-y-auto bg-workspace">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
