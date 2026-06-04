import { Inter } from "next/font/google";

// notion theme font(s). Exposed as a CSS variable; the theme's CSS points
// --font-body at it. next/font loaders must run at module scope with static
// arguments, which is why each theme declares its fonts in a module like this.

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const fontVariables = [inter.variable];
