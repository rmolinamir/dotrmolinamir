import { SidebarProvider, SidebarWrapper } from "@acme/ui/components/sidebar";
import { TooltipProvider } from "@acme/ui/components/tooltip";
import { ApplicationManagerProvider } from "@acme/ui/os/application-manager";
import { Taskbar, TaskbarItem, TaskbarSection } from "@acme/ui/os/taskbar";
import { WindowBoundary } from "@acme/ui/os/window-boundary";
import { WindowManagerProvider } from "@acme/ui/os/window-manager";
import { WindowSnap } from "@acme/ui/os/window-snap";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PanelRightOpen } from "lucide-react";
import * as React from "react";
import { expect, within } from "storybook/test";
import { ApplicationManagerSidebar } from "../scenes/desktop/application-manager-sidebar";
import {
  InsightsApplication,
  InsightsApplicationLauncher,
  MailApplication,
  MailApplicationLauncher,
  NotesApplication,
  NotesApplicationLauncher,
} from "../scenes/desktop/applications";
import { MoreMenu, ProductMenu } from "../scenes/desktop/taskbar-menus";

const meta = {
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "OS/Taskbar",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Orbit Desk" }));
    await expect(
      await within(document.body).findByRole("menuitem", {
        name: /Mission control/,
      }),
    ).toBeVisible();
  },
  render: () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const toggleRef = React.useRef<HTMLButtonElement | null>(null);

    React.useEffect(() => {
      if (!sidebarOpen) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (panelRef.current?.contains(target)) return;
        if (toggleRef.current?.contains(target)) return;
        setSidebarOpen(false);
      };

      document.addEventListener("pointerdown", handlePointerDown, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
      };
    }, [sidebarOpen]);

    return (
      <TooltipProvider>
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SidebarWrapper
            className="flex flex-col bg-transparent"
            style={{ "--sidebar-width": "22rem" } as React.CSSProperties}
          >
            <WindowManagerProvider>
              <ApplicationManagerProvider>
                <div className="flex h-full min-h-dvh w-full flex-col bg-[#e9e2d2]">
                  <WindowBoundary className="h-full w-full flex-1">
                    <WindowSnap>
                      {/* Application layer. */}
                      <MailApplication.Component />
                      <NotesApplication.Component />
                      <InsightsApplication.Component />

                      {/* Desktop layer. */}
                      <div ref={panelRef}>
                        <ApplicationManagerSidebar />
                      </div>
                      <div className="m-4">
                        <MailApplicationLauncher />
                        <NotesApplicationLauncher />
                        <InsightsApplicationLauncher />
                      </div>
                    </WindowSnap>
                  </WindowBoundary>

                  <Taskbar className="mx-4 my-2 rounded-full border border-black/10 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
                    <TaskbarSection
                      align="start"
                      className="gap-1 text-slate-700 text-sm"
                      grow
                    >
                      <TaskbarItem
                        variant="icon"
                        className="text-slate-700 hover:bg-black/5"
                      >
                        <span className="h-7 bg-slate-900 text-white">OS</span>
                      </TaskbarItem>
                      <ProductMenu />
                      <MoreMenu />
                    </TaskbarSection>

                    <TaskbarSection>
                      <TaskbarItem
                        variant="icon"
                        aria-label="Window manager"
                        active={sidebarOpen}
                        className="text-slate-700 hover:bg-black/5"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        ref={toggleRef}
                      >
                        <PanelRightOpen className="size-4" />
                      </TaskbarItem>
                    </TaskbarSection>
                  </Taskbar>
                </div>
              </ApplicationManagerProvider>
            </WindowManagerProvider>
          </SidebarWrapper>
        </SidebarProvider>
      </TooltipProvider>
    );
  },
};
