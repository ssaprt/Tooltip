import { useEffect } from "react";
import { DEFAULT_TRACK_THICKNESS } from "src/utils/constants";
import { computeReservedSpace, parsePxValue } from "src/utils/helper";
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
    target?: React.RefObject<HTMLElement | null> | null;
    anchorRef: React.RefObject<HTMLSpanElement | null>;
    targetRef: React.RefObject<HTMLElement | null>;
    setFindedTarget: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    mounted: boolean;
    config: any;
    showY: boolean;
    showX: boolean;
    superimposition: "over" | "after";
    findedTarget: HTMLElement | null;
    positionMode: "before" | "after";
    coversAllScrollableAxes: boolean;
    nativeOnMobile: boolean;
}) => {
    useEffect(() => {
        if (!mounted) return;

        let rafId: number | null = null;
        let stopped = false;

        const getPageTarget = (): HTMLElement =>
            document.scrollingElement instanceof HTMLElement
                ? document.scrollingElement
                : document.documentElement;

        const resolveTarget = () => {
            if (stopped) return;

            const explicitTarget = target?.current ?? null;
            const parentTarget = anchorRef.current?.parentElement ?? null;

            const nextTarget =
                explicitTarget ?? parentTarget ?? getPageTarget();

            targetRef.current = nextTarget;

            setFindedTarget((previousTarget) =>
                previousTarget === nextTarget ? previousTarget : nextTarget,
            );

            if (target && !explicitTarget) {
                rafId = requestAnimationFrame(resolveTarget);
            }
        };

        resolveTarget();

        return () => {
            stopped = true;

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [mounted, target, anchorRef, targetRef, setFindedTarget]);

    useEffect(() => {
        const el = targetRef.current;
        if (!el) return;

        const trackThickness =
            parsePxValue(config.scrollBar?.widthTrack) ??
            DEFAULT_TRACK_THICKNESS;
        const reservedY = showY
            ? computeReservedSpace(
                  config.scrollBar?.boundaryOffset,
                  trackThickness,
                  superimposition,
              )
            : 0;
        const reservedX = showX
            ? computeReservedSpace(
                  config.scrollBar?.boundaryOffset,
                  trackThickness,
                  superimposition,
              )
            : 0;
        const previousInlinePadding = {
            left: el.style.paddingLeft,
            right: el.style.paddingRight,
            top: el.style.paddingTop,
            bottom: el.style.paddingBottom,
        };
        const computedStyle = window.getComputedStyle(el);
        const basePadding = {
            left: Number.parseFloat(computedStyle.paddingLeft) || 0,
            right: Number.parseFloat(computedStyle.paddingRight) || 0,
            top: Number.parseFloat(computedStyle.paddingTop) || 0,
            bottom: Number.parseFloat(computedStyle.paddingBottom) || 0,
        };

        if (reservedY > 0) {
            if (positionMode === "before") {
                el.style.paddingLeft = `${basePadding.left + reservedY}px`;
            } else {
                el.style.paddingRight = `${basePadding.right + reservedY}px`;
            }
        }

        if (reservedX > 0) {
            if (positionMode === "before") {
                el.style.paddingTop = `${basePadding.top + reservedX}px`;
            } else {
                el.style.paddingBottom = `${basePadding.bottom + reservedX}px`;
            }
        }

        return () => {
            el.style.paddingLeft = previousInlinePadding.left;
            el.style.paddingRight = previousInlinePadding.right;
            el.style.paddingTop = previousInlinePadding.top;
            el.style.paddingBottom = previousInlinePadding.bottom;
        };
    }, [
        findedTarget,
        showX,
        showY,
        positionMode,
        superimposition,
        config.scrollBar?.boundaryOffset,
        config.scrollBar?.widthTrack,
    ]);

    useEffect(() => {
        if (!findedTarget) return;
        const mode = config.scrollBar?.hideNativeScrollbar ?? false;
        if (mode === false || !coversAllScrollableAxes) {
            return;
        }

        return hideNativeScrollbar(findedTarget, mode, nativeOnMobile);
    }, [
        findedTarget,
        coversAllScrollableAxes,
        nativeOnMobile,
        config.scrollBar?.hideNativeScrollbar,
    ]);
};
