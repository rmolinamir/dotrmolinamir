import { LoaderCircle } from "lucide-react";
import { WindowContent } from "@acme/ui/os/window-layout";

function ApplicationLoadingFallback() {
  return (
    <WindowContent
      aria-label="Loading application"
      className="grid place-items-center bg-background p-0"
    >
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
    </WindowContent>
  );
}

export { ApplicationLoadingFallback };
