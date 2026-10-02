import type { WindowPercentFraming } from "@acme/ui/os/window";
import type { WindowInstance } from "@acme/ui/os/window-manager";

export type WorkspaceWindow = Omit<WindowInstance, "id"> & { path: string };
export type WorkspaceSearch = Record<string, unknown>;

const MAX_WINDOWS = 32;
const WORKSPACE_QUERY_KEY = "w";
const WINDOW_STATE = {
  fullscreen: "f",
  hidden: "h",
  hiddenFullscreen: "hf",
} as const;
const fullFrame: WindowPercentFraming = {
  position: { x: 0, y: 0 },
  size: { height: 100, width: 100 },
  unit: "percent",
};

function isWorkspaceKey(key: string) {
  return (
    key === WORKSPACE_QUERY_KEY ||
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

/** Only registered local application routes can be restored from URL input. */
export function parseWorkspace(
  search: WorkspaceSearch,
  isApplicationPath: (path: string) => boolean,
): WorkspaceWindow[] {
  const value = search[WORKSPACE_QUERY_KEY];
  if (typeof value !== "string") return [];
  const [version, ...entries] = value.split("|");
  if (version !== "1" || entries.length > MAX_WINDOWS) return [];

  const paths = new Set<string>();
  const windows: WorkspaceWindow[] = [];
  for (const entry of entries) {
    const [encodedPath, ...fields] = entry.split(",");
    if (!encodedPath) continue;
    let path: string;
    try {
      path = `/${decodeURIComponent(encodedPath)}`;
    } catch {
      continue;
    }
    if (!isApplicationPath(path) || paths.has(path)) continue;
    paths.add(path);

    const state = fields[0];
    const isFullscreen =
      state === WINDOW_STATE.fullscreen ||
      state === WINDOW_STATE.hiddenFullscreen;
    const isHidden =
      state === WINDOW_STATE.hidden || state === WINDOW_STATE.hiddenFullscreen;
    const geometry = isFullscreen || isHidden ? fields.slice(1) : fields;
    const [x, y, width, height] = geometry;
    const savedFrame = frame(x, y, width, height);
    const window: WorkspaceWindow = {
      isFullscreen,
      isHidden,
      path,
      previousFraming: isFullscreen ? (savedFrame ?? null) : null,
      zIndex: windows.length + 1,
    };
    if (savedFrame || isFullscreen)
      window.framing = isFullscreen ? fullFrame : savedFrame;
    windows.push(window);
  }
  return windows;
}

function frameValues(value: WindowPercentFraming | undefined): number[] {
  if (!value) return [];
  const normalized = frame(
    value.position.x,
    value.position.y,
    value.size.width,
    value.size.height,
  );
  if (!normalized) return [];
  return [
    normalized.position.x,
    normalized.position.y,
    normalized.size.width,
    normalized.size.height,
  ].map((value) => Math.round(value * 100) / 100);
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
  const entries = [...windows]
    .sort((a, b) => a.zIndex - b.zIndex)
    .slice(-MAX_WINDOWS)
    .map((window) => {
      const path = encodeURIComponent(window.id.slice(1));
      if (window.isFullscreen) {
        return [
          path,
          window.isHidden
            ? WINDOW_STATE.hiddenFullscreen
            : WINDOW_STATE.fullscreen,
          ...frameValues(window.previousFraming ?? undefined),
        ].join(",");
      }
      if (window.isHidden)
        return [path, WINDOW_STATE.hidden, ...frameValues(window.framing)].join(
          ",",
        );
      return [path, ...frameValues(window.framing)].join(",");
    });
  result[WORKSPACE_QUERY_KEY] = ["1", ...entries].join("|");
  return result;
}
