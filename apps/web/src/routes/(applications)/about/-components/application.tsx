import {
  LauncherContent,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { WindowContent } from "@acme/ui/os/window-layout";
import { User } from "lucide-react";
import React from "react";
import { createApplicationRoute } from "@/lib/os/create-route-application";

const About = React.lazy(async () => {
  const module = await import("./about");
  return { default: module.About };
});

export const {
  Application: AboutApplication,
  Launcher: AboutLauncher,
  Route: AboutRoute,
} = createApplicationRoute("/about")({
  component: () => (
    <WindowContent className="p-0">
      <About />
    </WindowContent>
  ),
  launcher: () => (
    <LauncherContent>
      <LauncherIcon className="bg-background/90 backdrop-blur-xs">
        <User />
      </LauncherIcon>
      <LauncherLabel className="bg-background/90 border px-2 py-0.5 shadow-sm backdrop-blur-xs">
        about.md
      </LauncherLabel>
    </LauncherContent>
  ),
  metadata: {
    title: "Markdown Editor",
  },
});
