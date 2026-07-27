import { type RefObject, useLayoutEffect } from "react";

export type OverlayPlacement = "fixed" | "local";

interface HostPositionRecord {
    count: number;
    changed: boolean;
    originalInlinePosition: string;
}

interface RgbaColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

const hostPositionRecords = new WeakMap<HTMLElement, HostPositionRecord>();

const parseColor = (value: string): RgbaColor | null => {
    const match = value.match(
        /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/,
    );

    if (!match) {
        return null;
    }

    return {
        red: Number(match[1]),
        green: Number(match[2]),
        blue: Number(match[3]),
        alpha: match[4] === undefined ? 1 : Number(match[4]),
    };
};

const compositeColors = (
    foreground: RgbaColor,
    background: RgbaColor,
): RgbaColor => {
    const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);

    if (alpha <= 0) {
        return {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        };
    }

    return {
        red:
            (foreground.red * foreground.alpha +
                background.red * background.alpha * (1 - foreground.alpha)) /
            alpha,
        green:
            (foreground.green * foreground.alpha +
                background.green * background.alpha * (1 - foreground.alpha)) /
            alpha,
        blue:
            (foreground.blue * foreground.alpha +
                background.blue * background.alpha * (1 - foreground.alpha)) /
            alpha,
        alpha,
    };
};

const resolveSurfaceColor = (target: HTMLElement): string => {
    const layers: RgbaColor[] = [];
    let current: HTMLElement | null = target;

    while (current) {
        const style = window.getComputedStyle(current);
        const color = parseColor(style.backgroundColor);

        if (color && color.alpha > 0) {
            layers.push(color);
        }

        if (color?.alpha === 1) {
            break;
        }

        current = current.parentElement;
    }

    let result: RgbaColor = {
        red: 255,
        green: 255,
        blue: 255,
        alpha: 1,
    };

    for (let index = layers.length - 1; index >= 0; index -= 1) {
        result = compositeColors(layers[index], result);
    }

    return `rgb(${Math.round(result.red)} ${Math.round(
        result.green,
    )} ${Math.round(result.blue)})`;
};

const retainPositionedHost = (host: HTMLElement): (() => void) => {
    const currentRecord = hostPositionRecords.get(host);

    if (currentRecord) {
        currentRecord.count += 1;

        return () => {
            currentRecord.count -= 1;

            if (currentRecord.count > 0) {
                return;
            }

            if (currentRecord.changed && host.style.position === "relative") {
                host.style.position = currentRecord.originalInlinePosition;
            }

            hostPositionRecords.delete(host);
        };
    }

    const originalInlinePosition = host.style.position;
    const computedPosition = window.getComputedStyle(host).position;
    const changed = computedPosition === "static";

    if (changed) {
        host.style.position = "relative";
    }

    const record: HostPositionRecord = {
        count: 1,
        changed,
        originalInlinePosition,
    };

    hostPositionRecords.set(host, record);

    return () => {
        record.count -= 1;

        if (record.count > 0) {
            return;
        }

        if (record.changed && host.style.position === "relative") {
            host.style.position = record.originalInlinePosition;
        }

        hostPositionRecords.delete(host);
    };
};

export const useTargetRect = (
    target: HTMLElement | null,
    portalHost: HTMLElement | null,
    overlayRef: RefObject<HTMLDivElement | null>,
    placement: OverlayPlacement,
    enabled: boolean,
): void => {
    useLayoutEffect(() => {
        if (!enabled || !target) {
            return;
        }

        if (placement === "local" && !portalHost) {
            return;
        }

        const releaseHostPosition =
            placement === "local" && portalHost
                ? retainPositionedHost(portalHost)
                : () => {};
        let rafId: number | null = null;

        const updatePosition = () => {
            const overlay = overlayRef.current;

            if (!overlay) {
                return;
            }

            const targetStyle = window.getComputedStyle(target);

            overlay.style.setProperty(
                "--scroll-to-future-surface-color",
                resolveSurfaceColor(target),
            );
            overlay.style.borderRadius = targetStyle.borderRadius;

            if (placement === "local") {
                const host = portalHost;

                if (!host) {
                    return;
                }

                const targetRect = target.getBoundingClientRect();
                const hostRect = host.getBoundingClientRect();
                const left =
                    targetRect.left -
                    hostRect.left -
                    host.clientLeft +
                    host.scrollLeft +
                    target.clientLeft;
                const top =
                    targetRect.top -
                    hostRect.top -
                    host.clientTop +
                    host.scrollTop +
                    target.clientTop;
                const width = target.clientWidth;
                const height = target.clientHeight;

                overlay.style.transform = `translate3d(${left}px, ${top}px, 0)`;
                overlay.style.width = `${width}px`;
                overlay.style.height = `${height}px`;
                overlay.style.visibility =
                    width > 0 && height > 0 ? "visible" : "hidden";

                return;
            }

            const viewport = window.visualViewport;
            const width = viewport?.width ?? window.innerWidth;
            const height = viewport?.height ?? window.innerHeight;
            const left = viewport?.offsetLeft ?? 0;
            const top = viewport?.offsetTop ?? 0;

            overlay.style.transform = `translate3d(${left}px, ${top}px, 0)`;
            overlay.style.width = `${width}px`;
            overlay.style.height = `${height}px`;
            overlay.style.visibility =
                width > 0 && height > 0 ? "visible" : "hidden";
        };

        const scheduleUpdate = () => {
            if (rafId !== null) {
                return;
            }

            rafId = requestAnimationFrame(() => {
                rafId = null;

                updatePosition();
            });
        };

        const resizeObserver = new ResizeObserver(scheduleUpdate);
        const mutationObserver = new MutationObserver((mutations) => {
            const overlay = overlayRef.current;
            const shouldUpdate = mutations.some((mutation) => {
                if (!overlay) {
                    return true;
                }

                if (mutation.target === overlay) {
                    return false;
                }

                if (
                    mutation.target instanceof Node &&
                    overlay.contains(mutation.target)
                ) {
                    return false;
                }

                return true;
            });

            if (shouldUpdate) {
                scheduleUpdate();
            }
        });

        resizeObserver.observe(target);

        if (portalHost) {
            resizeObserver.observe(portalHost);

            mutationObserver.observe(portalHost, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ["class", "style", "hidden"],
            });
        }

        window.addEventListener("resize", scheduleUpdate, {
            passive: true,
        });

        window.visualViewport?.addEventListener("resize", scheduleUpdate, {
            passive: true,
        });

        scheduleUpdate();

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            releaseHostPosition();

            window.removeEventListener("resize", scheduleUpdate);

            window.visualViewport?.removeEventListener(
                "resize",
                scheduleUpdate,
            );

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [enabled, overlayRef, placement, portalHost, target]);
};
