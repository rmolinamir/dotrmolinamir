import type { ComponentProps } from "react";
import { SimulatedProgressBar } from "../../../components/simulated-progress-bar";
import { useSystem } from "../system/system-provider";

type ApplicationProgressProps = Omit<
  ComponentProps<typeof SimulatedProgressBar>,
  "loadingCount"
>;

export function ApplicationProgressBar(props: ApplicationProgressProps) {
  const { loadingApplications } = useSystem();

  return (
    <SimulatedProgressBar
      loadingCount={loadingApplications.length}
      {...props}
    />
  );
}
