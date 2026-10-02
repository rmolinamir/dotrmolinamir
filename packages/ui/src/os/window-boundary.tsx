import * as React from "react";
import { cn } from "../lib/utils";
import type { WindowSize } from "./window-utils";

type WindowBoundaryContextValue = {
  element: HTMLDivElement | null;
  size: WindowSize | null;
};

const WindowBoundaryContext =
  React.createContext<WindowBoundaryContextValue | null>(null);

type WindowBoundaryProps = React.ComponentProps<"div">;

function WindowBoundary({
  className,
  children,
  ref,
  ...props
}: WindowBoundaryProps) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState<WindowSize | null>(null);

  const handleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    },
    [ref],
  );

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!element) {
      setSize(null);
      return undefined;
    }

    const updateBounds = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width <= 0 || height <= 0) return;
      setSize({ height, width });
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  const value = React.useMemo<WindowBoundaryContextValue>(
    () => ({ element, size }),
    [element, size],
  );

  return (
    <WindowBoundaryContext.Provider value={value}>
      <div ref={handleRef} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </WindowBoundaryContext.Provider>
  );
}

function useWindowBoundary() {
  const context = React.useContext(WindowBoundaryContext);
  if (!context) {
    throw new Error("useShell must be used within Shell");
  }
  return context;
}

export { useWindowBoundary, WindowBoundary };
