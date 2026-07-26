import { type RefObject, useLayoutEffect } from "react";

export const useTargetRect = (
    target: HTMLElement | null,
    overlayRef: RefObject<HTMLDivElement | null>,
): void => {
    useLayoutEffect(() => {
        const overlay = overlayRef.current;

        if (!target || !overlay) {
            return;
        }

        const updatePosition = () => {
            const currentOverlay = overlayRef.current;

            if (!currentOverlay) {
                return;
            }

            const rect = target.getBoundingClientRect();

            currentOverlay.style.transform = `
                translate3d(
                    ${rect.left}px,
                    ${rect.top}px,
                    0
                )
            `;

            currentOverlay.style.width = `${rect.width}px`;
            currentOverlay.style.height = `${rect.height}px`;
            currentOverlay.style.visibility =
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
    }, [overlayRef, target]);
};
