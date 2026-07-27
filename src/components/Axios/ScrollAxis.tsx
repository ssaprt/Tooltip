import type React from "react";
import { useRef, useState } from "react";

import { Axis, AxisMetrics } from "src/types/config/axis.type";
import {
    PositionMode,
    ScrollToFutureScrollBar,
    Superimposition,
} from "src/types/config/scrollbar.type";
import { ScrollToFutureThumb } from "src/types/config/thumb.type";
import { DEFAULT_TRACK_THICKNESS } from "src/utils/constants";
import {
    clamp,
    computeThumbPosition,
    computeThumbSize,
    fitInsetsWithinSize,
    isPageScrollTarget,
    parseBoundaryOffset,
    parsePxValue,
    resolveTrackLength,
    trackPositionToScroll,
} from "src/utils/helper";

interface ScrollAxisProps {
    axis: Axis;
    target: HTMLElement | null;
    metrics: AxisMetrics;
    scrollBar: ScrollToFutureScrollBar;
    thumb: ScrollToFutureThumb;
    positionMode: PositionMode;
    superimposition: Superimposition;
    hasCrossAxis: boolean;

    vars: Record<string, string>;
}

export const ScrollAxis = ({
    axis,
    target,
    metrics,
    scrollBar,
    thumb,
    positionMode,
    superimposition,
    hasCrossAxis,
    vars,
}: ScrollAxisProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragState = useRef<{
        startPointer: number;
        startScroll: number;
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const requestedTrackThickness =
        parsePxValue(scrollBar.widthTrack) ?? DEFAULT_TRACK_THICKNESS;
    const trackThickness = Math.max(1, requestedTrackThickness);
    const trackBoundary = parseBoundaryOffset(scrollBar.boundaryOffset);
    const thumbBoundary = parseBoundaryOffset(thumb.boundaryOffset);
    const reserveCrossAxisCorner = hasCrossAxis;
    const crossAxisCornerSize = reserveCrossAxisCorner
        ? trackThickness +
          (positionMode === "before" ? trackBoundary.start : trackBoundary.end)
        : 0;
    const trackCenter = metrics.clientSize / 2;
    const requestedTrackLength = resolveTrackLength(
        scrollBar.heightTrack,
        metrics.clientSize,
    );
    const maximumTrackLength = Math.max(
        0,
        metrics.clientSize - crossAxisCornerSize * 2,
    );
    const trackLength =
        maximumTrackLength > 0
            ? clamp(requestedTrackLength, 1, maximumTrackLength)
            : 0;
    const fittedThumbMainInsets = fitInsetsWithinSize(
        thumbBoundary.start,
        thumbBoundary.end,
        trackLength,
        1,
    );
    const thumbMainStart = fittedThumbMainInsets.start;
    const innerTrackLength = fittedThumbMainInsets.innerSize;
    const requestedThumbCrossSize =
        trackThickness - thumbBoundary.start - thumbBoundary.end;
    const thumbCrossSize = clamp(requestedThumbCrossSize, 1, trackThickness);
    const thumbSize = computeThumbSize(
        innerTrackLength,
        metrics,
        thumb.heightTrack,
    );
    const thumbPositionInsideTrack = computeThumbPosition(
        innerTrackLength,
        thumbSize,
        metrics,
    );
    const thumbPosition = thumbMainStart + thumbPositionInsideTrack;
    const maxScroll = Math.max(0, metrics.scrollSize - metrics.clientSize);
    const maxThumbTravel = Math.max(0, innerTrackLength - thumbSize);

    const setScrollPosition = (value: number) => {
        const targetElement = target;

        if (!targetElement) {
            return;
        }

        const nextValue = clamp(value, 0, maxScroll);

        if (!isPageScrollTarget(targetElement)) {
            if (axis === "x") {
                targetElement.scrollLeft = nextValue;
            } else {
                targetElement.scrollTop = nextValue;
            }

            return;
        }

        const targetStyle = window.getComputedStyle(targetElement);
        const overflowValue =
            axis === "x" ? targetStyle.overflowX : targetStyle.overflowY;
        const targetCanScroll =
            axis === "x"
                ? targetElement.scrollWidth - targetElement.clientWidth > 1
                : targetElement.scrollHeight - targetElement.clientHeight > 1;
        const targetOwnsScroll =
            targetCanScroll && /^(auto|scroll|overlay)$/.test(overflowValue);

        if (targetOwnsScroll) {
            if (axis === "x") {
                targetElement.scrollLeft = nextValue;
            } else {
                targetElement.scrollTop = nextValue;
            }

            return;
        }

        window.scrollTo({
            left: axis === "x" ? nextValue : window.scrollX,
            top: axis === "y" ? nextValue : window.scrollY,
            behavior: "auto",
        });
    };

    const handleThumbPointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        dragState.current = {
            startPointer: axis === "x" ? event.clientX : event.clientY,
            startScroll: metrics.scrollPos,
        };

        setIsDragging(true);

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleThumbPointerMove = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        const currentDragState = dragState.current;

        if (!currentDragState) {
            return;
        }

        if (maxScroll <= 0 || maxThumbTravel <= 0) {
            return;
        }

        const pointerPosition = axis === "x" ? event.clientX : event.clientY;
        const pointerDelta = pointerPosition - currentDragState.startPointer;
        const scrollDelta = (pointerDelta / maxThumbTravel) * maxScroll;

        setScrollPosition(currentDragState.startScroll + scrollDelta);
    };

    const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current) {
            return;
        }

        dragState.current = null;

        setIsDragging(false);

        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch {}
    };

    const handleTrackPointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
    ) => {
        if (event.target !== event.currentTarget) {
            return;
        }

        const trackElement = trackRef.current;

        if (!trackElement) {
            return;
        }

        if (maxThumbTravel <= 0) {
            return;
        }

        const rect = trackElement.getBoundingClientRect();
        const clickPosition =
            axis === "x" ? event.clientX - rect.left : event.clientY - rect.top;
        const clickInsideInnerTrack = clickPosition - thumbMainStart;
        const targetThumbStart = clamp(
            clickInsideInnerTrack - thumbSize / 2,
            0,
            maxThumbTravel,
        );
        const nextScroll = trackPositionToScroll(
            targetThumbStart,
            innerTrackLength,
            thumbSize,
            metrics,
        );

        setScrollPosition(nextScroll);
    };

    if (
        !metrics.canScroll ||
        metrics.clientSize <= 0 ||
        trackLength < 1 ||
        innerTrackLength < 1 ||
        thumbSize < 1
    ) {
        return null;
    }

    const trackStyle: React.CSSProperties =
        axis === "y"
            ? {
                  position: "absolute",
                  top: trackCenter,
                  transform: "translateY(-50%)",
                  width: trackThickness,
                  height: trackLength,
                  ...(positionMode === "before"
                      ? {
                            left: trackBoundary.start,
                        }
                      : {
                            right: trackBoundary.end,
                        }),
                  pointerEvents: "auto",
              }
            : {
                  position: "absolute",
                  left: trackCenter,
                  transform: "translateX(-50%)",
                  width: trackLength,
                  height: trackThickness,
                  ...(positionMode === "before"
                      ? {
                            top: trackBoundary.start,
                        }
                      : {
                            bottom: trackBoundary.end,
                        }),
                  pointerEvents: "auto",
              };
    const thumbStyle: React.CSSProperties =
        axis === "y"
            ? {
                  top: 0,
                  left: "50%",
                  width: thumbCrossSize,
                  height: thumbSize,
                  transform: `translate3d(-50%, ${thumbPosition}px, 0)`,
                  willChange: "transform",
              }
            : {
                  top: "50%",
                  left: 0,
                  width: thumbSize,
                  height: thumbCrossSize,
                  transform: `translate3d(${thumbPosition}px, -50%, 0)`,
                  willChange: "transform",
              };

    return (
        <div
            ref={trackRef}
            className="scroll-to-future__track"
            style={{
                ...trackStyle,
                ...vars,
            }}
            onPointerDown={handleTrackPointerDown}
            data-axis={axis}
            data-superimposition={superimposition}
        >
            <div
                className={`scroll-to-future__thumb ${
                    isDragging ? "scroll-to-future__thumb--dragging" : ""
                }`.trim()}
                style={thumbStyle}
                onPointerDown={handleThumbPointerDown}
                onPointerMove={handleThumbPointerMove}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
            />
        </div>
    );
};
