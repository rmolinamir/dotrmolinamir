import { defineApplication, useApplication } from "@acme/ui/os/application";
import {
  Launcher,
  LauncherContent,
  LauncherDescription,
  LauncherIcon,
  LauncherLabel,
} from "@acme/ui/os/launcher";
import { getCenteredWindowFraming, Window } from "@acme/ui/os/window";
import {
  WindowAction,
  WindowControls,
  WindowFullscreenButton,
  WindowHideButton,
} from "@acme/ui/os/window-actions";
import {
  WindowContent,
  WindowHeader,
  WindowTitle,
} from "@acme/ui/os/window-layout";
import { Minus, Square, X } from "lucide-react";
import type * as React from "react";

const MailApplication = defineApplication("mail")({
  component: () => (
    <ApplicationWindow title="Mail">
      <div className="space-y-3 text-sm">
        <p className="font-medium">Inbox zero-ish</p>
        <p className="text-muted-foreground">
          Your daily digest is waiting. Tap a message to open it in a new
          window.
        </p>
        <div className="rounded-lg border border-muted-foreground/30 border-dashed px-3 py-3 text-muted-foreground text-xs">
          12 new messages
        </div>
      </div>
    </ApplicationWindow>
  ),
  metadata: {
    title: "Mail",
  },
});

function MailApplicationLauncher() {
  const { launchWindow: launch } = MailApplication.useApplication();

  return (
    <Launcher
      className="h-35 w-25 text-slate-700"
      onClick={(event) => {
        event.preventDefault();
        launch();
      }}
    >
      <LauncherContent className="justify-center">
        <LauncherIcon className="bg-slate-200 text-slate-700 ring-black/10">
          {MailApplication.getMetadata().title.slice(0, 1)}
        </LauncherIcon>
        <LauncherLabel className="text-slate-800">
          {MailApplication.getMetadata().title.toLowerCase()}.mdx
        </LauncherLabel>
        <LauncherDescription className="text-slate-500">
          Tap to open
        </LauncherDescription>
      </LauncherContent>
    </Launcher>
  );
}

const NotesApplication = defineApplication("notes")({
  component: () => (
    <ApplicationWindow title="Notes">
      <div className="space-y-2 text-sm">
        <p className="font-medium">Ideas in progress</p>
        <p className="text-muted-foreground">
          Three drafts synced from mobile.
        </p>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li>- Taskbar animations</li>
          <li>- Sidebar routing</li>
          <li>- Menu polish</li>
        </ul>
      </div>
    </ApplicationWindow>
  ),
  metadata: {
    title: "Notes",
  },
});

function NotesApplicationLauncher() {
  const { launchWindow: launch } = NotesApplication.useApplication();

  return (
    <Launcher
      className="h-35 w-25 text-slate-700"
      onClick={(event) => {
        event.preventDefault();
        launch();
      }}
    >
      <LauncherContent className="justify-center">
        <LauncherIcon className="bg-slate-200 text-slate-700 ring-black/10">
          {NotesApplication.getMetadata().title.slice(0, 1)}
        </LauncherIcon>
        <LauncherLabel className="text-slate-800">
          {NotesApplication.getMetadata().title.toLowerCase()}.mdx
        </LauncherLabel>
        <LauncherDescription className="text-slate-500">
          Tap to open
        </LauncherDescription>
      </LauncherContent>
    </Launcher>
  );
}

const InsightsApplication = defineApplication("insights")({
  component: () => (
    <ApplicationWindow title="Insights">
      <div className="space-y-2 text-sm">
        <p className="font-medium">Pulse check</p>
        <p className="text-muted-foreground">
          Conversion rates are up 8% week over week.
        </p>
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
          3 active experiments - 1 needs review
        </div>
      </div>
    </ApplicationWindow>
  ),
  metadata: {
    title: "Insights",
  },
});

function InsightsApplicationLauncher() {
  const { launchWindow: launch } = InsightsApplication.useApplication();

  return (
    <Launcher
      className="h-35 w-25 text-slate-700"
      onClick={(event) => {
        event.preventDefault();
        launch();
      }}
    >
      <LauncherContent className="justify-center">
        <LauncherIcon className="bg-slate-200 text-slate-700 ring-black/10">
          {InsightsApplication.getMetadata().title.slice(0, 1)}
        </LauncherIcon>
        <LauncherLabel className="text-slate-800">
          {InsightsApplication.getMetadata().title.toLowerCase()}.mdx
        </LauncherLabel>
        <LauncherDescription className="text-slate-500">
          Tap to open
        </LauncherDescription>
      </LauncherContent>
    </Launcher>
  );
}

type ApplicationWindowProps = {
  title: string;
  children: React.ReactNode;
};

function ApplicationWindow({ title, children }: ApplicationWindowProps) {
  const { close } = useApplication();
  return (
    <Window
      defaultFraming={getCenteredWindowFraming({
        height: 90,
        width: 90,
      })}
    >
      <WindowHeader>
        <WindowTitle>{title}</WindowTitle>
        <WindowControls>
          <WindowHideButton aria-label="Hide" className="text-slate-500">
            <Minus className="size-4" />
          </WindowHideButton>
          <WindowFullscreenButton
            aria-label="Fullscreen"
            className="text-slate-500"
          >
            <Square className="size-3.5" />
          </WindowFullscreenButton>
          <WindowAction
            aria-label="Close"
            className="text-slate-500"
            onClick={close}
          >
            <X className="size-4" />
          </WindowAction>
        </WindowControls>
      </WindowHeader>
      <WindowContent>{children}</WindowContent>
    </Window>
  );
}

export {
  InsightsApplication,
  InsightsApplicationLauncher,
  MailApplication,
  MailApplicationLauncher,
  NotesApplication,
  NotesApplicationLauncher,
};
