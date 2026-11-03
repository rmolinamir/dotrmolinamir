import { WindowContent } from "@acme/ui/os/window-layout";
import { LoaderCircle } from "lucide-react";

function ApplicationLoadingFallback() {
  return (
    <WindowContent
      aria-label="Loading application"
      className="bg-background grid place-items-center p-0"
    >
      <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />
    </WindowContent>
  );
}

export { ApplicationLoadingFallback };
