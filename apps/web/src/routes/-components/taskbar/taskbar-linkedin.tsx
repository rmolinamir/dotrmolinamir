import { Button } from "@acme/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { TaskbarItem } from "@acme/ui/os/taskbar";
import { LINKEDIN_URL } from "@/lib/socials/constants";
import { LinkedInIcon } from "../../../components/icons/linkedin";

type TaskbarLogoProps = React.ComponentPropsWithoutRef<"svg">;

export function TaskbarLinkedIn({ className, ...props }: TaskbarLogoProps) {
  return (
    <Tooltip>
      <Button variant="ghost" size="icon" asChild>
        <TooltipTrigger asChild>
          <TaskbarItem asChild variant="icon">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              <LinkedInIcon className={className} {...props} />
            </a>
          </TaskbarItem>
        </TooltipTrigger>
      </Button>
      <TooltipContent className="text-center">
        <div>LinkedIn</div>
        <div>
          <sup>(Microsoft please don't sue me)</sup>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
