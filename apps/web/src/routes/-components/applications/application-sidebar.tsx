import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@acme/ui/components/sidebar";
import { cn } from "@acme/ui/lib/utils";
import type { ApplicationInstance } from "@acme/ui/os/application";
import { useApplicationManager } from "@acme/ui/os/application-manager";
import { useWindowManager } from "@acme/ui/os/window-manager";
import { XIcon } from "lucide-react";
import { useQuitApplications } from "@/hooks/use-quit-applications";

type ApplicationSidebarProps = React.ComponentProps<typeof Sidebar>;

function ApplicationSidebar({
  side = "right",
  variant = "floating",
  collapsible = "offcanvas",
  className,
  ...props
}: ApplicationSidebarProps) {
  const { runningApplications, close } = useApplicationManager();
  const { activateWindow } = useWindowManager();
  const { quitApplications } = useQuitApplications();
  const { toggleSidebar } = useSidebar();

  function handleClick(
    event: React.MouseEvent<HTMLButtonElement>,
    application: ApplicationInstance,
  ) {
    event.stopPropagation();
    close(application);
    // If that was the last application, close the sidebar.
    if (runningApplications.length === 1) toggleSidebar();
  }

  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="offcanvas"
      className={cn(
        "inset-y-auto top-24 bottom-24 h-[calc(100dvh-12rem)]",
        className,
      )}
      style={{ "--sidebar-width": "22rem" } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="font-semibold text-base">Applications</div>
          <button
            type="button"
            className="text-muted-foreground text-sm hover:text-foreground"
            onClick={() => {
              quitApplications();
              toggleSidebar();
            }}
          >
            Close all
          </button>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          {runningApplications.length ? (
            <>
              <SidebarGroupLabel>Running Applications</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {runningApplications.map((application) => {
                    return (
                      <SidebarMenuItem
                        className="relative"
                        key={application.id}
                      >
                        <SidebarMenuButton
                          onClick={() => {
                            activateWindow(application.id);
                          }}
                        >
                          <span className="font-medium">
                            {application.metadata.title}
                          </span>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                          showOnHover
                          onClick={(event) => handleClick(event, application)}
                        >
                          <XIcon className="size-3" />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </>
          ) : (
            <SidebarGroupContent>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground">
                  No running applications
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

type ApplicationSidebarTriggerProps = Omit<
  React.ComponentProps<typeof SidebarTrigger>,
  "label"
>;

function ApplicationSidebarTrigger(props: ApplicationSidebarTriggerProps) {
  return (
    <SidebarTrigger variant="ghost" label="Manage applications" {...props} />
  );
}

export { ApplicationSidebar, ApplicationSidebarTrigger };
