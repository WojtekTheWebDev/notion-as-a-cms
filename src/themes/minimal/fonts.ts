import { Inter_Tight, Newsreader } from "next/font/google";

// minimal theme fonts. preload: false so deployments on other themes don't
// ship these — the browser only downloads a font once the active theme's CSS
// actually references its variable.

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter-tight",
  preload: false,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400"],
  variable: "--font-newsreader",
  preload: false,
});

export const fontVariables = [interTight.variable, newsreader.variable];
