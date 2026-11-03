import {
  LauncherContent,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { WindowContent } from "@acme/ui/os/window-layout";
import { FileText } from "lucide-react";
import React from "react";
import { createApplicationRoute } from "@/lib/os/create-route-application";

const Doom = React.lazy(async () => {
  const module = await import("./doom");
  return { default: module.Doom };
});

export const {
  Application: DoomApplication,
  Launcher: DoomLauncher,
  Route: DoomRoute,
} = createApplicationRoute("/doom")({
  component: () => (
    <WindowContent className="p-0">
      <Doom />
    </WindowContent>
  ),
  launcher: () => (
    <LauncherContent>
      <LauncherIcon className="bg-background/90 backdrop-blur-xs">
        <FileText />
      </LauncherIcon>
      <LauncherLabel className="bg-background/90 border px-2 py-0.5 shadow-sm backdrop-blur-xs">
        DOOM.exe
      </LauncherLabel>
    </LauncherContent>
  ),
  metadata: {
    title: "DOOM",
  },
});
