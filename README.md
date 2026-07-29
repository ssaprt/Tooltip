Tooltip by @ssaprt

A flexible, themeable, and interactive tooltip library for React and Next.js.

Web version: <a href="https://utility-lub.vercel.app/react/UI-Components/tooltip/">Scroll to Future</a>

tooltip supports simple text hints, rich React content, interactive controls, media, custom themes, built-in animations, automatic viewport collision handling, touch interaction, and optional global presets through TooltipProvider.

The provider is optional. Every Tooltip can work independently.

Features

Standalone tooltips without a provider

Optional global TooltipProvider

More than 50 built-in theme presets

Per-tooltip theme overrides

Fully custom themes

Four preferred placements: top, bottom, left, and right

Automatic opposite-side fallback

Automatic viewport clamping

Arrow position correction near rounded corners

Unified tooltip body and arrow surface

Solid colors, gradients, borders, textures, filters, and shadows

Separate show and hide animations

Configurable animation speed and easing

Interactive tooltip content

Configurable hide delay

Text, JSX, components, forms, buttons, links, images, video, and other media

Automatic repositioning while scrolling and resizing

Automatic updates when tooltip content changes size

Mouse, touch, focus, and keyboard handling

React portal rendering into document.body

TypeScript support

React and Next.js support

Adapted for modern Chrome, Safari, Firefox, Edge, iOS Safari, and Chromium-based mobile browsers

Installation

npm install @ssaprt/tooltip

yarn add @ssaprt/tooltip

pnpm add @ssaprt/tooltip

Import the stylesheet once in the application entry point:

import "@ssaprt/tooltip/style.css";

Basic usage

TooltipProvider is not required.

"use client";

import { Tooltip } from "@ssaprt/tooltip";
import "@ssaprt/tooltip/style.css";

export const Example = () => {
    return (
        <Tooltip content="Copy value">
            <button type="button">Copy</button>
        </Tooltip>
    );
};

The child element becomes the tooltip anchor.

Local configuration

Every tooltip can define its own position, theme, animation, delay, and behavior.

<Tooltip
    content="Saved successfully"
    position="bottom"
    selectTheme="dark"
    animation={{
        show: "bounce",
        hide: "fade",
        speed: "180ms",
        easing: "ease-out",
    }}
    hideDelay={200}
>
    <button type="button">Save</button>
</Tooltip>

Tooltip inside an element

A tooltip can also be placed directly inside its target element.

<button type="button">
    Delete

    <Tooltip
        content="Delete this item"
        position="top"
        selectTheme="red"
    />
</button>

When children is not passed to Tooltip, the immediate parent element becomes the anchor.

Optional global provider

Use TooltipProvider when many tooltips should share the same initial position, preset theme, custom theme overrides, or animations.

"use client";

import { TooltipProvider } from "@ssaprt/tooltip";
import "@ssaprt/tooltip/style.css";

export const AppProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <TooltipProvider
            defaultRenderPosition="top"
            selectTheme="glass"
            animation={{
                show: "slide",
                hide: "fade",
                speed: "140ms",
                easing: "ease-in-out",
            }}
        >
            {children}
        </TooltipProvider>
    );
};

All descendant tooltips inherit these values unless they override them locally.

<Tooltip content="Uses provider defaults">
    <button type="button">Default tooltip</button>
</Tooltip>

<Tooltip
    content="Uses local settings"
    position="right"
    selectTheme="comic"
    animation={{
        show: "zoom",
        hide: "scale",
        speed: "220ms",
    }}
>
    <button type="button">Local tooltip</button>
</Tooltip>

Configuration priority

Local tooltip values have priority over provider defaults.

The effective configuration is resolved in this order:

Props passed directly to Tooltip

Local customTheme

Values from TooltipProvider

Animation settings from the selected preset theme

Built-in defaults

The default built-in values are:

const defaults = {
    position: "top",
    selectTheme: "primary",
    showAnimation: "slide",
    hideAnimation: "fade",
    animationSpeed: "120ms",
    animationEasing: "ease-in-out",
};

Text content

<Tooltip content="Simple text tooltip">
    <span>Hover me</span>
</Tooltip>

The content prop accepts any valid ReactNode.

React content

<Tooltip
    content={
        <div>
            <strong>Build completed</strong>
            <span>All files were generated successfully.</span>
        </div>
    }
>
    <button type="button">Build status</button>
</Tooltip>

Interactive content

Set interactive when the user must be able to move the pointer into the tooltip and interact with its content.

<Tooltip
    interactive
    hideDelay={300}
    content={
        <div>
            <button type="button">Previous</button>
            <input type="text" placeholder="Search" />
            <button type="button">Next</button>
        </div>
    }
>
    <button type="button">Open controls</button>
</Tooltip>

With interactive enabled:

The tooltip remains visible while the pointer is inside it

Buttons, links, inputs, selects, and other controls remain usable

Moving from the anchor to the tooltip does not close it

Moving away from both the anchor and tooltip starts the hide delay

Clicking outside closes the tooltip

Pressing Escape closes the tooltip

Focus can move between the anchor and tooltip content

The default hide delay is:

120

For interactive tooltips, the default is:

240

A custom hideDelay overrides both values.

Rich components and media

Tooltip content is not limited to a short string. It can contain complete React interfaces, including cards, media previews, forms, navigation, images, audio, and video.

<Tooltip
    interactive
    position="right"
    selectTheme="glass"
    content={
        <article
            style={{
                display: "grid",
                width: "320px",
                gap: "12px",
                textAlign: "left",
            }}
        >
            <video
                controls
                poster="/media/preview.jpg"
                style={{
                    display: "block",
                    width: "100%",
                    borderRadius: "12px",
                }}
            >
                <source
                    src="/media/preview.mp4"
                    type="video/mp4"
                />
            </video>

            <div>
                <strong>Media preview</strong>
                <p>Interactive content remains available inside the tooltip.</p>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "8px",
                }}
            >
                <button type="button">Open</button>
                <button type="button">Save</button>
            </div>
        </article>
    }
>
    <button type="button">Show preview</button>
</Tooltip>

The tooltip uses ResizeObserver, so its position is recalculated when dynamic content changes size.

Trigger elements

Wrapping a DOM element

<Tooltip content="Open settings">
    <button type="button">Settings</button>
</Tooltip>

Wrapping a custom React component

The wrapped component must forward its ref to a DOM element.

import { forwardRef } from "react";

const ActionButton = forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button">
>((props, ref) => {
    return <button ref={ref} {...props} />;
});

ActionButton.displayName = "ActionButton";

export const Example = () => {
    return (
        <Tooltip content="Custom component tooltip">
            <ActionButton type="button">Action</ActionButton>
        </Tooltip>
    );
};

Using a tooltip inside a custom component

When forwarding a ref is not convenient, place Tooltip inside the final DOM element.

export const ActionButton = () => {
    return (
        <button type="button">
            Action
            <Tooltip content="Custom component tooltip" />
        </button>
    );
};

Placement

Available placements:

type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right";

Example:

<Tooltip content="Rendered on the left" position="left">
    <button type="button">Left</button>
</Tooltip>

The requested placement is preferred, not forced.

When there is not enough space, the tooltip checks the opposite side:

top can fall back to bottom

bottom can fall back to top

left can fall back to right

right can fall back to left

The final position is clamped to the viewport so the tooltip does not render outside the visible area.

The arrow is repositioned automatically and constrained to the straight section of the edge so it does not overlap rounded corners.

Built-in themes

The package includes more than 50 ready-to-use presets with different visual styles, including clean, dark, comic, terminal, glass, neon, retro, cyberpunk, paper, metallic, natural, warning, and decorative themes.

Examples include:

"primary"
"secondary"
"dark"
"light"
"comic"
"manga"
"newspaper"
"stickyNote"
"blueprint"
"terminal"
"crt"
"pixel"
"arcade"
"cyberpunk"
"synthwave"
"vaporwave"
"hologram"
"glass"
"frost"
"clay"
"bubblegum"
"candy"
"watermelon"
"lemon"
"lava"
"ember"
"toxic"
"radioactive"
"hazard"
"policeTape"
"construction"
"parchment"
"pirateMap"
"royal"
"noir"
"detective"
"dossier"
"medical"
"laboratory"
"circuit"
"galaxy"
"aurora"
"oceanDepths"
"coralReef"
"forest"
"moss"
"desert"
"snow"
"chrome"
"goldFoil"
"bronze"
"brutalist"
"chalkboard"

Select a preset globally:

<TooltipProvider selectTheme="cyberpunk">
    <App />
</TooltipProvider>

Or locally:

<Tooltip content="Local theme" selectTheme="terminal">
    <button type="button">Terminal</button>
</Tooltip>

PresetsThemeType is derived from the actual preset map, so TypeScript only accepts available theme names.

Custom themes

A custom theme can be applied globally through TooltipProvider or locally through Tooltip.

<Tooltip
    content="Custom theme"
    customTheme={{
        body: {
            background:
                "linear-gradient(135deg, #7c3aed, #db2777)",
            filter:
                "drop-shadow(0 12px 24px rgba(124, 58, 237, 0.4))",
            style: {
                color: "#ffffff",
                padding: "12px 16px",
                border: "2px solid #f0abfc",
                borderRadius: "18px 6px",
                fontSize: "14px",
                fontWeight: 700,
            },
        },
        arrow: {
            size: "10px",
            width: "24px",
        },
        animation: {
            show: "bounce",
            hide: "scale",
            speed: "220ms",
            easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        },
    }}
>
    <button type="button">Custom</button>
</Tooltip>

Custom theme values are merged with the selected preset. Only the values that must change need to be supplied.

Theme type

import type { CSSProperties } from "react";

type TooltipSize =
    | `${number}px`
    | `${number}rem`
    | `${number}em`
    | `calc(${string})`;

type ThemeType = {
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

body.background

Controls the complete tooltip surface background, including the arrow.

Supported values include:

Solid colors

Linear gradients

Radial gradients

Conic gradients

Repeating gradients

CSS variables

Other valid CSS background values

<Tooltip
    content="Gradient"
    customTheme={{
        body: {
            background:
                "linear-gradient(135deg, #22d3ee, #7c3aed)",
        },
    }}
>
    <button type="button">Gradient</button>
</Tooltip>

body.style

Accepts regular React CSSProperties for the tooltip content and surface configuration.

Common options include:

{
    color: "#ffffff",
    padding: "10px 14px",
    border: "2px solid #ffffff",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: "left",
    maxWidth: "320px",
}

Borders and corner radii are used to generate the unified body-and-arrow surface.

body.filter

Applies a filter to the complete tooltip surface, including the arrow.

<Tooltip
    content="Shadow"
    customTheme={{
        body: {
            filter:
                "drop-shadow(0 12px 18px rgba(0, 0, 0, 0.35))",
        },
    }}
>
    <button type="button">Shadow</button>
</Tooltip>

body.className

Adds a class name to the tooltip content container.

<Tooltip
    content="Class name"
    customTheme={{
        body: {
            className: "my-tooltip-content",
        },
    }}
>
    <button type="button">Styled</button>
</Tooltip>

arrow.size

Controls how far the arrow extends from the tooltip body.

arrow: {
    size: "10px",
}

arrow.width

Controls the width of the arrow base.

arrow: {
    width: "24px",
}

Animations

Show and hide animations can be configured independently.

<Tooltip
    content="Animated tooltip"
    animation={{
        show: "flip",
        hide: "blur",
        speed: "200ms",
        easing: "ease-out",
    }}
>
    <button type="button">Animate</button>
</Tooltip>

Available animation types:

type TooltipAnimationType =
    | "fade"
    | "slide"
    | "scale"
    | "zoom"
    | "blur"
    | "flip"
    | "bounce"
    | "none";

Animation options:

type TooltipAnimationSpeed =
    | `${number}ms`
    | `${number}s`;

type TooltipAnimationOptions = {
    show?: TooltipAnimationType;
    hide?: TooltipAnimationType;
    speed?: TooltipAnimationSpeed;
    easing?: CSSProperties["animationTimingFunction"];
};

Disable animations:

<Tooltip
    content="No animation"
    animation={{
        show: "none",
        hide: "none",
        speed: "1ms",
        easing: "linear",
    }}
>
    <button type="button">Static</button>
</Tooltip>

The stylesheet also respects prefers-reduced-motion and reduces animation duration when the user requests reduced motion.

TooltipProvider API

TooltipProvider is optional and only supplies global defaults to descendant tooltips.

Property

Type

Default

Description

children

ReactNode

Required

Components that can consume the provider defaults

defaultRenderPosition

"top" | "bottom" | "left" | "right"

"top"

Default preferred placement

selectTheme

PresetsThemeType

"primary"

Default built-in theme preset

customTheme

ThemeType

undefined

Global theme overrides merged with the selected preset

animation

TooltipAnimationOptions

Theme settings

Global show and hide animation overrides

Complete provider example:

<TooltipProvider
    defaultRenderPosition="bottom"
    selectTheme="glass"
    customTheme={{
        body: {
            style: {
                color: "#ffffff",
                padding: "10px 14px",
                borderRadius: "14px",
                maxWidth: "360px",
            },
        },
        arrow: {
            size: "8px",
            width: "18px",
        },
    }}
    animation={{
        show: "blur",
        hide: "fade",
        speed: "180ms",
        easing: "ease-in-out",
    }}
>
    <App />
</TooltipProvider>

Tooltip API

Property

Type

Default

Description

content

ReactNode

Required

Text, JSX, components, controls, media, or any other React content

children

ReactElement

Optional

Element used as the tooltip anchor; without it, the immediate parent is used

position

TooltipPlacement

Provider value or "top"

Preferred tooltip placement

selectTheme

PresetsThemeType

Provider value or "primary"

Local built-in theme preset

customTheme

ThemeType

undefined

Local theme overrides

animation

TooltipAnimationOptions

Provider or theme settings

Local show and hide animation settings

disabled

boolean

false

Prevents the tooltip from opening

interactive

boolean

false

Enables pointer and focus interaction inside the tooltip

hideDelay

number

120, or 240 when interactive

Delay in milliseconds before the tooltip begins hiding

Complete tooltip example:

<Tooltip
    content={
        <div>
            <strong>Account</strong>
            <button type="button">Open profile</button>
        </div>
    }
    position="right"
    selectTheme="terminal"
    customTheme={{
        body: {
            style: {
                minWidth: "220px",
                textAlign: "left",
            },
        },
    }}
    animation={{
        show: "zoom",
        hide: "fade",
        speed: "160ms",
    }}
    interactive
    hideDelay={300}
>
    <button type="button">Account</button>
</Tooltip>

Public interfaces

import type { ReactElement, ReactNode } from "react";

export type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right";

export interface TooltipProviderInterface {
    defaultRenderPosition?: TooltipPlacement;
    selectTheme?: PresetsThemeType;
    customTheme?: ThemeType;
    animation?: TooltipAnimationOptions;
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

TypeScript exports

import {
    Tooltip,
    TooltipProvider,
} from "@ssaprt/tooltip";

import type {
    PresetsThemeType,
    ThemeType,
    TooltipAnimationOptions,
    TooltipAnimationSpeed,
    TooltipAnimationType,
    TooltipInterface,
    TooltipPlacement,
    TooltipProviderInterface,
    TooltipSize,
} from "@ssaprt/tooltip";

Browser support

The package is designed for consistent behavior in modern desktop and mobile browsers:

Google Chrome

Apple Safari

Mozilla Firefox

Microsoft Edge

iOS Safari

Chromium-based Android browsers

The implementation uses browser-standard APIs and technologies:

React portals

Pointer events

Touch input

Focus events

ResizeObserver

requestAnimationFrame

SVG paths and masks

CSS custom properties

CSS gradients

CSS filters

Fixed viewport positioning

Tooltips are rendered into document.body, so they are not normally clipped by overflow: hidden or overflow: auto on application containers.

The position is recalculated when:

The window is resized

The page or an ancestor is scrolled

Tooltip content changes dimensions

Media or dynamic components change the tooltip size

Legacy Internet Explorer is not supported.

Mouse, keyboard, and touch behavior

Desktop pointer behavior:

Pointer enter opens the tooltip

Pointer leave starts the configured hide delay

Interactive content keeps the tooltip open while hovered

Keyboard behavior:

Focusing the anchor opens the tooltip

Focus can move into interactive content

Escape closes the tooltip

Touch behavior:

Tapping the anchor toggles the tooltip

Tapping outside closes it

React and Next.js

Tooltip and TooltipProvider use client-side browser APIs and React portals. In Next.js, render them from a Client Component.

"use client";

import { Tooltip, TooltipProvider } from "@ssaprt/tooltip";
import "@ssaprt/tooltip/style.css";

export const TooltipClientProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <TooltipProvider
            defaultRenderPosition="top"
            selectTheme="primary"
        >
            {children}
        </TooltipProvider>
    );
};

Use it in a layout:

import { TooltipClientProvider } from "./TooltipClientProvider";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <TooltipClientProvider>
                    {children}
                </TooltipClientProvider>
            </body>
        </html>
    );
}

A provider is still optional. A standalone tooltip can be rendered directly from any Client Component.

Rendering and overflow

The visible tooltip is rendered through a React portal into document.body.

This provides several benefits:

Parent overflow normally does not clip the tooltip

The tooltip is positioned relative to the viewport

Scroll and resize updates are handled globally

Complex content is isolated from the anchor layout

A high stacking level can be used without depending on the anchor's stacking context

License

MIT