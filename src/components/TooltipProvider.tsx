import { createContext, ReactNode, useContext, useMemo } from "react";

import { PresetsThemeType } from "src/config/presets";
import { ThemeType } from "src/types/Theme.type";
import {
    TooltipPlacement,
    TooltipProviderInterface,
} from "src/types/Tooltip.interface";
import { TooltipAnimationOptions } from "src/types/TooltipAnimation.type";

type TooltipDefaults = {
    defaultRenderPosition: TooltipPlacement;
    selectTheme: PresetsThemeType;
    customTheme?: ThemeType;
    animation?: TooltipAnimationOptions;
    interactive: boolean;
    hideDelay?: number;
};

type TooltipProviderProps = TooltipProviderInterface & {
    children: ReactNode;
};

const DEFAULT_TOOLTIP_VALUES: TooltipDefaults = {
    defaultRenderPosition: "top",
    selectTheme: "primary",
    interactive: false,
};

const TooltipContext = createContext<TooltipDefaults>(DEFAULT_TOOLTIP_VALUES);

export const TooltipProvider = ({
    children,
    defaultRenderPosition = DEFAULT_TOOLTIP_VALUES.defaultRenderPosition,
    selectTheme = DEFAULT_TOOLTIP_VALUES.selectTheme,
    customTheme,
    animation,
    interactive = DEFAULT_TOOLTIP_VALUES.interactive,
    hideDelay,
}: TooltipProviderProps) => {
    const value = useMemo<TooltipDefaults>(() => {
        return {
            defaultRenderPosition,
            selectTheme,
            customTheme,
            animation,
            interactive,
            hideDelay,
        };
    }, [
        animation,
        customTheme,
        defaultRenderPosition,
        hideDelay,
        interactive,
        selectTheme,
    ]);

    return (
        <TooltipContext.Provider value={value}>
            {children}
        </TooltipContext.Provider>
    );
};

export const useTooltipDefaults = () => {
    return useContext(TooltipContext);
};
