import { useApplicationManager } from "@acme/ui/os/application-manager";
import { useWindowManager } from "@acme/ui/os/window-manager";
import { useRouter, useRouterState } from "@tanstack/react-router";
import * as React from "react";
import { useSystem } from "@/routes/-components/system/system-provider";
import type { FileRoutesByTo } from "../../routeTree.gen";

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
  launched: boolean;
};

const ApplicationRoutingContext = React.createContext<
  ((path: keyof FileRoutesByTo) => boolean) | null
>(null);

export function ApplicationRoutingProvider({
  children,
}: React.PropsWithChildren) {
  const router = useRouter();
  const { location, status, isLoading, matches, statusCode } = useRouterState();
  const { power } = useSystem();
  const { runningApplications } = useApplicationManager();
  const { focusedId, windows, getWindowData, activateWindow, hideWindow } =
    useWindowManager();
  const navigation = React.useRef<Navigation | undefined>(undefined);
  const pendingSync = React.useRef<string | undefined>(undefined);
  const pendingActivation = React.useRef<string | null | undefined>(undefined);
  const ready =
    power === "on" &&
    status === "idle" &&
    !isLoading &&
    statusCode < 400 &&
    matches.every(
      (match) => match.status === "success" && !match.globalNotFound,
    );

  // Both directions consume the same navigation. Keep its origin until the
  // next visit, regardless of whether the route or provider effect runs first.
  const getNavigation = React.useCallback(() => {
    if (!ready) return;
    const path = location.pathname.replace(/\/$/, "") || "/";
    if (path !== "/" && !isApplicationPath(path)) return;

    const key = `${location.state.__TSR_key}:${location.href}`;
    if (navigation.current?.key !== key) {
      const isWindowSync =
        pendingSync.current !== undefined &&
        location.state.applicationWindowSync === pendingSync.current;
      pendingSync.current = undefined;
      navigation.current = { isWindowSync, key, launched: false, path };
      if (!isWindowSync) pendingActivation.current = path === "/" ? null : path;
    }
    return navigation.current;
  }, [ready, location]);

  const claimRouteLaunch = React.useCallback(
    (path: keyof FileRoutesByTo) => {
      const current = getNavigation();
      if (
        !current ||
        current.path !== path ||
        current.isWindowSync ||
        current.launched
      )
        return false;
      current.launched = true;
      return true;
    },
    [getNavigation],
  );

  React.useEffect(() => {
    const current = getNavigation();
    if (!current) return;

    // Window registration/cleanup follows the application commit. Do not
    // synchronize an intermediate frame back into a route-driven launch.
    if (
      runningApplications.some((app) => !getWindowData(app.id)) ||
      windows.some(
        (window) => !runningApplications.some((app) => app.id === window.id),
      )
    )
      return;

    // The route's launchWindow call may not have committed yet. Also restore
    // its requested focus when the desktop remounts after a not-found screen.
    if (pendingActivation.current !== undefined) {
      if ((focusedId ?? null) !== pendingActivation.current) {
        if (pendingActivation.current === null) {
          for (const window of windows) {
            if (!getWindowData(window.id)?.isHidden) hideWindow(window.id);
          }
        } else if (getWindowData(pendingActivation.current)) {
          activateWindow(pendingActivation.current);
        }
        return;
      }
      pendingActivation.current = undefined;
    }

    const focusedWindow = focusedId ? getWindowData(focusedId) : undefined;
    const to =
      focusedWindow &&
      !focusedWindow.isHidden &&
      isApplicationPath(focusedWindow.id)
        ? focusedWindow.id
        : "/";
    if (current.path === to) return;

    const syncId = crypto.randomUUID();
    pendingSync.current = syncId;
    void router.navigate({
      replace: true,
      resetScroll: false,
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
