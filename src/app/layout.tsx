import type { Metadata } from "next";
import "./globals.css";
import { metaGenerator } from "@/lib/metadata";
import { getAccent, getActiveThemeName } from "@/themes";
import { fontVariables } from "@/themes/fonts";

export const metadata: Metadata = {
  generator: metaGenerator,
};

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
