import { useInitialWindowFraming } from "@acme/ui/hooks/use-initial-window-framing";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import {
  type ApplicationDefinition,
  defineApplication,
  useApplication,
} from "@acme/ui/os/application";
import { Launcher as LauncherPrimitive } from "@acme/ui/os/launcher";
import { getCascadingWindowFraming, Window } from "@acme/ui/os/window";
import {
  WindowCloseButton,
  WindowControls,
  WindowFullscreenButton,
  WindowHideButton,
} from "@acme/ui/os/window-actions";
import { useWindowBoundary } from "@acme/ui/os/window-boundary";
import { WindowHeader, WindowTitle } from "@acme/ui/os/window-layout";
import { useWindowManager } from "@acme/ui/os/window-manager";
import { Link } from "@tanstack/react-router";
import { Maximize, Minimize, Minus, X } from "lucide-react";
import React, { useEffect } from "react";
import { useSystem } from "@/routes/-components/system/system-provider";
import type { FileRoutesByTo } from "../../routeTree.gen";
import { ApplicationLoadingFallback } from "./application-loading-fallback";
import {
  registerApplicationRoute,
  useApplicationRoute,
} from "./application-routing";

type RouteApplicationDefinition = ApplicationDefinition & {
  launcher: ApplicationDefinition["component"];
};

export function createApplicationRoute(toPath: keyof FileRoutesByTo) {
  const applicationFactory = defineApplication(toPath);

  return ({
    component: ApplicationComponent,
    fallback: FallbackComponent = ApplicationLoadingFallback,
    launcher: LauncherComponent,
    ...applicationFactoryDefinition
  }: RouteApplicationDefinition) => {
    function LoadingApplication() {
      const { insertLoadingApplication, removeLoadingApplication } =
        useSystem();
      const { application } = useApplication();

      React.useEffect(() => {
        insertLoadingApplication(application);
        return () => removeLoadingApplication(application);
      }, [application, insertLoadingApplication, removeLoadingApplication]);

      return FallbackComponent ? <FallbackComponent /> : null;
    }

    const Application = applicationFactory({
      ...applicationFactoryDefinition,
      component: () => {
        const {
          application: { id, metadata },
        } = useApplication();
        const isMobile = useIsMobile();
        const { size: bounds } = useWindowBoundary();
        const { getTopWindow, toggleFullscreen, getWindowData } =
          useWindowManager();
        const defaultFraming = useInitialWindowFraming(() => {
          if (!bounds) return null;
          return getCascadingWindowFraming({
            bounds,
            size: isMobile
              ? { height: 100, width: 100 }
              : { height: 90, width: 90 },
            topWindowFraming: getTopWindow()?.framing ?? null,
          });
        });

        const { isFullscreen, framing } = getWindowData(id) ?? {};

        useEffect(() => {
          if (isMobile && framing && !isFullscreen) {
            toggleFullscreen(id);
          }
        }, [isMobile, isFullscreen, framing, toggleFullscreen, id]);

        return (
          <Window defaultFraming={defaultFraming ?? undefined}>
            <WindowHeader>
              <WindowTitle>{metadata.title}</WindowTitle>
              <WindowControls>
                <WindowHideButton aria-label="Hide">
                  <Minus className="size-4" />
                </WindowHideButton>
                {!isMobile && (
                  <WindowFullscreenButton aria-label="Fullscreen">
                    {isFullscreen ? (
                      <Minimize className="size-3.5" />
                    ) : (
                      <Maximize className="size-3.5" />
                    )}
                  </WindowFullscreenButton>
                )}
                <WindowCloseButton aria-label="Close">
                  <X className="size-4" />
                </WindowCloseButton>
              </WindowControls>
            </WindowHeader>
            <React.Suspense fallback={<LoadingApplication />}>
              <ApplicationComponent />
            </React.Suspense>
          </Window>
        );
      },
    });

    registerApplicationRoute(toPath);

    function Launcher() {
      return (
        <LauncherPrimitive asChild>
          <Link to={toPath}>
            <LauncherComponent />
          </Link>
        </LauncherPrimitive>
      );
    }

    function Route({ children }: React.PropsWithChildren) {
      const { launchWindow } = Application.useApplication();
      useApplicationRoute(toPath, launchWindow);
      return children;
    }

    return {
      Application,
      Launcher,
      Route,
    };
  };
}
