import type { RefObject } from "react";
import type { Rnd, RndDragCallback } from "react-rnd";

export type WindowPosition = {
  x: number;
  y: number;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowPercentFraming = {
  unit: "percent";
  position: WindowPosition;
  size: WindowSize;
};

export type WindowPixelFraming = {
  unit: "px";
  position: WindowPosition;
  size: WindowSize;
};

export type RndInstance = Rnd & {
  updatePosition: (position: WindowPosition) => void;
  updateSize: (size: WindowSize) => void;
  getSelfElement?: () => HTMLElement | null;
  resizableElement?: HTMLElement;
};

export type RndDraggableEvent = Parameters<RndDragCallback>[0];

type CascadingWindowFramingOptions = {
  baseFraming?: WindowPercentFraming;
  bounds: WindowSize;
  minSize?: WindowSize;
  offset?: number;
  origin?: WindowPosition;
  originMode?: "center" | "random" | "custom";
  randomOriginRef?: { current: WindowPosition | null };
  topWindowFraming?: WindowPercentFraming | null;
  size?: WindowSize;
};

export function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getCenteredPosition(bounds: WindowSize, size: WindowSize) {
  const x = Math.max(0, (bounds.width - size.width) / 2);
  const y = Math.max(0, (bounds.height - size.height) / 2);
  return { x: Math.round(x), y: Math.round(y) };
}

export function getCenteredWindowFraming(
  size: WindowSize,
): WindowPercentFraming {
  return {
    position: {
      x: Math.max(0, 50 - size.width / 2),
      y: Math.max(0, 50 - size.height / 2),
    },
    size,
    unit: "percent",
  };
}

export function getParentElement(rndRef: RefObject<Rnd | null>) {
  const instance = rndRef.current as RndInstance | null;
  const selfElement =
    instance?.getSelfElement?.() ?? instance?.resizableElement ?? null;
  return selfElement?.parentElement ?? null;
}

export function getPointerPosition(event: RndDraggableEvent | null) {
  if (!event) return null;
  if ("touches" in event && "changedTouches" in event) {
    const touches = event.touches as TouchList;
    const changedTouches = event.changedTouches as TouchList;
    const touch = touches[0] ?? changedTouches[0];
    if (!touch) return null;
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

export function toPercentFraming(
  framing: WindowPixelFraming,
  bounds: WindowSize,
): WindowPercentFraming {
  const width = bounds.width || 1;
  const height = bounds.height || 1;

  return {
    position: {
      x: (framing.position.x / width) * 100,
      y: (framing.position.y / height) * 100,
    },
    size: {
      height: (framing.size.height / height) * 100,
      width: (framing.size.width / width) * 100,
    },
    unit: "percent",
  };
}

export function toPixelFraming(
  framing: WindowPercentFraming,
  bounds: WindowSize,
): WindowPixelFraming {
  return {
    position: {
      x: (framing.position.x / 100) * bounds.width,
      y: (framing.position.y / 100) * bounds.height,
    },
    size: {
      height: Math.max(1, (framing.size.height / 100) * bounds.height),
      width: Math.max(1, (framing.size.width / 100) * bounds.width),
    },
    unit: "px",
  };
}

export function getCascadingWindowFraming(
  options: CascadingWindowFramingOptions,
): WindowPercentFraming {
  const baseFraming =
    options.baseFraming ??
    (options.size
      ? getCenteredWindowFraming(options.size)
      : getCenteredWindowFraming({ height: 90, width: 90 }));
  const bounds = options.bounds;
  const offset = options.offset ?? 12;
  const minSize = options.minSize ?? { height: 0, width: 0 };
  const originMode =
    options.originMode ?? (options.origin ? "custom" : "center");

  const anchorFraming = options.topWindowFraming ?? baseFraming;
  const anchorPixelFraming = toPixelFraming(anchorFraming, bounds);

  if (
    bounds.width <= anchorPixelFraming.size.width ||
    bounds.height <= anchorPixelFraming.size.height
  ) {
    return baseFraming;
  }

  const maxX = bounds.width - anchorPixelFraming.size.width;
  const maxY = bounds.height - anchorPixelFraming.size.height;

  const basePixelFraming = toPixelFraming(baseFraming, bounds);
  const centerOrigin = basePixelFraming.position;

  const resolveOrigin = () => {
    if (originMode === "custom" && options.origin) {
      return {
        x: (options.origin.x / 100) * bounds.width,
        y: (options.origin.y / 100) * bounds.height,
      };
    }

    if (originMode === "random") {
      if (options.randomOriginRef) {
        if (!options.randomOriginRef.current) {
          options.randomOriginRef.current = {
            x: Math.max(0, Math.random() * maxX),
            y: Math.max(0, Math.random() * maxY),
          };
        }
        return options.randomOriginRef.current;
      }

      return {
        x: Math.max(0, Math.random() * maxX),
        y: Math.max(0, Math.random() * maxY),
      };
    }

    return centerOrigin;
  };

  const origin = resolveOrigin();
  const originPosition = {
    x: Math.min(Math.max(origin.x, 0), maxX),
    y: Math.min(Math.max(origin.y, 0), maxY),
  };

  const step = Math.max(1, offset);
  const nextX = anchorPixelFraming.position.x + step;
  const nextY = anchorPixelFraming.position.y + step;
  const shouldReset = nextX > maxX || nextY > maxY;

  if (shouldReset && originMode === "random" && options.randomOriginRef) {
    options.randomOriginRef.current = null;
  }

  const nextPosition = shouldReset ? originPosition : { x: nextX, y: nextY };

  const nextPixelFraming: WindowPixelFraming = {
    position: nextPosition,
    size: anchorPixelFraming.size,
    unit: "px",
  };

  return clampPercentFraming(
    toPercentFraming(nextPixelFraming, bounds),
    bounds,
    minSize,
  );
}

export function clampPercentFraming(
  framing: WindowPercentFraming,
  bounds: WindowSize,
  minSize: WindowSize,
  maxSize?: WindowSize,
): WindowPercentFraming {
  if (bounds.width <= 0 || bounds.height <= 0) return framing;

  const maxWidth = maxSize?.width ?? bounds.width;
  const maxHeight = maxSize?.height ?? bounds.height;
  const minWidthPercent = (minSize.width / bounds.width) * 100;
  const minHeightPercent = (minSize.height / bounds.height) * 100;
  const maxWidthPercent = (maxWidth / bounds.width) * 100;
  const maxHeightPercent = (maxHeight / bounds.height) * 100;

  const width = clampValue(
    framing.size.width,
    minWidthPercent,
    maxWidthPercent,
  );
  const height = clampValue(
    framing.size.height,
    minHeightPercent,
    maxHeightPercent,
  );
  const maxX = Math.max(0, 100 - width);
  const maxY = Math.max(0, 100 - height);
  const x = clampValue(framing.position.x, 0, maxX);
  const y = clampValue(framing.position.y, 0, maxY);

  return {
    position: { x, y },
    size: { height, width },
    unit: "percent",
  };
}
