import { cn } from "@acme/ui/lib/utils";
import {
  Launcher,
  LauncherContent,
  LauncherDescription,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { WindowBoundary } from "@acme/ui/os/window-boundary";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BookOpen,
  Calculator,
  FileText,
  Folder,
  Home,
  MessageCircle,
  Play,
  UserPlus,
} from "lucide-react";
import * as React from "react";
import { PurpleWallpaper } from "../scenes/desktop/purple-wallpaper";

const meta = {
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "OS/Launcher",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [hiddenId, setHiddenId] = React.useState("notes");

    return (
      <WindowBoundary>
        <PurpleWallpaper className="p-10">
          <div className="relative">
            <div className="text-xs tracking-[0.25em] text-white/80 uppercase">
              Launchpad
            </div>
            <div className="mt-6 grid w-full max-w-2xl auto-cols-[120px] grid-flow-col grid-rows-3 gap-4">
              {shortcuts.map((shortcut) => {
                const isHidden = shortcut.id === hiddenId;
                return (
                  <Launcher
                    key={shortcut.id}
                    size="lg"
                    className="text-white/90"
                    onClick={() => {
                      if (isHidden) {
                        setHiddenId("");
                        return;
                      }
                    }}
                  >
                    <LauncherContent>
                      <LauncherIcon
                        className={cn(
                          "shadow-lg ring-white/30",
                          shortcut.frameClassName,
                        )}
                      >
                        {shortcut.iconUrl ? (
                          <img
                            src={shortcut.iconUrl}
                            alt={shortcut.iconAlt ?? ""}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          shortcut.icon
                        )}
                      </LauncherIcon>
                      <LauncherLabel className="text-white/90">
                        {shortcut.label}
                      </LauncherLabel>
                      <LauncherDescription className="text-white/60">
                        {shortcut.description}
                      </LauncherDescription>
                    </LauncherContent>
                  </Launcher>
                );
              })}
            </div>
          </div>
        </PurpleWallpaper>
      </WindowBoundary>
    );
  },
};

const demoMovieThumbnail =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%230ea5e9'/><rect x='6' y='8' width='52' height='36' rx='8' fill='%23025669'/><circle cx='22' cy='26' r='8' fill='%23f8fafc'/><path d='M36 24l10 6-10 6z' fill='%23f8fafc'/><path d='M10 52h44' stroke='%23f8fafc' stroke-width='6' stroke-linecap='round'/></svg>";

const shortcuts = [
  {
    description: "Start here",
    frameClassName:
      "bg-linear-to-br from-amber-200/90 via-amber-100/80 to-amber-50/70 text-amber-900 ring-amber-200/80",
    icon: <Home className="h-6 w-6" />,
    id: "home",
    label: "home.mdx",
  },
  {
    description: "Workspace",
    frameClassName:
      "bg-linear-to-br from-emerald-200/90 via-emerald-100/80 to-emerald-50/70 text-emerald-900 ring-emerald-200/80",
    icon: <Folder className="h-6 w-6" />,
    id: "product",
    label: "Product OS",
  },
  {
    description: "Calculator",
    frameClassName:
      "bg-linear-to-br from-sky-200/90 via-sky-100/80 to-sky-50/70 text-sky-900 ring-sky-200/80",
    icon: <Calculator className="h-6 w-6" />,
    id: "pricing",
    label: "Pricing",
  },
  {
    description: "File",
    frameClassName:
      "bg-linear-to-br from-orange-200/90 via-orange-100/80 to-orange-50/70 text-orange-900 ring-orange-200/80",
    icon: <FileText className="h-6 w-6" />,
    id: "customers",
    label: "customers.mdx",
  },
  {
    description: "Playback",
    frameClassName:
      "bg-linear-to-br from-rose-200/90 via-rose-100/80 to-rose-50/70 text-rose-900 ring-rose-200/80",
    iconAlt: "Demo thumbnail",
    iconUrl: demoMovieThumbnail,
    id: "demo",
    label: "demo.mov",
  },
  {
    description: "Reference",
    frameClassName:
      "bg-linear-to-br from-violet-200/90 via-violet-100/80 to-violet-50/70 text-violet-900 ring-violet-200/80",
    icon: <BookOpen className="h-6 w-6" />,
    id: "docs",
    label: "Docs",
  },
  {
    description: "Help Desk",
    frameClassName:
      "bg-linear-to-br from-teal-200/90 via-teal-100/80 to-teal-50/70 text-teal-900 ring-teal-200/80",
    icon: <MessageCircle className="h-6 w-6" />,
    id: "support",
    label: "Talk to a human",
  },
  {
    description: "Create account",
    frameClassName:
      "bg-linear-to-br from-lime-200/90 via-lime-100/80 to-lime-50/70 text-lime-900 ring-lime-200/80",
    icon: <UserPlus className="h-6 w-6" />,
    id: "signup",
    label: "Sign up",
  },
  {
    description: "What's new",
    frameClassName:
      "bg-linear-to-br from-fuchsia-200/90 via-fuchsia-100/80 to-fuchsia-50/70 text-fuchsia-900 ring-fuchsia-200/80",
    icon: <Play className="h-6 w-6" />,
    id: "changelog",
    label: "Changelog",
  },
];
