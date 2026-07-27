import { HideNativeScrollbarMode } from "src/types/config/scrollbar.type";

const STYLE_ID = "scroll-to-future-native-scrollbar-styles";
const ALWAYS_CLASS = "scroll-to-future-hide-native-scrollbar";
const FINE_POINTER_CLASS = "scroll-to-future-hide-native-scrollbar-fine";

const classCounters = new WeakMap<HTMLElement, Map<string, number>>();

const installStyles = (): void => {
    if (typeof document === "undefined") return;

    if (document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
        .${ALWAYS_CLASS} {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
        }

        .${ALWAYS_CLASS}::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
        }

        @media (any-pointer: fine) {
            .${FINE_POINTER_CLASS} {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }

            .${FINE_POINTER_CLASS}::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                background: transparent !important;
            }
        }
    `;

    document.head.appendChild(style);
};

const retainClass = (element: HTMLElement, className: string): (() => void) => {
    let elementCounters = classCounters.get(element);

    if (!elementCounters) {
        elementCounters = new Map();
        classCounters.set(element, elementCounters);
    }

    const currentCount = elementCounters.get(className) ?? 0;
    elementCounters.set(className, currentCount + 1);

    if (currentCount === 0) {
        element.classList.add(className);
    }

    return () => {
        const counters = classCounters.get(element);
        if (!counters) return;

        const count = counters.get(className) ?? 0;

        if (count <= 1) {
            counters.delete(className);
            element.classList.remove(className);
        } else {
            counters.set(className, count - 1);
        }

        if (counters.size === 0) {
            classCounters.delete(element);
        }
    };
};

const isDocumentScrollTarget = (target: HTMLElement): boolean => {
    if (typeof document === "undefined") {
        return false;
    }

    return (
        target === document.body ||
        target === document.documentElement ||
        target === document.scrollingElement
    );
};

const resolveStyleTargets = (target: HTMLElement): HTMLElement[] => {
    if (!isDocumentScrollTarget(target)) {
        return [target];
    }

    const targets = new Set<HTMLElement>();
    targets.add(document.documentElement);

    if (document.body) {
        targets.add(document.body);
    }

    const scrollingElement = document.scrollingElement;

    if (scrollingElement instanceof HTMLElement) {
        targets.add(scrollingElement);
    }

    return Array.from(targets);
};

const isMobileInputDevice = (): boolean => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const cannotHover = window.matchMedia("(hover: none)").matches;
    const hasTouch = navigator.maxTouchPoints > 0;

    return hasTouch && coarsePointer && cannotHover;
};

export const hideNativeScrollbar = (
    target: HTMLElement,
    mode: HideNativeScrollbarMode,
    nativeOnMobile: boolean,
): (() => void) => {
    if (
        typeof window === "undefined" ||
        typeof document === "undefined" ||
        mode === false
    ) {
        return () => {};
    }

    if (nativeOnMobile && isMobileInputDevice()) {
        return () => {};
    }

    installStyles();

    const className = mode === "always" ? ALWAYS_CLASS : FINE_POINTER_CLASS;

    const targets = resolveStyleTargets(target);

    const cleanups = targets.map((element) => retainClass(element, className));

    return () => {
        cleanups.forEach((cleanup) => {
            cleanup();
        });
    };
};
