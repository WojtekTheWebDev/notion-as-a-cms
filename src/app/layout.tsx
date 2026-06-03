import type { Metadata } from "next";
import { Inter, Inter_Tight, Newsreader } from "next/font/google";
import "./globals.css";
import { metaGenerator } from "@/lib/metadata";
import { getAccent, getActiveThemeName } from "@/lib/theme";

export const metadata: Metadata = {
  generator: metaGenerator,
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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

const fontVariables = [
  inter.variable,
  interTight.variable,
  newsreader.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = getActiveThemeName();
  const accent = getAccent();

  return (
    <html
      lang="en"
      data-theme="dark"
      data-site-theme={theme}
      className={fontVariables}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
