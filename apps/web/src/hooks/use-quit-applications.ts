import { useApplicationManager } from "@acme/ui/os/application-manager";
import { useRouter } from "@tanstack/react-router";
import React from "react";

export function useQuitApplications() {
  const { closeAll } = useApplicationManager();
  const { navigate } = useRouter();

  const quitApplications = React.useCallback(() => {
    closeAll();
    navigate({ replace: true, to: "/" });
  }, [closeAll, navigate]);

  return { quitApplications };
}
