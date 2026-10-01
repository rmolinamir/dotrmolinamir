// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useWindowManager, WindowManagerProvider } from "./window-manager";

it("mounts above remaining windows after a middle window closes", () => {
  const { result, unmount } = renderHook(useWindowManager, {
    wrapper: WindowManagerProvider,
  });
  act(() => {
    result.current.mountWindow("about");
    result.current.mountWindow("doom");
    result.current.mountWindow("resume");
  });
  act(() => result.current.unmountWindow("doom"));
  act(() => result.current.mountWindow("blog"));
  expect(result.current.focusedId).toBe("blog");
  expect(result.current.getTopWindow()?.id).toBe("blog");
  act(() => result.current.hideWindow("blog"));
  expect(result.current.focusedId).toBe("resume");
  expect(result.current.getTopWindow()?.id).toBe("resume");
  unmount();
});

it("restores geometry, visibility, fullscreen state and stacking order without removing other windows", () => {
  const { result } = renderHook(useWindowManager, {
    wrapper: WindowManagerProvider,
  });
  const aboutFrame = {
    position: { x: 10, y: 15 },
    size: { height: 70, width: 60 },
    unit: "percent" as const,
  };
  const doomFrame = {
    position: { x: 0, y: 0 },
    size: { height: 100, width: 100 },
    unit: "percent" as const,
  };
  act(() => {
    result.current.mountWindow("about");
    result.current.mountWindow("doom");
    result.current.mountWindow("other");
  });
  act(() =>
    result.current.restoreWindowLayout([
      {
        framing: doomFrame,
        id: "doom",
        isFullscreen: true,
        previousFraming: aboutFrame,
        zIndex: 1,
      },
      { framing: aboutFrame, id: "about", isHidden: true, zIndex: 2 },
    ]),
  );
  expect(result.current.windows.map((window) => window.id)).toEqual([
    "other",
    "doom",
    "about",
  ]);
  expect(result.current.focusedId).toBe("doom");
  expect(result.current.getIsHidden("about")).toBe(true);
  expect(result.current.getIsFullscreen("doom")).toBe(true);
  act(() => result.current.toggleFullscreen("doom"));
  expect(result.current.getFraming("doom")).toEqual(aboutFrame);
  expect(result.current.getWindowData("other")).toBeDefined();
});
