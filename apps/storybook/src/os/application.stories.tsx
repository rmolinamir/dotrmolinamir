import { TooltipProvider } from "@acme/ui/components/tooltip";
import { defineApplication, useApplication } from "@acme/ui/os/application";
import {
  ApplicationManagerProvider,
  useApplicationManager,
} from "@acme/ui/os/application-manager";
import {
  Launcher,
  LauncherContent,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { Window } from "@acme/ui/os/window";
import {
  WindowAction,
  WindowControls,
  WindowFullscreenButton,
  WindowHideButton,
} from "@acme/ui/os/window-actions";
import { WindowBoundary } from "@acme/ui/os/window-boundary";
import {
  WindowContent,
  WindowHeader,
  WindowTitle,
} from "@acme/ui/os/window-layout";
import {
  useWindowManager,
  WindowManagerProvider,
} from "@acme/ui/os/window-manager";
import { WindowSnap } from "@acme/ui/os/window-snap";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notebook, User } from "lucide-react";
import * as React from "react";
import { PurpleWallpaper } from "../scenes/desktop/purple-wallpaper";

const meta = {
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "OS/Applications",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isActivated, setIsActivated] = React.useState(false);

    React.useEffect(() => {
      let buffer = "";
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key.length !== 1) return;
        buffer = `${buffer}${event.key}`.slice(-24);
        const normalized = buffer.toLowerCase();
        if (normalized.includes("doughnut")) {
          setIsActivated(true);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
      <TooltipProvider>
        <ApplicationManagerProvider>
          <WindowManagerProvider>
            <PurpleWallpaper className="flex h-dvh flex-col">
              <WindowBoundary className="h-full">
                <WindowSnap>
                  {/* Applications layer. */}
                  <AboutApplication.Component />
                  <NotesApplication.Component />

                  {/* Desktop layer. */}
                  <div className="m-6 text-sm font-semibold tracking-wide text-white select-none">
                    Win-doughs 11
                  </div>
                  {!isActivated && (
                    <div className="pointer-events-none absolute top-6 right-6 text-white/70 select-none">
                      <div className="text-[13px] font-medium">
                        Activate Win-dough
                      </div>
                      <div className="text-[11px] text-white/35">
                        Type <code>`doughnut`</code> to activate Win-dough.
                      </div>
                    </div>
                  )}
                  <div className="m-6">
                    <AboutApplicationLauncher />
                    <NotesApplicationLauncher />
                  </div>
                </WindowSnap>
              </WindowBoundary>
              <div className="m-4">
                <nav className="flex h-12 w-full items-center gap-3 border border-white/10 bg-black/40 px-4 text-white shadow-xl backdrop-blur-md">
                  <div className="flex flex-1 items-center gap-2">
                    <ApplicationTaskbarItems />
                  </div>
                  <div className="text-xs text-white/70">10:24</div>
                </nav>
              </div>
            </PurpleWallpaper>
          </WindowManagerProvider>
        </ApplicationManagerProvider>
      </TooltipProvider>
    );
  },
};

function ApplicationControls() {
  const { close } = useApplication();

  return (
    <WindowControls>
      <WindowHideButton aria-label="Hide">—</WindowHideButton>
      <WindowFullscreenButton aria-label="Fullscreen">□</WindowFullscreenButton>
      <WindowAction aria-label="Close" onClick={() => close()}>
        ×
      </WindowAction>
    </WindowControls>
  );
}

// Pretend code-splitting is happening here
const AboutContent = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="space-y-2 text-sm">
        <p className="font-medium">About Application</p>
        <p className="text-muted-foreground">
          This app renders its own window content.
        </p>
      </div>
    ),
  }),
);

const AboutApplication = defineApplication("about-application")({
  component: () => (
    <Window
      className="text-white"
      defaultFraming={{
        position: { x: 12, y: 12 },
        size: { height: 46, width: 45 },
      }}
    >
      <WindowHeader>
        <WindowTitle>About</WindowTitle>
        <ApplicationControls />
      </WindowHeader>
      <WindowContent>
        <React.Suspense
          fallback={
            <div className="space-y-2 text-sm">
              <div className="bg-muted/60 h-4 w-32 rounded" />
              <div className="bg-muted/50 h-3 w-48 rounded" />
              <div className="bg-muted/50 h-3 w-40 rounded" />
            </div>
          }
        >
          <AboutContent />
        </React.Suspense>
      </WindowContent>
    </Window>
  ),
  metadata: {
    title: "About",
  },
});

function AboutApplicationLauncher() {
  const { launchWindow: launch } = AboutApplication.useApplication();

  return (
    <Launcher
      className="text-white/90"
      onClick={(event) => {
        event.preventDefault();
        launch();
      }}
    >
      <LauncherContent>
        <LauncherIcon className="bg-white/10 text-white ring-white/20">
          <User />
        </LauncherIcon>
        <LauncherLabel className="text-white/90">
          {AboutApplication.getMetadata().title}
        </LauncherLabel>
      </LauncherContent>
    </Launcher>
  );
}

// Pretend code-splitting is happening here
const NotesContent = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="space-y-2 text-sm">
        <p className="font-medium">Notes Application</p>
        <p className="text-muted-foreground">
          Another lazy-loaded application window.
        </p>
      </div>
    ),
  }),
);

const NotesApplication = defineApplication("notes-application")({
  component: () => (
    <Window
      className="text-white"
      defaultFraming={{
        position: { x: 42, y: 18 },
        size: { height: 48, width: 42 },
      }}
    >
      <WindowHeader>
        <WindowTitle>Notes</WindowTitle>
        <ApplicationControls />
      </WindowHeader>
      <WindowContent>
        <React.Suspense
          fallback={
            <div className="space-y-2 text-sm">
              <div className="bg-muted/60 h-4 w-28 rounded" />
              <div className="bg-muted/50 h-3 w-52 rounded" />
              <div className="bg-muted/50 h-3 w-44 rounded" />
            </div>
          }
        >
          <NotesContent />
        </React.Suspense>
      </WindowContent>
    </Window>
  ),
  metadata: {
    title: "Notes",
  },
});

function NotesApplicationLauncher() {
  const { launchWindow: launch } = NotesApplication.useApplication();

  return (
    <Launcher
      className="text-white/90"
      onClick={(event) => {
        event.preventDefault();
        launch();
      }}
    >
      <LauncherContent>
        <LauncherIcon className="bg-white/10 text-white ring-white/20">
          <Notebook />
        </LauncherIcon>
        <LauncherLabel className="text-white/90">
          {NotesApplication.getMetadata().title}
        </LauncherLabel>
      </LauncherContent>
    </Launcher>
  );
}

function ApplicationTaskbarItems() {
  const { runningApplications, close, launch } = useApplicationManager();
  const { activateWindow } = useWindowManager();

  return runningApplications.map((application) => {
    return (
      <div
        key={application.id}
        className="relative flex h-8 items-center gap-1 rounded-xl bg-white/5 px-2 py-1 text-xs text-white/90"
      >
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-white/15 px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/25"
          onClick={() => {
            activateWindow(application.id);
            launch(application);
          }}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-[10px] font-semibold">
            {application.metadata.title.slice(0, 1)}
          </span>
          {application.metadata.title}
        </button>
        <button
          type="button"
          className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[11px] font-semibold text-slate-900 shadow-sm ring-1 ring-white/60 hover:bg-white"
          onClick={() => close(application)}
          aria-label={`Close ${application.metadata.title}`}
        >
          ×
        </button>
      </div>
    );
  });
}
