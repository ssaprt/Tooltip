import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useLayoutEffect } from "react";

import { DEFAULT_TRACK_THICKNESS } from "src/utils/constants";
import { computeReservedSpace, parsePxValue } from "src/utils/helper";
import type { MergedConfig } from "src/utils/merge";
import { hideNativeScrollbar } from "src/utils/native-scrollbar";

export const useFuture = ({
    target,
    anchorRef,
    targetRef,
    setFindedTarget,
    mounted,
    config,
    showY,
    showX,
    superimposition,
    findedTarget,
    positionMode,
    coversAllScrollableAxes,
    nativeOnMobile,
}: {
    target?: RefObject<HTMLElement | null> | null;
    anchorRef: RefObject<HTMLSpanElement | null>;
    targetRef: RefObject<HTMLElement | null>;
    setFindedTarget: Dispatch<SetStateAction<HTMLElement | null>>;
    mounted: boolean;
    config: MergedConfig;
    showY: boolean;
    showX: boolean;
    superimposition: "over" | "after";
    findedTarget: HTMLElement | null;
    positionMode: "before" | "after";
    coversAllScrollableAxes: boolean;
    nativeOnMobile: boolean;
}) => {
    useLayoutEffect(() => {
        if (!mounted) {
            return;
        }

        let rafId: number | null = null;
        let stopped = false;

        const resolveTarget = () => {
            if (stopped) {
                return;
            }

            const nextTarget = target
                ? target.current
                : (anchorRef.current?.parentElement ?? null);

            if (!nextTarget) {
                rafId = requestAnimationFrame(resolveTarget);

                return;
            }

            targetRef.current = nextTarget;

            setFindedTarget((previousTarget) =>
                previousTarget === nextTarget ? previousTarget : nextTarget,
            );
        };

        resolveTarget();

        return () => {
            stopped = true;

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [anchorRef, mounted, setFindedTarget, target, targetRef]);

    useEffect(() => {
        const element = findedTarget;

        if (!element) {
            return;
        }

        const trackThickness =
            parsePxValue(config.scrollBar.widthTrack) ??
            DEFAULT_TRACK_THICKNESS;
        const reservedY = showY
            ? computeReservedSpace(
                  config.scrollBar.boundaryOffset,
                  trackThickness,
                  superimposition,
              )
            : 0;
        const reservedX = showX
            ? computeReservedSpace(
                  config.scrollBar.boundaryOffset,
                  trackThickness,
                  superimposition,
              )
            : 0;
        const previousInlinePadding = {
            left: element.style.paddingLeft,
            right: element.style.paddingRight,
            top: element.style.paddingTop,
            bottom: element.style.paddingBottom,
        };
        const computedStyle = window.getComputedStyle(element);
        const basePaddingLeft =
            Number.parseFloat(computedStyle.paddingLeft) || 0;
        const basePaddingRight =
            Number.parseFloat(computedStyle.paddingRight) || 0;
        const basePaddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
        const basePaddingBottom =
            Number.parseFloat(computedStyle.paddingBottom) || 0;

        if (reservedY > 0) {
            if (positionMode === "before") {
                element.style.paddingLeft = `${basePaddingLeft + reservedY}px`;
            } else {
                element.style.paddingRight = `${basePaddingRight + reservedY}px`;
            }
        }

        if (reservedX > 0) {
            if (positionMode === "before") {
                element.style.paddingTop = `${basePaddingTop + reservedX}px`;
            } else {
                element.style.paddingBottom = `${basePaddingBottom + reservedX}px`;
            }
        }

        return () => {
            element.style.paddingLeft = previousInlinePadding.left;
            element.style.paddingRight = previousInlinePadding.right;
            element.style.paddingTop = previousInlinePadding.top;
            element.style.paddingBottom = previousInlinePadding.bottom;
        };
    }, [
        config.scrollBar.boundaryOffset,
        config.scrollBar.widthTrack,
        findedTarget,
        positionMode,
        showX,
        showY,
        superimposition,
    ]);

    useEffect(() => {
        if (!findedTarget) {
            return;
        }

        const mode = config.scrollBar.hideNativeScrollbar ?? false;

        if (mode === false || !coversAllScrollableAxes) {
            return;
        }

        return hideNativeScrollbar(findedTarget, mode, nativeOnMobile);
    }, [
        config.scrollBar.hideNativeScrollbar,
        coversAllScrollableAxes,
        findedTarget,
        nativeOnMobile,
    ]);
};
