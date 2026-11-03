import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type * as React from "react";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  component: RouteComponent,
  head: () => ({
    links: [{ href: appCss, rel: "stylesheet" }],
  }),
  shellComponent: RouteShellComponent,
});

function RouteComponent() {
  return <Outlet />;
}

function RouteShellComponent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-background relative">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
