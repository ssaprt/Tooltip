import {
    Axis,
    AxisInsets,
    AxisMetrics,
    ParsedOffset,
} from "../types/config/axis.type";
import { BoundaryOffset } from "../types/config/general.type";
import { HeightTrackType, ScrollBarMode } from "../types/config/scrollbar.type";
import { ScrollToFutureThumb } from "../types/config/thumb.type";
import { MAX_THUMB_RATIO, MIN_THUMB_SIZE } from "./constants";

export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), Math.max(min, max));

export const parsePxValue = (value?: string | null): number | null => {
    if (!value) return null;
    const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim());
    return match ? Number(match[1]) : null;
};

export const parseBoundaryOffset = (
    value?: BoundaryOffset | null,
): ParsedOffset => {
    if (!value) {
        return {
            start: 0,
            end: 0,
        };
    }

    const parts = value.trim().split(/\s+/);

    const start = Math.max(0, parsePxValue(parts[0]) ?? 0);

    const end =
        parts.length > 1 ? Math.max(0, parsePxValue(parts[1]) ?? 0) : start;

    return {
        start,
        end,
    };
};

export const fitInsetsWithinSize = (
    start: number,
    end: number,
    size: number,
    minInnerSize = 1,
): {
    start: number;
    end: number;
    innerSize: number;
} => {
    const safeSize = Math.max(0, size);

    if (safeSize <= 0) {
        return {
            start: 0,
            end: 0,
            innerSize: 0,
        };
    }

    const actualMinInnerSize = Math.min(Math.max(0, minInnerSize), safeSize);
    const safeStart = Math.max(0, start);
    const safeEnd = Math.max(0, end);
    const requestedInsetsSize = safeStart + safeEnd;
    const maximumInsetsSize = safeSize - actualMinInnerSize;

    if (requestedInsetsSize <= maximumInsetsSize) {
        return {
            start: safeStart,
            end: safeEnd,
            innerSize: safeSize - safeStart - safeEnd,
        };
    }

    if (requestedInsetsSize <= 0) {
        return {
            start: 0,
            end: 0,
            innerSize: safeSize,
        };
    }

    const scale = maximumInsetsSize / requestedInsetsSize;
    const fittedStart = safeStart * scale;
    const fittedEnd = safeEnd * scale;

    return {
        start: fittedStart,
        end: fittedEnd,
        innerSize: Math.max(
            actualMinInnerSize,
            safeSize - fittedStart - fittedEnd,
        ),
    };
};

export const resolveAxisInsets = (
    value: BoundaryOffset | undefined,
    axis: Axis,
): AxisInsets => {
    const { start, end } = parseBoundaryOffset(value);

    if (axis === "y") {
        return {
            cross: start,
            main: end,
        };
    }

    return {
        cross: start,
        main: end,
    };
};

export const resolveTrackLength = (
    value: HeightTrackType | undefined,
    containerSize: number,
): number => {
    if (!value) return containerSize;

    const px = parsePxValue(value);
    if (px !== null) return px;

    const percentMatch = /^(-?\d+(?:\.\d+)?)%$/.exec(value);
    if (percentMatch) return (Number(percentMatch[1]) / 100) * containerSize;

    const vhMatch = /^(-?\d+(?:\.\d+)?)vh$/.exec(value);
    if (vhMatch) {
        const vh =
            typeof window !== "undefined" ? window.innerHeight : containerSize;
        return (Number(vhMatch[1]) / 100) * vh;
    }

    const dvhMatch = /^(-?\d+(?:\.\d+)?)d(s)?vh$/.exec(value);
    if (dvhMatch) {
        const dvh =
            typeof window !== "undefined"
                ? (window.visualViewport?.height ?? window.innerHeight)
                : containerSize;
        return (Number(dvhMatch[1]) / 100) * dvh;
    }

    return containerSize;
};

export const computeThumbSize = (
    trackLength: number,
    metrics: AxisMetrics,
    thumbHeightTrack: ScrollToFutureThumb["heightTrack"],
): number => {
    if (trackLength <= 0) return 0;

    const minSize = Math.min(MIN_THUMB_SIZE, trackLength);
    const maxSize = Math.min(
        trackLength,
        Math.max(minSize, trackLength * MAX_THUMB_RATIO),
    );

    if (!thumbHeightTrack || thumbHeightTrack === "auto") {
        const ratio =
            metrics.scrollSize > 0
                ? metrics.clientSize / metrics.scrollSize
                : 1;

        const autoSize = trackLength * clamp(ratio, 0, 1);
        return clamp(autoSize, minSize, maxSize);
    }

    const px = parsePxValue(thumbHeightTrack);

    if (px !== null) {
        return clamp(px, minSize, maxSize);
    }

    const percentMatch = /^(-?\d+(?:\.\d+)?)%$/.exec(thumbHeightTrack.trim());

    if (percentMatch) {
        const size = (Number(percentMatch[1]) / 100) * trackLength;

        return clamp(size, minSize, maxSize);
    }

    return maxSize;
};

export const computeThumbPosition = (
    trackLength: number,
    thumbSize: number,
    metrics: AxisMetrics,
): number => {
    const maxScroll = metrics.scrollSize - metrics.clientSize;
    const maxThumbTravel = trackLength - thumbSize;
    if (maxScroll <= 0 || maxThumbTravel <= 0) return 0;
    const ratio = clamp(metrics.scrollPos / maxScroll, 0, 1);
    return ratio * maxThumbTravel;
};

export const trackPositionToScroll = (
    trackPos: number,
    trackLength: number,
    thumbSize: number,
    metrics: AxisMetrics,
): number => {
    const maxScroll = metrics.scrollSize - metrics.clientSize;
    const maxThumbTravel = trackLength - thumbSize;
    if (maxScroll <= 0 || maxThumbTravel <= 0) return 0;
    const ratio = clamp(trackPos / maxThumbTravel, 0, 1);
    return ratio * maxScroll;
};

export const computeReservedSpace = (
    boundaryOffset: BoundaryOffset | undefined,
    trackThicknessPx: number,
    superimposition: "over" | "after" | undefined,
): number => {
    if (superimposition !== "after") {
        return 0;
    }

    const { start, end } = parseBoundaryOffset(boundaryOffset);

    return start + trackThicknessPx + end;
};

export const resolveScrollingElement = (el: HTMLElement): HTMLElement => {
    if (
        typeof document !== "undefined" &&
        (el === document.body || el === document.documentElement)
    ) {
        return (
            (document.scrollingElement as HTMLElement | null) ??
            document.documentElement
        );
    }
    return el;
};

export const isPageScrollTarget = (el: HTMLElement): boolean =>
    typeof document !== "undefined" &&
    (el === document.body ||
        el === document.documentElement ||
        el === document.scrollingElement);

const allowsAxisScroll = (element: HTMLElement, axis: Axis): boolean => {
    const style = window.getComputedStyle(element);

    const overflow = axis === "x" ? style.overflowX : style.overflowY;

    return /^(auto|scroll|overlay)$/.test(overflow);
};

export const resolveActualScrollTarget = (
    element: HTMLElement,
    mode: ScrollBarMode,
): HTMLElement => {
    const scrollingElement =
        document.scrollingElement instanceof HTMLElement
            ? document.scrollingElement
            : document.documentElement;

    if (
        element === document.body ||
        element === document.documentElement ||
        element === document.scrollingElement
    ) {
        return scrollingElement;
    }

    let current: HTMLElement | null = element;

    while (current) {
        const allowsX = allowsAxisScroll(current, "x");
        const allowsY = allowsAxisScroll(current, "y");

        const matches =
            mode === "horizontal"
                ? allowsX
                : mode === "vertical"
                  ? allowsY
                  : allowsX || allowsY;

        if (matches) {
            return current;
        }

        current = current.parentElement;
    }

    return scrollingElement;
};
