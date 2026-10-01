import { Button } from "@acme/ui/components/button";
import { TooltipProvider } from "@acme/ui/components/tooltip";
import { useInitialWindowFraming } from "@acme/ui/hooks/use-initial-window-framing";
import {
  getCascadingWindowFraming,
  getCenteredWindowFraming,
  Window,
} from "@acme/ui/os/window";
import {
  WindowControls,
  WindowFullscreenButton,
  WindowHideButton,
} from "@acme/ui/os/window-actions";
import { useWindowBoundary, WindowBoundary } from "@acme/ui/os/window-boundary";
import {
  WindowCaption,
  WindowContent,
  WindowFooter,
  WindowHeader,
  WindowTitle,
} from "@acme/ui/os/window-layout";
import {
  useWindowManager,
  WindowManagerProvider,
} from "@acme/ui/os/window-manager";
import { WindowSnap } from "@acme/ui/os/window-snap";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, within } from "storybook/test";
import { FloatingHiddenWindows } from "../scenes/taskbar/floating-hidden-windows";

const meta = {
  component: Window,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "OS/Window",
} satisfies Meta<typeof Window>;

export default meta;

type Story = StoryObj<typeof meta>;

function WindowControlsHeader() {
  return (
    <WindowHeader>
      <div className="space-y-0.5">
        <WindowTitle>Window Controls</WindowTitle>
        <WindowCaption>
          Click on the controls to interact with the window.
        </WindowCaption>
      </div>
      <WindowControls>
        <WindowHideButton aria-label="Hide">—</WindowHideButton>
        <WindowFullscreenButton aria-label="Fullscreen">
          □
        </WindowFullscreenButton>
      </WindowControls>
    </WindowHeader>
  );
}

export const Default: Story = {
  render: () => (
    <WindowManagerProvider>
      <WindowBoundary className="relative h-160 w-full overflow-hidden bg-muted/30 p-6">
        <Window>
          <WindowHeader>
            <WindowTitle>About</WindowTitle>
          </WindowHeader>
          <WindowContent>
            <div className="space-y-3 text-sm">
              <p className="font-medium">Robert Molina</p>
              <p>
                Staff Software Engineer focused on building high-scale web
                experiences with modern React and Next.js.
              </p>
              <p className="text-muted-foreground">
                Drag the window by its header, resize from the edges, and
                customize content as needed.
              </p>
            </div>
          </WindowContent>
        </Window>
      </WindowBoundary>
    </WindowManagerProvider>
  ),
};

export const FixedShell: Story = {
  render: () => (
    <div className="bg-blue-100 p-6">
      <WindowManagerProvider>
        <WindowBoundary className="relative m-6 h-70 w-120 overflow-hidden border border-red-500 bg-green-200">
          <WindowSnap>
            <Window className="bg-white">
              <WindowHeader>
                <WindowTitle>Fixed Shell</WindowTitle>
              </WindowHeader>
              <WindowContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Fixed height shell</p>
                  <p className="text-muted-foreground">
                    Windows are bound to this shell.
                  </p>
                </div>
              </WindowContent>
            </Window>
          </WindowSnap>
        </WindowBoundary>
      </WindowManagerProvider>
    </div>
  ),
};

export const FluidShell: Story = {
  render: () => (
    <WindowManagerProvider>
      <div className="h-180 w-full">
        <WindowBoundary className="relative h-full w-full overflow-hidden bg-muted/30 p-6">
          <WindowSnap>
            <Window>
              <WindowHeader>
                <WindowTitle>Fluid Shell</WindowTitle>
              </WindowHeader>
              <WindowContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Percent-based shell</p>
                  <p className="text-muted-foreground">
                    Shell fills its parent container.
                  </p>
                </div>
              </WindowContent>
            </Window>
          </WindowSnap>
        </WindowBoundary>
      </div>
    </WindowManagerProvider>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <WindowManagerProvider>
      <WindowBoundary className="relative h-160 w-full overflow-hidden bg-muted/30 p-6">
        <Window>
          <WindowHeader>
            <div className="space-y-0.5">
              <WindowTitle>Explorer</WindowTitle>
              <WindowCaption>~/Projects/website</WindowCaption>
            </div>
          </WindowHeader>
          <WindowContent>
            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border border-muted-foreground/40 border-dashed px-3 py-4">
                Folder view content goes here.
              </div>
              <div className="rounded-lg border border-muted-foreground/40 border-dashed px-3 py-4">
                You can reuse this for file previews or lists.
              </div>
            </div>
          </WindowContent>
          <WindowFooter className="text-muted-foreground text-xs">
            12 items · 3.4 MB
          </WindowFooter>
        </Window>
      </WindowBoundary>
    </WindowManagerProvider>
  ),
};

export const MultiWindow: Story = {
  render: () => (
    <WindowManagerProvider>
      <WindowBoundary className="relative h-160 w-full overflow-hidden bg-muted/30 p-6">
        <Window
          defaultFraming={{
            position: { x: 8, y: 8 },
            size: { height: 50, width: 50 },
          }}
        >
          <WindowHeader>
            <WindowTitle>About</WindowTitle>
          </WindowHeader>
          <WindowContent>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Robert Molina</p>
              <p className="text-muted-foreground">
                Focus a window by clicking its header.
              </p>
            </div>
          </WindowContent>
        </Window>

        <Window
          defaultFraming={{
            position: { x: 28, y: 18 },
            size: { height: 50, width: 50 },
          }}
        >
          <WindowHeader>
            <div className="space-y-0.5">
              <WindowTitle>Explorer</WindowTitle>
              <WindowCaption>~/Projects/website</WindowCaption>
            </div>
          </WindowHeader>
          <WindowContent>
            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border border-muted-foreground/40 border-dashed px-3 py-4">
                This window is focused when it sits on top.
              </div>
              <div className="rounded-lg border border-muted-foreground/40 border-dashed px-3 py-4">
                Drag each window independently.
              </div>
            </div>
          </WindowContent>
          <WindowFooter className="text-muted-foreground text-xs">
            12 items · 3.4 MB
          </WindowFooter>
        </Window>
      </WindowBoundary>
    </WindowManagerProvider>
  ),
};

export const ConstrainedBounds: Story = {
  render: () => (
    <WindowManagerProvider>
      <WindowBoundary className="relative h-180 w-full overflow-hidden bg-muted/30">
        <div className="flex h-14 items-center justify-between border-b bg-background/80 px-4 text-muted-foreground text-sm">
          <span>Top Bar</span>
          <span>Taskbar Area</span>
        </div>
        <div className="relative h-[calc(100%-3.5rem)] p-6">
          <Window>
            <WindowHeader>
              <WindowTitle>Constrained Window</WindowTitle>
            </WindowHeader>
            <WindowContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Bounds: parent container</p>
                <p className="text-muted-foreground">
                  Try dragging and resizing — the window stays inside the
                  workspace area below the top bar.
                </p>
              </div>
            </WindowContent>
          </Window>
        </div>
      </WindowBoundary>
    </WindowManagerProvider>
  ),
};

export const WithSnapping: Story = {
  render: () => (
    <WindowManagerProvider>
      <WindowBoundary className="relative h-180 w-full overflow-hidden bg-muted/30 p-6">
        <WindowSnap>
          <Window
            defaultFraming={{
              position: { x: 8, y: 8 },
              size: { height: 50, width: 50 },
            }}
          >
            <WindowHeader>
              <WindowTitle>About</WindowTitle>
            </WindowHeader>
            <WindowContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Snap Assist</p>
                <p className="text-muted-foreground">
                  Drag a window to the left or right edge to preview snapping.
                </p>
              </div>
            </WindowContent>
          </Window>

          <Window
            defaultFraming={{
              position: { x: 30, y: 16 },
              size: { height: 50, width: 50 },
            }}
          >
            <WindowHeader>
              <WindowTitle>Explorer</WindowTitle>
            </WindowHeader>
            <WindowContent>
              <div className="grid gap-3 text-sm">
                <div className="rounded-lg border border-muted-foreground/40 border-dashed px-3 py-4">
                  Snap to the right half.
                </div>
                <div className="rounded-lg border border-muted-foreground/40 border-dashed px-3 py-4">
                  Overlay appears on hover.
                </div>
              </div>
            </WindowContent>
            <WindowFooter className="text-muted-foreground text-xs">
              Drag to edges
            </WindowFooter>
          </Window>
        </WindowSnap>
      </WindowBoundary>
    </WindowManagerProvider>
  ),
};

export const WithControls: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const hide = canvas.getAllByRole("button", { name: "Hide" })[2];
    if (!hide) throw new Error("Expected a window hide control");
    const window = hide.closest('[data-slot="window"]');
    if (!window) throw new Error("Expected a window around the hide control");

    await userEvent.click(hide);
    await expect(window).toHaveAttribute("data-hidden", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Show" }));
    await expect(window).toHaveAttribute("data-hidden", "false");

    const fullscreen = canvas.getAllByRole("button", { name: "Fullscreen" })[2];
    if (!fullscreen) throw new Error("Expected a fullscreen control");
    await userEvent.click(fullscreen);
    await expect(window).toHaveAttribute("data-fullscreen", "true");
  },
  render: () => (
    <TooltipProvider>
      <WindowManagerProvider>
        <WindowBoundary className="relative h-180 w-full overflow-hidden bg-muted/30 p-6">
          <FloatingHiddenWindows />
          <Window
            defaultFraming={{
              position: { x: 10, y: 12 },
              size: { height: 45, width: 40 },
            }}
          >
            <WindowControlsHeader />
            <WindowContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Double-click the header.</p>
                <p className="text-muted-foreground">
                  Use the hide button to move it to the taskbar.
                </p>
              </div>
            </WindowContent>
          </Window>
          <Window
            defaultFraming={{
              position: { x: 58, y: 30 },
              size: { height: 42, width: 38 },
            }}
          >
            <WindowControlsHeader />
            <WindowContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Third window</p>
                <p className="text-muted-foreground">
                  Taskbar entries restore hidden windows.
                </p>
              </div>
            </WindowContent>
          </Window>
          <Window
            defaultFraming={{
              position: { x: 34, y: 22 },
              size: { height: 46, width: 42 },
            }}
          >
            <WindowControlsHeader />
            <WindowContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Second window</p>
                <p className="text-muted-foreground">
                  Try hiding this one too.
                </p>
              </div>
            </WindowContent>
          </Window>
        </WindowBoundary>
      </WindowManagerProvider>
    </TooltipProvider>
  ),
};

export const CenteredFraming: Story = {
  render: () => {
    function CenteredWindow(
      props: Omit<React.ComponentProps<typeof Window>, "defaultFraming">,
    ) {
      const defaultFraming = useInitialWindowFraming(() =>
        getCenteredWindowFraming({ height: 90, width: 90 }),
      );

      return defaultFraming ? (
        <Window defaultFraming={defaultFraming} {...props} />
      ) : null;
    }

    return (
      <WindowManagerProvider>
        <WindowBoundary className="relative h-160 w-full overflow-hidden bg-blue-300/30 p-6">
          <CenteredWindow className="bg-white">
            <WindowHeader>
              <WindowTitle>Centered Framing</WindowTitle>
            </WindowHeader>
            <WindowContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Centered by factory</p>
                <p className="text-muted-foreground">
                  Uses getCenteredWindowFraming with an explicit size.
                </p>
              </div>
            </WindowContent>
          </CenteredWindow>
        </WindowBoundary>
      </WindowManagerProvider>
    );
  },
};

export const CascadingFraming: Story = {
  render: () => {
    const [windowIds, setWindowIds] = React.useState<number[]>([1]);

    const openWindow = React.useCallback(() => {
      setWindowIds((prev) => [...prev, prev.length + 1]);
    }, []);

    return (
      <WindowManagerProvider>
        <WindowBoundary className="relative h-180 w-full overflow-hidden bg-muted/30 p-6">
          {windowIds.map((id) => (
            <CascadingWindow key={id} id={id} onOpen={openWindow} />
          ))}
        </WindowBoundary>
      </WindowManagerProvider>
    );
  },
};

type CascadingWindowProps = {
  id: number;
  onOpen: () => void;
};

function CascadingWindow({ id, onOpen }: CascadingWindowProps) {
  const { size: bounds } = useWindowBoundary();
  const { getTopWindow } = useWindowManager();
  const defaultFraming = useInitialWindowFraming(() => {
    if (!bounds) return null;
    return getCascadingWindowFraming({
      bounds,
      size: { height: 65, width: 55 },
      topWindowFraming: getTopWindow()?.framing ?? null,
    });
  });

  return (
    <Window id={`cascade-${id}`} defaultFraming={defaultFraming ?? undefined}>
      <WindowHeader>
        <WindowTitle>Window {id}</WindowTitle>
      </WindowHeader>
      <WindowContent>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Cascading placement</p>
          <p className="text-muted-foreground">
            Opens offset from the top window.
          </p>
          <Button onClick={onOpen} size="sm">
            Open Window
          </Button>
        </div>
      </WindowContent>
    </Window>
  );
}
