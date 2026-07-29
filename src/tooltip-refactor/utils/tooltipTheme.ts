import { CSSProperties } from "react";

import { ThemeType } from "src/types/Theme.type";

type Defined<T> = Exclude<T, undefined>;
type BorderWidthValue = Defined<CSSProperties["borderTopWidth"]>;
type BorderStyleValue = Defined<CSSProperties["borderTopStyle"]>;
type BorderColorValue = Defined<CSSProperties["borderTopColor"]>;
type BorderRadiusValue = Defined<CSSProperties["borderTopLeftRadius"]>;
type Quad<T> = [T | undefined, T | undefined, T | undefined, T | undefined];

type ParsedBorder = {
    width?: BorderWidthValue;
    style?: BorderStyleValue;
    color?: BorderColorValue;
};

export type TooltipSurfaceStyle = Pick<
    CSSProperties,
    | "borderTopWidth"
    | "borderRightWidth"
    | "borderBottomWidth"
    | "borderLeftWidth"
    | "borderTopStyle"
    | "borderRightStyle"
    | "borderBottomStyle"
    | "borderLeftStyle"
    | "borderTopColor"
    | "borderRightColor"
    | "borderBottomColor"
    | "borderLeftColor"
    | "borderTopLeftRadius"
    | "borderTopRightRadius"
    | "borderBottomRightRadius"
    | "borderBottomLeftRadius"
>;

export type ResolvedThemeStyles = {
    background: CSSProperties["background"];
    color: CSSProperties["color"];
    contentStyle: CSSProperties;
    surfaceStyle: TooltipSurfaceStyle;
    fillStyle: CSSProperties;
    filter?: CSSProperties["filter"];
};

const BORDER_STYLE_VALUES = new Set<BorderStyleValue>([
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "inherit",
    "initial",
    "revert",
    "revert-layer",
    "unset",
]);

const splitCssTokens = (value: string) => {
    const tokens: string[] = [];
    let current = "";
    let depth = 0;

    for (const character of value.trim()) {
        if (character === "(") {
            depth += 1;
        }

        if (character === ")") {
            depth = Math.max(0, depth - 1);
        }

        if (/\s/.test(character) && depth === 0) {
            if (current.trim()) {
                tokens.push(current.trim());
            }

            current = "";
            continue;
        }

        current += character;
    }

    if (current.trim()) {
        tokens.push(current.trim());
    }

    return tokens;
};

const splitOutsideParentheses = (value: string, separator: string) => {
    const result: string[] = [];
    let current = "";
    let depth = 0;

    for (const character of value) {
        if (character === "(") {
            depth += 1;
        }

        if (character === ")") {
            depth = Math.max(0, depth - 1);
        }

        if (character === separator && depth === 0) {
            if (current.trim()) {
                result.push(current.trim());
            }

            current = "";
            continue;
        }

        current += character;
    }

    if (current.trim()) {
        result.push(current.trim());
    }

    return result;
};

const expandQuad = <T,>(values: T[]): Quad<T> => {
    if (values.length === 0) {
        return [undefined, undefined, undefined, undefined];
    }

    if (values.length === 1) {
        return [values[0], values[0], values[0], values[0]];
    }

    if (values.length === 2) {
        return [values[0], values[1], values[0], values[1]];
    }

    if (values.length === 3) {
        return [values[0], values[1], values[2], values[1]];
    }

    return [values[0], values[1], values[2], values[3]];
};

const isBorderWidthToken = (value: string) => {
    return (
        value === "thin" ||
        value === "medium" ||
        value === "thick" ||
        value === "0" ||
        value === "inherit" ||
        value === "initial" ||
        value === "revert" ||
        value === "revert-layer" ||
        value === "unset" ||
        /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|vh|vw|vmin|vmax|%)?$/.test(value) ||
        value.startsWith("calc(") ||
        value.startsWith("var(")
    );
};

const isBorderStyleToken = (value: string): value is BorderStyleValue => {
    return BORDER_STYLE_VALUES.has(value as BorderStyleValue);
};

const parseBorder = (
    value:
        | CSSProperties["border"]
        | CSSProperties["borderTop"]
        | CSSProperties["borderRight"]
        | CSSProperties["borderBottom"]
        | CSSProperties["borderLeft"],
): ParsedBorder => {
    if (typeof value !== "string" || !value.trim()) {
        return {};
    }

    const tokens = splitCssTokens(value);
    const widthToken = tokens.find(isBorderWidthToken);
    const styleToken = tokens.find(isBorderStyleToken);
    const colorTokens = tokens.filter((token) => {
        return token !== widthToken && token !== styleToken;
    });

    return {
        width: widthToken ? (widthToken as BorderWidthValue) : undefined,
        style: styleToken,
        color: colorTokens.length
            ? (colorTokens.join(" ") as BorderColorValue)
            : undefined,
    };
};

const expandBorderWidths = (
    value: CSSProperties["borderWidth"] | BorderWidthValue,
): Quad<BorderWidthValue> => {
    if (value === undefined) {
        return [undefined, undefined, undefined, undefined];
    }

    if (typeof value === "number") {
        return [value, value, value, value];
    }

    return expandQuad(
        splitCssTokens(String(value)).map((token) => token as BorderWidthValue),
    );
};

const expandBorderStyles = (
    value: CSSProperties["borderStyle"] | BorderStyleValue,
): Quad<BorderStyleValue> => {
    if (value === undefined) {
        return [undefined, undefined, undefined, undefined];
    }

    return expandQuad(splitCssTokens(String(value)).filter(isBorderStyleToken));
};

const expandBorderColors = (
    value: CSSProperties["borderColor"] | BorderColorValue,
): Quad<BorderColorValue> => {
    if (value === undefined) {
        return [undefined, undefined, undefined, undefined];
    }

    return expandQuad(
        splitCssTokens(String(value)).map((token) => token as BorderColorValue),
    );
};

const expandBorderRadii = (
    value: CSSProperties["borderRadius"],
): Quad<BorderRadiusValue> => {
    if (value === undefined) {
        return [undefined, undefined, undefined, undefined];
    }

    if (typeof value === "number") {
        return [value, value, value, value];
    }

    const parts = splitOutsideParentheses(String(value), "/");
    const horizontal = expandQuad(
        splitCssTokens(parts[0] ?? "").map(
            (token) => token as BorderRadiusValue,
        ),
    );

    if (!parts[1]) {
        return horizontal;
    }

    const vertical = expandQuad(
        splitCssTokens(parts[1]).map((token) => token as BorderRadiusValue),
    );

    return horizontal.map((horizontalRadius, index) => {
        const verticalRadius = vertical[index];

        if (horizontalRadius === undefined) {
            return undefined;
        }

        if (
            verticalRadius === undefined ||
            verticalRadius === horizontalRadius
        ) {
            return horizontalRadius;
        }

        return `${horizontalRadius} ${verticalRadius}` as BorderRadiusValue;
    }) as Quad<BorderRadiusValue>;
};

const resolveSurfaceStyle = (style: CSSProperties): TooltipSurfaceStyle => {
    const border = parseBorder(style.border);
    const borderTop = parseBorder(style.borderTop);
    const borderRight = parseBorder(style.borderRight);
    const borderBottom = parseBorder(style.borderBottom);
    const borderLeft = parseBorder(style.borderLeft);
    const widths = expandBorderWidths(style.borderWidth ?? border.width);
    const styles = expandBorderStyles(style.borderStyle ?? border.style);
    const colors = expandBorderColors(style.borderColor ?? border.color);
    const radii = expandBorderRadii(style.borderRadius);

    return {
        borderTopWidth: style.borderTopWidth ?? borderTop.width ?? widths[0],
        borderRightWidth:
            style.borderRightWidth ?? borderRight.width ?? widths[1],
        borderBottomWidth:
            style.borderBottomWidth ?? borderBottom.width ?? widths[2],
        borderLeftWidth: style.borderLeftWidth ?? borderLeft.width ?? widths[3],
        borderTopStyle: style.borderTopStyle ?? borderTop.style ?? styles[0],
        borderRightStyle:
            style.borderRightStyle ?? borderRight.style ?? styles[1],
        borderBottomStyle:
            style.borderBottomStyle ?? borderBottom.style ?? styles[2],
        borderLeftStyle: style.borderLeftStyle ?? borderLeft.style ?? styles[3],
        borderTopColor: style.borderTopColor ?? borderTop.color ?? colors[0],
        borderRightColor:
            style.borderRightColor ?? borderRight.color ?? colors[1],
        borderBottomColor:
            style.borderBottomColor ?? borderBottom.color ?? colors[2],
        borderLeftColor: style.borderLeftColor ?? borderLeft.color ?? colors[3],
        borderTopLeftRadius: style.borderTopLeftRadius ?? radii[0],
        borderTopRightRadius: style.borderTopRightRadius ?? radii[1],
        borderBottomRightRadius: style.borderBottomRightRadius ?? radii[2],
        borderBottomLeftRadius: style.borderBottomLeftRadius ?? radii[3],
    };
};

const splitShadowTokens = (value: string) => {
    const tokens: string[] = [];
    let current = "";
    let depth = 0;

    for (const character of value.trim()) {
        if (character === "(") {
            depth += 1;
        }

        if (character === ")") {
            depth = Math.max(0, depth - 1);
        }

        if (/\s/.test(character) && depth === 0) {
            if (current.trim()) {
                tokens.push(current.trim());
            }

            current = "";
            continue;
        }

        current += character;
    }

    if (current.trim()) {
        tokens.push(current.trim());
    }

    return tokens;
};

const isShadowLengthToken = (value: string) => {
    return (
        value === "0" ||
        /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|vh|vw|vmin|vmax|%)?$/.test(value) ||
        value.startsWith("calc(") ||
        value.startsWith("var(")
    );
};

const isShadowColorToken = (value: string) => {
    return (
        value.startsWith("#") ||
        value.startsWith("rgb(") ||
        value.startsWith("rgba(") ||
        value.startsWith("hsl(") ||
        value.startsWith("hsla(") ||
        value.startsWith("oklch(") ||
        value.startsWith("oklab(") ||
        value.startsWith("lab(") ||
        value.startsWith("lch(") ||
        value.startsWith("color(") ||
        value.startsWith("color-mix(") ||
        value.startsWith("var(") ||
        /^[a-zA-Z]+$/.test(value)
    );
};

const boxShadowToDropShadow = (
    boxShadow?: CSSProperties["boxShadow"],
): CSSProperties["filter"] | undefined => {
    if (
        typeof boxShadow !== "string" ||
        !boxShadow.trim() ||
        boxShadow.trim() === "none"
    ) {
        return undefined;
    }

    const shadows = splitOutsideParentheses(boxShadow, ",");
    const filters = shadows
        .map((shadow) => {
            const tokens = splitShadowTokens(shadow);

            if (tokens.includes("inset")) {
                return null;
            }

            const lengths = tokens.filter(isShadowLengthToken);

            if (lengths.length < 2) {
                return null;
            }

            const color = tokens.find((token) => {
                return (
                    token !== "inset" &&
                    !isShadowLengthToken(token) &&
                    isShadowColorToken(token)
                );
            });

            const offsetX = lengths[0];
            const offsetY = lengths[1];
            const blur = lengths[2] ?? "0px";

            return `drop-shadow(${offsetX} ${offsetY} ${blur} ${
                color ?? "rgba(0, 0, 0, 0.25)"
            })`;
        })
        .filter((value): value is string => {
            return value !== null;
        });

    return filters.length ? filters.join(" ") : undefined;
};

export const mergeThemes = (
    presetTheme: ThemeType,
    customTheme?: ThemeType,
): ThemeType => {
    if (!customTheme) {
        return presetTheme;
    }

    return {
        ...presetTheme,
        ...customTheme,
        body: {
            ...presetTheme.body,
            ...customTheme.body,
            style: {
                ...presetTheme.body?.style,
                ...customTheme.body?.style,
            },
            background:
                customTheme.body?.background ?? presetTheme.body?.background,
            filter: customTheme.body?.filter ?? presetTheme.body?.filter,
            className:
                customTheme.body?.className ?? presetTheme.body?.className,
        },
        arrow: {
            ...presetTheme.arrow,
            ...customTheme.arrow,
        },
        animation: {
            ...presetTheme.animation,
            ...customTheme.animation,
        },
    };
};

export const resolveThemeStyles = (
    theme: ThemeType,
): ResolvedThemeStyles => {
    const bodyStyle = theme.body?.style ?? {};
    const surfaceStyle = resolveSurfaceStyle(bodyStyle);

    const {
        background,
        backgroundColor,
        backgroundImage,
        border,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        borderWidth,
        borderStyle,
        borderColor,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth,
        borderTopStyle,
        borderRightStyle,
        borderBottomStyle,
        borderLeftStyle,
        borderTopColor,
        borderRightColor,
        borderBottomColor,
        borderLeftColor,
        borderRadius,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        boxShadow,
        filter,
        backdropFilter,
        WebkitBackdropFilter,
        color,
        ...contentStyle
    } = bodyStyle;

    const resolvedBackground =
        theme.body?.background ??
        background ??
        backgroundImage ??
        backgroundColor ??
        "var(--global-color-link)";

    const resolvedColor = color ?? "var(--global-bg-color)";
    const resolvedFilter =
        theme.body?.filter ?? filter ?? boxShadowToDropShadow(boxShadow);

    return {
        background: resolvedBackground,
        color: resolvedColor,
        contentStyle,
        surfaceStyle,
        fillStyle: {
            backdropFilter,
            WebkitBackdropFilter,
        },
        filter: resolvedFilter,
    };
};
