import { Button } from "@acme/ui/components/button";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { SimulatedProgressBar } from "../../../../components/simulated-progress-bar";

const resumeUrl =
  "https://drive.google.com/file/d/15bEpE77LztNaNu2fn2wRtPsXeKzHSCu9";

export function Resume() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <article className="relative flex h-full min-h-0 flex-col gap-2 p-2 text-sm">
      <Button asChild variant="ghost" size="icon-xs" className="self-end">
        <a
          href={`${resumeUrl}/view`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open resume in a new tab"
          title="Open resume in a new tab"
        >
          <ExternalLink aria-hidden="true" />
        </a>
      </Button>
      <div className="relative min-h-0 flex-1" aria-busy={!isLoaded}>
        <iframe
          className="block h-full w-full"
          title="Robert Molina - Resume"
          src={`${resumeUrl}/preview`}
          inert={!isLoaded}
          tabIndex={isLoaded ? 0 : -1}
          // Inline styles override the desktop's descendant pointer-events rule.
          style={{ pointerEvents: isLoaded ? "auto" : "none" }}
          // Drive does not expose PDF readiness; guard the initial frame load.
          onLoad={() => setIsLoaded(true)}
        />
        {!isLoaded && (
          <div className="absolute inset-0 touch-none bg-background/90">
            <p role="status" className="sr-only">
              Loading resume viewer…
            </p>
          </div>
        )}
      </div>
      <SimulatedProgressBar
        loadingCount={isLoaded ? 0 : 1}
        aria-label="Loading resume viewer"
        className="absolute inset-x-0 top-0 [&_[data-slot=progress-track]]:rounded-none"
      />
    </article>
  );
}
