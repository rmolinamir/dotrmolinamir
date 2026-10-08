import { Button } from "@acme/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { TaskbarItem } from "@acme/ui/os/taskbar";
import { GITHUB_URL } from "@/lib/socials/constants";
import { GitHubIcon } from "../../../components/icons/github";

type TaskbarLogoProps = React.ComponentPropsWithoutRef<"svg">;

export function TaskbarGitHub({ className, ...props }: TaskbarLogoProps) {
  return (
    <Tooltip>
      <Button variant="ghost" size="icon" asChild>
        <TooltipTrigger asChild>
          <TaskbarItem asChild variant="icon">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <GitHubIcon className={className} {...props} />
            </a>
          </TaskbarItem>
        </TooltipTrigger>
      </Button>
      <TooltipContent>GitHub</TooltipContent>
    </Tooltip>
  );
}
