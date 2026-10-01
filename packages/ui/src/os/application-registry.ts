import type { ApplicationInstance } from "./application";

// Definitions only. Running instances belong to each ApplicationManagerProvider.
const applications = new Map<string, ApplicationInstance>();

export function registerApplication(application: ApplicationInstance) {
  applications.set(application.id, application);
}

export function getApplication(id: string): ApplicationInstance | undefined {
  return applications.get(id);
}
