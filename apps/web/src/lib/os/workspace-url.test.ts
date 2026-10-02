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
    expect(parseWorkspace(decoded, known)).toEqual([
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
    expect(decoded).toMatchObject({ campaign: "hello", page: 2 });
    expect(serializeWorkspace(decoded, [])).toEqual({
      campaign: "hello",
      page: 2,
    });
  });

  it("reads encoded routes and skips malformed, duplicate, and unknown entries", () => {
    const search = serializeWorkspace({}, [
      { id: "/a,b|c", zIndex: 1 },
      { id: "/about", zIndex: 2 },
    ]);
    const decoded = defaultParseSearch(defaultStringifySearch(search));
    expect(
      parseWorkspace(decoded, (path) =>
        ["/a,b|c", "/about"].includes(path),
      ).map((window) => window.path),
    ).toEqual(["/a,b|c", "/about"]);
    expect(
      parseWorkspace({ w: "1|%ZZ|missing|about|about|doom" }, known).map(
        (window) => window.path,
      ),
    ).toEqual(["/about", "/doom"]);
  });

  it("restores a minimized fullscreen window", () => {
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
    expect(parseWorkspace(search, known)[0]).toMatchObject({
      isFullscreen: true,
      isHidden: true,
      previousFraming: framing,
    });
  });

  it("accepts only workspace input and removes obsolete URL fields", () => {
    expect(parseWorkspace({}, known)).toEqual([]);
    expect(parseWorkspace({ workspace: 1 }, known)).toEqual([]);
    expect(parseWorkspace({ w: "2|about" }, known)).toEqual([]);
    expect(parseWorkspace({ w: `1|${"about|".repeat(33)}` }, known)).toEqual(
      [],
    );
    expect(
      serializeWorkspace(
        {
          campaign: "hello",
          "window[framing][x]": 10,
          "windows[0][path]": "/about",
          workspace: 1,
        },
        [],
      ),
    ).toEqual({ campaign: "hello" });
  });

  it.each(["NaN", "Infinity", "", "invalid"])(
    "discards malformed geometry (%s) without discarding a valid app",
    (invalid) => {
      const result = parseWorkspace({ w: `1|about,${invalid},0,60,70` }, known);
      expect(result).toHaveLength(1);
      expect(result[0]?.framing).toBeUndefined();
    },
  );

  it("clamps geometry to the workspace and rounds to a stable precision", () => {
    expect(
      parseWorkspace({ w: "1|about,-50,99,200,33.123456" }, known)[0]?.framing,
    ).toEqual({
      position: { x: 0, y: 66.8765 },
      size: { height: 33.1235, width: 100 },
      unit: "percent",
    });
  });
});
