import React from "react";
import { Button } from "../components/button";
import { CardAction } from "../components/card";
import { Kbd, KbdGroup } from "../components/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/tooltip";
import { cn } from "../lib/utils";
import { useApplication, useApplicationId } from "./application";
import { useWindow } from "./window";
import { useWindowManager } from "./window-manager";

const ACTIONS_TOOLTIP_DELAY_DURATION = 150;

const INPUT_TAGNAME = "INPUT";
const INPUT_TEXTAREA = "TEXTAREA";
const INPUT_SELECT = "SELECT";
const KEYBOARD_SHORTCUT_CLOSE = "w";
const KEYBOARD_SHORTCUT_FULLSCREEN = "f";
const KEYBOARD_SHORTCUT_HIDE = "h";

function useKeyboardShortcutAction(
  letter: string,
  onTrigger: (event: KeyboardEvent) => void,
) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (!event.shiftKey) return;
      if (event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key.toLowerCase() !== letter.toLowerCase()) return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          target.isContentEditable ||
          tagName === INPUT_TAGNAME ||
          tagName === INPUT_TEXTAREA ||
          tagName === INPUT_SELECT ||
          target.closest("[contenteditable='true']")
        ) {
          return;
        }
      }

      event.preventDefault();
      onTrigger(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [letter, onTrigger]);
}

function WindowControls({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <CardAction
      ref={ref}
      data-slot="window-controls"
      className={cn("flex cursor-default items-center gap-1", className)}
      {...props}
    />
  );
}

function WindowAction({
  className,
  size = "icon-sm",
  variant = "outline",
  ref,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      ref={ref}
      data-slot="window-control"
      data-window-control
      size={size}
      variant={variant}
      className={cn(
        "bg-background! text-foreground hover:bg-secondary! hover:text-secondary-foreground!",
        className,
      )}
      {...props}
    />
  );
}

function WindowHideButton({
  onClick,
  ref,
  ...props
}: React.ComponentProps<typeof WindowAction>) {
  const { toggleHidden } = useWindow();
  const applicationId = useApplicationId();
  const { focusedId } = useWindowManager();

  const handleToggleHidden = React.useCallback(() => {
    toggleHidden();
  }, [toggleHidden]);

  useKeyboardShortcutAction(KEYBOARD_SHORTCUT_HIDE, () => {
    if (!applicationId || focusedId !== applicationId) return;
    handleToggleHidden();
  });

  return (
    <Tooltip delayDuration={ACTIONS_TOOLTIP_DELAY_DURATION}>
      <TooltipTrigger asChild>
        <WindowAction
          ref={ref}
          data-window-hide
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            toggleHidden();
          }}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        <span className="flex flex-col items-center gap-2">
          <div>Hide window</div>
          <KbdGroup>
            <Kbd>Shift</Kbd>
            <Kbd>H</Kbd>
          </KbdGroup>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function WindowFullscreenButton({
  onClick,
  ref,
  ...props
}: React.ComponentProps<typeof WindowAction>) {
  const { toggleFullscreen, isFullscreen } = useWindow();
  const applicationId = useApplicationId();
  const { focusedId } = useWindowManager();

  const handleToggleFullscreen = React.useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  useKeyboardShortcutAction(KEYBOARD_SHORTCUT_FULLSCREEN, () => {
    if (!applicationId || focusedId !== applicationId) return;
    handleToggleFullscreen();
  });

  return (
    <Tooltip delayDuration={ACTIONS_TOOLTIP_DELAY_DURATION}>
      <TooltipTrigger asChild>
        <WindowAction
          ref={ref}
          data-window-fullscreen
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            toggleFullscreen();
          }}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        <span className="flex flex-col items-center gap-2">
          <div>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</div>
          <KbdGroup>
            <Kbd>Shift</Kbd>
            <Kbd>F</Kbd>
          </KbdGroup>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function WindowCloseButton({
  onClick,
  ref,
  ...props
}: React.ComponentProps<typeof WindowAction>) {
  const { close } = useApplication();
  const applicationId = useApplicationId();
  const { focusedId } = useWindowManager();
  const handleClose = React.useCallback(() => {
    close();
  }, [close]);

  useKeyboardShortcutAction(KEYBOARD_SHORTCUT_CLOSE, () => {
    if (!applicationId || focusedId !== applicationId) return;
    handleClose();
  });

  return (
    <Tooltip delayDuration={ACTIONS_TOOLTIP_DELAY_DURATION}>
      <TooltipTrigger asChild>
        <WindowAction
          ref={ref}
          data-window-fullscreen
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            close();
          }}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        <span className="flex flex-col items-center gap-2">
          <div>Close window</div>
          <KbdGroup>
            <Kbd>Shift</Kbd>
            <Kbd>W</Kbd>
          </KbdGroup>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export {
  WindowAction,
  WindowCloseButton,
  WindowControls,
  WindowFullscreenButton,
  WindowHideButton,
};
