import { Progress } from "@acme/ui/components/progress";
import React from "react";

const START_PROGRESS_INTERVAL_MS = 120;
const END_PROGRESS_TIMEOUT_MS = START_PROGRESS_INTERVAL_MS * 3;
const END_PROGRESS_MIN_TIMEOUT_MS = START_PROGRESS_INTERVAL_MS * 5;

type SimulatedProgressBarProps = Omit<
  React.ComponentProps<typeof Progress>,
  "value"
> & {
  loadingCount: number;
};

export function SimulatedProgressBar({
  loadingCount,
  ...props
}: SimulatedProgressBarProps) {
  const [progress, setProgress] = React.useState(0);

  const previousCountRef = React.useRef(0);
  const startTimeRef = React.useRef<number | null>(null);
  const progressIntervalRef = React.useRef<number | null>(null);
  const completionTimeoutRef = React.useRef<number | null>(null);

  const clearTimers = React.useCallback(() => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (completionTimeoutRef.current) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  }, []);

  const startProgress = React.useCallback(() => {
    clearTimers();
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const ceiling = 92;
        const rate = prev < 50 ? 0.18 : 0.06;
        const next = prev + (ceiling - prev) * rate;
        return Math.min(next, ceiling);
      });
    }, START_PROGRESS_INTERVAL_MS);
  }, [clearTimers]);

  const resetProgress = React.useCallback(() => {
    clearTimers();
    startTimeRef.current = null;
    setProgress(0);
  }, [clearTimers]);

  /**
   * @privateRemarks
   * We set the progress to as close to 100 as possible to make it look like it's done.
   * The progress bar will be hidden after a short delay when setting the progress to 100.
   * If another application starts within this range, it will be reset to 0.
   */
  const endProgress = React.useCallback(() => {
    const startedAt = startTimeRef.current ?? performance.now();
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, END_PROGRESS_MIN_TIMEOUT_MS - elapsed);

    completionTimeoutRef.current = window.setTimeout(() => {
      clearTimers();
      setProgress(99.99999);
      completionTimeoutRef.current = window.setTimeout(() => {
        setProgress(100);
        startTimeRef.current = null;
      }, END_PROGRESS_TIMEOUT_MS);
    }, remaining);
  }, [clearTimers]);

  React.useEffect(() => {
    const previousCount = previousCountRef.current;
    const currentCount = loadingCount;

    if (currentCount > 0) {
      if (currentCount > previousCount) resetProgress();
      startProgress();
    } else if (previousCount > 0) {
      endProgress();
    }

    previousCountRef.current = currentCount;
  }, [loadingCount, startProgress, resetProgress, endProgress]);

  // If unmounted, clear any pending timers.
  React.useEffect(() => clearTimers, [clearTimers]);

  const shouldShowProgress =
    loadingCount > 0 || (progress > 0 && progress < 100);

  // Hide the progress bar as soon as it's complete.
  if (!shouldShowProgress) return null;

  return <Progress value={progress} {...props} />;
}
