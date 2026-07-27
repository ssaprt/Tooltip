import { type RefObject, useLayoutEffect } from "react";
import { isPageScrollTarget } from "../utils/helper";

export const useTargetRect = (
    target: HTMLElement | null,
    overlayRef: RefObject<HTMLDivElement | null>,
): void => {
    useLayoutEffect(() => {
        if (!target) return;

        const updatePosition = () => {
            const overlay = overlayRef.current;

            if (!overlay) return;

            if (isPageScrollTarget(target)) {
                const width = window.visualViewport?.width ?? window.innerWidth;

                const height =
                    window.visualViewport?.height ?? window.innerHeight;

                overlay.style.transform = "translate3d(0, 0, 0)";

                overlay.style.width = `${width}px`;
                overlay.style.height = `${height}px`;
                overlay.style.visibility = "visible";

                return;
            }

            const rect = target.getBoundingClientRect();

            overlay.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;

            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;

            overlay.style.visibility =
                rect.width > 0 && rect.height > 0 ? "visible" : "hidden";
        };

        window.addEventListener("scroll", updatePosition, {
            capture: true,
            passive: true,
        });

        window.addEventListener("resize", updatePosition, {
            passive: true,
        });

        window.visualViewport?.addEventListener("scroll", updatePosition, {
            passive: true,
        });

        window.visualViewport?.addEventListener("resize", updatePosition, {
            passive: true,
        });

        const resizeObserver = new ResizeObserver(updatePosition);

        resizeObserver.observe(target);

        updatePosition();

        return () => {
            window.removeEventListener("scroll", updatePosition, true);

            window.removeEventListener("resize", updatePosition);

            window.visualViewport?.removeEventListener(
                "scroll",
                updatePosition,
            );

            window.visualViewport?.removeEventListener(
                "resize",
                updatePosition,
            );

            resizeObserver.disconnect();
        };
    }, [target, overlayRef]);
};
