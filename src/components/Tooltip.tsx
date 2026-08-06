import {
    AnimationEvent,
    Children,
    cloneElement,
    CSSProperties,
    ReactElement,
    Ref,
    RefCallback,
    RefObject,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import { presets } from "src/config/presets";
import { useTooltip } from "src/hooks/useTooltip";
import { TooltipInterface } from "src/types/Tooltip.interface";
import { TooltipAnimationType } from "src/types/TooltipAnimation.type";
import { mergeThemes, resolveThemeStyles } from "src/utils/tooltipTheme";

import { useTooltipDefaults } from "./TooltipProvider";
import { TooltipSurface } from "./TooltipSurface";

import "../css/tooltip.css";

type TooltipContainerStyle = CSSProperties & {
    "--tooltip-bg"?: CSSProperties["background"];
    "--tooltip-color"?: CSSProperties["color"];
    "--tooltip-arrow-size"?: string;
    "--tooltip-arrow-width"?: string;
    "--tooltip-animation-speed"?: string;
    "--tooltip-animation-easing"?: string;
};

type RefableElementProps = {
    ref?: Ref<HTMLElement>;
};

const DEFAULT_SHOW_ANIMATION: TooltipAnimationType = "slide";
const DEFAULT_HIDE_ANIMATION: TooltipAnimationType = "fade";

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
    if (typeof ref === "function") {
        ref(value);
        return;
    }

    if (ref) {
        (ref as RefObject<T | null>).current = value;
    }
};

export const Tooltip = ({
    content,
    children,
    position,
    selectTheme,
    customTheme,
    animation,
    disabled = false,
    interactive,
    hideDelay,
}: TooltipInterface) => {
    const defaults = useTooltipDefaults();
    const markerRef = useRef<HTMLSpanElement>(null);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const trigger = children
        ? (Children.only(children) as ReactElement<RefableElementProps>)
        : null;

    const triggerRef = trigger?.props.ref;

    const setTriggerRef = useCallback<RefCallback<HTMLElement>>(
        (node) => {
            assignRef(triggerRef, node);
            setAnchor(node);
        },
        [triggerRef],
    );

    useLayoutEffect(() => {
        if (trigger) {
            return;
        }

        const marker = markerRef.current;
        const parent = marker?.parentElement ?? null;

        setAnchor(parent);

        return () => {
            setAnchor(null);
        };
    }, [trigger]);

    const inheritedTheme = useMemo(() => {
        return mergeThemes(presets[defaults.selectTheme], defaults.customTheme);
    }, [defaults.customTheme, defaults.selectTheme]);

    const theme = useMemo(() => {
        if (selectTheme) {
            return mergeThemes(presets[selectTheme], customTheme);
        }

        return mergeThemes(inheritedTheme, customTheme);
    }, [customTheme, inheritedTheme, selectTheme]);

    const resolvedThemeStyles = useMemo(() => {
        return resolveThemeStyles(theme);
    }, [theme]);

    const localThemeAnimation = selectTheme
        ? theme.animation
        : customTheme?.animation;

    const showAnimation =
        animation?.show ??
        localThemeAnimation?.show ??
        defaults.animation?.show ??
        inheritedTheme.animation?.show ??
        DEFAULT_SHOW_ANIMATION;

    const hideAnimation =
        animation?.hide ??
        localThemeAnimation?.hide ??
        defaults.animation?.hide ??
        inheritedTheme.animation?.hide ??
        DEFAULT_HIDE_ANIMATION;

    const animationSpeed =
        animation?.speed ??
        localThemeAnimation?.speed ??
        defaults.animation?.speed ??
        inheritedTheme.animation?.speed ??
        "120ms";

    const animationEasing =
        animation?.easing ??
        localThemeAnimation?.easing ??
        defaults.animation?.easing ??
        inheritedTheme.animation?.easing ??
        "ease-in-out";

    const preferredPlacement = position ?? defaults.defaultRenderPosition;
    const resolvedInteractive = interactive ?? defaults.interactive;
    const resolvedHideDelay = hideDelay ?? defaults.hideDelay;

    const {
        shouldRender,
        phase,
        placement,
        position: tooltipPosition,
        tooltipRef,
        bodyRef,
        onAnimationEnd,
    } = useTooltip({
        anchor,
        preferredPlacement,
        disabled: disabled || content === null || content === undefined,
        interactive: resolvedInteractive,
        hideDelay: resolvedHideDelay,
    });

    const arrowSize = theme.arrow?.size ?? "6px";
    const arrowWidth = theme.arrow?.width ?? `calc(${arrowSize} * 2)`;

    const containerStyle: TooltipContainerStyle = {
        "--tooltip-bg": resolvedThemeStyles.background,
        "--tooltip-color": resolvedThemeStyles.color,
        "--tooltip-arrow-size": arrowSize,
        "--tooltip-arrow-width": arrowWidth,
        "--tooltip-animation-speed": animationSpeed,
        "--tooltip-animation-easing": animationEasing,
        ...tooltipPosition,
    };

    const arrowOffset = String(
        tooltipPosition["--tooltip-arrow-offset"] ?? "50%",
    );

    const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget) {
            return;
        }

        onAnimationEnd();
    };

    const triggerElement = trigger ? (
        cloneElement(trigger, {
            ref: setTriggerRef,
        })
    ) : (
        <span ref={markerRef} hidden aria-hidden="true" />
    );

    const portal =
        shouldRender && typeof document !== "undefined"
            ? createPortal(
                  <div
                      ref={tooltipRef}
                      className={[
                          "tooltip-container",
                          `tooltip-container--${placement}`,
                          `tooltip-container--phase-${phase}`,
                          `tooltip-container--show-${showAnimation}`,
                          `tooltip-container--hide-${hideAnimation}`,
                          resolvedInteractive
                              ? "tooltip-container--interactive"
                              : null,
                      ]
                          .filter(Boolean)
                          .join(" ")}
                      style={containerStyle}
                  >
                      <div
                          ref={bodyRef}
                          className="tooltip-body"
                          onAnimationEnd={handleAnimationEnd}
                      >
                          <TooltipSurface
                              placement={placement}
                              arrowOffset={arrowOffset}
                              surfaceStyle={resolvedThemeStyles.surfaceStyle}
                              fillStyle={resolvedThemeStyles.fillStyle}
                              filter={resolvedThemeStyles.filter}
                          />

                          <div
                              className={[
                                  "tooltip-body__content",
                                  theme.body?.className,
                              ]
                                  .filter(Boolean)
                                  .join(" ")}
                              style={resolvedThemeStyles.contentStyle}
                          >
                              {content}
                          </div>
                      </div>
                  </div>,
                  document.body,
              )
            : null;

    return (
        <>
            {triggerElement}
            {portal}
        </>
    );
};
