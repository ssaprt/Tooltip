import { useLayoutEffect, useRef, useState } from "react";

import { AxisMetrics, TargetMetrics } from "../types/config/axis.type";
import { EMPTY_AXIS_METRICS } from "../utils/constants";
import { isPageScrollTarget } from "../utils/helper";

const isSameAxisMetrics = (previous: AxisMetrics, next: AxisMetrics): boolean =>
    previous.scrollSize === next.scrollSize &&
    previous.clientSize === next.clientSize &&
    previous.scrollPos === next.scrollPos &&
    previous.canScroll === next.canScroll;

const getActualScrollPosition = (...values: number[]): number =>
    values.reduce(
        (current, value) =>
            Math.abs(value) > Math.abs(current) ? value : current,
        0,
    );

const getEmptyMetrics = (): TargetMetrics => ({
    x: {
        ...EMPTY_AXIS_METRICS,
    },
    y: {
        ...EMPTY_AXIS_METRICS,
    },
});

const isInternalElement = (element: Element): boolean =>
    element.matches("[data-scroll-to-future-overlay]") ||
    element.closest("[data-scroll-to-future-overlay]") !== null;

export const useElementScrollObserver = (
    target: HTMLElement | null | undefined,
): TargetMetrics => {
    const [metrics, setMetrics] = useState<TargetMetrics>(getEmptyMetrics);
    const rafRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        const targetElement = target;

        if (!targetElement) {
            setMetrics(getEmptyMetrics());

            return;
        }

        const pageScroll = isPageScrollTarget(targetElement);
        let initialFrameId: number | null = null;
        let secondInitialFrameId: number | null = null;

        const measure = () => {
            let nextX: AxisMetrics;
            let nextY: AxisMetrics;

            if (pageScroll) {
                const root = document.documentElement;
                const body = document.body;
                const scrollingElement =
                    document.scrollingElement instanceof HTMLElement
                        ? document.scrollingElement
                        : root;
                const scrollWidth = Math.max(
                    root.scrollWidth,
                    body.scrollWidth,
                    scrollingElement.scrollWidth,
                    targetElement.scrollWidth,
                );
                const scrollHeight = Math.max(
                    root.scrollHeight,
                    body.scrollHeight,
                    scrollingElement.scrollHeight,
                    targetElement.scrollHeight,
                );
                const clientWidth =
                    window.visualViewport?.width ?? window.innerWidth;
                const clientHeight =
                    window.visualViewport?.height ?? window.innerHeight;
                const scrollLeft = getActualScrollPosition(
                    window.scrollX,
                    root.scrollLeft,
                    body.scrollLeft,
                    scrollingElement.scrollLeft,
                    targetElement.scrollLeft,
                );
                const scrollTop = getActualScrollPosition(
                    window.scrollY,
                    root.scrollTop,
                    body.scrollTop,
                    scrollingElement.scrollTop,
                    targetElement.scrollTop,
                );

                nextX = {
                    scrollSize: scrollWidth,
                    clientSize: clientWidth,
                    scrollPos: scrollLeft,
                    canScroll: scrollWidth - clientWidth > 1,
                };

                nextY = {
                    scrollSize: scrollHeight,
                    clientSize: clientHeight,
                    scrollPos: scrollTop,
                    canScroll: scrollHeight - clientHeight > 1,
                };
            } else {
                const scrollWidth = targetElement.scrollWidth;
                const scrollHeight = targetElement.scrollHeight;
                const clientWidth = targetElement.clientWidth;
                const clientHeight = targetElement.clientHeight;

                nextX = {
                    scrollSize: scrollWidth,
                    clientSize: clientWidth,
                    scrollPos: targetElement.scrollLeft,
                    canScroll: scrollWidth - clientWidth > 1,
                };

                nextY = {
                    scrollSize: scrollHeight,
                    clientSize: clientHeight,
                    scrollPos: targetElement.scrollTop,
                    canScroll: scrollHeight - clientHeight > 1,
                };
            }

            setMetrics((previous) => {
                const sameX = isSameAxisMetrics(previous.x, nextX);
                const sameY = isSameAxisMetrics(previous.y, nextY);

                if (sameX && sameY) {
                    return previous;
                }

                return {
                    x: nextX,
                    y: nextY,
                };
            });
        };

        const scheduleMeasure = () => {
            if (rafRef.current !== null) {
                return;
            }

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;

                measure();
            });
        };

        const resizeObserver = new ResizeObserver(scheduleMeasure);

        const observeElement = (element: Element) => {
            if (isInternalElement(element)) {
                return;
            }

            try {
                resizeObserver.observe(element);
            } catch {}
        };

        const observeTree = (root: Element) => {
            observeElement(root);

            root.querySelectorAll("*").forEach((element) => {
                observeElement(element);
            });
        };

        if (pageScroll) {
            observeTree(document.documentElement);

            if (document.body !== document.documentElement) {
                observeTree(document.body);
            }
        } else {
            observeTree(targetElement);
        }

        const mutationRoot = pageScroll
            ? document.documentElement
            : targetElement;

        const mutationObserver = new MutationObserver((mutations) => {
            let shouldMeasure = false;

            mutations.forEach((mutation) => {
                if (
                    mutation.target instanceof Element &&
                    isInternalElement(mutation.target)
                ) {
                    return;
                }

                if (mutation.type === "attributes") {
                    shouldMeasure = true;

                    return;
                }

                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) {
                        return;
                    }

                    if (isInternalElement(node)) {
                        return;
                    }

                    observeTree(node);
                    shouldMeasure = true;
                });

                if (mutation.removedNodes.length > 0) {
                    shouldMeasure = true;
                }
            });

            if (shouldMeasure) {
                scheduleMeasure();
            }
        });

        mutationObserver.observe(mutationRoot, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "hidden"],
        });

        const handleTransitionEnd = (event: Event) => {
            if (
                event.target instanceof Element &&
                isInternalElement(event.target)
            ) {
                return;
            }

            scheduleMeasure();
        };

        const handleAnimationEnd = (event: Event) => {
            if (
                event.target instanceof Element &&
                isInternalElement(event.target)
            ) {
                return;
            }

            scheduleMeasure();
        };

        window.addEventListener("scroll", scheduleMeasure, {
            capture: true,
            passive: true,
        });

        targetElement.addEventListener("scroll", scheduleMeasure, {
            passive: true,
        });

        window.addEventListener("resize", scheduleMeasure, {
            passive: true,
        });

        targetElement.addEventListener(
            "transitionend",
            handleTransitionEnd,
            true,
        );

        targetElement.addEventListener(
            "animationend",
            handleAnimationEnd,
            true,
        );

        window.visualViewport?.addEventListener("resize", scheduleMeasure, {
            passive: true,
        });

        window.visualViewport?.addEventListener("scroll", scheduleMeasure, {
            passive: true,
        });

        measure();

        initialFrameId = requestAnimationFrame(() => {
            measure();

            secondInitialFrameId = requestAnimationFrame(measure);
        });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();

            window.removeEventListener("scroll", scheduleMeasure, true);

            targetElement.removeEventListener("scroll", scheduleMeasure);

            window.removeEventListener("resize", scheduleMeasure);

            targetElement.removeEventListener(
                "transitionend",
                handleTransitionEnd,
                true,
            );

            targetElement.removeEventListener(
                "animationend",
                handleAnimationEnd,
                true,
            );

            window.visualViewport?.removeEventListener(
                "resize",
                scheduleMeasure,
            );

            window.visualViewport?.removeEventListener(
                "scroll",
                scheduleMeasure,
            );

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);

                rafRef.current = null;
            }

            if (initialFrameId !== null) {
                cancelAnimationFrame(initialFrameId);
            }

            if (secondInitialFrameId !== null) {
                cancelAnimationFrame(secondInitialFrameId);
            }
        };
    }, [target]);

    return metrics;
};
