import { ReactElement, ReactNode } from "react";

import { PresetsThemeType } from "./PresetsTheme.type";
import { ThemeType } from "./Theme.type";
import { TooltipAnimationOptions } from "./TooltipAnimation.type";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProviderInterface {
    defaultRenderPosition?: TooltipPlacement;
    selectTheme?: PresetsThemeType;
    customTheme?: ThemeType;
    animation?: TooltipAnimationOptions;
    interactive?: boolean;
    hideDelay?: number;
}

export interface TooltipInterface {
    content: ReactNode;
    children?: ReactElement;
    position?: TooltipPlacement;
    selectTheme?: PresetsThemeType;
    customTheme?: ThemeType;
    animation?: TooltipAnimationOptions;
    disabled?: boolean;
    interactive?: boolean;
    hideDelay?: number;
}
