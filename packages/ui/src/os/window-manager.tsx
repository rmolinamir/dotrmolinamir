import * as React from "react";
import type { WindowPercentFraming } from "./window-utils";

export type WindowInstance = {
  id: string;
  zIndex: number;
  framing?: WindowPercentFraming;
  isFullscreen?: boolean;
  isHidden?: boolean;
  previousFraming?: WindowPercentFraming | null;
};

type WindowManagerState = {
  windows: WindowInstance[];
  map: Record<string, WindowInstance>;
  focusedId?: string;
};

export type WindowManagerContextValue = {
  windows: WindowInstance[];
  focusedId?: string;
  getWindowData: (id: string) => WindowInstance | undefined;
  getTopWindow: () => WindowInstance | undefined;
  getFraming: (id: string) => WindowPercentFraming | undefined;
  getIsFullscreen: (id: string) => boolean;
  getIsHidden: (id: string) => boolean;
  mountWindow: (id: string) => void;
  unmountWindow: (id: string) => void;
  activateWindow: (id: string) => void;
  hideWindow: (id: string) => void;
  setFraming: (id: string, framing: WindowPercentFraming) => void;
  toggleFullscreen: (id: string) => void;
  restoreWindowLayout: (layout: ReadonlyArray<WindowInstance>) => void;
};

const WindowManagerContext =
  React.createContext<WindowManagerContextValue | null>(null);

function findTopWindow(
  windows: WindowInstance[],
  map: Record<string, WindowInstance>,
) {
  let top: WindowInstance | null = null;

  for (const window of windows) {
    const windowData = map[window.id] ?? window;
    if (windowData.isHidden) continue;
    if (!top || windowData.zIndex > top.zIndex) {
      top = windowData;
    }
  }

  return top ?? undefined;
}

type WindowManagerProps = {
  children: React.ReactNode;
};

function WindowManagerProvider({ children }: WindowManagerProps) {
  const [state, setState] = React.useState<WindowManagerState>(() => ({
    focusedId: undefined,
    map: {},
    windows: [],
  }));

  const getWindowData = React.useCallback(
    (id: string) => state.map[id],
    [state.map],
  );

  const getFraming = React.useCallback(
    (id: string) => getWindowData(id)?.framing,
    [getWindowData],
  );

  const getIsFullscreen = React.useCallback(
    (id: string) => Boolean(getWindowData(id)?.isFullscreen),
    [getWindowData],
  );

  const getIsHidden = React.useCallback(
    (id: string) => Boolean(getWindowData(id)?.isHidden),
    [getWindowData],
  );

  const getTopWindow = React.useCallback(
    () => findTopWindow(state.windows, state.map),
    [state.map, state.windows],
  );

  const mountWindow = React.useCallback((id: string) => {
    setState((prev) => {
      // If the window is already mounted, do nothing
      if (prev.windows.some((window) => window.id === id)) {
        return prev;
      }

      const entry: WindowInstance = {
        id,
        zIndex: Math.max(0, ...prev.windows.map((window) => window.zIndex)) + 1,
      };

      return {
        ...prev,
        focusedId: id,
        map: {
          ...prev.map,
          [id]: entry,
        },
        windows: [...prev.windows, entry],
      };
    });
  }, []);

  const unmountWindow = React.useCallback((id: string) => {
    setState((prev) => {
      const windows = prev.windows.filter((window) => window.id !== id);
      const { [id]: _removedWindow, ...map } = prev.map;

      if (prev.focusedId !== id) {
        return { ...prev, map, windows };
      }

      // If the window being unmounted is the focused window, also focus the next window
      const nextFocusedId = findTopWindow(windows, map)?.id;
      return {
        ...prev,
        focusedId: nextFocusedId,
        map,
        windows,
      };
    });
  }, []);

  const activateWindow = React.useCallback((id: string) => {
    setState((prev) => {
      const hasWindow = prev.windows.some((window) => window.id === id);
      if (!hasWindow) {
        return prev;
      }

      const activeWindow = prev.windows.find((window) => window.id === id);
      if (!activeWindow) return prev;

      // Recalculating the z-index values based on the new order
      const reordered = prev.windows.filter((window) => window.id !== id);
      const windows = [...reordered, activeWindow].map((window, index) => ({
        ...window,
        zIndex: index + 1,
      }));

      const nextMap = { ...prev.map };
      for (const window of windows) {
        nextMap[window.id] = {
          ...(nextMap[window.id] ?? window),
          ...window,
        };
      }
      nextMap[id] = {
        ...(nextMap[id] ?? activeWindow),
        isHidden: false,
      };

      return {
        ...prev,
        focusedId: id,
        map: nextMap,
        windows,
      };
    });
  }, []);

  const hideWindow = React.useCallback((id: string) => {
    setState((prev) => {
      const windowData = prev.map[id];
      const nextMap = {
        ...prev.map,
        [id]: {
          ...(windowData ?? { id, zIndex: prev.windows.length + 1 }),
          isHidden: true,
        },
      };
      const nextFocusedId =
        prev.focusedId === id
          ? findTopWindow(prev.windows, nextMap)?.id
          : prev.focusedId;

      return {
        ...prev,
        focusedId: nextFocusedId,
        map: nextMap,
      };
    });
  }, []);

  const setFraming = React.useCallback(
    (id: string, framing: WindowPercentFraming) => {
      setState((prev) => ({
        ...prev,
        map: {
          ...prev.map,
          [id]: {
            ...(prev.map[id] ?? { id, zIndex: prev.windows.length + 1 }),
            framing,
          },
        },
      }));
    },
    [],
  );

  const toggleFullscreen = React.useCallback((id: string) => {
    setState((prev) => {
      const windowData = prev.map[id];
      if (!windowData?.framing) return prev;

      if (windowData.isFullscreen) {
        const restoredFraming =
          windowData.previousFraming ?? windowData.framing;
        return {
          ...prev,
          map: {
            ...prev.map,
            [id]: {
              ...windowData,
              framing: restoredFraming,
              isFullscreen: false,
              previousFraming: null,
            },
          },
        };
      }

      return {
        ...prev,
        map: {
          ...prev.map,
          [id]: {
            ...windowData,
            framing: {
              position: { x: 0, y: 0 },
              size: { height: 100, width: 100 },
              unit: "percent",
            },
            isFullscreen: true,
            previousFraming: windowData.framing,
          },
        },
      };
    });
  }, []);

  // Apply a saved layout atomically after its windows have mounted. Windows
  // omitted from the layout remain running, behind the restored windows.
  const restoreWindowLayout = React.useCallback(
    (layout: ReadonlyArray<WindowInstance>) => {
      setState((prev) => {
        const restored = layout.filter((entry) =>
          prev.windows.some((window) => window.id === entry.id),
        );
        const ids = new Set(restored.map((entry) => entry.id));
        const ordered = [
          ...prev.windows.filter((window) => !ids.has(window.id)),
          ...[...restored].sort((a, b) => a.zIndex - b.zIndex),
        ];
        const windows = ordered.map((entry, index) => ({
          id: entry.id,
          zIndex: index + 1,
        }));
        const map = { ...prev.map };
        for (const entry of restored)
          map[entry.id] = { ...map[entry.id], ...entry };
        for (const window of windows)
          map[window.id] = { ...map[window.id], ...window };
        return { focusedId: findTopWindow(windows, map)?.id, map, windows };
      });
    },
    [],
  );

  const value = React.useMemo<WindowManagerContextValue>(
    () => ({
      activateWindow,
      focusedId: state.focusedId,
      getFraming,
      getIsFullscreen,
      getIsHidden,
      getTopWindow,
      getWindowData,
      hideWindow,
      mountWindow,
      restoreWindowLayout,
      setFraming: setFraming,
      toggleFullscreen,
      unmountWindow,
      windows: state.windows,
    }),
    [
      getWindowData,
      getFraming,
      getIsFullscreen,
      getIsHidden,
      mountWindow,
      unmountWindow,
      activateWindow,
      hideWindow,
      getTopWindow,
      setFraming,
      state.focusedId,
      state.windows,
      toggleFullscreen,
      restoreWindowLayout,
    ],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

function useWindowManager() {
  const context = React.useContext(WindowManagerContext);
  if (!context) {
    throw new Error("useWindowManager must be used within WindowManager");
  }
  return context;
}

export {
  findTopWindow as getTopWindow,
  useWindowManager,
  WindowManagerProvider,
};
