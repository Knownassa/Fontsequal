import { useEffect, useRef } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

const routeTitles: Record<string, string> = {
  "/browse": "Browse",
  "/installed": "Installed",
  "/collections": "Collections",
  "/settings": "Settings",
};

export function AppShell() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const title = routeTitles[pathname] ?? "Browse";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCommand = event.ctrlKey || event.metaKey;

      if (!isCommand) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
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
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div className="cosmic-backdrop" aria-hidden="true" />
      <AppSidebar activePath={pathname} />

      <div className="relative flex h-screen min-w-0 flex-col lg:pl-[292px]">
        <AppHeader searchRef={searchRef} title={title} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
