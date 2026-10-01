import { getApplication } from "@acme/ui/os/application";
import { useApplicationManager } from "@acme/ui/os/application-manager";
import {
  useWindowManager,
  type WindowInstance,
} from "@acme/ui/os/window-manager";
import { useRouter, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { useSystem } from "@/routes/-components/system/system-provider";
import type { FileRoutesByTo } from "../../routeTree.gen";
import {
  parseWorkspace,
  serializeWorkspace,
  type WorkspaceWindow,
} from "./workspace-url";

declare module "@tanstack/react-router" {
  interface HistoryState {
    applicationWindowSync?: string;
  }
}

// The application factory uses its route as the application/window ID.
const applicationPaths = new Set<string>();

export function registerApplicationRoute(path: keyof FileRoutesByTo) {
  applicationPaths.add(path);
}

function isApplicationPath(path: string): path is keyof FileRoutesByTo {
  return applicationPaths.has(path);
}

type Navigation = {
  key: string;
  path: string;
  isWindowSync: boolean;
  routeLaunched: boolean;
  workspace: WorkspaceWindow[];
  savedAppsLaunched: boolean;
  layoutRestored: boolean;
};

const ApplicationRoutingContext = React.createContext<
  ((path: keyof FileRoutesByTo) => boolean) | null
>(null);

export function ApplicationRoutingProvider({
  children,
}: React.PropsWithChildren) {
  const router = useRouter();
  const { location, status, isLoading, matches } = useRouterState();
  const { power } = useSystem();
  const { runningApplications, launch, isRunning } = useApplicationManager();
  const {
    focusedId,
    windows,
    getWindowData,
    activateWindow,
    hideWindow,
    restoreWindowLayout,
  } = useWindowManager();
  const navigation = React.useRef<Navigation | undefined>(undefined);
  const pendingSync = React.useRef<string | undefined>(undefined);
  const pendingActivation = React.useRef<string | null | undefined>(undefined);
  const ready =
    power === "on" &&
    status === "idle" &&
    !isLoading &&
    matches.every((match) => match.status === "success" && !match._notFound);

  // Both directions consume the same navigation. Keep its origin until the
  // next visit, regardless of whether the route or provider effect runs first.
  const getNavigation = React.useCallback(() => {
    const key = `${location.state.__TSR_key}:${location.href}`;
    // Observe departures even while synchronization is suspended. Back from an
    // error page must consume the restored history entry as a fresh visit.
    if (navigation.current?.key !== key) {
      navigation.current = undefined;
      pendingActivation.current = undefined;
      if (location.state.applicationWindowSync !== pendingSync.current) {
        pendingSync.current = undefined;
      }
    }

    if (!ready) return;
    const path = location.pathname.replace(/\/$/, "") || "/";
    if (path !== "/" && !isApplicationPath(path)) return;
    if (navigation.current) return navigation.current;

    const isWindowSync =
      pendingSync.current !== undefined &&
      location.state.applicationWindowSync === pendingSync.current;
    pendingSync.current = undefined;
    navigation.current = {
      isWindowSync,
      key,
      layoutRestored: false,
      path,
      routeLaunched: false,
      savedAppsLaunched: false,
      workspace: isWindowSync
        ? []
        : parseWorkspace(location.search, isApplicationPath),
    };
    if (!isWindowSync) pendingActivation.current = path === "/" ? null : path;
    return navigation.current;
  }, [ready, location]);

  const claimRouteLaunch = React.useCallback(
    (path: keyof FileRoutesByTo) => {
      const current = getNavigation();
      if (
        !current ||
        current.path !== path ||
        current.isWindowSync ||
        current.routeLaunched
      )
        return false;
      current.routeLaunched = true;
      return true;
    },
    [getNavigation],
  );

  React.useEffect(() => {
    const current = getNavigation();
    if (!current) return;

    function launchSavedApplications(navigation: Navigation): boolean {
      if (navigation.savedAppsLaunched) return false;
      navigation.savedAppsLaunched = true;
      // The active route launches through Route -> launchWindow.
      // Only the other saved apps need launching here.
      let launched = false;
      for (const entry of navigation.workspace) {
        if (entry.path === navigation.path) continue;
        const application = getApplication(entry.path);
        if (!application || isRunning(application)) continue;
        launch(application);
        launched = true;
      }
      return launched;
    }

    function hasUncommittedWindows(): boolean {
      // Registration and cleanup follow the application commit. Wait for both
      // sides before applying a layout or writing an intermediate URL.
      return (
        runningApplications.some((app) => !getWindowData(app.id)) ||
        windows.some(
          (window) => !runningApplications.some((app) => app.id === window.id),
        )
      );
    }

    function restoreSavedLayout(navigation: Navigation): boolean {
      if (navigation.layoutRestored || !navigation.workspace.length)
        return false;
      if (navigation.workspace.some((entry) => !getWindowData(entry.path)))
        return true;
      restoreWindowLayout(
        navigation.workspace.map(({ path, ...entry }) => ({
          ...entry,
          id: path,
        })),
      );
      navigation.layoutRestored = true;
      return true;
    }

    function activateRequestedWindow(): boolean {
      const requested = pendingActivation.current;
      if (requested === undefined) return false;
      if ((focusedId ?? null) === requested) {
        pendingActivation.current = undefined;
        return false;
      }
      if (requested === null) {
        for (const window of windows) {
          if (!getWindowData(window.id)?.isHidden) hideWindow(window.id);
        }
        return true;
      }
      if (getWindowData(requested)) activateWindow(requested);
      return true;
    }

    // Each phase stops here when it starts work or needs another commit.
    if (launchSavedApplications(current)) return;
    if (hasUncommittedWindows()) return;
    if (restoreSavedLayout(current)) return;
    if (activateRequestedWindow()) return;

    const focusedWindow = focusedId ? getWindowData(focusedId) : undefined;
    const to =
      focusedWindow &&
      !focusedWindow.isHidden &&
      isApplicationPath(focusedWindow.id)
        ? focusedWindow.id
        : "/";
    const layout = windows
      .map((window) => getWindowData(window.id))
      .filter((window): window is WindowInstance =>
        Boolean(window && isApplicationPath(window.id)),
      );
    const search = serializeWorkspace(location.search, layout);
    if (
      current.path === to &&
      router.options.stringifySearch(search) === location.searchStr
    )
      return;

    const syncId = crypto.randomUUID();
    pendingSync.current = syncId;
    void router.navigate({
      hash: location.hash,
      replace: true,
      resetScroll: false,
      search,
      state: { applicationWindowSync: syncId },
      to,
    });
  }, [
    router,
    getNavigation,
    runningApplications,
    focusedId,
    windows,
    getWindowData,
    activateWindow,
    hideWindow,
    restoreWindowLayout,
    launch,
    isRunning,
    location.search,
    location.searchStr,
    location.hash,
  ]);

  return (
    <ApplicationRoutingContext.Provider value={claimRouteLaunch}>
      {children}
    </ApplicationRoutingContext.Provider>
  );
}

export function useApplicationRoute(
  path: keyof FileRoutesByTo,
  launchWindow: () => void,
) {
  const claimRouteLaunch = React.useContext(ApplicationRoutingContext);
  if (!claimRouteLaunch)
    throw new Error(
      "useApplicationRoute must be used within ApplicationRoutingProvider",
    );

  const launch = React.useEffectEvent(launchWindow);
  React.useEffect(() => {
    if (claimRouteLaunch(path)) launch();
  }, [claimRouteLaunch, path]);
}
