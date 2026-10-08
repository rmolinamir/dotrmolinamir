import { SidebarProvider } from "@acme/ui/components/sidebar";
import { TooltipProvider } from "@acme/ui/components/tooltip";
import type { ApplicationInstance } from "@acme/ui/os/application";
import * as ApplicationManager from "@acme/ui/os/application-manager";
import {
  ApplicationManagerProvider,
  useApplicationManager,
} from "@acme/ui/os/application-manager";
import { WindowBoundary } from "@acme/ui/os/window-boundary";
import {
  useWindowManager,
  WindowManagerProvider,
} from "@acme/ui/os/window-manager";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  defaultStringifySearch,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { useNotFound } from "@/hooks/use-not-found";
import { ApplicationSidebar } from "@/routes/-components/applications/application-sidebar";
import {
  SystemProvider,
  useSystem,
} from "@/routes/-components/system/system-provider";
import { TaskbarStart } from "@/routes/-components/taskbar/taskbar-start";
import { TaskbarTabStrip } from "@/routes/-components/taskbar/taskbar-tab-strip";
import { ApplicationRoutingProvider } from "./application-routing";
import { createApplicationRoute } from "./create-route-application";
import { parseWorkspace, serializeWorkspace } from "./workspace-url";

function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Count {count}
    </button>
  );
}

function setup({
  initialEntries = ["/"],
  content = Counter,
  loader,
}: {
  initialEntries?: string[];
  content?: React.ComponentType;
  loader?: () => Promise<void>;
} = {}) {
  const about = createApplicationRoute("/about")({
    component: content,
    launcher: () => <>Launch About</>,
    metadata: { title: "About" },
  });
  const doom = createApplicationRoute("/doom")({
    component: () => <input aria-label="Doom input" />,
    launcher: () => <>Launch Doom</>,
    metadata: { title: "Doom" },
  });
  let managers: {
    applications: ReturnType<typeof useApplicationManager>;
    windows: ReturnType<typeof useWindowManager>;
    system: ReturnType<typeof useSystem>;
  };

  function Desktop() {
    const { isNotFound } = useNotFound();
    const applications = useApplicationManager();
    const windows = useWindowManager();
    const system = useSystem();
    managers = { applications, system, windows };
    return (
      <>
        {!isNotFound && (
          <WindowBoundary>
            <about.Application.Component />
            <doom.Application.Component />
          </WindowBoundary>
        )}
        <about.Launcher />
        <doom.Launcher />
        <TaskbarTabStrip />
        <ApplicationSidebar />
        <TaskbarStart />
        <Outlet />
      </>
    );
  }

  const root = createRootRoute({
    component: () => (
      <ApplicationManagerProvider>
        <WindowManagerProvider>
          <SystemProvider>
            <TooltipProvider>
              <SidebarProvider>
                <ApplicationRoutingProvider>
                  <Desktop />
                </ApplicationRoutingProvider>
              </SidebarProvider>
            </TooltipProvider>
          </SystemProvider>
        </WindowManagerProvider>
      </ApplicationManagerProvider>
    ),
    notFoundComponent: () => <div>BSOD</div>,
  });
  const home = createRoute({
    component: () => null,
    getParentRoute: () => root,
    path: "/",
  });
  const aboutRoute = createRoute({
    component: about.Route,
    getParentRoute: () => root,
    loader,
    path: "/about",
  });
  const doomRoute = createRoute({
    component: doom.Route,
    getParentRoute: () => root,
    path: "/doom",
  });
  const history = createMemoryHistory({ initialEntries });
  const router = createRouter({
    history,
    routeTree: root.addChildren([home, aboutRoute, doomRoute]),
  });
  const rendered = render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );

  return {
    async expectPath(path: string) {
      await waitFor(() => {
        expect(router.state.status).toBe("idle");
        expect(router.state.location.pathname).toBe(path);
        const active = managers.windows.getTopWindow();
        expect(active?.id ?? "/").toBe(path);
        expect(managers.windows.focusedId ?? "/").toBe(path);
      });
    },
    history,
    get managers() {
      return managers;
    },
    async navigate(to: "/" | "/about" | "/doom") {
      await act(async () => {
        await router.navigate({ to });
      });
    },
    router,
    unmount: rendered.unmount,
  };
}

function windowFor(title: string) {
  const window = screen
    .getByText(title, { selector: "[data-slot=window-title]" })
    .closest<HTMLElement>("[data-slot=window]");
  if (!window) throw new Error(`No window for ${title}`);
  return window;
}

describe("active-window routing", () => {
  const frame = {
    position: { x: 10, y: 15 },
    size: { height: 70, width: 60 },
    unit: "percent" as const,
  };
  const isApp = (path: string) => path === "/about" || path === "/doom";

  it("restores a multi-window workspace on direct load and refresh", async () => {
    const search = serializeWorkspace({ campaign: "test" }, [
      { framing: frame, id: "/about", isHidden: true, zIndex: 1 },
      {
        framing: { ...frame, position: { x: 25, y: 20 } },
        id: "/doom",
        zIndex: 2,
      },
    ]);
    const app = setup({
      initialEntries: [`/doom${defaultStringifySearch(search)}#bookmark`],
    });
    await app.expectPath("/doom");
    await waitFor(() =>
      expect(app.managers.windows.getFraming("/about")).toEqual(frame),
    );
    expect(app.managers.windows.getIsHidden("/about")).toBe(true);
    expect(app.managers.applications.runningApplications).toHaveLength(2);
    expect(
      (app.router.state.location.search as Record<string, unknown>).campaign,
    ).toBe("test");
    expect(app.router.state.location.hash).toBe("bookmark");
    const url = app.router.state.location.href;
    app.unmount();
    const refreshed = setup({ initialEntries: [url] });
    await refreshed.expectPath("/doom");
    await waitFor(() =>
      expect(refreshed.managers.windows.getFraming("/about")).toEqual(frame),
    );
    expect(refreshed.managers.windows.getIsHidden("/about")).toBe(true);
    expect(refreshed.managers.applications.runningApplications).toHaveLength(2);
  });

  it("keeps all-minimized workspaces at / across refresh and restores from the taskbar", async () => {
    const search = serializeWorkspace({}, [
      { framing: frame, id: "/about", isHidden: true, zIndex: 1 },
      { framing: frame, id: "/doom", isHidden: true, zIndex: 2 },
    ]);
    const app = setup({
      initialEntries: [`/${defaultStringifySearch(search)}`],
    });
    await waitFor(() =>
      expect(app.managers.applications.runningApplications).toHaveLength(2),
    );
    await app.expectPath("/");
    expect(app.managers.windows.getIsHidden("/about")).toBe(true);
    expect(app.managers.windows.getIsHidden("/doom")).toBe(true);
    fireEvent.focus(screen.getByRole("tab", { name: "About" }));
    await app.expectPath("/about");
  });

  it("persists geometry/fullscreen and restores the original frame on exiting fullscreen", async () => {
    const app = setup({ initialEntries: ["/about?campaign=test#bookmark"] });
    await app.expectPath("/about");
    const historyLength = app.history.length;
    act(() => app.managers.windows.setFraming("/about", frame));
    await waitFor(() =>
      expect(
        parseWorkspace(app.router.state.location.search, isApp)[0]?.framing,
      ).toEqual(frame),
    );
    act(() => app.managers.windows.toggleFullscreen("/about"));
    await waitFor(() =>
      expect(
        parseWorkspace(app.router.state.location.search, isApp)[0]
          ?.isFullscreen,
      ).toBe(true),
    );
    expect(app.history.length).toBe(historyLength);
    expect(
      (app.router.state.location.search as Record<string, unknown>).campaign,
    ).toBe("test");
    expect(app.router.state.location.hash).toBe("bookmark");
    const url = app.router.state.location.href;
    app.unmount();
    const refreshed = setup({ initialEntries: [url] });
    await refreshed.expectPath("/about");
    await waitFor(() =>
      expect(refreshed.managers.windows.getIsFullscreen("/about")).toBe(true),
    );
    act(() => refreshed.managers.windows.toggleFullscreen("/about"));
    expect(refreshed.managers.windows.getFraming("/about")).toEqual(frame);
  });

  it("merges a shared layout without closing other apps or resetting their content", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Count 0"));
    const search = serializeWorkspace({}, [
      { framing: frame, id: "/doom", zIndex: 1 },
    ]);
    await act(async () => {
      await app.router.navigate({ search, to: "/doom" });
    });
    await app.expectPath("/doom");
    expect(app.managers.applications.runningApplications).toHaveLength(2);
    expect(screen.getByText("Count 1")).toBeDefined();
    expect(app.managers.windows.getFraming("/doom")).toEqual(frame);
  });

  it("replays saved layout from a history destination", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    act(() => app.managers.windows.setFraming("/about", frame));
    await waitFor(() =>
      expect(
        parseWorkspace(app.router.state.location.search, isApp)[0]?.framing,
      ).toEqual(frame),
    );
    await app.navigate("/doom");
    await app.expectPath("/doom");
    act(() =>
      app.managers.windows.setFraming("/about", {
        ...frame,
        position: { x: 20, y: 20 },
      }),
    );
    act(() => app.history.back());
    await app.expectPath("/about");
    await waitFor(() =>
      expect(app.managers.windows.getFraming("/about")).toEqual(frame),
    );
  });

  it("lets the pathname override contradictory saved focus and hidden state", async () => {
    const search = serializeWorkspace({}, [
      { framing: frame, id: "/about", isHidden: true, zIndex: 1 },
      { framing: frame, id: "/doom", zIndex: 2 },
    ]);
    const app = setup({
      initialEntries: [`/about${defaultStringifySearch(search)}`],
    });
    await app.expectPath("/about");
    await waitFor(() =>
      expect(app.managers.windows.getFraming("/doom")).toEqual(frame),
    );
    await app.expectPath("/about");
    expect(app.managers.windows.getIsHidden("/about")).toBe(false);
  });

  it("ignores unknown apps and invalid geometry without blocking route launch", async () => {
    const app = setup({
      initialEntries: ["/about?w=1%7Cmissing%7Cdoom%2CNaN%2C0%2C60%2C70"],
    });
    await app.expectPath("/about");
    await waitFor(() =>
      expect(app.managers.applications.runningApplications).toHaveLength(2),
    );
    expect(
      app.managers.applications.runningApplications.some(
        (app) => app.id === "/missing",
      ),
    ).toBe(false);
  });

  it.each(["navigation", "window focus"])(
    "reactivates the history destination after BSOD when reached through %s",
    async (source) => {
      const app = setup({ initialEntries: ["/about"] });
      await app.expectPath("/about");
      await app.navigate("/doom");
      await app.expectPath("/doom");
      if (source === "navigation") await app.navigate("/about");
      else act(() => app.managers.windows.activateWindow("/about"));
      await app.expectPath("/about");
      const destinationKey = app.router.state.location.state.__TSR_key;
      await act(async () => {
        await app.router.navigate({ href: "/missing" });
      });
      await screen.findByText("BSOD");
      expect(app.managers.windows.windows).toHaveLength(0);
      const historyLength = app.history.length;

      act(() => app.history.back());
      await app.expectPath("/about");
      expect(app.router.state.location.state.__TSR_key).toBe(destinationKey);
      expect(app.history.length).toBe(historyLength);
      expect(app.managers.applications.runningApplications).toHaveLength(2);

      act(() => app.history.forward());
      await screen.findByText("BSOD");
      act(() => app.history.back());
      await app.expectPath("/about");
    },
  );

  it("allows manager launches from an empty desktop and restores after an already-empty home visit", async () => {
    const app = setup();
    await app.expectPath("/");
    act(() =>
      app.managers.applications.launch({
        id: "/about",
        metadata: { title: "About" },
      }),
    );
    await app.expectPath("/about");
    await app.navigate("/");
    await app.expectPath("/");
    await app.navigate("/");
    await app.expectPath("/");
    fireEvent.focus(screen.getByRole("tab", { name: "About" }));
    await app.expectPath("/about");
  });

  it("activates the requested app after the desktop remounts from a not-found screen", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    await app.navigate("/doom");
    await app.expectPath("/doom");
    await act(async () => {
      await app.router.navigate({ href: "/missing" });
    });
    await screen.findByText("BSOD");
    expect(app.managers.windows.windows).toHaveLength(0);
    await app.navigate("/about");
    await app.expectPath("/about");
    expect(app.managers.applications.runningApplications).toHaveLength(2);
  });

  it("activates taskbar tabs when they receive keyboard focus", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    await app.navigate("/doom");
    await app.expectPath("/doom");
    fireEvent.focus(screen.getByRole("tab", { name: "About" }));
    await app.expectPath("/about");
    fireEvent.focus(screen.getByRole("tab", { name: "Doom" }));
    await app.expectPath("/doom");
  });

  it("keeps the requested URL across updates before a launch commits", async () => {
    const useManager = ApplicationManager.useApplicationManager;
    let launch!: (application: ApplicationInstance) => void;
    let commitLaunch: (() => void) | undefined;
    const deferLaunch = (application: ApplicationInstance) => {
      commitLaunch = () => launch(application);
    };
    const spy = vi
      .spyOn(ApplicationManager, "useApplicationManager")
      .mockImplementation(() => {
        const manager = useManager();
        launch = manager.launch;
        return { ...manager, launch: deferLaunch };
      });

    try {
      const app = setup({ initialEntries: ["/about"] });
      await waitFor(() => expect(commitLaunch).toBeDefined());
      await act(async () => {
        await app.router.invalidate();
      });
      expect(app.router.state.location.pathname).toBe("/about");
      expect(app.managers.windows.windows).toHaveLength(0);
      act(() => commitLaunch?.());
      await app.expectPath("/about");
    } finally {
      spy.mockRestore();
    }
  });

  it("restores from the sidebar and closes all with one replacement", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    await app.navigate("/doom");
    await app.expectPath("/doom");
    fireEvent.keyDown(document.body, { key: "H", shiftKey: true });
    await app.expectPath("/about");
    fireEvent.click(screen.getByRole("button", { name: "Doom" }));
    await app.expectPath("/doom");
    const historyLength = app.history.length;
    fireEvent.click(screen.getByRole("button", { name: "Close all" }));
    await app.expectPath("/");
    expect(app.history.length).toBe(historyLength);
    expect(app.managers.applications.runningApplications).toHaveLength(0);
  });

  it("relaunches the current app URL without duplicates or resetting content", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Count 0"));
    fireEvent.click(screen.getByText("Launch About"));
    await app.expectPath("/about");
    expect(screen.getByText("Count 1")).toBeDefined();
    expect(app.managers.applications.runningApplications).toHaveLength(1);
  });

  it("does not launch apps for modified launcher clicks", async () => {
    const app = setup();
    await app.expectPath("/");
    // Cancel the browser's new-tab default after React handles the click.
    document.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(screen.getByText("Launch About"), { ctrlKey: true });
    await app.expectPath("/");
    expect(app.managers.applications.runningApplications).toHaveLength(0);
  });

  it("keeps the latest window state when a synchronization navigation loads slowly", async () => {
    let loading: Promise<void> | undefined;
    let resolve!: () => void;
    const app = setup({
      initialEntries: ["/about"],
      loader: async () => loading,
    });
    await app.expectPath("/about");
    await app.navigate("/doom");
    await app.expectPath("/doom");
    loading = new Promise<void>((done) => {
      resolve = done;
    });
    act(() => app.managers.windows.activateWindow("/about"));
    await waitFor(() => expect(app.router.state.isLoading).toBe(true));
    act(() =>
      app.managers.applications.close({
        id: "/about",
        metadata: { title: "About" },
      }),
    );
    await act(async () => {
      resolve();
    });
    await app.expectPath("/doom");
    expect(
      app.managers.applications.runningApplications.map((app) => app.id),
    ).toEqual(["/doom"]);
  });

  it("does not reopen a lazy window that was closed before its content loaded", async () => {
    let resolve!: (value: { default: typeof Counter }) => void;
    const content = React.lazy(
      () =>
        new Promise<{ default: typeof Counter }>((done) => {
          resolve = done;
        }),
    );
    const app = setup({ content, initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.keyDown(document.body, { key: "W", shiftKey: true });
    await app.expectPath("/");
    await act(async () => {
      resolve({ default: Counter });
    });
    await app.expectPath("/");
    expect(app.managers.applications.runningApplications).toHaveLength(0);
    expect(app.managers.system.loadingApplications).toHaveLength(0);
  });

  it("launches direct URLs once and keeps content across focus, minimize, and restoration", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Count 0"));
    await app.navigate("/doom");
    await app.expectPath("/doom");
    fireEvent.mouseDown(windowFor("About"));
    await app.expectPath("/about");
    expect(screen.getByText("Count 1")).toBeDefined();
    fireEvent.keyDown(document.body, { key: "H", shiftKey: true });
    await app.expectPath("/doom");
    expect(app.managers.windows.getIsHidden("/about")).toBe(true);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "About" }), {
      button: 0,
      ctrlKey: false,
    });
    await app.expectPath("/about");
    expect(screen.getByText("Count 1")).toBeDefined();
    expect(app.managers.applications.runningApplications).toHaveLength(2);
  });

  it("follows the next visible window on close and leaves inactive changes alone", async () => {
    const app = setup();
    await app.expectPath("/");
    fireEvent.click(screen.getByText("Launch About"));
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Launch Doom"));
    await app.expectPath("/doom");
    act(() => app.managers.windows.hideWindow("/about"));
    await app.expectPath("/doom");
    act(() =>
      app.managers.applications.close({
        id: "/about",
        metadata: { title: "About" },
      }),
    );
    await app.expectPath("/doom");
    await app.navigate("/about");
    await app.expectPath("/about");
    fireEvent.click(
      within(windowFor("About")).getByRole("button", { name: "Close" }),
    );
    await app.expectPath("/doom");
    fireEvent.keyDown(document.body, { key: "W", shiftKey: true });
    await app.expectPath("/");
    expect(app.managers.applications.runningApplications).toHaveLength(0);
    expect(parseWorkspace(app.router.state.location.search, isApp)).toEqual([]);
  });

  it("uses / when all windows are hidden and does not restore them during synchronization", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.click(
      within(windowFor("About")).getByRole("button", { name: "Hide" }),
    );
    await app.expectPath("/");
    expect(app.managers.windows.getIsHidden("/about")).toBe(true);
    expect(app.managers.applications.runningApplications).toHaveLength(1);
    await app.navigate("/about");
    await app.expectPath("/about");
    expect(app.managers.applications.runningApplications).toHaveLength(1);
  });

  it("minimizes visible windows on explicit home navigation without losing content", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Count 0"));
    await app.navigate("/doom");
    await app.expectPath("/doom");
    await app.navigate("/");
    await app.expectPath("/");
    expect(app.managers.windows.getIsHidden("/about")).toBe(true);
    expect(app.managers.windows.getIsHidden("/doom")).toBe(true);
    await app.navigate("/about");
    await app.expectPath("/about");
    expect(screen.getByText("Count 1")).toBeDefined();
  });

  it("pushes launches, replaces window transitions, and replays history as navigation", async () => {
    const app = setup();
    await app.expectPath("/");
    fireEvent.click(screen.getByText("Launch About"));
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Launch Doom"));
    await app.expectPath("/doom");
    expect(app.history.length).toBe(3);
    fireEvent.focus(screen.getByText("Count 0"));
    await app.expectPath("/about");
    expect(app.history.length).toBe(3);
    fireEvent.keyDown(document.body, { key: "W", shiftKey: true });
    await app.expectPath("/doom");
    act(() => app.history.back());
    await app.expectPath("/about");
    expect(app.managers.applications.runningApplications).toHaveLength(2);
    act(() => app.history.forward());
    await app.expectPath("/doom");
    act(() => app.history.go(-2));
    await app.expectPath("/");
    act(() => app.history.forward());
    await app.expectPath("/about");
  });

  it("keeps a lazy window controllable and does not steal focus when content finishes loading", async () => {
    let resolve!: (value: { default: typeof Counter }) => void;
    const content = React.lazy(
      () =>
        new Promise<{ default: typeof Counter }>((done) => {
          resolve = done;
        }),
    );
    const app = setup({ content, initialEntries: ["/about"] });
    await app.expectPath("/about");
    expect(app.managers.system.loadingApplications).toHaveLength(1);
    await app.navigate("/doom");
    await app.expectPath("/doom");
    await act(async () => {
      resolve({ default: Counter });
    });
    await app.expectPath("/doom");
    expect(app.managers.system.loadingApplications).toHaveLength(0);
    expect(app.managers.applications.runningApplications).toHaveLength(2);
  });

  it("waits for initial route loading and settles rapid focus changes without extra launches", async () => {
    let resolve!: () => void;
    const loading = new Promise<void>((done) => {
      resolve = done;
    });
    const app = setup({ initialEntries: ["/about"], loader: () => loading });
    await waitFor(() => expect(app.router.state.isLoading).toBe(true));
    expect(app.router.state.location.pathname).toBe("/about");
    await act(async () => {
      resolve();
    });
    await app.expectPath("/about");
    await app.navigate("/doom");
    await app.expectPath("/doom");
    act(() => {
      app.managers.windows.activateWindow("/about");
      app.managers.windows.activateWindow("/doom");
      app.managers.windows.activateWindow("/about");
    });
    await app.expectPath("/about");
    expect(app.managers.applications.runningApplications).toHaveLength(2);
  });

  it("does not redirect not-found or powered-off screens, and allows recovery", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    await act(async () => {
      await app.router.navigate({ href: "/missing" });
    });
    await screen.findByText("BSOD");
    expect(app.router.state.location.pathname).toBe("/missing");
    act(() => app.managers.system.shutdown());
    expect(app.router.state.location.pathname).toBe("/missing");
    act(() => app.managers.system.boot());
    await app.navigate("/");
    await app.expectPath("/");
    await app.navigate("/about");
    await app.expectPath("/about");
    act(() => app.managers.system.shutdown());
    act(() => app.managers.windows.hideWindow("/about"));
    expect(app.router.state.location.pathname).toBe("/about");
    act(() => app.managers.system.boot());
    await app.expectPath("/");
  });

  it("keeps applications and their state when opening and dismissing Start", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    fireEvent.click(screen.getByText("Count 0"));
    await app.navigate("/doom");
    await app.expectPath("/doom");
    const applicationIds = app.managers.applications.runningApplications.map(
      (application) => application.id,
    );
    const location = app.router.state.location.href;

    fireEvent.click(screen.getByRole("button", { name: "Open start menu" }));
    const quitItem = await screen.findByRole("menuitem", {
      name: "Quit applications",
    });
    expect(
      app.managers.applications.runningApplications.map(
        (application) => application.id,
      ),
    ).toEqual(applicationIds);
    expect(app.router.state.location.href).toBe(location);
    expect(screen.getByText("Count 1")).toBeTruthy();

    fireEvent.keyDown(quitItem, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await app.expectPath("/doom");
    expect(
      app.managers.applications.runningApplications.map(
        (application) => application.id,
      ),
    ).toEqual(applicationIds);
    expect(screen.getByText("Count 1")).toBeTruthy();
  });

  it("quits all applications without relaunching a closing window", async () => {
    const app = setup({ initialEntries: ["/about"] });
    await app.expectPath("/about");
    await app.navigate("/doom");
    await app.expectPath("/doom");
    fireEvent.click(screen.getByRole("button", { name: "Open start menu" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Quit applications" }),
    );
    await app.expectPath("/");
    expect(app.managers.applications.runningApplications).toHaveLength(0);
  });
});
