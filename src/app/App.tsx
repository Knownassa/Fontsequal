import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  RouterProvider,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { Toaster } from "@/components/ui/sonner";
import { UpdateDialog, useUpdaterStore } from "@/features/updater";
import { BrowsePage } from "../features/browse/BrowsePage";
import { CollectionsPage } from "../features/collections/CollectionsPage";
import { InstalledPage } from "../features/installed/InstalledPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { ComparePage } from "../features/compare/ComparePage";
import { AppShell } from "./AppShell";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <AppShell />
      <UpdaterBootstrap />
      <UpdateDialog />
      <Toaster />
    </>
  ),
});

function UpdaterBootstrap() {
  const checkForUpdates = useUpdaterStore((state) => state.checkForUpdates);
  const loadCurrentVersion = useUpdaterStore((state) => state.loadCurrentVersion);

  useEffect(() => {
    if (!isTauri()) return;

    void loadCurrentVersion();
    const timeoutId = window.setTimeout(() => {
      void checkForUpdates({ openDialogOnAvailable: false });
    }, 7_000);

    return () => window.clearTimeout(timeoutId);
  }, [checkForUpdates, loadCurrentVersion]);

  return null;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/browse" />,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  component: BrowsePage,
});

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorites",
  component: () => <BrowsePage favoritesOnly />,
});

const installedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/installed",
  component: InstalledPage,
});

const collectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections",
  component: CollectionsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const duplicatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/duplicates",
  component: () => <InstalledPage duplicatesOnly />,
});

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare",
  component: ComparePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  favoritesRoute,
  installedRoute,
  collectionsRoute,
  settingsRoute,
  duplicatesRoute,
  compareRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
