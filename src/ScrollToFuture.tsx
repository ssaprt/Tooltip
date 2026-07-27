"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { CSSProperties } from "react";
import { ScrollAxis } from "./components/Axios/ScrollAxis";

type HorizontalGutterStyle = CSSProperties & {
    "--scroll-to-future-gutter-size": string;
};

import "./css/axis.css";
import "./css/scroll.css";

import { useElementScrollObserver } from "./hooks/useElementScrollObserver";
import { useFuture } from "./hooks/useFuture";
import { useMounted } from "./hooks/useMounted";
import { type OverlayPlacement, useTargetRect } from "./hooks/useTargetRect";
import type { ScrollToFutureInterface } from "./types/scroll-to-future.type";
import { DEFAULT_TRACK_THICKNESS } from "./utils/constants";
import {
    computeReservedSpace,
    isPageScrollTarget,
    parsePxValue,
} from "./utils/helper";
import { merge } from "./utils/merge";
import { shouldUseNativeScrollbar } from "./utils/mobile-detect";
import { variables } from "./utils/variables-css";

type OverlayStyle = CSSProperties & {
    "--scroll-to-future-horizontal-space": string;
};

export const ScrollToFuture = ({
    target,
    scrollBar = {},
    thumb = {},
    selectTheme = "primary",
    optionsTheme = {},
    nativeOnMobile = true,
}: ScrollToFutureInterface) => {
    const anchorRef = useRef<HTMLSpanElement | null>(null);
    const targetRef = useRef<HTMLElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const mounted = useMounted();
    const [findedTarget, setFindedTarget] = useState<HTMLElement | null>(null);
    const config = merge({
        scrollBar,
        thumb,
        selectTheme,
        optionsTheme,
    });
    const vars = variables(config.optionsTheme);
    const mode = config.scrollBar.mode ?? "both";
    const positionMode = config.scrollBar.positionMode ?? "after";
    const superimposition = config.scrollBar.superimposition ?? "over";
    const nativeScrollOnMobile = shouldUseNativeScrollbar() && nativeOnMobile;
    const metrics = useElementScrollObserver(findedTarget);
    const wantsY = mode === "vertical" || mode === "both";
    const wantsX = mode === "horizontal" || mode === "both";
    const showY = wantsY && metrics.y.canScroll;
    const showX = wantsX && metrics.x.canScroll;
    const coversAllScrollableAxes =
        (!metrics.x.canScroll || showX) && (!metrics.y.canScroll || showY);
    const customScrollbarEnabled = mounted && !nativeScrollOnMobile;
    const pageTarget =
        findedTarget !== null && isPageScrollTarget(findedTarget);
    const portalTarget =
        !mounted || !findedTarget
            ? null
            : pageTarget
              ? document.body
              : findedTarget.parentElement;
    const placement: OverlayPlacement = pageTarget ? "fixed" : "local";
    const overlayEnabled =
        customScrollbarEnabled &&
        findedTarget !== null &&
        portalTarget !== null;

    const trackThickness =
        parsePxValue(config.scrollBar.widthTrack) ?? DEFAULT_TRACK_THICKNESS;
    const horizontalReservedSpace =
        showX && superimposition === "after"
            ? computeReservedSpace(
                  config.scrollBar.boundaryOffset,
                  trackThickness,
                  superimposition,
              )
            : 0;
    const overlayStyle: OverlayStyle = {
        "--scroll-to-future-horizontal-space": `${horizontalReservedSpace}px`,
    };

    useFuture({
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
    });

    useTargetRect(
        findedTarget,
        portalTarget,
        overlayRef,
        placement,
        overlayEnabled,
    );

    const overlay =
        overlayEnabled && findedTarget ? (
            <div
                ref={overlayRef}
                className={`scroll-to-future__overlay ${
                    pageTarget
                        ? "scroll-to-future__overlay--fixed"
                        : "scroll-to-future__overlay--local"
                }`}
                style={overlayStyle}
                data-scroll-to-future-overlay=""
            >
                {horizontalReservedSpace > 0 && (
                    <div
                        className="scroll-to-future__horizontal-space"
                        data-position={positionMode}
                    />
                )}

                {showY && (
                    <ScrollAxis
                        vars={vars}
                        axis="y"
                        target={findedTarget}
                        metrics={metrics.y}
                        scrollBar={config.scrollBar}
                        thumb={config.thumb}
                        positionMode={positionMode}
                        superimposition={superimposition}
                        hasCrossAxis={showX}
                    />
                )}

                {showX && (
                    <ScrollAxis
                        vars={vars}
                        axis="x"
                        target={findedTarget}
                        metrics={metrics.x}
                        scrollBar={config.scrollBar}
                        thumb={config.thumb}
                        positionMode={positionMode}
                        superimposition={superimposition}
                        hasCrossAxis={showY}
                    />
                )}
            </div>
        ) : null;

    return (
        <>
            {!target && (
                <span
                    ref={anchorRef}
                    aria-hidden="true"
                    style={{
                        display: "none",
                    }}
                />
            )}

            {overlay && portalTarget && createPortal(overlay, portalTarget)}
        </>
    );
};
