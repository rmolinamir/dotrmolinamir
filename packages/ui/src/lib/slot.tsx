import { mergeProps } from "@base-ui/react/merge-props";
import * as React from "react";

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

function Root({ children, ...props }: SlotProps) {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<
    React.HTMLAttributes<HTMLElement>
  >;
  return React.cloneElement(child, mergeProps(props, child.props));
}

export const Slot = { Root };
