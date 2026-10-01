import type { WindowPercentFraming } from "@acme/ui/os/window";
import type { WindowInstance } from "@acme/ui/os/window-manager";

export type WorkspaceWindow = Omit<WindowInstance, "id"> & { path: string };
export type WorkspaceSearch = Record<string, unknown>;

const MAX_WINDOWS = 32;
const MAX_WORKSPACE_KEYS = MAX_WINDOWS * 16;
const fullFrame: WindowPercentFraming = {
  position: { x: 0, y: 0 },
  size: { height: 100, width: 100 },
  unit: "percent",
};

function isWorkspaceKey(key: string) {
  return (
    key === "workspace" ||
    key === "windows" ||
    key === "window" ||
    key.startsWith("windows[") ||
    key.startsWith("window[")
  );
}

function number(value: unknown): number | undefined {
  if (typeof value !== "number" && typeof value !== "string") return;
  if (typeof value === "string" && !value.trim()) return;
  const result = Number(value);
  return Number.isFinite(result) ? result : undefined;
}

function round(value: number) {
  return Math.round(value * 10000) / 10000;
}

function frame(
  x: unknown,
  y: unknown,
  width: unknown,
  height: unknown,
): WindowPercentFraming | undefined {
  const values = [x, y, width, height].map(number);
  const [left, top, w, h] = values;
  if (
    left === undefined ||
    top === undefined ||
    w === undefined ||
    h === undefined ||
    w <= 0 ||
    h <= 0
  )
    return;
  const size = {
    height: round(Math.min(100, Math.max(0.01, h))),
    width: round(Math.min(100, Math.max(0.01, w))),
  };
  return {
    position: {
      x: round(Math.min(100 - size.width, Math.max(0, left))),
      y: round(Math.min(100 - size.height, Math.max(0, top))),
    },
    size,
    unit: "percent",
  };
}

function readFrame(search: WorkspaceSearch, prefix: string) {
  return frame(
    search[`${prefix}[position][x]`],
    search[`${prefix}[position][y]`],
    search[`${prefix}[size][width]`],
    search[`${prefix}[size][height]`],
  );
}

function flag(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

/** Only registered local application routes can be restored from URL input. */
export function parseWorkspace(
  search: WorkspaceSearch,
  pathname: string,
  isApplicationPath: (path: string) => boolean,
): WorkspaceWindow[] {
  if (search.workspace !== undefined && number(search.workspace) !== 1)
    return [];
  const keys = Object.keys(search).filter(isWorkspaceKey);
  if (keys.length > MAX_WORKSPACE_KEYS) return [];
  const indices = new Set<number>();
  for (const key of keys) {
    const match = /^windows\[(\d{1,2})\]\[path\]$/.exec(key);
    if (match && Number(match[1]) < MAX_WINDOWS) indices.add(Number(match[1]));
  }
  const paths = new Set<string>();
  const windows: WorkspaceWindow[] = [];
  for (const index of [...indices].sort((a, b) => a - b)) {
    const prefix = `windows[${index}]`;
    const path = search[`${prefix}[path]`];
    if (typeof path !== "string" || !isApplicationPath(path) || paths.has(path))
      continue;
    paths.add(path);
    const framing = readFrame(search, prefix);
    const previousFraming = readFrame(search, `${prefix}[previousFraming]`);
    const isFullscreen = flag(search[`${prefix}[isFullscreen]`]);
    const entry: WorkspaceWindow = {
      isFullscreen,
      isHidden: flag(search[`${prefix}[isHidden]`]),
      path,
      previousFraming: isFullscreen
        ? (previousFraming ?? framing ?? null)
        : null,
      zIndex: number(search[`${prefix}[zIndex]`]) ?? index + 1,
    };
    if (framing || isFullscreen)
      entry.framing = isFullscreen ? fullFrame : framing;
    windows.push(entry);
  }

  // Accept the single-window example from the original design as well.
  if (!windows.length && isApplicationPath(pathname)) {
    const framing = frame(
      search["window[framing][x]"],
      search["window[framing][y]"],
      search["window[framing][width]"],
      search["window[framing][height]"],
    );
    if (framing)
      windows.push({
        framing,
        isFullscreen: false,
        isHidden: false,
        path: pathname,
        previousFraming: null,
        zIndex: 1,
      });
  }
  return [...windows].sort((a, b) => a.zIndex - b.zIndex);
}

function writeFrame(
  search: WorkspaceSearch,
  prefix: string,
  value: WindowPercentFraming,
) {
  const normalized = frame(
    value.position.x,
    value.position.y,
    value.size.width,
    value.size.height,
  );
  if (!normalized) return;
  search[`${prefix}[position][x]`] = normalized.position.x;
  search[`${prefix}[position][y]`] = normalized.position.y;
  search[`${prefix}[size][width]`] = normalized.size.width;
  search[`${prefix}[size][height]`] = normalized.size.height;
}

/** Replace only workspace fields, preserving other query parameters. */
export function serializeWorkspace(
  search: WorkspaceSearch,
  windows: ReadonlyArray<WindowInstance>,
): WorkspaceSearch {
  const result = Object.fromEntries(
    Object.entries(search).filter(([key]) => !isWorkspaceKey(key)),
  );
  if (!windows.length) return result;
  result.workspace = 1;
  for (const [index, window] of [...windows]
    .sort((a, b) => a.zIndex - b.zIndex)
    .slice(-MAX_WINDOWS)
    .entries()) {
    const prefix = `windows[${index}]`;
    result[`${prefix}[path]`] = window.id;
    result[`${prefix}[zIndex]`] = index + 1;
    if (window.framing) writeFrame(result, prefix, window.framing);
    if (window.isHidden) result[`${prefix}[isHidden]`] = true;
    if (window.isFullscreen) {
      result[`${prefix}[isFullscreen]`] = true;
      if (window.previousFraming)
        writeFrame(
          result,
          `${prefix}[previousFraming]`,
          window.previousFraming,
        );
    }
  }
  return result;
}
