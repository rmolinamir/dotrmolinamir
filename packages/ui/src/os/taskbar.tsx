import type * as React from "react";
import { Button } from "../components/button";
import { cn } from "../lib/utils";

export type TaskbarBarSize = "sm" | "md";

export type TaskbarProps = React.ComponentPropsWithoutRef<"nav"> & {
  size?: TaskbarBarSize;
};

function Taskbar({ size = "md", className, ...props }: TaskbarProps) {
  return (
    <nav
      data-size={size}
      className={cn(
        "border-border/40 bg-background/80 text-foreground dark:bg-background/70 flex items-center gap-3 border backdrop-blur-md",
        "data-[size=sm]:h-8 data-[size=sm]:px-3",
        "data-[size=md]:h-10",
        className,
      )}
      {...props}
    />
  );
}

export type TaskbarSectionAlign = "start" | "center" | "end";

export type TaskbarSectionProps = React.ComponentPropsWithoutRef<"div"> & {
  align?: TaskbarSectionAlign;
  grow?: boolean;
};

function TaskbarSection({
  align = "start",
  grow = false,
  className,
  ...props
}: TaskbarSectionProps) {
  return (
    <div
      data-align={align}
      data-grow={grow}
      className={cn(
        "flex min-w-0 items-center",
        "data-[grow=true]:flex-1",
        "data-[grow=true]:min-w-0",
        "data-[align=center]:justify-center",
        "data-[align=end]:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export type TaskbarDividerProps = React.ComponentPropsWithoutRef<"span">;

function TaskbarDivider({ className, ...props }: TaskbarDividerProps) {
  return (
    <span
      aria-hidden
      className={cn("bg-border/60 h-6 w-px", className)}
      {...props}
    />
  );
}

export type TaskbarItemVariant = "icon" | "label" | "pill";

type ButtonProps = React.ComponentProps<typeof Button>;

export type TaskbarItemProps = Omit<ButtonProps, "variant" | "size"> & {
  variant?: TaskbarItemVariant;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  active?: boolean;
};

function TaskbarItem({
  variant = "label",
  active = false,
  className,
  type = "button",
  buttonVariant = "ghost",
  buttonSize = "sm",
  ...props
}: TaskbarItemProps) {
  return (
    <Button
      type={type}
      variant={buttonVariant}
      size={buttonSize}
      data-taskbar-variant={variant}
      data-active={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl text-sm font-normal transition",
        "hover:bg-muted/60 data-[active=true]:bg-muted/70",
        "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-hidden",
        "data-[taskbar-variant=icon]:h-9 data-[taskbar-variant=icon]:w-9",
        "data-[taskbar-variant=icon]:px-0",
        "data-[taskbar-variant=label]:h-9 data-[taskbar-variant=label]:px-3",
        "data-[taskbar-variant=pill]:h-7 data-[taskbar-variant=pill]:px-2",
        "data-[taskbar-variant=pill]:self-center",
        className,
      )}
      {...props}
    />
  );
}

export { Taskbar, TaskbarDivider, TaskbarItem, TaskbarSection };
