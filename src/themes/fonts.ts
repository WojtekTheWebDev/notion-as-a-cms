import { fontVariables as notionFonts } from "./notion/fonts";
import { fontVariables as minimalFonts } from "./minimal/fonts";

// Every theme's font variables, applied together to <html> in layout.tsx. The
// variables only define CSS custom properties; the browser downloads a font
// only when the active theme's CSS actually references it. Add a new theme's
// fonts here.
export const fontVariables = [...notionFonts, ...minimalFonts].join(" ");
