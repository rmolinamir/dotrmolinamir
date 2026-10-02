import * as React from "react";
import {
  Rnd,
  type RndDragCallback,
  type RndResizeCallback,
  type RndResizeStartCallback,
} from "react-rnd";
import { Card } from "../components/card";
import { cn } from "../lib/utils";
import { useApplicationId } from "./application";
import { useWindowBoundary } from "./window-boundary";
import { useWindowManager } from "./window-manager";
import { useWindowSnap } from "./window-snap";
import {
  clampPercentFraming,
  getCenteredWindowFraming,
  getPointerPosition,
  toPercentFraming,
  toPixelFraming,
  type WindowPercentFraming,
  type WindowPixelFraming,
  type WindowSize,
} from "./window-utils";

type WindowContextValue = {
  toggleHidden: () => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  isHidden: boolean;
};

const WindowContext = React.createContext<WindowContextValue | null>(null);

type WindowProviderProps = {
  id: string;
  children: React.ReactNode;
};

function WindowProvider({ id, children }: WindowProviderProps) {
  const manager = useWindowManager();

  const toggleHidden = React.useCallback(() => {
    if (manager.getWindowData(id)?.isHidden) {
      manager.activateWindow(id);
      return;
    }
    manager.hideWindow(id);
  }, [manager, id]);

  const toggleFullscreen = React.useCallback(() => {
    manager.toggleFullscreen(id);
  }, [manager, id]);

  const { isFullscreen, isHidden } = manager.getWindowData(id) ?? {};

  const value = React.useMemo(
    () => ({
      isFullscreen: Boolean(isFullscreen),
      isHidden: Boolean(isHidden),
      toggleFullscreen,
      toggleHidden,
    }),
    [toggleHidden, toggleFullscreen, isFullscreen, isHidden],
  );

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
}

const fallbackMinSize: WindowSize = { height: 200, width: 280 };
const fallbackFramingSize = { height: 70, width: 60 } satisfies WindowSize;
const fallbackFraming = getCenteredWindowFraming(fallbackFramingSize);

export type WindowProps = React.ComponentProps<typeof Card> & {
  id?: string;
  defaultFraming?: Omit<WindowPercentFraming, "unit">;
  minSize?: WindowSize;
  maxSize?: WindowSize;
  draggable?: boolean;
  resizable?: boolean;
};

function Window({
  className,
  children,
  id,
  defaultFraming: defaultPercentageFraming,
  minSize = fallbackMinSize,
  maxSize,
  draggable = true,
  resizable = true,
  style,
  ref,
  ...props
}: WindowProps) {
  const defaultFraming = defaultPercentageFraming
    ? ({
        ...defaultPercentageFraming,
        unit: "percent",
      } satisfies WindowPercentFraming)
    : undefined;
  const autoId = React.useId();
  const applicationId = useApplicationId();
  const windowId = id ?? applicationId ?? autoId;

  const { size: bounds, element } = useWindowBoundary();
  const manager = useWindowManager();
  const snap = useWindowSnap();

  const previousBoundsRef = React.useRef<WindowSize | null>(null);
  const lastUserPixelFramingRef = React.useRef<WindowPixelFraming | null>(null);

  const windowData = manager.getWindowData(windowId);
  const framing = windowData?.framing;
  const isActive = manager.focusedId === windowId;
  const isFullscreen = Boolean(windowData?.isFullscreen);
  const isHidden = Boolean(windowData?.isHidden);
  const zIndex = windowData?.zIndex ?? 1;

  const currentPixelFraming = React.useMemo(() => {
    if (!bounds || !framing) return null;
    return toPixelFraming(framing, bounds);
  }, [bounds, framing]);

  const initialPixelFraming = React.useMemo(() => {
    if (!bounds || !defaultFraming) return null;
    return toPixelFraming(defaultFraming, bounds);
  }, [bounds, defaultFraming]);

  const fallbackPixelFraming = React.useMemo(() => {
    if (!bounds) return null;
    return toPixelFraming(fallbackFraming, bounds);
  }, [bounds]);

  const activateWindow = React.useCallback(() => {
    manager.activateWindow(windowId);
  }, [manager, windowId]);

  const setFraming = React.useCallback(
    (nextFraming: WindowPercentFraming) => {
      manager.setFraming(windowId, nextFraming);
    },
    [manager, windowId],
  );

  const computeNextFraming = React.useCallback(
    (pixelFraming: WindowPixelFraming) => {
      if (!bounds) return null;
      return clampPercentFraming(
        toPercentFraming(pixelFraming, bounds),
        bounds,
        minSize,
        maxSize,
      );
    },
    [bounds, maxSize, minSize],
  );

  const handleDragStop = React.useCallback<RndDragCallback>(
    (event, data) => {
      if (!bounds) return;
      const currentSize =
        currentPixelFraming?.size ??
        initialPixelFraming?.size ??
        fallbackPixelFraming?.size ??
        fallbackFraming.size;
      const snapPointer = getPointerPosition(event);
      const snapFraming = snapPointer
        ? snap?.getSnapFraming({
            pointer: snapPointer,
            size: currentSize,
          })
        : null;

      // If the window is snapping, use the snap's framing then clear the overlay
      if (snapFraming) {
        setFraming(snapFraming);
        snap?.clearOverlay();
        return;
      }

      const desiredPixelFraming: WindowPixelFraming = {
        position: { x: data.x, y: data.y },
        size: currentSize,
        unit: "px",
      };
      lastUserPixelFramingRef.current = desiredPixelFraming;

      const nextFraming = computeNextFraming(desiredPixelFraming);
      if (nextFraming) {
        setFraming(nextFraming);
      }
      snap?.clearOverlay();
    },
    [
      bounds,
      initialPixelFraming,
      fallbackPixelFraming,
      currentPixelFraming,
      setFraming,
      snap,
      computeNextFraming,
    ],
  );

  const handleDrag = React.useCallback<RndDragCallback>(
    (event) => {
      if (!bounds || isFullscreen) return;
      const currentSize =
        currentPixelFraming?.size ??
        initialPixelFraming?.size ??
        fallbackPixelFraming?.size ??
        fallbackFraming.size;
      const snapPointer = getPointerPosition(event);
      if (!snapPointer) return;

      snap?.handleDrag({
        pointer: snapPointer,
        size: currentSize,
      });
    },
    [
      bounds,
      initialPixelFraming,
      fallbackPixelFraming,
      isFullscreen,
      currentPixelFraming,
      snap,
    ],
  );

  const handleDragStart = React.useCallback<RndDragCallback>(() => {
    activateWindow();
  }, [activateWindow]);

  const handleResizeStop = React.useCallback<RndResizeCallback>(
    (_event, _direction, refElement, _delta, nextPosition) => {
      if (!bounds) return;
      const nextSize = {
        height: refElement.offsetHeight,
        width: refElement.offsetWidth,
      };
      const desiredPixelFraming: WindowPixelFraming = {
        position: nextPosition,
        size: nextSize,
        unit: "px",
      };
      lastUserPixelFramingRef.current = desiredPixelFraming;

      const nextFraming = computeNextFraming(desiredPixelFraming);
      if (nextFraming) {
        setFraming(nextFraming);
      }
    },
    [bounds, setFraming, computeNextFraming],
  );

  const handleResizeStart = React.useCallback<RndResizeStartCallback>(() => {
    activateWindow();
  }, [activateWindow]);

  const handleMouseDown = React.useCallback(() => {
    activateWindow();
  }, [activateWindow]);

  const handleFocusCapture = React.useCallback(() => {
    if (isActive) return;
    activateWindow();
  }, [activateWindow, isActive]);

  const mountWindow = React.useEffectEvent((nextId: string) => {
    manager.mountWindow(nextId);
  });
  const unmountWindow = React.useEffectEvent((nextId: string) => {
    manager.unmountWindow(nextId);
  });

  // Mount and unmount the window when the windowId changes
  React.useEffect(() => {
    mountWindow(windowId);
    return () => unmountWindow(windowId);
  }, [windowId]);

  // Initialize the frame once we know bounds
  React.useEffect(() => {
    if (!bounds || framing) return;
    setFraming(defaultFraming ?? fallbackFraming);
  }, [bounds, defaultFraming, framing, setFraming]);

  // Keep the window inside bounds when the workspace size changes
  React.useEffect(() => {
    if (!bounds || !framing || isFullscreen) {
      previousBoundsRef.current = bounds;
      return;
    }

    const previousBounds = previousBoundsRef.current;
    if (!previousBounds) {
      previousBoundsRef.current = bounds;
      return;
    }

    const boundsDecreased =
      bounds.width < previousBounds.width ||
      bounds.height < previousBounds.height;
    const boundsIncreased =
      bounds.width > previousBounds.width ||
      bounds.height > previousBounds.height;

    if (boundsDecreased || boundsIncreased) {
      // Use the last user-driven pixel frame as the target
      const desiredPixelFraming = lastUserPixelFramingRef.current ??
        currentPixelFraming ??
        initialPixelFraming ??
        fallbackPixelFraming ?? {
          position: { x: 0, y: 0 },
          size: fallbackFraming.size,
          unit: "px",
        };

      const widthOverflow = desiredPixelFraming.size.width > bounds.width;
      const heightOverflow = desiredPixelFraming.size.height > bounds.height;

      const nextSize = {
        height: heightOverflow
          ? Math.max(
              minSize.height,
              Math.min(desiredPixelFraming.size.height, bounds.height),
            )
          : desiredPixelFraming.size.height,
        width: widthOverflow
          ? Math.max(
              minSize.width,
              Math.min(desiredPixelFraming.size.width, bounds.width),
            )
          : desiredPixelFraming.size.width,
      };

      const maxX = Math.max(0, bounds.width - nextSize.width);
      const maxY = Math.max(0, bounds.height - nextSize.height);

      const nextPosition = {
        x: Math.min(Math.max(desiredPixelFraming.position.x, 0), maxX),
        y: Math.min(Math.max(desiredPixelFraming.position.y, 0), maxY),
      };

      const nextFraming = toPercentFraming(
        {
          position: nextPosition,
          size: nextSize,
          unit: "px",
        },
        bounds,
      );

      if (
        nextFraming.position.x !== framing.position.x ||
        nextFraming.position.y !== framing.position.y ||
        nextFraming.size.width !== framing.size.width ||
        nextFraming.size.height !== framing.size.height
      ) {
        setFraming(nextFraming);
      }
    }

    previousBoundsRef.current = bounds;
  }, [
    bounds,
    framing,
    isFullscreen,
    minSize,
    setFraming,
    currentPixelFraming,
    initialPixelFraming,
    fallbackPixelFraming,
  ]);

  return (
    <WindowProvider id={windowId}>
      <Rnd
        bounds={element ?? "parent"}
        disableDragging={!draggable || isFullscreen || isHidden}
        enableResizing={resizable && !isFullscreen && !isHidden}
        minWidth={minSize.width}
        minHeight={minSize.height}
        maxWidth={maxSize?.width}
        maxHeight={maxSize?.height}
        default={undefined}
        position={currentPixelFraming?.position}
        size={currentPixelFraming?.size}
        style={{
          ...style,
          zIndex,
        }}
        className={cn("max-h-full max-w-full", {
          "hidden!": isHidden,
        })}
        dragHandleClassName="os-window__rnd-handler"
        cancel="[data-slot=window-control], [data-slot=window-content]"
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onDragStart={handleDragStart}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        onMouseDown={handleMouseDown}
      >
        <Card
          ref={ref}
          data-slot="window"
          data-focused={isActive ? "true" : "false"}
          data-hidden={isHidden ? "true" : "false"}
          data-fullscreen={isFullscreen ? "true" : "false"}
          onFocusCapture={handleFocusCapture}
          className={cn(
            "shadow- flex h-full w-full flex-col gap-0 rounded-none border-border/80 bg-transparent p-0",
            "transition-shadow data-[focused=true]:shadow-xl",
            "data-[focused=false]:**:data-[slot=window-content]:select-none",
            "data-[focused=true]:**:data-[slot=window-content]:select-text",
            "data-[fullscreen=false]:**:data-[slot=window-header]:cursor-move",
            "data-[fullscreen=true]:**:data-[slot=window-header]:cursor-default",
            className,
          )}
          {...props}
        >
          {children}
        </Card>
      </Rnd>
    </WindowProvider>
  );
}

function useWindow() {
  const context = React.useContext(WindowContext);
  if (!context) {
    throw new Error("useWindow must be used within a WindowContext.Provider");
  }
  return context;
}

export type {
  WindowPercentFraming,
  WindowPixelFraming,
  WindowPosition,
  WindowSize,
} from "./window-utils";
export {
  getCascadingWindowFraming,
  getCenteredWindowFraming,
} from "./window-utils";
export { useWindow, Window };
