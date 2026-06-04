const themeNames = ["notion", "minimal"] as const;

export type ThemeName = (typeof themeNames)[number];

export const defaultTheme: ThemeName = "notion";

const isThemeName = (value: string): value is ThemeName =>
  (themeNames as readonly string[]).includes(value);

export const getActiveThemeName = (): ThemeName => {
  const configured = process.env.SITE_THEME?.trim().toLowerCase();

  if (configured && isThemeName(configured)) {
    return configured;
  }

  return defaultTheme;
};
