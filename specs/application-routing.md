# Application Routing

## Status

Implemented for the desktop applications. This is the current routing contract;
`archive/application-routing-integration.md` is historical design background.

## Active window and URL

- The URL follows the focused, visible window, including launcher, taskbar,
  application sidebar, pointer, and keyboard interactions.
- Closing or minimizing the active window selects the next visible window in
  stacking order and updates its route. Changing an inactive window keeps the
  active route.
- No open windows, or all windows minimized, results in `/`.
- URL synchronization never launches, restores, or resets an application.

## Navigation and history

- Direct app URLs and refresh launch the corresponding application once.
- Explicit navigation to a running app activates or restores its existing
  window, preserving its content and window state.
- Launcher links and explicit navigation push history entries. Modified clicks
  keep normal link behavior and do not launch an app in the current tab.
- Window focus, restore, minimize, close, and quit-all transitions replace the
  current history entry without resetting page scroll. They do not add a history
  entry for every window interaction.
- Back and Forward interpret the destination as a new navigation: an app route
  launches or restores that app, even if it was previously closed or minimized.
  They do not undo the entire workspace or remove other running applications.
- Explicit navigation to `/`, including through history, minimizes all visible
  windows. Applications retain their content until closed and can be restored.
- Reloading restores only the application named by the URL; the workspace and
  unsaved content are not serialized into history.
- Full workspace persistence remains a future extension. The archived
  [PostHog-style URL examples](archive/application-management.md#posthog-url-examples)
  encode window routes, positions, sizes, and stacking order in query parameters;
  the [hydration design](archive/application-routing-integration.md#url-hydration-flow-posthog-style)
  describes restoring those windows and focus on reload. This is not implemented
  by active-window route synchronization.

## Loading and system screens

- Route loading finishes before a navigation launches or activates its app.
- Window shells mount immediately; lazy content loads inside them. Loading
  windows can be focused, minimized, restored, and closed. Finishing content
  loading does not steal focus or reopen a closed window.
- Overlapping window changes settle on the latest window state, including when
  a URL update is still loading. Synchronization does not trigger a second launch.
- Not-found/BSOD, route errors, and powered-off screens suspend synchronization.
  Booting back into the desktop resumes the same routing contract.

## Ownership

- `apps/web` owns routing. Each application factory's existing `Route` component
  launches or restores its app through `Application.useApplication().launchWindow()`.
  A shared routing guard distinguishes explicit navigation from automatic URL
  replacements so synchronization never triggers a second launch.
- The desktop routing provider observes window changes and updates the URL. It
  also handles explicit home navigation and waits for route launches to commit.
- The window manager remains the source of truth for focus, stacking order, and
  minimized state. `packages/ui` has no router dependency.
- Taskbar, sidebar, window controls, and shortcuts use the existing managers;
  they do not implement their own route synchronization.
