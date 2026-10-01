# Application Routing and Workspace URLs

## Status

Implemented and archived. `application-routing-integration.md` is the original
design background for URL hydration.

## Active window and URL

- The pathname follows the focused, visible window across launcher, taskbar,
  application sidebar, pointer, and keyboard interactions.
- Closing or minimizing the active window selects the next visible window in
  stacking order. Changing an inactive window leaves the active route unchanged.
- No open windows, or all windows minimized, results in `/`.
- Automatic URL updates never launch, restore, or reset an application.

## Workspace serialization

- The `w` query parameter stores up to 32 app windows. It contains a version,
  ordered application paths, percent-based frames, minimized/fullscreen state,
  and the frame needed when leaving fullscreen. Entry order is stacking order.
- Older `workspace=1` and indexed `windows[n]` links remain readable and are
  replaced with the compact format when the workspace changes.
- The pathname identifies the active app. A conflicting saved layout yields to
  the pathname; `/` minimizes every visible window.
- Changing window geometry, order, visibility, fullscreen state, or running apps
  updates the current URL. Updates replace the history entry and preserve
  unrelated query parameters and the fragment.
- Direct links and reloads restore registered apps and their saved windows.
  Unknown apps, malformed geometry, and unsupported format versions are ignored.
  The archived single-window framing example is also accepted.
- Loading a shared workspace URL in an already running session restores its
  listed windows. Other running apps remain open and keep their content, behind
  the restored windows. Closing an app removes it from the serialized workspace.
- Window state is shareable; app content and unsaved edits are not serialized.

For example, `/about?w=1%7Cabout%2C10%2C12%2C60%2C70` restores the About
window at that frame. More entries restore their order and visibility.

## Navigation and history

- Explicit app navigation pushes a history entry and launches or activates its
  app once. Modified launcher clicks retain normal link behavior.
- Window focus, restore, minimize, close, geometry, and quit-all transitions
  replace the current entry, avoiding an entry for every window interaction.
- Back and Forward process the destination URL as a new navigation and restore
  its listed layout. Existing unlisted apps remain running. Returning from the
  not-found screen activates the destination app without replacing that entry.
- Explicit `/` navigation minimizes visible windows and preserves their
  in-session content. A saved all-minimized workspace can be reloaded at `/`.

## Loading and system screens

- Route loading finishes before it launches or activates its app. Window shells
  mount immediately while lazy content loads, so loading windows remain
  controllable. Finishing content loading does not steal focus.
- Overlapping window changes settle on the latest window state. Synchronization
  does not duplicate launches or reopen closed windows.
- Not-found/BSOD, route errors, and powered-off screens suspend synchronization.
  Returning to the desktop resumes the routing contract.

## Ownership

- `apps/web` owns the URL format, its validation, and restoration. Its existing
  application `Route` launches the active app through `launchWindow()`.
- The application registry contains definitions only. The application manager
  tracks running apps; the window manager owns geometry, focus, order, and
  visibility. `packages/ui` remains router-agnostic.
- Taskbar, sidebar, window controls, and shortcuts use those managers; they do
  not implement their own routing logic.
