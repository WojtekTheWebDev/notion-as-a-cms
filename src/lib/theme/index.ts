const themeNames = ["notion", "editorial"] as const;

export type ThemeName = (typeof themeNames)[number];

export const defaultTheme: ThemeName = "notion";
export const defaultAccent = "#c9a66b";

const isThemeName = (value: string): value is ThemeName =>
  (themeNames as readonly string[]).includes(value);

export const getActiveThemeName = (): ThemeName => {
  const configured = process.env.SITE_THEME?.trim().toLowerCase();

  if (configured && isThemeName(configured)) {
    return configured;
  }

  return defaultTheme;
};

const hexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const getAccent = (): string => {
  const configured = process.env.SITE_ACCENT?.trim();

  if (configured && hexColor.test(configured)) {
    return configured;
  }

  return defaultAccent;
};
