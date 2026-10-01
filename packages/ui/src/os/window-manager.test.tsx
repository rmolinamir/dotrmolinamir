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
