import * as React from "react";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { cn } from "../lib/utils";
import { useWindow } from "./window";

function WindowHeader({
  className,
  ref,
  onDoubleClick,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  const { toggleFullscreen } = useWindow();
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const handleHeaderDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onDoubleClick?.(event);
      if (event.defaultPrevented) return;
      if (event.target === element) toggleFullscreen();
    },
    [element, toggleFullscreen, onDoubleClick],
  );

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

  return (
    <CardHeader
      ref={handleRef}
      data-slot="window-header"
      onDoubleClick={handleHeaderDoubleClick}
      className={cn(
        "os-window__rnd-handler",
        "flex select-none flex-row items-center justify-between gap-3",
        "border-border/80 border-b bg-accent/90 px-3 py-2! text-accent-foreground backdrop-blur-xs",
        "auto-rows-auto grid-rows-none items-center",
        className,
      )}
      {...props}
    />
  );
}

function WindowTitle({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      ref={ref}
      data-slot="window-title"
      className={cn("truncate font-medium text-sm", className)}
      {...props}
    />
  );
}

function WindowCaption({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      ref={ref}
      data-slot="window-caption"
      className={cn("text-xs", className)}
      {...props}
    />
  );
}

function WindowContent({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      ref={ref}
      data-slot="window-content"
      className={cn(
        "flex-1 select-text overflow-auto bg-background/90 px-3 py-2 backdrop-blur-md dark:bg-background/92.5",
        className,
      )}
      {...props}
    />
  );
}

function WindowFooter({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      ref={ref}
      data-slot="window-footer"
      className={cn(
        "px-3 py-2",
        "border-border/80 border-t bg-accent/90 text-accent-foreground backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  );
}

export {
  WindowCaption,
  WindowContent,
  WindowFooter,
  WindowHeader,
  WindowTitle,
};
