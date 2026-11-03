import {
  LauncherContent,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { WindowContent } from "@acme/ui/os/window-layout";
import { FileText } from "lucide-react";
import React from "react";
import { createApplicationRoute } from "@/lib/os/create-route-application";

const Resume = React.lazy(async () => {
  const module = await import("./resume");
  return { default: module.Resume };
});

export const {
  Application: ResumeApplication,
  Launcher: ResumeLauncher,
  Route: ResumeRoute,
} = createApplicationRoute("/resume")({
  component: () => (
    <WindowContent className="p-0">
      <Resume />
    </WindowContent>
  ),
  launcher: () => (
    <LauncherContent>
      <LauncherIcon className="bg-background/90 backdrop-blur-xs">
        <FileText />
      </LauncherIcon>
      <LauncherLabel className="bg-background/90 border px-2 py-0.5 shadow-sm backdrop-blur-xs">
        resume.pdf
      </LauncherLabel>
    </LauncherContent>
  ),
  metadata: {
    title: "resume.pdf",
  },
});
