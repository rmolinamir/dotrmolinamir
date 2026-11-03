import { Button } from "@acme/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@acme/ui/components/dropdown-menu";
import {
  Timer,
  TimerGroup,
  TimerSegment,
  TimerSeparator,
} from "@acme/ui/components/timer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { cn } from "@acme/ui/lib/utils";
import * as React from "react";

type ClockFormat = "12" | "24";

function formatTimePart(value: number) {
  return value.toString().padStart(2, "0");
}

function getTimeParts(date: Date, format: ClockFormat) {
  const hours24 = date.getHours();
  const isPm = hours24 >= 12;
  const hoursValue = format === "24" ? hours24 : hours24 % 12 || 12;

  return {
    hours: formatTimePart(hoursValue),
    meridiem: isPm ? "PM" : "AM",
    minutes: formatTimePart(date.getMinutes()),
    seconds: formatTimePart(date.getSeconds()),
  };
}

type ClockProps = React.ComponentProps<typeof Timer>;

export function TaskbarClock({ className, ...props }: ClockProps) {
  const [now, setNow] = React.useState(() => new Date());
  const [format, setFormat] = React.useState<ClockFormat>("12");

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const { hours, minutes, seconds, meridiem } = getTimeParts(now, format);

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button className="p-0" variant="ghost">
              <Timer className={cn("select-none", className)} {...props}>
                <TimerGroup>
                  <TimerSegment className="text-inherit">{hours}</TimerSegment>
                  <TimerSeparator className="text-inherit">:</TimerSeparator>
                  <TimerSegment className="text-inherit">
                    {minutes}
                  </TimerSegment>
                  <TimerSeparator className="text-inherit">:</TimerSeparator>
                  <TimerSegment className="text-inherit">
                    {seconds}
                  </TimerSegment>
                  {format === "12" ? (
                    <TimerSegment className="ml-1 text-inherit/70">
                      {meridiem}
                    </TimerSegment>
                  ) : null}
                </TimerGroup>
              </Timer>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-foreground/55 text-xs select-none">
            Formats
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setFormat("24")}>
            24-hour
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFormat("12")}>
            12-hour
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent>Change time format</TooltipContent>
    </Tooltip>
  );
}
