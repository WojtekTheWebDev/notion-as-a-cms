---
"notion-as-a-cms": minor
---

Add an environment-driven style theme system so one codebase can be deployed to multiple sites with different looks. `SITE_THEME` selects the active theme — `notion` (the default) or the new serif `minimal` — and falls back to `notion` when unset, so existing deployments render exactly as before. Themes now live in self-contained `src/themes/<name>/` directories — a stylesheet scoped to `[data-site-theme="<name>"]` plus its `next/font` loaders — with `globals.css` reduced to the Tailwind setup that imports them in cascade order (notion first as the base). A README "Adding a new theme" guide and an `add-theme` skill cover authoring new ones.
