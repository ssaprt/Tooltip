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
const INTERACTIVE_DIRECT_PADDING = 4;
const INTERACTIVE_BRIDGE_PADDING = 8;
const INTERACTIVE_BRIDGE_TIMEOUT = 700;
const INTERACTIVE_RECHECK_INTERVAL = 50;
const TOUCH_MOVE_THRESHOLD = 10;
const TOUCH_MAX_TAP_DURATION = 600;
const TOUCH_FOCUS_SUPPRESSION = 700;

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

type Point = {
    x: number;
    y: number;
};

type PointerSnapshot = Point & {
    pointerType: string;
};

type TouchGesture = {
    pointerId: number;
    startX: number;
    startY: number;
    startedAt: number;
    moved: boolean;
    cancelled: boolean;
};

type InteractivePointerArea = "direct" | "bridge" | "outside";

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

const isPointInsideRect = (point: Point, rect: DOMRect, padding = 0) => {
    return (
        point.x >= rect.left - padding &&
        point.x <= rect.right + padding &&
        point.y >= rect.top - padding &&
        point.y <= rect.bottom + padding
    );
};

const isPointOnSegment = (point: Point, start: Point, end: Point) => {
    const cross =
        (point.y - start.y) * (end.x - start.x) -
        (point.x - start.x) * (end.y - start.y);

    if (Math.abs(cross) > 0.001) {
        return false;
    }

    return (
        point.x >= Math.min(start.x, end.x) &&
        point.x <= Math.max(start.x, end.x) &&
        point.y >= Math.min(start.y, end.y) &&
        point.y <= Math.max(start.y, end.y)
    );
};

const isPointInsidePolygon = (point: Point, polygon: Point[]) => {
    let inside = false;

    for (
        let currentIndex = 0, previousIndex = polygon.length - 1;
        currentIndex < polygon.length;
        previousIndex = currentIndex, currentIndex += 1
    ) {
        const current = polygon[currentIndex];
        const previous = polygon[previousIndex];

        if (isPointOnSegment(point, previous, current)) {
            return true;
        }

        const crosses =
            current.y > point.y !== previous.y > point.y &&
            point.x <
                ((previous.x - current.x) * (point.y - current.y)) /
                    (previous.y - current.y) +
                    current.x;

        if (crosses) {
            inside = !inside;
        }
    }

    return inside;
};

const createInteractiveBridge = (
    anchorRect: DOMRect,
    tooltipRect: DOMRect,
    placement: TooltipPlacement,
) => {
    const padding = INTERACTIVE_BRIDGE_PADDING;

    if (placement === "top") {
        return [
            {
                x: tooltipRect.left - padding,
                y: tooltipRect.bottom - padding,
            },
            {
                x: tooltipRect.right + padding,
                y: tooltipRect.bottom - padding,
            },
            {
                x: anchorRect.right + padding,
                y: anchorRect.top + padding,
            },
            {
                x: anchorRect.left - padding,
                y: anchorRect.top + padding,
            },
        ];
    }

    if (placement === "bottom") {
        return [
            {
                x: anchorRect.left - padding,
                y: anchorRect.bottom - padding,
            },
            {
                x: anchorRect.right + padding,
                y: anchorRect.bottom - padding,
            },
            {
                x: tooltipRect.right + padding,
                y: tooltipRect.top + padding,
            },
            {
                x: tooltipRect.left - padding,
                y: tooltipRect.top + padding,
            },
        ];
    }

    if (placement === "left") {
        return [
            {
                x: tooltipRect.right - padding,
                y: tooltipRect.top - padding,
            },
            {
                x: anchorRect.left + padding,
                y: anchorRect.top - padding,
            },
            {
                x: anchorRect.left + padding,
                y: anchorRect.bottom + padding,
            },
            {
                x: tooltipRect.right - padding,
                y: tooltipRect.bottom + padding,
            },
        ];
    }

    return [
        {
            x: anchorRect.right - padding,
            y: anchorRect.top - padding,
        },
        {
            x: tooltipRect.left + padding,
            y: tooltipRect.top - padding,
        },
        {
            x: tooltipRect.left + padding,
            y: tooltipRect.bottom + padding,
        },
        {
            x: anchorRect.right - padding,
            y: anchorRect.bottom + padding,
        },
    ];
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
    const interactiveFrameRef = useRef<number | null>(null);
    const phaseRef = useRef<TooltipPhase>("hidden");
    const pendingHideRef = useRef(false);
    const interactiveBridgeDeadlineRef = useRef(0);
    const pointerRef = useRef<PointerSnapshot>({
        x: Number.NaN,
        y: Number.NaN,
        pointerType: "",
    });
    const touchGestureRef = useRef<TouchGesture | null>(null);
    const suppressFocusUntilRef = useRef(0);

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

    const clearInteractiveFrame = useCallback(() => {
        if (interactiveFrameRef.current === null) {
            return;
        }

        window.cancelAnimationFrame(interactiveFrameRef.current);
        interactiveFrameRef.current = null;
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

        const preferredAvailable = getAvailableSpace(preferredPlacement, rect);
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

    const isFocusInsideTooltipRegion = useCallback(() => {
        if (!anchor || typeof document === "undefined") {
            return false;
        }

        const activeElement = document.activeElement;
        const tooltip = tooltipRef.current;

        if (!(activeElement instanceof Node)) {
            return false;
        }

        if (interactive && tooltip?.contains(activeElement)) {
            return true;
        }

        return (
            anchor.contains(activeElement) &&
            activeElement instanceof Element &&
            activeElement.matches(":focus-visible")
        );
    }, [anchor, interactive]);

    const getInteractivePointerArea =
        useCallback((): InteractivePointerArea => {
            if (!interactive || !anchor) {
                return "outside";
            }

            const pointer = pointerRef.current;
            const tooltip = tooltipRef.current;

            if (
                !tooltip ||
                (pointer.pointerType !== "mouse" &&
                    pointer.pointerType !== "pen") ||
                !Number.isFinite(pointer.x) ||
                !Number.isFinite(pointer.y)
            ) {
                return "outside";
            }

            const point = {
                x: pointer.x,
                y: pointer.y,
            };
            const anchorRect = anchor.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            if (
                isPointInsideRect(
                    point,
                    anchorRect,
                    INTERACTIVE_DIRECT_PADDING,
                ) ||
                isPointInsideRect(
                    point,
                    tooltipRect,
                    INTERACTIVE_DIRECT_PADDING,
                )
            ) {
                return "direct";
            }

            const bridge = createInteractiveBridge(
                anchorRect,
                tooltipRect,
                placement,
            );

            return isPointInsidePolygon(point, bridge) ? "bridge" : "outside";
        }, [anchor, interactive, placement]);

    const removeTooltip = useCallback(() => {
        clearHideTimer();
        clearEnterFrames();
        clearInteractiveFrame();
        pendingHideRef.current = false;
        interactiveBridgeDeadlineRef.current = 0;
        updatePhase("hidden");
    }, [clearEnterFrames, clearHideTimer, clearInteractiveFrame, updatePhase]);

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
            if (immediate) {
                clearHideTimer();
                interactiveBridgeDeadlineRef.current = 0;
                runHide();
                return;
            }

            if (hideTimerRef.current !== null) {
                return;
            }

            const attemptHide = () => {
                hideTimerRef.current = null;

                if (isFocusInsideTooltipRegion()) {
                    interactiveBridgeDeadlineRef.current = 0;
                    return;
                }

                if (interactive) {
                    const pointerArea = getInteractivePointerArea();

                    if (pointerArea === "direct") {
                        interactiveBridgeDeadlineRef.current = 0;
                        return;
                    }

                    if (pointerArea === "bridge") {
                        const now = window.performance.now();

                        if (interactiveBridgeDeadlineRef.current === 0) {
                            interactiveBridgeDeadlineRef.current =
                                now + INTERACTIVE_BRIDGE_TIMEOUT;
                        }

                        const remaining =
                            interactiveBridgeDeadlineRef.current - now;

                        if (remaining > 0) {
                            hideTimerRef.current = window.setTimeout(
                                attemptHide,
                                Math.min(
                                    INTERACTIVE_RECHECK_INTERVAL,
                                    remaining,
                                ),
                            );
                            return;
                        }
                    }
                }

                interactiveBridgeDeadlineRef.current = 0;
                runHide();
            };

            hideTimerRef.current = window.setTimeout(
                attemptHide,
                resolvedHideDelay,
            );
        },
        [
            clearHideTimer,
            getInteractivePointerArea,
            interactive,
            isFocusInsideTooltipRegion,
            resolvedHideDelay,
            runHide,
        ],
    );

    const showTooltip = useCallback(() => {
        if (!anchor || disabled) {
            return;
        }

        clearHideTimer();
        clearEnterFrames();
        interactiveBridgeDeadlineRef.current = 0;
        pendingHideRef.current = false;
        setMounted(true);

        if (phaseRef.current === "entering" || phaseRef.current === "visible") {
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
        interactiveBridgeDeadlineRef.current = 0;
        pendingHideRef.current = false;

        if (phaseRef.current === "leaving") {
            updatePhase("visible");
        }
    }, [clearHideTimer, disabled, interactive, updatePhase]);

    const processInteractivePointer = useCallback(() => {
        if (!interactive || disabled || phaseRef.current === "hidden") {
            return;
        }

        if (isFocusInsideTooltipRegion()) {
            keepTooltipOpen();
            return;
        }

        const pointerArea = getInteractivePointerArea();

        if (pointerArea === "direct") {
            keepTooltipOpen();
            return;
        }

        if (pointerArea === "bridge") {
            if (interactiveBridgeDeadlineRef.current === 0) {
                interactiveBridgeDeadlineRef.current =
                    window.performance.now() + INTERACTIVE_BRIDGE_TIMEOUT;
            }

            hideTooltip(false);
            return;
        }

        interactiveBridgeDeadlineRef.current = 0;
        hideTooltip(false);
    }, [
        disabled,
        getInteractivePointerArea,
        hideTooltip,
        interactive,
        isFocusInsideTooltipRegion,
        keepTooltipOpen,
    ]);

    const scheduleInteractivePointerProcessing = useCallback(() => {
        if (interactiveFrameRef.current !== null) {
            return;
        }

        interactiveFrameRef.current = window.requestAnimationFrame(() => {
            interactiveFrameRef.current = null;
            processInteractivePointer();
        });
    }, [processInteractivePointer]);

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

        const updatePointer = (event: PointerEvent) => {
            pointerRef.current = {
                x: event.clientX,
                y: event.clientY,
                pointerType: event.pointerType,
            };
        };

        const onPointerEnter = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType === "touch") {
                return;
            }

            showTooltip();
        };

        const onPointerLeave = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType === "touch") {
                return;
            }

            if (interactive) {
                interactiveBridgeDeadlineRef.current =
                    window.performance.now() + INTERACTIVE_BRIDGE_TIMEOUT;
                hideTooltip(false);
                scheduleInteractivePointerProcessing();
                return;
            }

            hideTooltip(false);
        };

        const onPointerDown = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType !== "touch") {
                return;
            }

            const now = window.performance.now();

            touchGestureRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                startedAt: now,
                moved: false,
                cancelled: false,
            };
            suppressFocusUntilRef.current = now + TOUCH_FOCUS_SUPPRESSION;
        };

        const onPointerMove = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType !== "touch") {
                return;
            }

            const gesture = touchGestureRef.current;

            if (!gesture || gesture.pointerId !== event.pointerId) {
                return;
            }

            const distance = Math.hypot(
                event.clientX - gesture.startX,
                event.clientY - gesture.startY,
            );

            if (distance <= TOUCH_MOVE_THRESHOLD) {
                return;
            }

            gesture.moved = true;
            suppressFocusUntilRef.current =
                window.performance.now() + TOUCH_FOCUS_SUPPRESSION;
            hideTooltip(true);
        };

        const onPointerUp = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType !== "touch") {
                return;
            }

            const gesture = touchGestureRef.current;
            touchGestureRef.current = null;

            if (!gesture || gesture.pointerId !== event.pointerId) {
                return;
            }

            const now = window.performance.now();
            const distance = Math.hypot(
                event.clientX - gesture.startX,
                event.clientY - gesture.startY,
            );
            const duration = now - gesture.startedAt;

            suppressFocusUntilRef.current = now + TOUCH_FOCUS_SUPPRESSION;

            if (
                gesture.cancelled ||
                gesture.moved ||
                distance > TOUCH_MOVE_THRESHOLD ||
                duration > TOUCH_MAX_TAP_DURATION
            ) {
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

        const onPointerCancel = (event: PointerEvent) => {
            if (event.pointerType !== "touch") {
                return;
            }

            const gesture = touchGestureRef.current;

            if (!gesture || gesture.pointerId !== event.pointerId) {
                return;
            }

            gesture.cancelled = true;
            touchGestureRef.current = null;
            suppressFocusUntilRef.current =
                window.performance.now() + TOUCH_FOCUS_SUPPRESSION;
            hideTooltip(true);
        };

        const onFocusIn = () => {
            if (window.performance.now() < suppressFocusUntilRef.current) {
                return;
            }

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
        anchor.addEventListener("pointermove", onPointerMove);
        anchor.addEventListener("pointerup", onPointerUp);
        anchor.addEventListener("pointercancel", onPointerCancel);
        anchor.addEventListener("focusin", onFocusIn);
        anchor.addEventListener("focusout", onFocusOut);

        return () => {
            anchor.removeEventListener("pointerenter", onPointerEnter);
            anchor.removeEventListener("pointerleave", onPointerLeave);
            anchor.removeEventListener("pointerdown", onPointerDown);
            anchor.removeEventListener("pointermove", onPointerMove);
            anchor.removeEventListener("pointerup", onPointerUp);
            anchor.removeEventListener("pointercancel", onPointerCancel);
            anchor.removeEventListener("focusin", onFocusIn);
            anchor.removeEventListener("focusout", onFocusOut);

            touchGestureRef.current = null;
            clearHideTimer();
            clearEnterFrames();
            clearInteractiveFrame();
        };
    }, [
        anchor,
        clearEnterFrames,
        clearHideTimer,
        clearInteractiveFrame,
        hideTooltip,
        interactive,
        removeTooltip,
        scheduleInteractivePointerProcessing,
        showTooltip,
    ]);

    useEffect(() => {
        if (!interactive || phase === "hidden") {
            return;
        }

        const tooltip = tooltipRef.current;

        if (!tooltip) {
            return;
        }

        const updatePointer = (event: PointerEvent) => {
            pointerRef.current = {
                x: event.clientX,
                y: event.clientY,
                pointerType: event.pointerType,
            };
        };

        const onPointerEnter = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType === "touch") {
                return;
            }

            keepTooltipOpen();
        };

        const onPointerLeave = (event: PointerEvent) => {
            updatePointer(event);

            if (event.pointerType === "touch") {
                return;
            }

            interactiveBridgeDeadlineRef.current =
                window.performance.now() + INTERACTIVE_BRIDGE_TIMEOUT;
            hideTooltip(false);
            scheduleInteractivePointerProcessing();
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
        phase,
        scheduleInteractivePointerProcessing,
    ]);

    useEffect(() => {
        if (!interactive || phase === "hidden") {
            return;
        }

        const onDocumentPointerMove = (event: PointerEvent) => {
            if (event.pointerType === "touch") {
                return;
            }

            pointerRef.current = {
                x: event.clientX,
                y: event.clientY,
                pointerType: event.pointerType,
            };

            scheduleInteractivePointerProcessing();
        };

        document.addEventListener("pointermove", onDocumentPointerMove, {
            passive: true,
        });

        return () => {
            document.removeEventListener("pointermove", onDocumentPointerMove);
            clearInteractiveFrame();
        };
    }, [
        clearInteractiveFrame,
        interactive,
        phase,
        scheduleInteractivePointerProcessing,
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

            touchGestureRef.current = null;
            hideTooltip(true);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                hideTooltip(true);
            }
        };

        document.addEventListener("pointerdown", onDocumentPointerDown, true);
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
    }, [anchor, calculatePosition, hideTooltip, interactive, phase]);

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
