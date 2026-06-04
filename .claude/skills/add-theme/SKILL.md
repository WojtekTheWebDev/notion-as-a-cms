---
name: add-theme
description: >-
  Add a new visual theme to this notion-as-a-cms site from a design reference —
  an image/screenshot, a text brief, a live URL or Figma link, or a
  Claude-generated design/prototype (HTML/JSX export). Use this whenever the
  user wants the site to look like a given design, asks to "add/create/make a
  theme", mentions a new look/style/skin/palette/typography/font for the site,
  wants to restyle the pages, or hands over a mockup/screenshot/Figma/prototype
  and asks to turn it into a theme — even if they never say the word "theme".
  Not for editing Notion content, changing page structure with a header/footer
  shell, or touching the data pipeline.
---

# Add a theme from a design

This site (see `AGENTS.md`) renders Notion pages into bare HTML elements
(`<h1>`, `<p>`, `<a>`, list items, an image) and lets CSS style them. A
**theme** is a palette + fonts + a handful of element rules, scoped to a
`[data-site-theme="<name>"]` attribute and chosen per deployment by the
`SITE_THEME` env var. Your job: turn a design reference into one more such
theme, following the existing modular pattern, and prove it renders like the
design.

The whole point of this system is that themes restyle the **same Notion
content** — you are not rebuilding the page, you are re-skinning the elements
the renderer already emits. Keep that in mind and you'll avoid most mistakes.

## What this skill does NOT do

- It does **not** change page *structure*. The minimal/notion themes are pure
  CSS over the existing DOM. A design with a top bar, footer, sidebar, or
  multi-column layout needs a per-theme React **shell component**, which
  doesn't exist yet — that's a bigger change. If the design clearly needs one,
  say so and confirm scope before proceeding; don't fake it with CSS hacks.
- It does **not** edit Notion content, the DB schema, or `src/lib/notion/*`.
- It does **not** add `"use client"` or touch anything that reads
  `NOTION_SECRET`.

## Step 1 — Understand the design reference

The input can arrive in several forms. Get to a concrete palette + typography
+ layout from whichever you're given:

- **Image / screenshot** (path or pasted): read it directly and observe colors,
  fonts, alignment, spacing.
- **Text brief** ("warm cream bg, serif display, terracotta accent"): use it as
  given; ask only if a load-bearing detail is missing.
- **Code/markup prototype** (a Claude-generated design — an HTML or JSX export
  like a `Portfolio Landing.html` or `variations/*.jsx`): **read the file**.
  This is the richest source — prototypes usually contain explicit hex values
  and `font-family` names. Prefer reading exact values over eyeballing a render.
- **Live URL / Figma link**: screenshot it with the bundled helper
  `scripts/screenshot.sh "<url>" /tmp/ref.png`, then read the PNG. For Figma,
  if a Figma MCP tool is connected use it to read styles; otherwise screenshot
  the public link or ask the user for an export.

If anything essential is ambiguous (the accent color, serif vs sans for the
headline), make a sensible choice and state the assumption rather than stalling
— the user reviews the rendered result and can correct it fast.

## Step 2 — Extract the design system

Pull these out of the reference. The left column is the CSS variable / selector
you'll set in Step 3.

| What | Where it goes | Notes |
| --- | --- | --- |
| Page background | `--notion-background` | The dominant surface color. |
| Primary body text | `--notion-default` | Default ink for paragraphs/body. |
| Heading color | `h1` (and `h2,h3`) `color` | Often brighter/warmer than body. |
| Muted text | `p`/`li` `color` | If body text is dimmer than headings. |
| Accent | `var(--accent)` | Don't hardcode if avoidable — it already comes from the `SITE_ACCENT` env var (default `#c9a66b`). Use `var(--accent)` for link underlines/hover so deployments can retune it. |
| Display font | `--font-display` | The headline typeface. |
| Body font | `--font-body` | Paragraph/UI typeface. |
| Layout | `.content` | Column width, alignment (centered vs left), padding, vertical placement. |

**Fonts → Google Fonts.** Identify each typeface's category (serif display,
grotesque sans, mono…) and its weight/contrast, then pick a close match that
`next/font/google` can load (it supports essentially the whole Google Fonts
library). Good starting points: serif display → `Newsreader`, `Fraunces`,
`Playfair_Display`, `EB_Garamond`; sans → `Inter`, `Inter_Tight`, `Manrope`,
`Geist`; mono → `JetBrains_Mono`, `Geist_Mono`. If you can't identify the exact
font, choose the closest category match and note it.

## Step 3 — Scaffold the theme

Pick a short, lowercase, hyphen-free `<name>` (e.g. `editorial`, `brutalist`,
`mono`). Then create/edit exactly these five places. Mirror the existing
`src/themes/minimal/` theme — read it first; it's your template.

**3a. `src/themes/<name>/fonts.ts`** — load the theme's fonts as CSS variables.
`next/font` loaders must be called at module scope with static arguments. Use
`preload: false` so deployments on *other* themes don't ship these fonts (the
browser only downloads a font once the active theme's CSS references it).

```ts
import { Fraunces } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-fraunces",
  preload: false,
});

export const fontVariables = [fraunces.variable];
```

If the theme reuses a font already loaded by another theme (e.g. Inter), you
can import that font's `fontVariables` instead of re-declaring the loader.

**3b. `src/themes/<name>/<name>.css`** — the theme block. Everything is scoped
to `[data-site-theme="<name>"]` so it only applies when active, and it's
imported *after* notion (Step 3d) so it wins at equal specificity. Override the
tokens, point the semantic font vars at your loaded fonts, and restyle the few
elements that matter.

```css
/* <name> theme — opt-in via data-site-theme="<name>" (SITE_THEME env). */
[data-site-theme="<name>"] {
  --notion-background: #0e0e10;
  --notion-default: #e7e2d6;

  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-fraunces), Georgia, serif;
}

[data-site-theme="<name>"] .content {
  max-width: 760px;
  /* alignment, padding, vertical placement to match the design */
}

[data-site-theme="<name>"] h1 {
  font-family: var(--font-display);
  color: #f5efe1;
  /* size, weight, line-height, letter-spacing */
}

[data-site-theme="<name>"] p,
[data-site-theme="<name>"] li { color: #b8b2a6; }

[data-site-theme="<name>"] a {
  color: #e7e2d6;
  border-bottom: 1px solid var(--accent);
  text-decoration: none;
}
[data-site-theme="<name>"] a:hover { color: var(--accent); }
```

Only override what the design actually changes; everything you don't touch
inherits the notion base. Note: a Notion **color annotation** on content (e.g.
a heading the author colored yellow) still wins over your element `color` —
that's intended, leave it.

**3c. Register the name** in `src/themes/index.ts` — add it to `themeNames`:

```ts
const themeNames = ["notion", "minimal", "<name>"] as const;
```

That single edit is the whole selection story: `SITE_THEME=<name>` now resolves
and validates, and unknown values still fall back to `notion`.

**3d. Import the CSS** in `src/app/globals.css`, *after* the notion import so
cascade order = priority:

```css
@import "../themes/notion/notion.css";
@import "../themes/minimal/minimal.css";
@import "../themes/<name>/<name>.css";
```

**3e. Add the fonts to the aggregator** in `src/themes/fonts.ts`:

```ts
import { fontVariables as nameFonts } from "./<name>/fonts";
export const fontVariables = [...notionFonts, ...minimalFonts, ...nameFonts].join(" ");
```

### The font-resolution rule (don't skip this)

`layout.tsx` applies the aggregated `fontVariables` to the **`<html>`** element
on purpose. The font CSS variables (e.g. `--font-fraunces`) and the semantic
indirection (`--font-display: var(--font-fraunces)`) must live on the same
element (or an ancestor of where they're used), or the intermediate resolves to
nothing and headings silently fall back to the body font. Keep the variables on
`<html>`; don't move them to `<body>`. (This exact bug produced a sans-serif,
italic heading once — the fix was keeping the vars on `<html>`.)

## Step 4 — Verify it builds AND looks right

A theme that compiles can still render wrong (see the font bug above), so do
both.

1. **Static checks:** `npm run lint` and `npm run build`. Both must pass.
2. **Visual check against the design:**
   - Set `SITE_THEME=<name>` (and `SITE_ACCENT` if the design has a specific
     accent) and start dev: `SITE_THEME=<name> npm run dev`.
   - **Restart dev after editing `globals.css` or theme CSS.** Turbopack's dev
     server does not reliably hot-reload these — it will keep serving the old
     CSS, which looks exactly like "my theme isn't working." If a restart isn't
     enough, `rm -rf .next` and start again. (`npm run build` never has this
     problem.)
   - Screenshot the result and compare side-by-side with the reference:
     `scripts/screenshot.sh http://localhost:3000/ /tmp/theme.png`
   - Confirm the rendered HTML's `data-site-theme="<name>"` matches your CSS
     selector, the headline uses the intended (serif/sans) font, the palette
     matches, and links carry the accent.
   - Stop the dev server when done so it doesn't block the user's own
     `npm run dev`.

Iterate on the CSS until the screenshot matches the design's palette,
typography, and layout. The body copy comes from real Notion content, so it
won't match the mockup's words — judge the *styling*, not the text.

## Step 5 — Report

Tell the user: the theme name, the files you created/edited, how to activate it
(`SITE_THEME=<name>`, plus `SITE_ACCENT` if relevant), and how the screenshot
compares to the design. Flag any assumptions you made (font substitutions,
guessed colors) so they can correct them. This is a user-visible change — offer
to add a changeset (`/generate-changeset`) rather than running it unprompted.
