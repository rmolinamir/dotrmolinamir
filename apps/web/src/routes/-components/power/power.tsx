import { Button } from "@acme/ui/components/button";
import { cn } from "@acme/ui/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { Power } from "lucide-react";
import { useNotFound } from "@/hooks/use-not-found";

type PowerScreen = React.ComponentProps<"div">;

export function PowerScreen({ className, ...props }: PowerScreen) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "bg-foreground dark:bg-background",
        className,
      )}
      {...props}
    />
  );
}

type PowerButtonProps = Omit<React.ComponentProps<typeof Button>, "children">;

export function PowerButton({
  className,
  onClick,
  ...props
}: PowerButtonProps) {
  const { isNotFound } = useNotFound();
  const { navigate } = useRouter();

  return (
    <div
      className={cn(
        "power-button-chroma transition-transform duration-200 ease-out",
        "hover:drop-shadow-[0_0_12px_var(--chart-5)]",
        "hover:[--chroma-opacity:1] hover:[--chroma-speed:2.2s]",
        "hover:[--chroma-boost-opacity:0.7] hover:[--chroma-brightness:1.15]",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "text-chart-5 relative size-22 p-16 transition-transform duration-150",
          "hover:scale-[1.2] active:scale-95",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (isNotFound) navigate({ to: "/" });
        }}
        {...props}
      >
        <Power className="size-22" />
      </Button>
    </div>
  );
}
