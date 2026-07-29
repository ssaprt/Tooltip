import { CSSProperties } from "react";

export type TooltipAnimationType =
    | "fade"
    | "slide"
    | "scale"
    | "zoom"
    | "blur"
    | "flip"
    | "bounce"
    | "none";

export type TooltipAnimationSpeed = `${number}ms` | `${number}s`;

export type TooltipAnimationOptions = {
    show?: TooltipAnimationType;
    hide?: TooltipAnimationType;
    speed?: TooltipAnimationSpeed;
    easing?: CSSProperties["animationTimingFunction"];
};
