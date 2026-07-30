import { CSSProperties } from "react";

import { ThemeType } from "../types/Theme.type";

type PresetAnimation = NonNullable<ThemeType["animation"]>;

type TooltipArrow = NonNullable<ThemeType["arrow"]>;

type ArrowSize = NonNullable<TooltipArrow["size"]>;

type ArrowWidth = NonNullable<TooltipArrow["width"]>;

type CreateThemeOptions = {
    background: NonNullable<CSSProperties["background"]>;
    color: NonNullable<CSSProperties["color"]>;
    fontFamily?: CSSProperties["fontFamily"];
    fontSize?: CSSProperties["fontSize"];
    fontWeight?: CSSProperties["fontWeight"];
    fontStyle?: CSSProperties["fontStyle"];
    lineHeight?: CSSProperties["lineHeight"];
    borderRadius?: CSSProperties["borderRadius"];
    border?: CSSProperties["border"];
    filter?: CSSProperties["filter"];
    padding?: CSSProperties["padding"];
    letterSpacing?: CSSProperties["letterSpacing"];
    textShadow?: CSSProperties["textShadow"];
    textTransform?: CSSProperties["textTransform"];
    textAlign?: CSSProperties["textAlign"];
    backdropFilter?: CSSProperties["backdropFilter"];
    arrowSize?: ArrowSize;
    arrowWidth?: ArrowWidth;
    animation?: PresetAnimation;
    style?: CSSProperties;
};

const animations = {
    soft: {
        show: "fade",
        hide: "fade",
        speed: "160ms",
        easing: "ease-in-out",
    },

    slide: {
        show: "slide",
        hide: "fade",
        speed: "160ms",
        easing: "ease-out",
    },

    pop: {
        show: "scale",
        hide: "scale",
        speed: "170ms",
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },

    bounce: {
        show: "bounce",
        hide: "scale",
        speed: "240ms",
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },

    flip: {
        show: "flip",
        hide: "fade",
        speed: "210ms",
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },

    blur: {
        show: "blur",
        hide: "blur",
        speed: "200ms",
        easing: "ease-out",
    },

    zoom: {
        show: "zoom",
        hide: "zoom",
        speed: "170ms",
        easing: "ease-out",
    },

    snap: {
        show: "zoom",
        hide: "fade",
        speed: "110ms",
        easing: "steps(4, end)",
    },

    instant: {
        show: "none",
        hide: "none",
        speed: "1ms",
        easing: "linear",
    },
} satisfies Record<string, PresetAnimation>;

const createTheme = ({
    background,
    color,
    fontFamily = "Inter, Arial, sans-serif",
    fontSize = "12px",
    fontWeight = 500,
    fontStyle,
    lineHeight = 1.4,
    borderRadius = "7px",
    border,
    filter,
    padding = "7px 12px",
    letterSpacing,
    textShadow,
    textTransform,
    textAlign = "center",
    backdropFilter,
    arrowSize = "7px",
    arrowWidth = "14px",
    animation = animations.slide,
    style,
}: CreateThemeOptions): ThemeType => {
    return {
        body: {
            background,
            filter,
            style: {
                color,
                fontFamily,
                fontSize,
                fontWeight,
                fontStyle,
                lineHeight,
                borderRadius,
                border,
                padding,
                letterSpacing,
                textShadow,
                textTransform,
                textAlign,
                backdropFilter,
                WebkitBackdropFilter: backdropFilter,
                ...style,
            },
        },

        arrow: {
            size: arrowSize,
            width: arrowWidth,
        },

        animation,
    };
};

export const presets = {
    primary: createTheme({
        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#ffffff",
        filter: "drop-shadow(0 7px 12px rgba(37, 99, 235, 0.38))",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: "8px",
    }),

    secondary: createTheme({
        background: "linear-gradient(135deg, #64748b, #475569)",
        color: "#ffffff",
        filter: "drop-shadow(0 7px 12px rgba(15, 23, 42, 0.3))",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        animation: animations.soft,
    }),

    dark: createTheme({
        background: "linear-gradient(145deg, #18181b, #09090b)",
        color: "#fafafa",
        border: "1px solid #3f3f46",
        borderRadius: "10px",
        filter: "drop-shadow(0 11px 18px rgba(0, 0, 0, 0.56))",
        animation: animations.pop,
    }),

    light: createTheme({
        background: "linear-gradient(145deg, #ffffff, #f4f4f5)",
        color: "#18181b",
        border: "1px solid #d4d4d8",
        borderRadius: "10px",
        filter: "drop-shadow(0 9px 15px rgba(15, 23, 42, 0.18))",
        animation: animations.soft,
    }),

    comic: createTheme({
        background: "#fde047",
        color: "#18181b",
        fontFamily: "Comic Sans MS, Comic Sans, cursive",
        fontSize: "13px",
        fontWeight: 700,
        border: "3px solid #18181b",
        borderRadius: "12px",
        filter: "drop-shadow(5px 5px 0 #18181b)",
        padding: "8px 14px",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.bounce,
    }),

    manga: createTheme({
        background: "linear-gradient(145deg, #ffffff, #f4f4f5)",
        color: "#000000",
        fontFamily: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif",
        fontSize: "13px",
        fontWeight: 900,
        border: "3px solid #000000",
        borderRadius: "10px 3px 10px 3px",
        padding: "9px 15px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "17px",
        animation: animations.pop,
    }),

    newspaper: createTheme({
        background:
            "repeating-linear-gradient(0deg, rgba(68, 64, 60, 0.035) 0, rgba(68, 64, 60, 0.035) 1px, transparent 1px, transparent 4px), #f5f0e6",
        color: "#292524",
        fontFamily: "Times New Roman, Times, serif",
        fontSize: "13px",
        fontWeight: 600,
        border: "2px solid #44403c",
        borderRadius: "1px",
        filter: "drop-shadow(3px 4px 0 rgba(68, 64, 60, 0.28))",
        padding: "9px 15px",
        letterSpacing: "0.02em",
        textAlign: "left",
        arrowSize: "8px",
        arrowWidth: "18px",
        animation: animations.soft,
        style: {
            fontVariantCaps: "small-caps",
        },
    }),

    stickyNote: createTheme({
        background:
            "linear-gradient(145deg, #fff7a8 0%, #fde96b 70%, #e9cc42 100%)",
        color: "#4a3c00",
        fontFamily: "Comic Sans MS, cursive",
        fontSize: "13px",
        fontWeight: 600,
        border: "1px solid #d6b936",
        borderRadius: "3px 14px 5px 11px",
        filter: "drop-shadow(3px 6px 5px rgba(78, 65, 0, 0.28))",
        padding: "10px 15px",
        textAlign: "left",
        arrowSize: "8px",
        arrowWidth: "19px",
        animation: animations.pop,
    }),

    blueprint: createTheme({
        background:
            "linear-gradient(rgba(147, 197, 253, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 197, 253, 0.15) 1px, transparent 1px), #0c4a6e",
        color: "#e0f2fe",
        fontFamily: "Courier New, Consolas, monospace",
        fontSize: "12px",
        fontWeight: 600,
        border: "2px dashed #7dd3fc",
        borderRadius: "2px",
        filter: "drop-shadow(0 0 7px rgba(56, 189, 248, 0.45))",
        padding: "9px 13px",
        letterSpacing: "0.05em",
        textAlign: "left",
        arrowSize: "8px",
        arrowWidth: "16px",
        animation: animations.flip,
        style: {
            backgroundSize: "12px 12px",
        },
    }),

    terminal: createTheme({
        background: "#020a04",
        color: "#4ade80",
        fontFamily: "Consolas, Monaco, Courier New, monospace",
        fontSize: "12px",
        fontWeight: 600,
        border: "1px solid #22c55e",
        borderRadius: "3px",
        padding: "8px 12px",
        letterSpacing: "0.035em",
        textAlign: "left",
        arrowSize: "7px",
        arrowWidth: "13px",
        animation: animations.soft,
    }),

    crt: createTheme({
        background: "linear-gradient(180deg, #07150b, #020804)",
        color: "#86efac",
        fontFamily: "Lucida Console, Monaco, monospace",
        fontSize: "12px",
        fontWeight: 600,
        border: "2px solid #166534",
        borderRadius: "12px",
        padding: "10px 15px",
        arrowSize: "8px",
        arrowWidth: "18px",
        animation: animations.soft,
    }),

    pixel: createTheme({
        background: "linear-gradient(135deg, #4c1d95, #581c87)",
        color: "#fef08a",
        fontFamily: "Courier New, monospace",
        fontSize: "10px",
        fontWeight: 700,
        lineHeight: 1.7,
        border: "4px solid #fef08a",
        borderRadius: "0px",
        padding: "10px 14px",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "18px",
        animation: animations.pop,
    }),

    arcade: createTheme({
        background:
            "radial-gradient(circle at 20% 0%, rgba(34, 211, 238, 0.45), transparent 38%), radial-gradient(circle at 90% 100%, rgba(236, 72, 153, 0.55), transparent 45%), #150629",
        color: "#ffffff",
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "2px solid #22d3ee",
        borderRadius: "12px",
        filter: "drop-shadow(3px 3px 0 #ec4899) drop-shadow(-3px -3px 0 #22d3ee)",
        padding: "9px 15px",
        letterSpacing: "0.07em",
        textShadow: "0 0 6px #22d3ee",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "18px",
        animation: animations.bounce,
    }),

    cyberpunk: createTheme({
        background:
            "repeating-linear-gradient(135deg, rgba(0, 0, 0, 0.12) 0, rgba(0, 0, 0, 0.12) 5px, transparent 5px, transparent 10px), linear-gradient(135deg, #fde047, #facc15)",
        color: "#18181b",
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "2px solid #22d3ee",
        borderRadius: "1px 12px 1px 12px",
        filter: "drop-shadow(5px 5px 0 #ec4899) drop-shadow(-2px -2px 0 #22d3ee)",
        padding: "9px 15px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "21px",
        animation: animations.flip,
    }),

    synthwave: createTheme({
        background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.75)), linear-gradient(135deg, #7c3aed, #db2777)",
        color: "#fdf4ff",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "2px solid #67e8f9",
        borderRadius: "16px 3px 16px 3px",
        filter: "drop-shadow(0 0 7px #ec4899) drop-shadow(0 0 14px rgba(103, 232, 249, 0.5))",
        padding: "9px 15px",
        letterSpacing: "0.07em",
        textShadow: "0 0 6px rgba(255, 255, 255, 0.7)",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.zoom,
    }),

    vaporwave: createTheme({
        background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent 50%), linear-gradient(135deg, #67e8f9, #f0abfc 52%, #f9a8d4)",
        color: "#4c1d95",
        fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "2px solid #ffffff",
        borderRadius: "18px",
        filter: "drop-shadow(5px 6px 0 rgba(124, 58, 237, 0.42))",
        padding: "9px 16px",
        letterSpacing: "0.06em",
        textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "21px",
        animation: animations.bounce,
    }),

    hologram: createTheme({
        background:
            "linear-gradient(115deg, rgba(34, 211, 238, 0.42), rgba(168, 85, 247, 0.35), rgba(236, 72, 153, 0.35), rgba(34, 211, 238, 0.42)), linear-gradient(135deg, #082f49, #312e81)",
        color: "#ecfeff",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        border: "1px solid rgba(165, 243, 252, 0.75)",
        borderRadius: "14px",
        filter: "drop-shadow(0 0 7px rgba(34, 211, 238, 0.75)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.4))",
        padding: "9px 15px",
        letterSpacing: "0.06em",
        arrowSize: "8px",
        arrowWidth: "18px",
        animation: animations.blur,
    }),

    glass: createTheme({
        background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.07)), linear-gradient(135deg, #1e293b, #0f172a)",
        color: "#f8fafc",
        border: "1px solid rgba(255, 255, 255, 0.34)",
        borderRadius: "16px",
        filter: "drop-shadow(0 12px 20px rgba(15, 23, 42, 0.38))",
        padding: "9px 15px",
        arrowSize: "8px",
        arrowWidth: "18px",
        animation: animations.blur,
    }),

    frost: createTheme({
        background:
            "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.85), transparent 35%), linear-gradient(135deg, #e0f2fe, #bae6fd)",
        color: "#075985",
        fontWeight: 600,
        border: "1px solid rgba(125, 211, 252, 0.9)",
        borderRadius: "18px",
        filter: "drop-shadow(0 8px 15px rgba(14, 116, 144, 0.24))",
        padding: "9px 15px",
        textShadow: "0 1px 0 rgba(255, 255, 255, 0.8)",
        arrowSize: "8px",
        arrowWidth: "19px",
        animation: animations.blur,
    }),

    clay: createTheme({
        background: "linear-gradient(145deg, #f3d5bc, #d9a77d)",
        color: "#5b2d16",
        fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "1px solid #c78f63",
        borderRadius: "24px",
        filter: "drop-shadow(7px 9px 10px rgba(91, 45, 22, 0.28)) drop-shadow(-3px -3px 5px rgba(255, 242, 229, 0.72))",
        padding: "10px 17px",
        arrowSize: "9px",
        arrowWidth: "22px",
        animation: animations.pop,
    }),

    bubblegum: createTheme({
        background:
            "radial-gradient(circle at 25% 15%, rgba(255, 255, 255, 0.55), transparent 28%), linear-gradient(135deg, #f9a8d4, #f472b6)",
        color: "#831843",
        fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "2px solid #fdf2f8",
        borderRadius: "999px",
        filter: "drop-shadow(0 8px 12px rgba(219, 39, 119, 0.34))",
        padding: "9px 18px",
        textShadow: "0 1px 0 rgba(255, 255, 255, 0.8)",
        arrowSize: "9px",
        arrowWidth: "22px",
        animation: animations.bounce,
    }),

    candy: createTheme({
        background:
            "repeating-linear-gradient(135deg, #ffffff 0, #ffffff 8px, #ef4444 8px, #ef4444 16px)",
        color: "#991b1b",
        fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "3px solid #991b1b",
        borderRadius: "16px",
        filter: "drop-shadow(4px 5px 0 rgba(127, 29, 29, 0.5))",
        padding: "9px 16px",
        textShadow: "1px 1px 0 #ffffff, -1px -1px 0 #ffffff",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "22px",
        animation: animations.bounce,
    }),

    watermelon: createTheme({
        background:
            "radial-gradient(ellipse at 22% 30%, #111827 0 2px, transparent 3px), radial-gradient(ellipse at 72% 68%, #111827 0 2px, transparent 3px), linear-gradient(180deg, #fb7185 0%, #f43f5e 72%, #f8fafc 72%, #f8fafc 82%, #22c55e 82%)",
        color: "#4c0519",
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "12px",
        fontWeight: 800,
        border: "2px solid #166534",
        borderRadius: "20px 20px 8px 8px",
        filter: "drop-shadow(0 8px 11px rgba(22, 101, 52, 0.32))",
        padding: "9px 16px 12px",
        arrowSize: "9px",
        arrowWidth: "22px",
        animation: animations.pop,
    }),

    lemon: createTheme({
        background:
            "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.65), transparent 22%), linear-gradient(135deg, #fef08a, #facc15)",
        color: "#713f12",
        fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 800,
        border: "2px dotted #a16207",
        borderRadius: "999px",
        filter: "drop-shadow(0 7px 10px rgba(202, 138, 4, 0.32))",
        padding: "8px 17px",
        arrowSize: "9px",
        arrowWidth: "22px",
        animation: animations.bounce,
    }),

    lava: createTheme({
        background:
            "radial-gradient(circle at 18% 20%, #facc15 0, #f97316 8%, transparent 22%), radial-gradient(circle at 78% 70%, #ef4444 0, #7f1d1d 18%, transparent 34%), linear-gradient(135deg, #450a0a, #09090b)",
        color: "#fef3c7",
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "12px",
        fontWeight: 800,
        border: "2px solid #f97316",
        borderRadius: "14px 4px 18px 6px",
        filter: "drop-shadow(0 0 7px rgba(249, 115, 22, 0.8)) drop-shadow(0 8px 15px rgba(69, 10, 10, 0.6))",
        padding: "9px 15px",
        letterSpacing: "0.04em",
        textShadow: "0 0 5px rgba(253, 186, 116, 0.8)",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "19px",
        animation: animations.zoom,
    }),

    ember: createTheme({
        background:
            "radial-gradient(circle at 15% 40%, rgba(251, 146, 60, 0.72), transparent 22%), radial-gradient(circle at 75% 20%, rgba(239, 68, 68, 0.48), transparent 25%), #291208",
        color: "#fed7aa",
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        fontWeight: 600,
        border: "1px solid #c2410c",
        borderRadius: "8px 18px 8px 18px",
        filter: "drop-shadow(0 0 7px rgba(234, 88, 12, 0.5))",
        padding: "9px 15px",
        textShadow: "0 0 4px rgba(251, 146, 60, 0.7)",
        arrowSize: "9px",
        arrowWidth: "18px",
        animation: animations.blur,
    }),

    toxic: createTheme({
        background: "linear-gradient(135deg, #bef264, #84cc16)",
        color: "#1a2e05",
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "3px solid #1a2e05",
        borderRadius: "3px 10px 3px 10px",
        padding: "9px 14px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "20px",
        animation: animations.pop,
    }),

    radioactive: createTheme({
        background:
            "conic-gradient(from 45deg at 50% 50%, #facc15 0 12.5%, #18181b 12.5% 25%, #facc15 25% 37.5%, #18181b 37.5% 50%, #facc15 50% 62.5%, #18181b 62.5% 75%, #facc15 75% 87.5%, #18181b 87.5%)",
        color: "#ffffff",
        fontFamily: "Arial Black, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "3px solid #000000",
        borderRadius: "50%",
        filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.7))",
        padding: "13px 18px",
        letterSpacing: "0.05em",
        textShadow: "2px 2px 0 #000000, -1px -1px 0 #000000",
        textTransform: "uppercase",
        arrowSize: "11px",
        arrowWidth: "21px",
        animation: animations.zoom,
    }),

    hazard: createTheme({
        background: "linear-gradient(135deg, #fb923c, #ea580c)",
        color: "#ffffff",
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "3px solid #18181b",
        borderRadius: "4px",
        padding: "9px 15px",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "20px",
        animation: animations.pop,
    }),

    policeTape: createTheme({
        background:
            "repeating-linear-gradient(135deg, #f8fafc 0, #f8fafc 11px, #2563eb 11px, #2563eb 22px)",
        color: "#172554",
        fontFamily: "Arial Narrow, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "3px solid #1e3a8a",
        borderRadius: "1px",
        filter: "drop-shadow(4px 5px 0 rgba(30, 58, 138, 0.42))",
        padding: "8px 15px",
        letterSpacing: "0.1em",
        textShadow: "1px 1px 0 #ffffff, -1px -1px 0 #ffffff",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.slide,
    }),

    construction: createTheme({
        background:
            "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.045) 0, rgba(255, 255, 255, 0.045) 1px, transparent 1px, transparent 7px), linear-gradient(135deg, #52525b, #27272a)",
        color: "#fed7aa",
        fontFamily: "DIN Condensed, Arial Narrow, sans-serif",
        fontSize: "12px",
        fontWeight: 800,
        border: "3px dashed #f97316",
        borderRadius: "3px",
        filter: "drop-shadow(5px 6px 0 rgba(24, 24, 27, 0.52))",
        padding: "9px 15px",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        arrowSize: "10px",
        arrowWidth: "20px",
        animation: animations.flip,
    }),

    parchment: createTheme({
        background:
            "radial-gradient(circle at 12% 20%, rgba(120, 83, 36, 0.12), transparent 20%), radial-gradient(circle at 82% 70%, rgba(120, 83, 36, 0.16), transparent 25%), linear-gradient(135deg, #f5deb3, #e7c78e)",
        color: "#5b3716",
        fontFamily: "Garamond, Georgia, serif",
        fontSize: "14px",
        fontWeight: 600,
        border: "2px solid #9a6b32",
        borderRadius: "14px 3px 12px 5px",
        filter: "drop-shadow(4px 6px 5px rgba(91, 55, 22, 0.3))",
        padding: "10px 16px",
        textAlign: "left",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.soft,
    }),

    pirateMap: createTheme({
        background:
            "radial-gradient(circle at 75% 25%, transparent 0 6px, rgba(127, 29, 29, 0.55) 7px 8px, transparent 9px), repeating-radial-gradient(circle at 15% 85%, rgba(120, 83, 36, 0.08) 0 2px, transparent 2px 9px), #e7c78e",
        color: "#422006",
        fontFamily: "Papyrus, Harrington, Georgia, serif",
        fontSize: "13px",
        fontWeight: 700,
        border: "2px dashed #78350f",
        borderRadius: "5px 17px 7px 12px",
        filter: "drop-shadow(4px 7px 5px rgba(66, 32, 6, 0.36))",
        padding: "10px 16px",
        letterSpacing: "0.025em",
        textAlign: "left",
        arrowSize: "10px",
        arrowWidth: "19px",
        animation: animations.flip,
    }),

    royal: createTheme({
        background:
            "radial-gradient(circle at 50% -20%, rgba(250, 204, 21, 0.5), transparent 46%), linear-gradient(135deg, #581c87, #2e1065)",
        color: "#fef3c7",
        fontFamily: "Palatino Linotype, Book Antiqua, serif",
        fontSize: "13px",
        fontWeight: 700,
        border: "2px solid #facc15",
        borderRadius: "6px 20px 6px 20px",
        filter: "drop-shadow(0 8px 14px rgba(46, 16, 101, 0.55)) drop-shadow(0 0 5px rgba(250, 204, 21, 0.4))",
        padding: "10px 17px",
        letterSpacing: "0.05em",
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.7)",
        arrowSize: "10px",
        arrowWidth: "21px",
        animation: animations.flip,
        style: {
            fontVariantCaps: "small-caps",
        },
    }),

    noir: createTheme({
        background:
            "linear-gradient(115deg, #000000 0%, #27272a 48%, #09090b 52%, #000000 100%)",
        color: "#ffffff",
        fontFamily: "Helvetica Neue, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "1px solid #a1a1aa",
        borderRadius: "0px",
        filter: "drop-shadow(7px 9px 0 rgba(0, 0, 0, 0.6))",
        padding: "9px 15px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "16px",
        animation: animations.soft,
    }),

    detective: createTheme({
        background:
            "repeating-linear-gradient(0deg, rgba(68, 64, 60, 0.05) 0, rgba(68, 64, 60, 0.05) 1px, transparent 1px, transparent 5px), #d6c29f",
        color: "#292524",
        fontFamily: "Courier New, monospace",
        fontSize: "12px",
        fontWeight: 700,
        border: "2px solid #57534e",
        borderRadius: "2px",
        filter: "drop-shadow(5px 7px 0 rgba(68, 64, 60, 0.34))",
        padding: "10px 15px",
        letterSpacing: "0.04em",
        textAlign: "left",
        arrowSize: "8px",
        arrowWidth: "17px",
        animation: animations.slide,
    }),

    dossier: createTheme({
        background: "linear-gradient(180deg, #f2e5c8, #dfc99f)",
        color: "#3f2d1d",
        fontFamily: "Courier New, monospace",
        fontSize: "11px",
        fontWeight: 800,
        border: "2px solid #92400e",
        borderRadius: "2px 7px 2px 7px",
        padding: "11px 16px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        textAlign: "left",
        arrowSize: "8px",
        arrowWidth: "17px",
        animation: animations.soft,
    }),

    medical: createTheme({
        background:
            "linear-gradient(90deg, transparent 44%, rgba(14, 165, 233, 0.08) 44% 56%, transparent 56%), linear-gradient(0deg, transparent 44%, rgba(14, 165, 233, 0.08) 44% 56%, transparent 56%), #f8fafc",
        color: "#075985",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "2px solid #38bdf8",
        borderRadius: "10px",
        filter: "drop-shadow(0 8px 12px rgba(14, 165, 233, 0.2))",
        padding: "9px 15px",
        arrowSize: "8px",
        arrowWidth: "18px",
        animation: animations.soft,
    }),

    laboratory: createTheme({
        background:
            "linear-gradient(rgba(34, 211, 238, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.09) 1px, transparent 1px), linear-gradient(135deg, #082f49, #0f172a)",
        color: "#a5f3fc",
        fontFamily: "Roboto Mono, Consolas, monospace",
        fontSize: "11px",
        fontWeight: 600,
        border: "1px solid #22d3ee",
        borderRadius: "7px",
        filter: "drop-shadow(0 0 7px rgba(34, 211, 238, 0.45))",
        padding: "9px 14px",
        letterSpacing: "0.04em",
        textAlign: "left",
        arrowSize: "8px",
        arrowWidth: "16px",
        animation: animations.blur,
        style: {
            backgroundSize: "10px 10px",
        },
    }),

    circuit: createTheme({
        background: "linear-gradient(135deg, #052e16, #022c22)",
        color: "#bbf7d0",
        fontFamily: "Consolas, monospace",
        fontSize: "11px",
        fontWeight: 700,
        border: "2px solid #22c55e",
        borderRadius: "5px",
        padding: "9px 14px",
        letterSpacing: "0.05em",
        arrowSize: "8px",
        arrowWidth: "16px",
        animation: animations.soft,
    }),

    galaxy: createTheme({
        background:
            "radial-gradient(circle at 12% 25%, #ffffff 0 1px, transparent 1.5px), radial-gradient(circle at 76% 18%, #c4b5fd 0 1px, transparent 1.5px), radial-gradient(circle at 63% 78%, #ffffff 0 1.2px, transparent 1.8px), radial-gradient(circle at 28% 72%, rgba(236, 72, 153, 0.55), transparent 22%), radial-gradient(circle at 70% 20%, rgba(99, 102, 241, 0.55), transparent 32%), #09051f",
        color: "#f5f3ff",
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        border: "1px solid #8b5cf6",
        borderRadius: "18px",
        filter: "drop-shadow(0 0 9px rgba(139, 92, 246, 0.62)) drop-shadow(0 9px 16px rgba(9, 5, 31, 0.6))",
        padding: "10px 16px",
        textShadow: "0 0 5px rgba(196, 181, 253, 0.8)",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.blur,
    }),

    aurora: createTheme({
        background:
            "radial-gradient(ellipse at 15% 0%, rgba(45, 212, 191, 0.85), transparent 45%), radial-gradient(ellipse at 90% 100%, rgba(217, 70, 239, 0.72), transparent 50%), linear-gradient(135deg, #0f172a, #312e81)",
        color: "#f0fdfa",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        border: "1px solid rgba(153, 246, 228, 0.6)",
        borderRadius: "20px 8px 20px 8px",
        filter: "drop-shadow(0 10px 17px rgba(49, 46, 129, 0.48))",
        padding: "10px 16px",
        arrowSize: "9px",
        arrowWidth: "21px",
        animation: animations.blur,
    }),

    oceanDepths: createTheme({
        background:
            "radial-gradient(circle at 20% 10%, rgba(34, 211, 238, 0.32), transparent 32%), radial-gradient(circle at 80% 90%, rgba(14, 116, 144, 0.42), transparent 36%), linear-gradient(160deg, #083344, #020617)",
        color: "#cffafe",
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        border: "1px solid #0e7490",
        borderRadius: "4px 20px 4px 20px",
        filter: "drop-shadow(0 10px 16px rgba(2, 6, 23, 0.56)) drop-shadow(0 0 6px rgba(34, 211, 238, 0.3))",
        padding: "10px 16px",
        arrowSize: "10px",
        arrowWidth: "19px",
        animation: animations.slide,
    }),

    coralReef: createTheme({
        background:
            "radial-gradient(circle at 15% 100%, rgba(251, 113, 133, 0.75), transparent 30%), radial-gradient(circle at 90% 0%, rgba(45, 212, 191, 0.72), transparent 34%), linear-gradient(135deg, #0e7490, #155e75)",
        color: "#fff7ed",
        fontFamily: "Trebuchet MS, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        border: "2px solid #fdba74",
        borderRadius: "18px 8px 14px 5px",
        filter: "drop-shadow(0 9px 14px rgba(14, 116, 144, 0.4))",
        padding: "9px 16px",
        textShadow: "0 1px 2px rgba(12, 74, 110, 0.8)",
        arrowSize: "9px",
        arrowWidth: "21px",
        animation: animations.bounce,
    }),

    forest: createTheme({
        background:
            "radial-gradient(ellipse at 20% 20%, rgba(74, 222, 128, 0.18), transparent 30%), repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.025) 0 2px, transparent 2px 7px), linear-gradient(135deg, #14532d, #052e16)",
        color: "#dcfce7",
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        fontWeight: 600,
        border: "2px solid #4d7c0f",
        borderRadius: "13px 4px 17px 6px",
        filter: "drop-shadow(0 9px 14px rgba(5, 46, 22, 0.5))",
        padding: "9px 16px",
        arrowSize: "9px",
        arrowWidth: "19px",
        animation: animations.slide,
    }),

    moss: createTheme({
        background:
            "radial-gradient(circle at 20% 30%, rgba(190, 242, 100, 0.16) 0 3px, transparent 4px), radial-gradient(circle at 72% 65%, rgba(132, 204, 22, 0.14) 0 4px, transparent 5px), linear-gradient(135deg, #3f6212, #1a2e05)",
        color: "#ecfccb",
        fontFamily: "Palatino Linotype, serif",
        fontSize: "13px",
        fontWeight: 600,
        border: "2px dotted #84cc16",
        borderRadius: "18px 7px 14px 10px",
        filter: "drop-shadow(0 8px 13px rgba(26, 46, 5, 0.5))",
        padding: "10px 16px",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.blur,
    }),

    desert: createTheme({
        background:
            "radial-gradient(ellipse at 20% 120%, #f59e0b 0 35%, transparent 36%), radial-gradient(ellipse at 85% 110%, #d97706 0 40%, transparent 41%), linear-gradient(180deg, #fde68a, #fbbf24)",
        color: "#78350f",
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        fontWeight: 700,
        border: "2px solid #b45309",
        borderRadius: "22px 22px 7px 7px",
        filter: "drop-shadow(0 9px 13px rgba(180, 83, 9, 0.32))",
        padding: "10px 16px",
        arrowSize: "9px",
        arrowWidth: "21px",
        animation: animations.soft,
    }),

    snow: createTheme({
        background:
            "radial-gradient(circle at 15% 25%, #ffffff 0 2px, transparent 2.5px), radial-gradient(circle at 75% 65%, #ffffff 0 1.5px, transparent 2px), linear-gradient(135deg, #e0f2fe, #bae6fd)",
        color: "#0c4a6e",
        fontFamily: "Helvetica Neue, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        border: "2px solid #ffffff",
        borderRadius: "20px",
        filter: "drop-shadow(0 8px 13px rgba(14, 116, 144, 0.22))",
        padding: "10px 16px",
        textShadow: "0 1px 0 rgba(255, 255, 255, 0.9)",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.blur,
    }),

    chrome: createTheme({
        background:
            "linear-gradient(180deg, #ffffff 0%, #a1a1aa 18%, #f4f4f5 38%, #52525b 52%, #d4d4d8 72%, #71717a 100%)",
        color: "#18181b",
        fontFamily: "Arial Black, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "2px solid #27272a",
        borderRadius: "10px",
        filter: "drop-shadow(0 8px 12px rgba(24, 24, 27, 0.45))",
        padding: "9px 16px",
        letterSpacing: "0.04em",
        textShadow: "0 1px 0 #ffffff",
        textTransform: "uppercase",
        arrowSize: "9px",
        arrowWidth: "20px",
        animation: animations.flip,
    }),

    goldFoil: createTheme({
        background:
            "linear-gradient(115deg, #713f12 0%, #facc15 18%, #fef08a 32%, #ca8a04 52%, #fef9c3 70%, #a16207 100%)",
        color: "#422006",
        fontFamily: "Palatino Linotype, serif",
        fontSize: "13px",
        fontWeight: 800,
        border: "2px solid #713f12",
        borderRadius: "5px 16px 5px 16px",
        filter: "drop-shadow(0 9px 14px rgba(113, 63, 18, 0.45))",
        padding: "10px 17px",
        letterSpacing: "0.04em",
        textShadow: "0 1px 0 rgba(255, 255, 255, 0.55)",
        arrowSize: "10px",
        arrowWidth: "21px",
        animation: animations.flip,
        style: {
            fontVariantCaps: "small-caps",
        },
    }),

    bronze: createTheme({
        background:
            "repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 5px), linear-gradient(135deg, #d97706, #78350f)",
        color: "#ffedd5",
        fontFamily: "Georgia, serif",
        fontSize: "13px",
        fontWeight: 700,
        border: "2px solid #fdba74",
        borderRadius: "8px",
        filter: "drop-shadow(0 9px 14px rgba(120, 53, 15, 0.5))",
        padding: "9px 16px",
        textShadow: "0 1px 2px rgba(66, 32, 6, 0.8)",
        arrowSize: "9px",
        arrowWidth: "19px",
        animation: animations.pop,
    }),

    brutalist: createTheme({
        background: "#ffffff",
        color: "#000000",
        fontFamily: "Arial Black, Helvetica, sans-serif",
        fontSize: "12px",
        fontWeight: 900,
        border: "4px solid #000000",
        borderRadius: "0px",
        padding: "10px 16px",
        letterSpacing: "-0.03em",
        textTransform: "uppercase",
        textAlign: "left",
        arrowSize: "11px",
        arrowWidth: "19px",
        animation: animations.pop,
    }),

    chalkboard: createTheme({
        background: "linear-gradient(145deg, #183f30, #102a21)",
        color: "#f5f5dc",
        fontFamily: "Comic Sans MS, Chalkboard, cursive",
        fontSize: "13px",
        fontWeight: 600,
        border: "3px solid #8b5e3c",
        borderRadius: "2px",
        padding: "10px 16px",
        letterSpacing: "0.025em",
        textAlign: "left",
        arrowSize: "9px",
        arrowWidth: "18px",
        animation: animations.soft,
    }),
} satisfies Record<string, ThemeType>;

export type PresetsThemeType = keyof typeof presets;

export const presetThemeNames = Object.keys(presets) as PresetsThemeType[];

export const isPresetTheme = (
    value: string | undefined,
): value is PresetsThemeType => {
    return Boolean(
        value && Object.prototype.hasOwnProperty.call(presets, value),
    );
};
