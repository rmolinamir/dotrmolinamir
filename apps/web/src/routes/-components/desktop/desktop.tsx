import { ThemeMenu } from "@acme/ui/components/theme";
import { cn } from "@acme/ui/lib/utils";
import { Taskbar, TaskbarDivider, TaskbarSection } from "@acme/ui/os/taskbar";
import { WindowBoundary } from "@acme/ui/os/window-boundary";
import { WindowSnap } from "@acme/ui/os/window-snap";
import {
  AboutApplication,
  AboutLauncher,
} from "../../(applications)/about/-components/application";
import {
  DoomApplication,
  DoomLauncher,
} from "../../(applications)/doom/-components/application";
import {
  ResumeApplication,
  ResumeLauncher,
} from "../../(applications)/resume/-components/application";
import { ApplicationProgressBar } from "../applications/application-progress-bar";
import { ApplicationSidebarTrigger } from "../applications/application-sidebar";
import { BSODLauncher } from "../bsod/bsod-launcher";
import { TaskbarClock } from "../taskbar/taskbar-clock";
import { TaskbarGitHub } from "../taskbar/taskbar-github";
import { TaskbarLinkedIn } from "../taskbar/taskbar-linkedin";
import { TaskbarStart } from "../taskbar/taskbar-start";
import { TaskbarTabStrip } from "../taskbar/taskbar-tab-strip";
import { Wallpaper } from "./wallpaper";

type DesktopProps = React.ComponentProps<"main">;

export function Desktop({ className, children, ...props }: DesktopProps) {
  return (
    <main
      className={cn("relative flex flex-1 flex-col overflow-hidden", className)}
      {...props}
    >
      <DesktopWallpaper className="absolute h-full w-full" />

      <ApplicationProgressBar className="absolute top-0 left-0 z-progress" />

      <WindowBoundary className="pointer-events-none min-h-0 w-full flex-1 **:pointer-events-auto">
        <WindowSnap>
          <AboutApplication.Component />
          <ResumeApplication.Component />
          <DoomApplication.Component />
        </WindowSnap>
      </WindowBoundary>

      {/* Route content shares the desktop; application windows persist across navigation. */}
      {children}

      <DesktopGrid className="absolute max-h-full min-h-0 flex-1 p-2">
        <AboutLauncher />
        <ResumeLauncher />
        <DoomLauncher />
        <BSODLauncher />
      </DesktopGrid>

      <Taskbar className="z-taskbar max-w-dvw shrink-0">
        <TaskbarSection className="h-full" align="start">
          <TaskbarStart />
          <div className="hidden md:flex">
            <TaskbarGitHub />
            <TaskbarLinkedIn />
          </div>
        </TaskbarSection>
        <TaskbarDivider />
        <TaskbarSection className="h-full items-center" align="center" grow>
          <TaskbarTabStrip />
        </TaskbarSection>
        <TaskbarDivider />
        <TaskbarSection className="h-full" align="end">
          <ThemeMenu variant="ghost" className="hidden md:inline-flex" />
          <ApplicationSidebarTrigger variant="ghost" />
          <TaskbarClock className="hidden px-2 py-1 text-xs md:flex" />
        </TaskbarSection>
      </Taskbar>
    </main>
  );
}

type DesktopWallpaperProps = React.ComponentProps<typeof Wallpaper>;

function DesktopWallpaper({ className, ...props }: DesktopWallpaperProps) {
  return (
    <>
      {/* Wallpaper Backdrop (e.g., fallback while it loads) */}
      <div className={cn("z-backdrop bg-secondary", className)} />
      <Wallpaper className={cn("z-wallpaper", className)} {...props} />
    </>
  );
}

type DesktopGridProps = React.ComponentProps<"nav">;

function DesktopGrid({ className, children, ...props }: DesktopGridProps) {
  return (
    <nav
      className={cn(
        "flex w-full flex-col flex-wrap content-start gap-1",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  );
}
