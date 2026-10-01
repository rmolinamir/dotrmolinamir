import * as React from "react";
import type { ApplicationInstance } from "./application";

type ApplicationManagerContextValue = {
  close: (application: ApplicationInstance) => void;
  closeAll: () => void;
  isRunning: (application: ApplicationInstance) => boolean;
  launch: (application: ApplicationInstance) => void;
  runningApplications: ReadonlyArray<ApplicationInstance>;
};

const ApplicationManagerContext =
  React.createContext<ApplicationManagerContextValue | null>(null);

type ApplicationManagerProps = {
  children: React.ReactNode;
};

function ApplicationManagerProvider({ children }: ApplicationManagerProps) {
  const [runningApplications, setApplications] = React.useState(
    new Map<ApplicationInstance["id"], ApplicationInstance>(),
  );

  const close = React.useCallback((application: ApplicationInstance) => {
    setApplications((prev) => {
      const next = new Map(prev);
      next.delete(application.id);
      return next;
    });
  }, []);

  const closeAll = React.useCallback(() => {
    setApplications(new Map());
  }, []);

  const isRunning = React.useCallback(
    (application: ApplicationInstance) => {
      return runningApplications.has(application.id);
    },
    [runningApplications],
  );

  const launch = React.useCallback((application: ApplicationInstance) => {
    setApplications((prev) => {
      if (prev.has(application.id)) {
        return prev;
      }
      return new Map(prev).set(application.id, application);
    });
  }, []);

  const value = React.useMemo<ApplicationManagerContextValue>(
    () => ({
      close,
      closeAll,
      isRunning,
      launch,
      runningApplications: Array.from(runningApplications.values()),
    }),
    [close, closeAll, launch, isRunning, runningApplications],
  );

  return (
    <ApplicationManagerContext.Provider value={value}>
      {children}
    </ApplicationManagerContext.Provider>
  );
}

function useApplicationManager() {
  const context = React.useContext(ApplicationManagerContext);
  if (!context) {
    throw new Error(
      "useApplicationManager must be used within ApplicationManagerProvider",
    );
  }
  return context;
}

export { ApplicationManagerProvider, useApplicationManager };
