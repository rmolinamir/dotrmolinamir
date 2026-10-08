import { useState } from "react";

const resumeUrl =
  "https://drive.google.com/file/d/15bEpE77LztNaNu2fn2wRtPsXeKzHSCu9";

export function Resume() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <article className="flex h-full min-h-0 flex-col gap-2 p-2 text-sm">
      <a
        className="self-end underline underline-offset-4"
        href={`${resumeUrl}/view`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open resume in a new tab
      </a>
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
          <div className="absolute inset-0 grid touch-none place-items-center bg-background/90">
            <p role="status">Loading resume viewer…</p>
          </div>
        )}
      </div>
    </article>
  );
}
