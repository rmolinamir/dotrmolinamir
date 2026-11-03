import {
  Launcher,
  LauncherContent,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { Link } from "@tanstack/react-router";
import { Link2Off } from "lucide-react";

const bsodRoute = `/${encodeURIComponent("you're-absolutely-right!")}`;

export function BSODLauncher() {
  return (
    <Launcher asChild>
      {/* @ts-ignore: This is done on purpose to trigger a 404 easter egg. */}
      <Link to={bsodRoute} rel="nofollow">
        <LauncherContent>
          <LauncherIcon className="bg-background/90 backdrop-blur-xs">
            <Link2Off className="text-foreground/90 h-7 w-7" />
          </LauncherIcon>
          <LauncherLabel className="bg-background/90 border px-2 py-0.5 shadow-sm backdrop-blur-xs">
            do-not-click
          </LauncherLabel>
        </LauncherContent>
      </Link>
    </Launcher>
  );
}
