"use client";

import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
} from "react";

import { PresetsThemeType } from "src/config/presets";
import { ThemeType } from "src/types/Theme.type";
import { TooltipPlacement } from "src/types/Tooltip.interface";
import { TooltipAnimationOptions } from "src/types/TooltipAnimation.type";

type TooltipDefaults = {
    defaultRenderPosition: TooltipPlacement;
    selectTheme: PresetsThemeType;
    customTheme?: ThemeType;
    animation?: TooltipAnimationOptions;
};

type TooltipProviderProps = {
    children: ReactNode;
    defaultRenderPosition?: TooltipPlacement;
    selectTheme?: PresetsThemeType;
    customTheme?: ThemeType;
    animation?: TooltipAnimationOptions;
};

const DEFAULT_TOOLTIP_VALUES: TooltipDefaults = {
    defaultRenderPosition: "top",
    selectTheme: "primary",
};

const TooltipContext = createContext<TooltipDefaults>(
    DEFAULT_TOOLTIP_VALUES,
);

export const TooltipProvider = ({
    children,
    defaultRenderPosition = DEFAULT_TOOLTIP_VALUES.defaultRenderPosition,
    selectTheme = DEFAULT_TOOLTIP_VALUES.selectTheme,
    customTheme,
    animation,
}: TooltipProviderProps) => {
    const value = useMemo<TooltipDefaults>(() => {
        return {
            defaultRenderPosition,
            selectTheme,
            customTheme,
            animation,
        };
    }, [animation, customTheme, defaultRenderPosition, selectTheme]);

    return (
        <TooltipContext.Provider value={value}>
            {children}
        </TooltipContext.Provider>
    );
};

export const useTooltipDefaults = () => {
    return useContext(TooltipContext);
};
