import { Button } from "@acme/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/components/dropdown-menu";
import { useTheme } from "@acme/ui/components/theme";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { cn } from "@acme/ui/lib/utils";
import { TaskbarItem } from "@acme/ui/os/taskbar";
import { useQuitApplications } from "@/hooks/use-quit-applications";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/socials/constants";
import { GitHubIcon } from "../../../components/icons/github";
import { LinkedInIcon } from "../../../components/icons/linkedin";
import { useSystem } from "../system/system-provider";

type TaskbarLogoProps = React.ComponentPropsWithoutRef<"svg">;

export function TaskbarStart({ className, ...props }: TaskbarLogoProps) {
  const { quitApplications } = useQuitApplications();
  const { shutdown } = useSystem();
  const { setTheme } = useTheme();

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" asChild>
              <TaskbarItem
                className="text-accent hover:text-accent-foreground"
                variant="icon"
                aria-label="Open start menu"
              >
                <svg
                  className={cn("size-5", className)}
                  role="img"
                  viewBox="0 0 433 289"
                  fill="currentColor"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  {...props}
                >
                  <title>Personal Logo</title>
                  <path d="M0.769226 288.228L128.269 1.22754L212.951 190.362L300.269 1.22754L431.769 288.228H256.769L212.951 190.362L167.769 288.228H0.769226Z" />
                  <path d="M0.769226 288.228L128.269 1.22754L256.769 288.228H431.769L300.269 1.22754L167.769 288.228H0.769226Z" />
                </svg>
              </TaskbarItem>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent align="start" side="top" className="min-w-48">
          <DropdownMenuLabel className="select-none text-foreground/55 text-xs">
            Start Menu
          </DropdownMenuLabel>
          <DropdownMenuGroup className="md:hidden">
            <DropdownMenuItem
              render={
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <GitHubIcon className="size-4" aria-hidden="true" />
              GitHub
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <LinkedInIcon className="size-4" aria-hidden="true" />
              LinkedIn
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Themes</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
          <DropdownMenuItem onClick={quitApplications}>
            Quit applications
          </DropdownMenuItem>
          <DropdownMenuItem onClick={shutdown}>Shut down</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent>Open start menu</TooltipContent>
    </Tooltip>
  );
}
