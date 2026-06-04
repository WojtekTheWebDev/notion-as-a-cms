import type { Metadata } from "next";
import "./globals.css";
import { metaGenerator } from "@/lib/metadata";
import { getActiveThemeName } from "@/themes";
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

  return (
    <html
      lang="en"
      data-theme="dark"
      data-site-theme={theme}
      className={fontVariables}
    >
      <body>{children}</body>
    </html>
  );
}
