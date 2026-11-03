import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type * as React from "react";
import {
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_NAME,
  SITE_THEME_COLOR_DARK,
  SITE_THEME_COLOR_LIGHT,
  SITE_TITLE,
} from "@/lib/socials/constants";
import appCss from "../styles.css?url";
import { BSODScreen } from "./-components/bsod/bsod";
import { RootLayout } from "./-components/root/root-layout";
import { RootProviders } from "./-components/root/root-providers";

export const Route = createRootRoute({
  component: RouteComponent,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
      {
        href: "/manifest.json",
        rel: "manifest",
      },
      {
        as: "image",
        href: "/vibrant-wallpaper-light.webp",
        media: "(prefers-color-scheme: light)",
        rel: "prefetch",
      },
      {
        as: "image",
        href: "/vibrant-wallpaper-dark.webp",
        media: "(prefers-color-scheme: dark)",
        rel: "prefetch",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: SITE_TITLE,
      },
      {
        content: SITE_DESCRIPTION,
        name: "description",
      },
      {
        content: SITE_THEME_COLOR_LIGHT,
        media: "(prefers-color-scheme: light)",
        name: "theme-color",
      },
      {
        content: SITE_THEME_COLOR_DARK,
        media: "(prefers-color-scheme: dark)",
        name: "theme-color",
      },
      {
        content: SITE_TITLE,
        property: "og:title",
      },
      {
        content: SITE_NAME,
        property: "og:site_name",
      },
      {
        content: SITE_DESCRIPTION,
        property: "og:description",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: SITE_IMAGE,
        property: "og:image",
      },
      {
        content: "image/png",
        property: "og:image:type",
      },
      {
        content: "1200",
        property: "og:image:width",
      },
      {
        content: "630",
        property: "og:image:height",
      },
      {
        content: "Robert Molina logo",
        property: "og:image:alt",
      },
      {
        content: "summary_large_image",
        name: "twitter:card",
      },
      {
        content: SITE_TITLE,
        name: "twitter:title",
      },
      {
        content: SITE_DESCRIPTION,
        name: "twitter:description",
      },
      {
        content: SITE_IMAGE,
        name: "twitter:image",
      },
      {
        content: "Robert Molina logo",
        name: "twitter:image:alt",
      },
    ],
    scripts: [
      {
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@id": "/#website",
              "@type": "WebSite",
              description: SITE_DESCRIPTION,
              inLanguage: "en-US",
              name: SITE_NAME,
              publisher: {
                "@id": "/#person",
              },
              url: "/",
            },
            {
              "@id": "/#person",
              "@type": "Person",
              image: SITE_IMAGE,
              jobTitle: "Software Engineer",
              name: SITE_NAME,
              sameAs: [GITHUB_URL, LINKEDIN_URL],
              url: "/",
            },
          ],
        }),
        type: "application/ld+json",
      },
    ],
  }),
  notFoundComponent: BSODScreen,
  shellComponent: RouteShellComponent,
});

function RouteComponent() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}

function RouteShellComponent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-background relative">
        <RootProviders>{children}</RootProviders>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
