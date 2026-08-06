import { CSSProperties, useLayoutEffect, useRef, useState } from "react";

import { TooltipPlacement } from "src/types/Tooltip.interface";

type TooltipSurfaceProps = {
    placement: TooltipPlacement;
    arrowOffset: string;
    surfaceStyle?: CSSProperties;
    fillStyle?: CSSProperties;
    filter?: CSSProperties["filter"];
};

type CornerRadii = {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
};

type SurfaceMetrics = {
    width: number;
    height: number;
    left: number;
    top: number;
    path: string;
    strokeWidth: number;
    strokeColor: string;
    strokeDasharray?: string;
    strokeLinecap?: "butt" | "round" | "square";
};

type SurfaceFillStyle = CSSProperties & {
    WebkitMaskImage?: string;
    WebkitMaskPosition?: string;
    WebkitMaskRepeat?: string;
    WebkitMaskSize?: string;
};

const EMPTY_METRICS: SurfaceMetrics = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    path: "",
    strokeWidth: 0,
    strokeColor: "transparent",
};

const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), Math.max(min, max));
};

const resolveCssLength = (value: string, base: number) => {
    const normalized = value.trim();

    if (!normalized) {
        return 0;
    }

    if (normalized.endsWith("%")) {
        return base * (Number.parseFloat(normalized) / 100);
    }

    const parsed = Number.parseFloat(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
};

const resolveCornerRadius = (value: string, width: number, height: number) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);

    const horizontal = resolveCssLength(parts[0] ?? "0", width);
    const vertical = resolveCssLength(parts[1] ?? parts[0] ?? "0", height);

    return Math.min(horizontal, vertical);
};

const normalizeRadii = (
    radii: CornerRadii,
    width: number,
    height: number,
): CornerRadii => {
    const top = radii.topLeft + radii.topRight;
    const bottom = radii.bottomLeft + radii.bottomRight;
    const left = radii.topLeft + radii.bottomLeft;
    const right = radii.topRight + radii.bottomRight;

    const scale = Math.min(
        1,
        top > 0 ? width / top : 1,
        bottom > 0 ? width / bottom : 1,
        left > 0 ? height / left : 1,
        right > 0 ? height / right : 1,
    );

    return {
        topLeft: radii.topLeft * scale,
        topRight: radii.topRight * scale,
        bottomRight: radii.bottomRight * scale,
        bottomLeft: radii.bottomLeft * scale,
    };
};

const resolveArrowOffset = (value: string, edgeLength: number) => {
    const normalized = value.trim();

    if (normalized.endsWith("%")) {
        return edgeLength * (Number.parseFloat(normalized) / 100);
    }

    const parsed = Number.parseFloat(normalized);

    return Number.isFinite(parsed) ? parsed : edgeLength / 2;
};

const createSurfacePath = ({
    placement,
    bodyWidth,
    bodyHeight,
    arrowHeight,
    arrowWidth,
    requestedArrowOffset,
    radii,
}: {
    placement: TooltipPlacement;
    bodyWidth: number;
    bodyHeight: number;
    arrowHeight: number;
    arrowWidth: number;
    requestedArrowOffset: number;
    radii: CornerRadii;
}) => {
    let x0 = 0;
    let y0 = 0;
    let x1 = bodyWidth;
    let y1 = bodyHeight;

    let width = bodyWidth;
    let height = bodyHeight;
    let left = 0;
    let top = 0;

    if (placement === "top") {
        height += arrowHeight;
    }

    if (placement === "bottom") {
        y0 = arrowHeight;
        y1 = arrowHeight + bodyHeight;
        height += arrowHeight;
        top = -arrowHeight;
    }

    if (placement === "left") {
        width += arrowHeight;
    }

    if (placement === "right") {
        x0 = arrowHeight;
        x1 = arrowHeight + bodyWidth;
        width += arrowHeight;
        left = -arrowHeight;
    }

    let edgeLength = bodyWidth;
    let edgeStartRadius = radii.bottomLeft;
    let edgeEndRadius = radii.bottomRight;

    if (placement === "bottom") {
        edgeStartRadius = radii.topLeft;
        edgeEndRadius = radii.topRight;
    }

    if (placement === "left") {
        edgeLength = bodyHeight;
        edgeStartRadius = radii.topRight;
        edgeEndRadius = radii.bottomRight;
    }

    if (placement === "right") {
        edgeLength = bodyHeight;
        edgeStartRadius = radii.topLeft;
        edgeEndRadius = radii.bottomLeft;
    }

    const availableStraightEdge = Math.max(
        0,
        edgeLength - edgeStartRadius - edgeEndRadius - 2,
    );

    const arrowHalf = Math.min(arrowWidth / 2, availableStraightEdge / 2);
    const minArrowCenter = edgeStartRadius + arrowHalf + 1;
    const maxArrowCenter = edgeLength - edgeEndRadius - arrowHalf - 1;

    const arrowCenter =
        minArrowCenter <= maxArrowCenter
            ? clamp(requestedArrowOffset, minArrowCenter, maxArrowCenter)
            : edgeLength / 2;

    const tl = radii.topLeft;
    const tr = radii.topRight;
    const br = radii.bottomRight;
    const bl = radii.bottomLeft;

    let path = "";

    if (placement === "top") {
        path = [
            `M ${x0 + tl} ${y0}`,
            `H ${x1 - tr}`,
            `Q ${x1} ${y0} ${x1} ${y0 + tr}`,
            `V ${y1 - br}`,
            `Q ${x1} ${y1} ${x1 - br} ${y1}`,
            `H ${arrowCenter + arrowHalf}`,
            `L ${arrowCenter} ${y1 + arrowHeight}`,
            `L ${arrowCenter - arrowHalf} ${y1}`,
            `H ${x0 + bl}`,
            `Q ${x0} ${y1} ${x0} ${y1 - bl}`,
            `V ${y0 + tl}`,
            `Q ${x0} ${y0} ${x0 + tl} ${y0}`,
            "Z",
        ].join(" ");
    }

    if (placement === "bottom") {
        path = [
            `M ${x0 + tl} ${y0}`,
            `H ${arrowCenter - arrowHalf}`,
            `L ${arrowCenter} ${y0 - arrowHeight}`,
            `L ${arrowCenter + arrowHalf} ${y0}`,
            `H ${x1 - tr}`,
            `Q ${x1} ${y0} ${x1} ${y0 + tr}`,
            `V ${y1 - br}`,
            `Q ${x1} ${y1} ${x1 - br} ${y1}`,
            `H ${x0 + bl}`,
            `Q ${x0} ${y1} ${x0} ${y1 - bl}`,
            `V ${y0 + tl}`,
            `Q ${x0} ${y0} ${x0 + tl} ${y0}`,
            "Z",
        ].join(" ");
    }

    if (placement === "left") {
        path = [
            `M ${x0 + tl} ${y0}`,
            `H ${x1 - tr}`,
            `Q ${x1} ${y0} ${x1} ${y0 + tr}`,
            `V ${arrowCenter - arrowHalf}`,
            `L ${x1 + arrowHeight} ${arrowCenter}`,
            `L ${x1} ${arrowCenter + arrowHalf}`,
            `V ${y1 - br}`,
            `Q ${x1} ${y1} ${x1 - br} ${y1}`,
            `H ${x0 + bl}`,
            `Q ${x0} ${y1} ${x0} ${y1 - bl}`,
            `V ${y0 + tl}`,
            `Q ${x0} ${y0} ${x0 + tl} ${y0}`,
            "Z",
        ].join(" ");
    }

    if (placement === "right") {
        path = [
            `M ${x0 + tl} ${y0}`,
            `H ${x1 - tr}`,
            `Q ${x1} ${y0} ${x1} ${y0 + tr}`,
            `V ${y1 - br}`,
            `Q ${x1} ${y1} ${x1 - br} ${y1}`,
            `H ${x0 + bl}`,
            `Q ${x0} ${y1} ${x0} ${y1 - bl}`,
            `V ${arrowCenter + arrowHalf}`,
            `L ${x0 - arrowHeight} ${arrowCenter}`,
            `L ${x0} ${arrowCenter - arrowHalf}`,
            `V ${y0 + tl}`,
            `Q ${x0} ${y0} ${x0 + tl} ${y0}`,
            "Z",
        ].join(" ");
    }

    return {
        width,
        height,
        left,
        top,
        path,
    };
};

const getStrokeConfig = (computedStyle: CSSStyleDeclaration) => {
    const widths = [
        Number.parseFloat(computedStyle.borderTopWidth) || 0,
        Number.parseFloat(computedStyle.borderRightWidth) || 0,
        Number.parseFloat(computedStyle.borderBottomWidth) || 0,
        Number.parseFloat(computedStyle.borderLeftWidth) || 0,
    ];

    const styles = [
        computedStyle.borderTopStyle,
        computedStyle.borderRightStyle,
        computedStyle.borderBottomStyle,
        computedStyle.borderLeftStyle,
    ];

    const colors = [
        computedStyle.borderTopColor,
        computedStyle.borderRightColor,
        computedStyle.borderBottomColor,
        computedStyle.borderLeftColor,
    ];

    const activeIndexes = widths
        .map((width, index) => ({
            width,
            index,
        }))
        .filter(({ width, index }) => {
            return (
                width > 0 &&
                styles[index] !== "none" &&
                styles[index] !== "hidden"
            );
        });

    if (!activeIndexes.length) {
        return {
            strokeWidth: 0,
            strokeColor: "transparent",
            strokeDasharray: undefined,
            strokeLinecap: undefined,
        };
    }

    const active = activeIndexes.reduce((largest, current) => {
        return current.width > largest.width ? current : largest;
    });

    const strokeWidth = active.width;
    const strokeStyle = styles[active.index];
    const strokeColor = colors[active.index];

    if (strokeStyle === "dashed") {
        return {
            strokeWidth,
            strokeColor,
            strokeDasharray: `${strokeWidth * 3} ${strokeWidth * 2}`,
            strokeLinecap: "butt" as const,
        };
    }

    if (strokeStyle === "dotted") {
        return {
            strokeWidth,
            strokeColor,
            strokeDasharray: `${strokeWidth} ${strokeWidth * 1.6}`,
            strokeLinecap: "round" as const,
        };
    }

    return {
        strokeWidth,
        strokeColor,
        strokeDasharray: undefined,
        strokeLinecap: "round" as const,
    };
};

const createMaskImage = (width: number, height: number, path: string) => {
    const svg = [
        '<svg xmlns="http://www.w3.org/2000/svg"',
        ` viewBox="0 0 ${width} ${height}"`,
        ` width="${width}"`,
        ` height="${height}">`,
        `<path fill="white" d="${path}"/>`,
        "</svg>",
    ].join("");

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export const TooltipSurface = ({
    placement,
    arrowOffset,
    surfaceStyle,
    fillStyle,
    filter,
}: TooltipSurfaceProps) => {
    const surfaceProbeRef = useRef<HTMLDivElement>(null);
    const arrowProbeRef = useRef<HTMLDivElement>(null);
    const [metrics, setMetrics] = useState<SurfaceMetrics>(EMPTY_METRICS);

    useLayoutEffect(() => {
        const surfaceProbe = surfaceProbeRef.current;
        const arrowProbe = arrowProbeRef.current;

        if (!surfaceProbe || !arrowProbe) {
            return;
        }

        const body = surfaceProbe.parentElement;

        if (!body) {
            return;
        }

        const update = () => {
            const bodyWidth = body.offsetWidth;
            const bodyHeight = body.offsetHeight;

            if (bodyWidth <= 0 || bodyHeight <= 0) {
                return;
            }

            surfaceProbe.style.width = `${bodyWidth}px`;
            surfaceProbe.style.height = `${bodyHeight}px`;

            const surfaceComputedStyle = window.getComputedStyle(surfaceProbe);
            const arrowComputedStyle = window.getComputedStyle(arrowProbe);

            const arrowHeight =
                Number.parseFloat(arrowComputedStyle.height) || 6;

            const arrowWidth =
                Number.parseFloat(arrowComputedStyle.width) || arrowHeight * 2;

            const radii = normalizeRadii(
                {
                    topLeft: resolveCornerRadius(
                        surfaceComputedStyle.borderTopLeftRadius,
                        bodyWidth,
                        bodyHeight,
                    ),
                    topRight: resolveCornerRadius(
                        surfaceComputedStyle.borderTopRightRadius,
                        bodyWidth,
                        bodyHeight,
                    ),
                    bottomRight: resolveCornerRadius(
                        surfaceComputedStyle.borderBottomRightRadius,
                        bodyWidth,
                        bodyHeight,
                    ),
                    bottomLeft: resolveCornerRadius(
                        surfaceComputedStyle.borderBottomLeftRadius,
                        bodyWidth,
                        bodyHeight,
                    ),
                },
                bodyWidth,
                bodyHeight,
            );

            const requestedArrowOffset = resolveArrowOffset(
                arrowOffset,
                placement === "top" || placement === "bottom"
                    ? bodyWidth
                    : bodyHeight,
            );

            const surface = createSurfacePath({
                placement,
                bodyWidth,
                bodyHeight,
                arrowHeight,
                arrowWidth,
                requestedArrowOffset,
                radii,
            });

            const stroke = getStrokeConfig(surfaceComputedStyle);

            const nextMetrics: SurfaceMetrics = {
                ...surface,
                ...stroke,
            };

            setMetrics((current) => {
                if (
                    current.width === nextMetrics.width &&
                    current.height === nextMetrics.height &&
                    current.left === nextMetrics.left &&
                    current.top === nextMetrics.top &&
                    current.path === nextMetrics.path &&
                    current.strokeWidth === nextMetrics.strokeWidth &&
                    current.strokeColor === nextMetrics.strokeColor &&
                    current.strokeDasharray === nextMetrics.strokeDasharray &&
                    current.strokeLinecap === nextMetrics.strokeLinecap
                ) {
                    return current;
                }

                return nextMetrics;
            });
        };

        update();

        const resizeObserver = new ResizeObserver(update);

        resizeObserver.observe(body);
        window.addEventListener("resize", update);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", update);
        };
    }, [arrowOffset, placement, surfaceStyle]);

    const maskImage = metrics.path
        ? createMaskImage(metrics.width, metrics.height, metrics.path)
        : undefined;

    const resolvedFillStyle: SurfaceFillStyle = {
        ...fillStyle,
        maskImage,
        maskPosition: "0 0",
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
        WebkitMaskImage: maskImage,
        WebkitMaskPosition: "0 0",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
    };

    return (
        <>
            <div
                ref={surfaceProbeRef}
                className="tooltip-surface-probe"
                style={surfaceStyle}
            />

            <div ref={arrowProbeRef} className="tooltip-arrow-probe" />

            {metrics.path ? (
                <div
                    className="tooltip-surface"
                    style={{
                        width: metrics.width,
                        height: metrics.height,
                        left: metrics.left,
                        top: metrics.top,
                        filter,
                    }}
                    aria-hidden="true"
                >
                    <div
                        className="tooltip-surface__fill"
                        style={resolvedFillStyle}
                    />

                    {metrics.strokeWidth > 0 ? (
                        <svg
                            className="tooltip-surface__stroke"
                            width={metrics.width}
                            height={metrics.height}
                            viewBox={`0 0 ${metrics.width} ${metrics.height}`}
                        >
                            <path
                                d={metrics.path}
                                fill="none"
                                stroke={metrics.strokeColor}
                                strokeWidth={metrics.strokeWidth}
                                strokeDasharray={metrics.strokeDasharray}
                                strokeLinecap={metrics.strokeLinecap}
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    ) : null}
                </div>
            ) : null}
        </>
    );
};
