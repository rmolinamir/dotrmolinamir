import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@acme/ui/components/sidebar";
import { useApplicationManager } from "@acme/ui/os/application-manager";
import { useWindowManager } from "@acme/ui/os/window-manager";

function ApplicationManagerSidebar() {
  const { runningApplications, closeAll } = useApplicationManager();
  const { activateWindow } = useWindowManager();

  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="offcanvas"
      className="inset-y-auto top-24 bottom-24 h-[calc(100dvh-12rem)]"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">Active windows</div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-sm"
            onClick={() => {
              closeAll();
            }}
          >
            Close all
          </button>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Running apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {runningApplications.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-muted-foreground">
                    No active windows
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                runningApplications.map((application) => {
                  return (
                    <SidebarMenuItem key={application.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          activateWindow(application.id);
                        }}
                      >
                        <span className="font-medium">
                          {application.metadata.title.toLowerCase()}.mdx
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export { ApplicationManagerSidebar };
