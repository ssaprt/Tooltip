# Scroll To Future


Web version: <a href="https://utility-lub.vercel.app/react/UI-Components/scroll-to-future/">Scroll to Future</a>

A customizable React scrollbar component with vertical and horizontal scrolling, draggable thumbs, automatic size calculation, mobile fallback, native scrollbar hiding, and built-in themes.

## Features

* Vertical and horizontal scrollbars
* Automatic thumb sizing
* Drag-to-scroll support
* Clickable scrollbar track
* Support for regular elements and page scrolling
* Automatic target detection
* Automatic content and container observation
* Native scrollbar hiding
* Native scrolling fallback on mobile devices
* Overlay and reserved-space positioning
* Built-in theme presets
* Fully customizable scrollbar and thumb styles
* TypeScript support
* React and Next.js compatible

# 20+ Themes in box
* "primary"
* "midnight"
* "neonCyan"
* "ocean"
* "deepSea"
* "forest"
* "moss"
* "lava"
* "ember"
* "gold"
* "roseQuartz"
* "violet"
* "royal"
* "arctic"
* "glass"
* "graphite"
* "terminal"
* "toxic"
* "candy"
* "sand"
* "monoLight"
* "monoDark";

## Installation

```bash
npm install scroll-to-future
```

```bash
yarn add scroll-to-future
```

```bash
pnpm add scroll-to-future
```


## Basic usage

### Improt styles
```bash
import 'scroll-to-future/style.css';
```


The scroll container must have a constrained size and an `overflow` value such as `auto` or `scroll`.

```tsx
import { ScrollToFuture } from "scroll-to-future";

export const Example = () => {
    return (
        <div
            style={{
                position: "relative",
                width: "400px",
                height: "300px",
                overflow: "auto",
            }}
        >
            <ScrollToFuture />

            <div style={{ minHeight: "1000px" }}>
                Scrollable content
            </div>
        </div>
    );
};
```

When `target` is not provided, `ScrollToFuture` automatically uses its parent element as the scroll target.

For automatic target detection, place the component directly inside the scrollable container.

## Usage with a target ref

Use the `target` property when the scrollbar is rendered outside the scrollable element or when explicit target control is required.

```tsx
import { useRef } from "react";
import { ScrollToFuture } from "scroll-to-future";

export const Example = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div style={{ position: "relative" }}>
            <div
                ref={scrollRef}
                style={{
                    width: "400px",
                    height: "300px",
                    overflow: "auto",
                }}
            >
                <div style={{ minHeight: "1000px" }}>
                    Scrollable content
                </div>
            </div>

            <ScrollToFuture target={scrollRef} />
        </div>
    );
};
```

## Vertical scrollbar

```tsx
<ScrollToFuture
    scrollBar={{
        mode: "vertical",
    }}
/>
```

## Horizontal scrollbar

```tsx
<div
    style={{
        position: "relative",
        width: "600px",
        overflowX: "auto",
        overflowY: "hidden",
    }}
>
    <ScrollToFuture
        scrollBar={{
            mode: "horizontal",
        }}
    />

    <div style={{ width: "1600px", whiteSpace: "nowrap" }}>
        Horizontally scrollable content
    </div>
</div>
```

## Vertical and horizontal scrollbars

```tsx
<ScrollToFuture
    scrollBar={{
        mode: "both",
    }}
/>
```

## Configuration

```tsx
import type { ScrollToFutureConfig } from "scroll-to-future";
import "scroll-to-future/styles.css";

const config: ScrollToFutureConfig = {
    scrollBar: {
        mode: "both",
        positionMode: "after",
        superimposition: "after",
        boundaryOffset: "4px",
        widthTrack: "8px",
        heightTrack: "98%",
        hideNativeScrollbar: "always",
    },

    thumb: {
        boundaryOffset: "1px 1px",
        heightTrack: "auto",
    },

    nativeOnMobile: true,
    selectTheme: "primary",
    optionsTheme: {},
};
```

```tsx
<ScrollToFuture {...config} />
```

## Component properties

| Property         | Type                                   |                  Default | Description                                       |
| ---------------- | -------------------------------------- | -----------------------: | ------------------------------------------------- |
| `target`         | `React.RefObject<HTMLElement \| null>` |           Parent element | Element whose scrolling is controlled             |
| `scrollBar`      | `ScrollToFutureScrollBar`              | Default scrollbar config | Track and positioning configuration               |
| `thumb`          | `ScrollToFutureThumb`                  |     Default thumb config | Thumb size and offset configuration               |
| `selectTheme`    | `PresetsThemeType`                     |              `"primary"` | Built-in theme name                               |
| `optionsTheme`   | `ScrollToFutureThemeProps`             |                     `{}` | Custom theme overrides                            |
| `nativeOnMobile` | `boolean`                              |                   `true` | Use native scrolling on mobile-only input devices |

## Scrollbar configuration

### `mode`

Controls which scrollbars are rendered.

```ts
type ScrollBarMode = "horizontal" | "vertical" | "both";
```

```tsx
<ScrollToFuture
    scrollBar={{
        mode: "vertical",
    }}
/>
```

Default:

```ts
"both"
```

### `positionMode`

Controls the side on which the custom scrollbar is rendered.

```ts
type PositionMode = "before" | "after";
```

For a vertical scrollbar:

* `"before"` places the track on the left.
* `"after"` places the track on the right.

For a horizontal scrollbar:

* `"before"` places the track at the top.
* `"after"` places the track at the bottom.

```tsx
<ScrollToFuture
    scrollBar={{
        positionMode: "before",
    }}
/>
```

Default:

```ts
"after"
```

### `superimposition`

Controls whether the scrollbar overlaps the content or reserves space for itself.

```ts
type Superimposition = "over" | "after";
```

#### Overlay mode

The scrollbar is placed over the content.

```tsx
<ScrollToFuture
    scrollBar={{
        superimposition: "over",
    }}
/>
```

#### Reserved-space mode

The component adds padding to the target element so the scrollbar does not cover its content.

```tsx
<ScrollToFuture
    scrollBar={{
        superimposition: "after",
    }}
/>
```

Default:

```ts
"after"
```

### `boundaryOffset`

Sets the outer offset of the track.

Accepted values:

```ts
type BoundaryOffset =
    | `${number}px`
    | `${number}px ${number}px`;
```

A single value applies the same offset to both sides:

```tsx
<ScrollToFuture
    scrollBar={{
        boundaryOffset: "6px",
    }}
/>
```

Two values define the start and end offsets:

```tsx
<ScrollToFuture
    scrollBar={{
        boundaryOffset: "4px 8px",
    }}
/>
```

Default:

```ts
"4px"
```

### `widthTrack`

Sets the scrollbar track thickness.

```tsx
<ScrollToFuture
    scrollBar={{
        widthTrack: "10px",
    }}
/>
```

Accepted value:

```ts
`${number}px`
```

The effective default thickness is `8px`.

### `heightTrack`

Sets the length of the scrollbar track.

Accepted values:

```ts
type HeightTrackType =
    | `${number}px`
    | `${number}%`
    | `${number}vh`
    | `${number}dvh`
    | `${number}dsvh`;
```

Examples:

```tsx
<ScrollToFuture
    scrollBar={{
        heightTrack: "80%",
    }}
/>
```

```tsx
<ScrollToFuture
    scrollBar={{
        heightTrack: "240px",
    }}
/>
```

```tsx
<ScrollToFuture
    scrollBar={{
        heightTrack: "80dvh",
    }}
/>
```

Default:

```ts
"98%"
```

### `hideNativeScrollbar`

Controls when the browser's native scrollbar is hidden.

```ts
type HideNativeScrollbarMode =
    | false
    | "fine-pointer"
    | "always";
```

#### Do not hide the native scrollbar

```tsx
<ScrollToFuture
    scrollBar={{
        hideNativeScrollbar: false,
    }}
/>
```

#### Hide only when a fine pointer is available

This normally applies to devices with a mouse, trackpad, stylus, or another precise pointer.

```tsx
<ScrollToFuture
    scrollBar={{
        hideNativeScrollbar: "fine-pointer",
    }}
/>
```

#### Always hide the native scrollbar

```tsx
<ScrollToFuture
    scrollBar={{
        hideNativeScrollbar: "always",
    }}
/>
```

Default:

```ts
"always"
```

The native scrollbar is hidden only when the custom component covers every currently scrollable axis.

For example, when the target can scroll both horizontally and vertically but `mode` is set to `"vertical"`, the native scrollbar is preserved because the horizontal axis is not covered by the custom scrollbar.

## Thumb configuration

### `boundaryOffset`

Controls the space between the thumb and the track boundaries.

```tsx
<ScrollToFuture
    thumb={{
        boundaryOffset: "2px",
    }}
/>
```

```tsx
<ScrollToFuture
    thumb={{
        boundaryOffset: "2px 4px",
    }}
/>
```

Default:

```ts
"1px 1px"
```

### `heightTrack`

Controls the thumb size.

```ts
type ThumbHeight =
    | "auto"
    | `${number}px`
    | `${number}%`;
```

#### Automatic size

The thumb size is calculated from the ratio between the visible area and the full scrollable content.

```tsx
<ScrollToFuture
    thumb={{
        heightTrack: "auto",
    }}
/>
```

#### Fixed size

```tsx
<ScrollToFuture
    thumb={{
        heightTrack: "48px",
    }}
/>
```

#### Percentage size

```tsx
<ScrollToFuture
    thumb={{
        heightTrack: "20%",
    }}
/>
```

Default:

```ts
"auto"
```

The calculated thumb size is constrained to prevent it from becoming too small or occupying the entire track.

## Mobile behavior

By default, mobile-only input devices use the browser's native scrolling behavior.

```tsx
<ScrollToFuture nativeOnMobile />
```

This is equivalent to:

```tsx
<ScrollToFuture nativeOnMobile={true} />
```

On a device whose primary input is coarse and which has no fine pointer:

* The custom scrollbar is not rendered.
* The browser's native scrollbar is not hidden.
* Native touch scrolling remains available.

To force the custom scrollbar to render on mobile devices:

```tsx
<ScrollToFuture nativeOnMobile={false} />
```

## Built-in themes

The package includes the following presets:

```ts
type PresetsThemeType =
    | "primary"
    | "midnight"
    | "neonCyan"
    | "ocean"
    | "deepSea"
    | "forest"
    | "moss"
    | "lava"
    | "ember"
    | "gold"
    | "roseQuartz"
    | "violet"
    | "royal"
    | "arctic"
    | "glass"
    | "graphite"
    | "terminal"
    | "toxic"
    | "candy"
    | "sand"
    | "monoLight"
    | "monoDark";
```

Select a theme with `selectTheme`:

```tsx
<ScrollToFuture selectTheme="neonCyan" />
```

```tsx
<ScrollToFuture selectTheme="forest" />
```

```tsx
<ScrollToFuture selectTheme="monoDark" />
```

## Custom theme

Use `optionsTheme` to override part or all of the selected preset.

```tsx
<ScrollToFuture
    selectTheme="primary"
    optionsTheme={{
        scrollBar: {
            inactive: {
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "999px",
            },

            hover: {
                backgroundColor: "rgba(255, 255, 255, 0.16)",
            },

            active: {
                backgroundColor: "rgba(255, 255, 255, 0.24)",
            },
        },

        thumb: {
            inactive: {
                backgroundColor: "#8b5cf6",
                borderRadius: "999px",
            },

            hover: {
                backgroundColor: "#a78bfa",
                transform: "scale(1.05)",
            },

            active: {
                backgroundColor: "#ddd6fe",
                transform: "scale(1.12)",
            },
        },
    }}
/>
```

Custom theme values are deeply merged with the selected preset. You only need to provide the properties you want to replace.

## Theme types

```ts
type ScrollToFutureThemeProps = {
    scrollBar?: StatusElementsTheme;
    thumb?: StatusElementsTheme;
};

type StatusElementsTheme = {
    inactive?: ScrollToFutureGeneralTypes;
    hover?: ScrollToFutureGeneralTypes;
    active?: ScrollToFutureGeneralTypes;
};

type ScrollToFutureGeneralTypes = {
    backgroundColor?: string;
    opacity?: number;
    border?: string;
    borderRadius?: string;
    outline?: string;
    boxShadow?: string;
    transition?: string;
    transform?: string;
};
```

## Complete customization example

```tsx
import { useRef } from "react";
import { ScrollToFuture } from "scroll-to-future";

export const CustomScrollbarExample = () => {
    const targetRef = useRef<HTMLDivElement>(null);

    return (
        <div style={{ position: "relative" }}>
            <div
                ref={targetRef}
                style={{
                    width: "600px",
                    height: "400px",
                    overflow: "auto",
                }}
            >
                <div
                    style={{
                        width: "1200px",
                        minHeight: "1400px",
                        padding: "24px",
                    }}
                >
                    Scrollable content
                </div>
            </div>

            <ScrollToFuture
                target={targetRef}
                nativeOnMobile={true}
                selectTheme="violet"
                scrollBar={{
                    mode: "both",
                    positionMode: "after",
                    superimposition: "over",
                    boundaryOffset: "6px",
                    widthTrack: "10px",
                    heightTrack: "90%",
                    hideNativeScrollbar: "fine-pointer",
                }}
                thumb={{
                    boundaryOffset: "2px",
                    heightTrack: "auto",
                }}
                optionsTheme={{
                    thumb: {
                        active: {
                            transform: "scale(1.15)",
                            boxShadow: "0 0 16px rgba(139, 92, 246, 0.8)",
                        },
                    },
                }}
            />
        </div>
    );
};
```

## Next.js

The component uses browser APIs and must be rendered inside a Client Component.

```tsx
"use client";

import { ScrollToFuture } from "scroll-to-future";

export const ScrollContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <div
            style={{
                position: "relative",
                height: "100dvh",
                overflow: "auto",
            }}
        >
            <ScrollToFuture />

            {children}
        </div>
    );
};
```

## How it works

The component observes the target element and its content using browser observers.

It automatically recalculates:

* Scrollable width and height
* Current scroll position
* Visible container size
* Track dimensions
* Thumb dimensions
* Thumb position
* Target element position
* Horizontal and vertical overflow availability

The scrollbar is updated when:

* The target is scrolled
* The window is resized
* The visual viewport changes
* The target changes size
* Child elements change size
* Elements are added or removed
* Relevant styles or classes change

## Interaction

### Dragging the thumb

Press and drag the thumb to change the target's scroll position.

Pointer capture is used during dragging, so the interaction continues even when the pointer leaves the thumb.

### Clicking the track

Click an empty part of the track to move the thumb toward that position.

The requested scroll position is automatically clamped to the available scroll range.

## Page scrolling

The component supports page scroll targets such as:

* `document.body`
* `document.documentElement`
* `document.scrollingElement`

When the target is part of the document scrolling system, the component resolves the active scroll container and uses the browser viewport for its measurements.

## Important CSS requirements

The target element should normally have:

```css
.scroll-container {
    position: relative;
    overflow: auto;
    width: 100%;
    height: 400px;
}
```

A scrollbar cannot appear when the element has no constrained size or when its content does not exceed its visible area.

For vertical scrolling:

```css
.scroll-container {
    overflow-y: auto;
}
```

For horizontal scrolling:

```css
.scroll-container {
    overflow-x: auto;
}
```

For both axes:

```css
.scroll-container {
    overflow: auto;
}
```

## Troubleshooting

### The custom scrollbar is not visible

Check that:

1. The target has a constrained width or height.
2. The content is larger than the target.
3. The target uses `overflow: auto` or `overflow: scroll`.
4. The selected `mode` includes the overflowing axis.
5. The component is rendered in a Client Component.
6. `nativeOnMobile` is not disabling the custom scrollbar on the current device.

### The browser scrollbar is still visible

Check the following:

1. `hideNativeScrollbar` is not `false`.
2. The custom component covers every scrollable axis.
3. The correct element is passed through `target`.
4. The actual scroll container is not a nested child of the supplied target.
5. `nativeOnMobile` is not preserving native scrolling on the current device.
6. `"fine-pointer"` is only active when the device has a fine pointer.

To force native scrollbar hiding on desktop and mobile:

```tsx
<ScrollToFuture
    nativeOnMobile={false}
    scrollBar={{
        hideNativeScrollbar: "always",
    }}
/>
```

### The content moves when the scrollbar appears

The default `superimposition` value is `"after"`, which reserves space by adding padding to the target.

Use overlay mode when the scrollbar should not affect content spacing:

```tsx
<ScrollToFuture
    scrollBar={{
        superimposition: "over",
    }}
/>
```

### The scrollbar is rendered on the wrong element

Pass an explicit ref:

```tsx
const targetRef = useRef<HTMLDivElement>(null);

<div ref={targetRef}>...</div>

<ScrollToFuture target={targetRef} />
```

## Browser requirements

The component relies on modern browser APIs:

* `ResizeObserver`
* `MutationObserver`
* Pointer Events
* `requestAnimationFrame`
* `matchMedia`
* CSS custom properties

For older browsers, additional polyfills may be required.

## TypeScript

The package exports the component and its public configuration type:

```ts
export { ScrollToFuture } from "scroll-to-future";

export type {
    ScrollToFutureConfig,
} from "scroll-to-future";
```

Example:

```tsx
import type { ScrollToFutureConfig } from "scroll-to-future";

const scrollbarConfig: ScrollToFutureConfig = {
    selectTheme: "graphite",

    scrollBar: {
        mode: "vertical",
        positionMode: "after",
        superimposition: "over",
        hideNativeScrollbar: "always",
    },

    thumb: {
        heightTrack: "auto",
    },
};
```
