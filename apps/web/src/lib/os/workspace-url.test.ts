import {
  defaultParseSearch,
  defaultStringifySearch,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { parseWorkspace, serializeWorkspace } from "./workspace-url";

const known = (path: string) => ["/about", "/doom"].includes(path);
const framing = {
  position: { x: 10, y: 12 },
  size: { height: 70, width: 60 },
  unit: "percent" as const,
};

describe("workspace URL format", () => {
  it("round trips registered windows, geometry, order, hidden/fullscreen state and restore geometry", () => {
    const windows = [
      { framing, id: "/about", isHidden: true, zIndex: 5 },
      {
        framing: {
          ...framing,
          position: { x: 0, y: 0 },
          size: { height: 100, width: 100 },
        },
        id: "/doom",
        isFullscreen: true,
        previousFraming: framing,
        zIndex: 8,
      },
    ];
    const search = serializeWorkspace({ campaign: "hello", page: 2 }, windows);
    expect(search.w).toBe("1|about,h,10,12,60,70|doom,f,10,12,60,70");
    expect(defaultStringifySearch(search).length).toBeLessThan(150);
    const decoded = defaultParseSearch(defaultStringifySearch(search));
    const restored = parseWorkspace(decoded, "/doom", known);
    expect(restored).toEqual([
      {
        framing,
        isFullscreen: false,
        isHidden: true,
        path: "/about",
        previousFraming: null,
        zIndex: 1,
      },
      {
        framing: windows[1]?.framing,
        isFullscreen: true,
        isHidden: false,
        path: "/doom",
        previousFraming: framing,
        zIndex: 2,
      },
    ]);
    expect((decoded as Record<string, unknown>).campaign).toBe("hello");
    expect((decoded as Record<string, unknown>).page).toBe(2);
    expect(serializeWorkspace(decoded, [])).toEqual({
      campaign: "hello",
      page: 2,
    });
  });

  it("reads the archived single-window example", () => {
    const search = defaultParseSearch(
      "?window[framing][x]=10&window[framing][y]=12&window[framing][width]=60&window[framing][height]=70",
    );
    expect(parseWorkspace(search, "/about", known)[0]?.framing).toEqual(
      framing,
    );
    expect(parseWorkspace(search, "/missing", known)).toEqual([]);
  });

  it("accepts sparse PostHog-style indices and sorts by stacking order", () => {
    const search = defaultParseSearch(
      "?windows[3][path]=/about&windows[3][zIndex]=9&windows[1][path]=/doom&windows[1][zIndex]=2",
    );
    expect(
      parseWorkspace(search, "/about", known).map((window) => window.path),
    ).toEqual(["/doom", "/about"]);
    expect(
      serializeWorkspace(
        search,
        parseWorkspace(search, "/about", known).map(({ path, ...window }) => ({
          ...window,
          id: path,
        })),
      ),
    ).toEqual({ w: "1|doom|about" });
  });

  it("reads compact routes with reserved characters and skips malformed entries", () => {
    const search = serializeWorkspace({}, [
      { id: "/a,b|c", zIndex: 1 },
      { id: "/about", zIndex: 2 },
    ]);
    const decoded = defaultParseSearch(defaultStringifySearch(search));
    expect(
      parseWorkspace(decoded, "/about", (path) =>
        ["/a,b|c", "/about"].includes(path),
      ).map((window) => window.path),
    ).toEqual(["/a,b|c", "/about"]);
    expect(parseWorkspace({ w: "2|about" }, "/about", known)).toEqual([]);
    expect(parseWorkspace({ w: "1|%ZZ|about" }, "/about", known)).toMatchObject(
      [{ path: "/about" }],
    );
  });

  it("restores a minimized fullscreen window from the compact format", () => {
    const search = serializeWorkspace({}, [
      {
        framing: {
          position: { x: 0, y: 0 },
          size: { height: 100, width: 100 },
          unit: "percent",
        },
        id: "/about",
        isFullscreen: true,
        isHidden: true,
        previousFraming: framing,
        zIndex: 1,
      },
    ]);
    expect(search.w).toBe("1|about,hf,10,12,60,70");
    expect(parseWorkspace(search, "/", known)[0]).toMatchObject({
      isFullscreen: true,
      isHidden: true,
      previousFraming: framing,
    });
    expect(
      parseWorkspace({ w: `1|${"about|".repeat(33)}` }, "/", known),
    ).toEqual([]);
  });

  it("ignores unknown or duplicate app routes and unsupported versions", () => {
    const search = {
      "windows[0][path]": "https://evil.test",
      "windows[1][path]": "/about",
      "windows[2][path]": "/about",
      "windows[3][path]": ["/doom"],
    };
    expect(parseWorkspace(search, "/about", known)).toHaveLength(1);
    expect(
      parseWorkspace({ ...search, workspace: 2 }, "/about", known),
    ).toEqual([]);
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    "NaN",
    "Infinity",
    "",
    null,
    true,
    [],
    {},
  ])("discards malformed geometry (%j) without discarding a valid app", (invalid) => {
    const search = {
      "windows[0][path]": "/about",
      "windows[0][position][x]": invalid,
      "windows[0][position][y]": 0,
      "windows[0][size][height]": 70,
      "windows[0][size][width]": 60,
    };
    const result = parseWorkspace(search, "/about", known);
    expect(result).toHaveLength(1);
    expect(result[0]?.framing).toBeUndefined();
  });

  it("clamps geometry to the workspace and rounds to a stable precision", () => {
    const search = {
      "windows[0][path]": "/about",
      "windows[0][position][x]": -50,
      "windows[0][position][y]": 99,
      "windows[0][size][height]": 33.123456,
      "windows[0][size][width]": 200,
    };
    expect(parseWorkspace(search, "/about", known)[0]?.framing).toEqual({
      position: { x: 0, y: 66.8765 },
      size: { height: 33.1235, width: 100 },
      unit: "percent",
    });
  });

  it("bounds the number of entries and ignores malformed flags", () => {
    const search = {
      "windows[0][isFullscreen]": {},
      "windows[0][isHidden]": "false",
      "windows[0][path]": "/about",
      "windows[99][path]": "/doom",
    };
    expect(parseWorkspace(search, "/about", known)).toMatchObject([
      { isFullscreen: false, isHidden: false, path: "/about" },
    ]);
    const excessive = Object.fromEntries(
      Array.from({ length: 600 }, (_, i) => [`windows[${i}][path]`, "/about"]),
    );
    expect(parseWorkspace(excessive, "/about", known)).toEqual([]);
  });
});
