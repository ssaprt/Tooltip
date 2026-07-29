import { CSSProperties } from "react";

import { TooltipAnimationOptions } from "./TooltipAnimation.type";

export type TooltipSize =
    | `${number}px`
    | `${number}rem`
    | `${number}em`
    | `calc(${string})`;

export type ThemeType = {
    body?: {
        background?: CSSProperties["background"];
        filter?: CSSProperties["filter"];
        style?: CSSProperties;
        className?: string;
    };
    arrow?: {
        size?: TooltipSize;
        width?: TooltipSize;
    };
    animation?: TooltipAnimationOptions;
};
