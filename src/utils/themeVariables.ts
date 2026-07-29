import { CSSProperties } from "react";
import { ThemeType } from "src/types/Theme.type";

type TooltipVariables = CSSProperties & {
    "--tooltip-bg"?: CSSProperties["background"];
    "--tooltip-arrow-size"?: string;
    "--tooltip-animation-speed"?: string;
    "--tooltip-animation-easing"?: string;
};

export const getTooltipVariables = (
    theme: ThemeType,
    animationSpeed: string,
    animationEasing: string,
): TooltipVariables => {
    return {
        "--tooltip-bg": theme.body?.background ?? "var(--global-color-link)",
        "--tooltip-arrow-size": theme.arrow?.size ?? "6px",
        "--tooltip-animation-speed": animationSpeed,
        "--tooltip-animation-easing": animationEasing,
    };
};
