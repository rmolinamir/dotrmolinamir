import { XIcon } from "lucide-react";
import React from "react";
import { Button } from "../components/button";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";

function TabStrip({ className, ...props }: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs className={cn("w-full min-w-0 max-w-full", className)} {...props} />
  );
}

function TabStripRail({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabstrip-rail"
      className={cn(
        "tabstrip-rail w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden px-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabStripList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      variant="line"
      data-slot="tabstrip-list"
      className={cn(
        "min-w-max gap-1 rounded-md border border-border/40 px-1 py-1",
        className,
      )}
      tabIndex={-1}
      {...props}
    />
  );
}

type TabStripTabProps = React.ComponentProps<"div">;

function TabStripTab({ className, ...props }: TabStripTabProps) {
  return (
    <div
      data-slot="tabstrip-tab"
      className={cn("group/tab relative", className)}
      {...props}
    />
  );
}

type TabStripTabTriggerProps = React.ComponentProps<typeof TabsTrigger>;

function TabStripTabTrigger({
  className,
  value,
  ...props
}: TabStripTabTriggerProps) {
  const tabRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <TabsTrigger
      ref={tabRef}
      data-slot="tabstrip-tab-trigger"
      className={cn(
        "h-7 max-w-48 justify-start rounded-md border px-2 pr-6 text-foreground/70",
        "hover:bg-muted/60 hover:text-foreground",
        "data-active:border-border/60! data-active:bg-background/90 data-active:text-foreground",
        className,
      )}
      value={value}
      tabIndex={0}
      {...props}
    />
  );
}

function TabStripTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tabstrip-title"
      className={cn("truncate text-left", className)}
      {...props}
    />
  );
}

type TabStripCloseProps = React.ComponentProps<typeof Button> & {
  onClose?: () => void;
};

function TabStripClose({
  className,
  onClick,
  onClose,
  ...props
}: TabStripCloseProps) {
  const isMobile = useIsMobile();
  return (
    <Button
      size="icon"
      variant="ghost"
      data-slot="tabstrip-close"
      aria-label="Close Tab"
      type="button"
      className={cn(
        "absolute top-1/2 right-1 size-4 -translate-y-1/2 rounded-sm",
        "text-foreground/50 transition",
        isMobile ? "opacity-100" : "opacity-0",
        "hover:text-foreground focus-visible:opacity-100",
        "group-focus-within/tab:opacity-100 group-hover/tab:opacity-100",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onClose?.();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
      }}
      {...props}
    >
      <XIcon className="size-full" />
    </Button>
  );
}

export {
  TabStrip,
  TabStripClose,
  TabStripList,
  TabStripRail,
  TabStripTab,
  TabStripTabTrigger,
  TabStripTitle,
};
