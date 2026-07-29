"use client";

import {
    CSSProperties,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { TooltipPlacement } from "src/types/Tooltip.interface";

const DEFAULT_HIDE_DELAY = 120;
const DEFAULT_INTERACTIVE_HIDE_DELAY = 240;
const VIEWPORT_PADDING = 8;
const DEFAULT_ARROW_SIZE = 6;
const DEFAULT_TOOLTIP_GAP = 10;
const ARROW_EDGE_OFFSET = 10;

export type TooltipPhase =
    | "hidden"
    | "preparing"
    | "entering"
    | "visible"
    | "leaving";

type TooltipPositionStyle = CSSProperties & {
    "--tooltip-arrow-offset": string;
};

type UseTooltipOptions = {
    anchor: HTMLElement | null;
    preferredPlacement: TooltipPlacement;
    disabled?: boolean;
    interactive?: boolean;
    hideDelay?: number;
};

const oppositePlacement: Record<TooltipPlacement, TooltipPlacement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
};

const clamp = (value: number, min: number, max: number) => {
    const resolvedMax = Math.max(min, max);

    return Math.min(Math.max(value, min), resolvedMax);
};

export const useTooltip = ({
    anchor,
    preferredPlacement,
    disabled = false,
    interactive = false,
    hideDelay,
}: UseTooltipOptions) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const hideTimerRef = useRef<number | null>(null);
    const firstFrameRef = useRef<number | null>(null);
    const secondFrameRef = useRef<number | null>(null);
    const phaseRef = useRef<TooltipPhase>("hidden");
    const pendingHideRef = useRef(false);

    const [mounted, setMounted] = useState(false);
    const [phase, setPhase] = useState<TooltipPhase>("hidden");
    const [placement, setPlacement] =
        useState<TooltipPlacement>(preferredPlacement);
    const [showVersion, setShowVersion] = useState(0);
    const [position, setPosition] = useState<TooltipPositionStyle>({
        top: "0px",
        left: "0px",
        "--tooltip-arrow-offset": "50%",
    });

    const resolvedHideDelay =
        hideDelay ??
        (interactive ? DEFAULT_INTERACTIVE_HIDE_DELAY : DEFAULT_HIDE_DELAY);

    const updatePhase = useCallback((nextPhase: TooltipPhase) => {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
    }, []);

    const clearHideTimer = useCallback(() => {
        if (hideTimerRef.current === null) {
            return;
        }

        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
    }, []);

    const clearEnterFrames = useCallback(() => {
        if (firstFrameRef.current !== null) {
            window.cancelAnimationFrame(firstFrameRef.current);
            firstFrameRef.current = null;
        }

        if (secondFrameRef.current !== null) {
            window.cancelAnimationFrame(secondFrameRef.current);
            secondFrameRef.current = null;
        }
    }, []);

    const getAvailableSpace = useCallback(
        (currentPlacement: TooltipPlacement, rect: DOMRect) => {
            switch (currentPlacement) {
                case "top":
                    return rect.top - VIEWPORT_PADDING;

                case "bottom":
                    return window.innerHeight - rect.bottom - VIEWPORT_PADDING;

                case "left":
                    return rect.left - VIEWPORT_PADDING;

                case "right":
                    return window.innerWidth - rect.right - VIEWPORT_PADDING;
            }
        },
        [],
    );

    const calculatePosition = useCallback(() => {
        const tooltip = tooltipRef.current;
        const body = bodyRef.current;

        if (!anchor || !tooltip || !body) {
            return;
        }

        const rect = anchor.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(tooltip);

        const arrowSize =
            Number.parseFloat(
                computedStyle.getPropertyValue("--tooltip-arrow-size"),
            ) || DEFAULT_ARROW_SIZE;

        const tooltipGap =
            Number.parseFloat(
                computedStyle.getPropertyValue("--tooltip-gap"),
            ) || DEFAULT_TOOLTIP_GAP;

        const bodyWidth = body.offsetWidth;
        const bodyHeight = body.offsetHeight;
        const distance = arrowSize + tooltipGap;
        const opposite = oppositePlacement[preferredPlacement];

        const getRequiredSpace = (currentPlacement: TooltipPlacement) => {
            if (currentPlacement === "top" || currentPlacement === "bottom") {
                return bodyHeight + distance;
            }

            return bodyWidth + distance;
        };

        const preferredAvailable = getAvailableSpace(
            preferredPlacement,
            rect,
        );
        const preferredRequired = getRequiredSpace(preferredPlacement);

        let nextPlacement = preferredPlacement;

        if (preferredAvailable < preferredRequired) {
            const oppositeAvailable = getAvailableSpace(opposite, rect);
            const oppositeRequired = getRequiredSpace(opposite);

            if (
                oppositeAvailable >= oppositeRequired ||
                oppositeAvailable > preferredAvailable
            ) {
                nextPlacement = opposite;
            }
        }

        const anchorCenterX = rect.left + rect.width / 2;
        const anchorCenterY = rect.top + rect.height / 2;

        let top = 0;
        let left = 0;
        let arrowOffset = "50%";

        if (nextPlacement === "top") {
            top = rect.top - bodyHeight - distance;
            left = anchorCenterX - bodyWidth / 2;
        }

        if (nextPlacement === "bottom") {
            top = rect.bottom + distance;
            left = anchorCenterX - bodyWidth / 2;
        }

        if (nextPlacement === "left") {
            top = anchorCenterY - bodyHeight / 2;
            left = rect.left - bodyWidth - distance;
        }

        if (nextPlacement === "right") {
            top = anchorCenterY - bodyHeight / 2;
            left = rect.right + distance;
        }

        const maxLeft = window.innerWidth - bodyWidth - VIEWPORT_PADDING;
        const maxTop = window.innerHeight - bodyHeight - VIEWPORT_PADDING;

        left = clamp(left, VIEWPORT_PADDING, maxLeft);
        top = clamp(top, VIEWPORT_PADDING, maxTop);

        if (nextPlacement === "top" || nextPlacement === "bottom") {
            const offset = clamp(
                anchorCenterX - left,
                ARROW_EDGE_OFFSET,
                bodyWidth - ARROW_EDGE_OFFSET,
            );

            arrowOffset = `${offset}px`;
        }

        if (nextPlacement === "left" || nextPlacement === "right") {
            const offset = clamp(
                anchorCenterY - top,
                ARROW_EDGE_OFFSET,
                bodyHeight - ARROW_EDGE_OFFSET,
            );

            arrowOffset = `${offset}px`;
        }

        setPlacement(nextPlacement);
        setPosition({
            top: `${top}px`,
            left: `${left}px`,
            "--tooltip-arrow-offset": arrowOffset,
        });
    }, [anchor, getAvailableSpace, preferredPlacement]);

    const removeTooltip = useCallback(() => {
        clearHideTimer();
        clearEnterFrames();
        pendingHideRef.current = false;
        updatePhase("hidden");
    }, [clearEnterFrames, clearHideTimer, updatePhase]);

    const runHide = useCallback(() => {
        const currentPhase = phaseRef.current;

        if (currentPhase === "hidden" || currentPhase === "leaving") {
            return;
        }

        if (currentPhase === "preparing") {
            removeTooltip();
            return;
        }

        if (currentPhase === "entering") {
            pendingHideRef.current = true;
            return;
        }

        updatePhase("leaving");
    }, [removeTooltip, updatePhase]);

    const hideTooltip = useCallback(
        (immediate = false) => {
            clearHideTimer();

            if (immediate) {
                runHide();
                return;
            }

            hideTimerRef.current = window.setTimeout(() => {
                hideTimerRef.current = null;
                runHide();
            }, resolvedHideDelay);
        },
        [clearHideTimer, resolvedHideDelay, runHide],
    );

    const showTooltip = useCallback(() => {
        if (!anchor || disabled) {
            return;
        }

        clearHideTimer();
        clearEnterFrames();
        pendingHideRef.current = false;
        setMounted(true);

        if (
            phaseRef.current === "entering" ||
            phaseRef.current === "visible"
        ) {
            return;
        }

        updatePhase("preparing");
        setShowVersion((value) => value + 1);
    }, [anchor, clearEnterFrames, clearHideTimer, disabled, updatePhase]);

    const keepTooltipOpen = useCallback(() => {
        if (!interactive || disabled) {
            return;
        }

        clearHideTimer();
        pendingHideRef.current = false;

        if (phaseRef.current === "leaving") {
            updatePhase("visible");
        }
    }, [clearHideTimer, disabled, interactive, updatePhase]);

    const onAnimationEnd = useCallback(() => {
        const currentPhase = phaseRef.current;

        if (currentPhase === "entering") {
            if (pendingHideRef.current) {
                pendingHideRef.current = false;
                updatePhase("leaving");
                return;
            }

            updatePhase("visible");
            return;
        }

        if (currentPhase === "leaving") {
            removeTooltip();
        }
    }, [removeTooltip, updatePhase]);

    useLayoutEffect(() => {
        if (phase !== "preparing" || !anchor) {
            return;
        }

        calculatePosition();

        firstFrameRef.current = window.requestAnimationFrame(() => {
            firstFrameRef.current = null;

            secondFrameRef.current = window.requestAnimationFrame(() => {
                secondFrameRef.current = null;

                if (!anchor || phaseRef.current !== "preparing") {
                    return;
                }

                updatePhase("entering");
            });
        });

        return clearEnterFrames;
    }, [
        anchor,
        calculatePosition,
        clearEnterFrames,
        phase,
        showVersion,
        updatePhase,
    ]);

    useEffect(() => {
        if (!anchor) {
            removeTooltip();
            return;
        }

        const onPointerEnter = (event: PointerEvent) => {
            if (event.pointerType === "touch") {
                return;
            }

            showTooltip();
        };

        const onPointerLeave = (event: PointerEvent) => {
            if (event.pointerType === "touch") {
                return;
            }

            const relatedTarget = event.relatedTarget;
            const tooltip = tooltipRef.current;

            if (
                interactive &&
                relatedTarget instanceof Node &&
                tooltip?.contains(relatedTarget)
            ) {
                keepTooltipOpen();
                return;
            }

            hideTooltip(false);
        };

        const onPointerDown = (event: PointerEvent) => {
            if (event.pointerType !== "touch") {
                return;
            }

            if (
                phaseRef.current === "hidden" ||
                phaseRef.current === "leaving"
            ) {
                showTooltip();
            } else {
                hideTooltip(true);
            }
        };

        const onFocusIn = () => {
            showTooltip();
        };

        const onFocusOut = (event: FocusEvent) => {
            const relatedTarget = event.relatedTarget;
            const tooltip = tooltipRef.current;

            if (
                relatedTarget instanceof Node &&
                (anchor.contains(relatedTarget) ||
                    (interactive && tooltip?.contains(relatedTarget)))
            ) {
                return;
            }

            hideTooltip(false);
        };

        anchor.addEventListener("pointerenter", onPointerEnter);
        anchor.addEventListener("pointerleave", onPointerLeave);
        anchor.addEventListener("pointerdown", onPointerDown);
        anchor.addEventListener("focusin", onFocusIn);
        anchor.addEventListener("focusout", onFocusOut);

        return () => {
            anchor.removeEventListener("pointerenter", onPointerEnter);
            anchor.removeEventListener("pointerleave", onPointerLeave);
            anchor.removeEventListener("pointerdown", onPointerDown);
            anchor.removeEventListener("focusin", onFocusIn);
            anchor.removeEventListener("focusout", onFocusOut);

            clearHideTimer();
            clearEnterFrames();
        };
    }, [
        anchor,
        clearEnterFrames,
        clearHideTimer,
        hideTooltip,
        interactive,
        keepTooltipOpen,
        removeTooltip,
        showTooltip,
    ]);

    useEffect(() => {
        if (!interactive || !mounted) {
            return;
        }

        const tooltip = tooltipRef.current;

        if (!tooltip) {
            return;
        }

        const onPointerEnter = (event: PointerEvent) => {
            if (event.pointerType === "touch") {
                return;
            }

            keepTooltipOpen();
        };

        const onPointerLeave = (event: PointerEvent) => {
            if (event.pointerType === "touch") {
                return;
            }

            const relatedTarget = event.relatedTarget;

            if (
                relatedTarget instanceof Node &&
                anchor?.contains(relatedTarget)
            ) {
                keepTooltipOpen();
                return;
            }

            hideTooltip(false);
        };

        const onFocusIn = () => {
            keepTooltipOpen();
        };

        const onFocusOut = (event: FocusEvent) => {
            const relatedTarget = event.relatedTarget;

            if (
                relatedTarget instanceof Node &&
                (tooltip.contains(relatedTarget) ||
                    anchor?.contains(relatedTarget))
            ) {
                return;
            }

            hideTooltip(false);
        };

        tooltip.addEventListener("pointerenter", onPointerEnter);
        tooltip.addEventListener("pointerleave", onPointerLeave);
        tooltip.addEventListener("focusin", onFocusIn);
        tooltip.addEventListener("focusout", onFocusOut);

        return () => {
            tooltip.removeEventListener("pointerenter", onPointerEnter);
            tooltip.removeEventListener("pointerleave", onPointerLeave);
            tooltip.removeEventListener("focusin", onFocusIn);
            tooltip.removeEventListener("focusout", onFocusOut);
        };
    }, [
        anchor,
        hideTooltip,
        interactive,
        keepTooltipOpen,
        mounted,
    ]);

    useEffect(() => {
        if (!anchor || phase === "hidden") {
            return;
        }

        const onDocumentPointerDown = (event: PointerEvent) => {
            const target = event.target;
            const tooltip = tooltipRef.current;

            if (
                target instanceof Node &&
                (anchor.contains(target) ||
                    (interactive && tooltip?.contains(target)))
            ) {
                return;
            }

            hideTooltip(true);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                hideTooltip(true);
            }
        };

        document.addEventListener(
            "pointerdown",
            onDocumentPointerDown,
            true,
        );
        document.addEventListener("keydown", onKeyDown);

        window.addEventListener("resize", calculatePosition);
        window.addEventListener("scroll", calculatePosition, true);

        return () => {
            document.removeEventListener(
                "pointerdown",
                onDocumentPointerDown,
                true,
            );
            document.removeEventListener("keydown", onKeyDown);

            window.removeEventListener("resize", calculatePosition);
            window.removeEventListener("scroll", calculatePosition, true);
        };
    }, [
        anchor,
        calculatePosition,
        hideTooltip,
        interactive,
        phase,
    ]);

    useLayoutEffect(() => {
        if (phase === "hidden") {
            return;
        }

        const body = bodyRef.current;

        if (!body) {
            return;
        }

        const resizeObserver = new ResizeObserver(calculatePosition);

        resizeObserver.observe(body);

        return () => {
            resizeObserver.disconnect();
        };
    }, [calculatePosition, phase]);

    useEffect(() => {
        if (!disabled) {
            return;
        }

        hideTooltip(true);
    }, [disabled, hideTooltip]);

    return {
        shouldRender: mounted,
        phase,
        placement,
        position,
        tooltipRef,
        bodyRef,
        calculatePosition,
        onAnimationEnd,
    };
};
