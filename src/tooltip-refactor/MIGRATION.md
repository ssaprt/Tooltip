# Tooltip API migration

Delete `src/store/tooltipContentStore.ts` and remove every import from it.

`TooltipProvider` is optional and only supplies default placement, theme and animation values.

## Without provider

```tsx
<Tooltip content="Copy" position="top" selectTheme="dark">
    <button type="button">Copy</button>
</Tooltip>
```

## Tooltip inside an element

```tsx
<button type="button">
    Copy
    <Tooltip
        content="Copy to clipboard"
        position="bottom"
        selectTheme="ocean"
        animation={{
            show: "bounce",
            hide: "fade",
            speed: "180ms",
        }}
    />
</button>
```

## Optional global defaults

```tsx
<TooltipProvider
    defaultRenderPosition="top"
    selectTheme="primary"
    animation={{
        show: "slide",
        hide: "fade",
        speed: "120ms",
    }}
>
    <App />
</TooltipProvider>
```

## Local override

```tsx
<Tooltip
    content={<strong>Deleted</strong>}
    position="right"
    selectTheme="red"
    animation={{
        show: "zoom",
        hide: "scale",
        speed: "200ms",
    }}
>
    <button type="button">Delete</button>
</Tooltip>
```

When wrapping a custom React component, that component must forward its ref to the root DOM element. Otherwise place `<Tooltip />` inside the component's root element.
