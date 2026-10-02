import * as React from "react";
import { useApplicationManager } from "./application-manager";
import { registerApplication } from "./application-registry";
import { useWindowManager } from "./window-manager";

type ApplicationDefinition = {
  component: ApplicationComponent;
  fallback?: React.ComponentType;
  metadata: ApplicationMetadata;
};

type ApplicationMetadata = {
  title: string;
};

type ApplicationComponent =
  | React.ComponentType
  | React.LazyExoticComponent<React.ComponentType>;

type ApplicationInstance = {
  id: string;
  metadata: ApplicationMetadata;
};

const ApplicationContext = React.createContext<ApplicationInstance | null>(
  null,
);

function defineApplication(applicationId: string) {
  return function define<T extends ApplicationDefinition>(definition: T) {
    const Component = definition.component;
    const Fallback = definition.fallback;
    const application: ApplicationInstance = {
      id: applicationId,
      metadata: definition.metadata,
    };
    registerApplication(application);

    return {
      Component: () => {
        const { isRunning } = useApplicationManager();

        if (!isRunning(application)) {
          return null;
        }

        return (
          <ApplicationContext.Provider value={application}>
            <React.Suspense fallback={Fallback ? <Fallback /> : undefined}>
              <Component />
            </React.Suspense>
          </ApplicationContext.Provider>
        );
      },
      getId: () => application.id,
      getMetadata: () => application.metadata,
      useApplication: () => {
        const { launch, isRunning } = useApplicationManager();
        const { activateWindow } = useWindowManager();

        const launchWindow = React.useCallback(() => {
          if (isRunning(application)) activateWindow(application.id);
          else launch(application);
        }, [isRunning, activateWindow, launch]);

        return {
          application,
          isRunning: isRunning(application),
          launchWindow,
        };
      },
    };
  };
}

function useApplication() {
  const application = React.useContext(ApplicationContext);
  if (!application) {
    throw new Error("useApplication must be used within an application");
  }
  const manager = useApplicationManager();

  return {
    application,
    close: () => manager.close(application),
    isRunning: manager.isRunning(application),
    launch: () => manager.launch(application),
  };
}

/**
 * @returns Returns the application ID if the hook is used within an application context.
 */
function useApplicationId(): string | undefined {
  const context = React.useContext(ApplicationContext);
  return context?.id;
}

export { getApplication } from "./application-registry";
export {
  type ApplicationDefinition,
  type ApplicationInstance,
  defineApplication,
  useApplication,
  useApplicationId,
};
