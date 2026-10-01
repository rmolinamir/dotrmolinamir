import { cn } from "@acme/ui/lib/utils";
import { useApplicationManager } from "@acme/ui/os/application-manager";
import {
  TabStrip,
  TabStripClose,
  TabStripList,
  TabStripRail,
  TabStripTab,
  TabStripTabTrigger,
  TabStripTitle,
} from "@acme/ui/os/tab-strip";
import { useWindowManager } from "@acme/ui/os/window-manager";
import React from "react";

type ApplicationTabStripProps = Omit<
  React.ComponentProps<typeof TabStrip>,
  "value" | "onValueChange"
>;

export function TaskbarTabStrip({
  className,
  ...props
}: ApplicationTabStripProps) {
  const { runningApplications, close } = useApplicationManager();
  const { activateWindow, getTopWindow, hideWindow } = useWindowManager();

  const activeWindow = getTopWindow();

  // Keep the active tab in view anytime the active window changes.
  React.useEffect(() => {
    const tab = document.getElementById(`tab-${activeWindow?.id}`);
    if (tab) {
      window.requestAnimationFrame(() => {
        tab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      });
    }
  }, [activeWindow]);

  return (
    <TabStrip
      className={cn("w-full min-w-0 flex-1 border-none", className)}
      value={activeWindow?.id ?? ""}
      onValueChange={activateWindow}
      {...props}
    >
      <TabStripRail>
        <TabStripList className="border-none p-0">
          {runningApplications.map((application) => {
            return (
              <TabStripTab key={application.id}>
                <TabStripTabTrigger
                  id={`tab-${application.id}`}
                  value={application.id}
                  onDoubleClick={() => hideWindow(application.id)}
                >
                  <TabStripTitle>{application.metadata.title}</TabStripTitle>
                </TabStripTabTrigger>
                <TabStripClose onClose={() => close(application)} />
              </TabStripTab>
            );
          })}
        </TabStripList>
      </TabStripRail>
    </TabStrip>
  );
}
