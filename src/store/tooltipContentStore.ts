type TooltipContentOwner = symbol;

type TooltipContentEntry = {
    owner: TooltipContentOwner;
};

type TooltipContentSnapshot = {
    activeAnchor: HTMLElement | null;
    activeOwner: TooltipContentOwner | null;
    portalTarget: HTMLElement | null;
};

const registry = new WeakMap<HTMLElement, TooltipContentEntry>();

const listeners = new Set<() => void>();

const SERVER_SNAPSHOT: TooltipContentSnapshot = {
    activeAnchor: null,
    activeOwner: null,
    portalTarget: null,
};

let snapshot: TooltipContentSnapshot = {
    activeAnchor: null,
    activeOwner: null,
    portalTarget: null,
};

const emit = () => {
    listeners.forEach((listener) => {
        listener();
    });
};

const updateSnapshot = (nextSnapshot: TooltipContentSnapshot) => {
    if (
        snapshot.activeAnchor === nextSnapshot.activeAnchor &&
        snapshot.activeOwner === nextSnapshot.activeOwner &&
        snapshot.portalTarget === nextSnapshot.portalTarget
    ) {
        return;
    }

    snapshot = nextSnapshot;

    emit();
};

export const registerTooltipContent = (
    anchor: HTMLElement,
    owner: TooltipContentOwner,
) => {
    registry.set(anchor, {
        owner,
    });

    if (snapshot.activeAnchor === anchor) {
        updateSnapshot({
            ...snapshot,
            activeOwner: owner,
        });
    }
};

export const unregisterTooltipContent = (
    anchor: HTMLElement,
    owner: TooltipContentOwner,
) => {
    const entry = registry.get(anchor);

    if (!entry || entry.owner !== owner) {
        return;
    }

    registry.delete(anchor);

    if (snapshot.activeAnchor === anchor && snapshot.activeOwner === owner) {
        updateSnapshot({
            ...snapshot,
            activeOwner: null,
        });
    }
};

export const hasTooltipContent = (anchor: HTMLElement) => {
    return registry.has(anchor);
};

export const setActiveTooltipAnchor = (anchor: HTMLElement | null) => {
    const activeOwner = anchor ? (registry.get(anchor)?.owner ?? null) : null;

    updateSnapshot({
        ...snapshot,
        activeAnchor: anchor,
        activeOwner,
    });
};

export const setTooltipPortalTarget = (portalTarget: HTMLElement | null) => {
    updateSnapshot({
        ...snapshot,
        portalTarget,
    });
};

export const subscribeTooltipContent = (listener: () => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

export const getTooltipContentSnapshot = () => {
    return snapshot;
};

export const getTooltipContentServerSnapshot = () => {
    return SERVER_SNAPSHOT;
};
