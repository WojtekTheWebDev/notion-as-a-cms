# notion-as-a-cms project

## Getting started

This project combines the power of Notion as a CMS with modern web development tools like Next.js, providing a flexible foundation for your content management needs.

This guide will walk you through the setup process and essential features of this boilerplate.

### Why?

I love Notion and imho it’s a great (and free) tool that can work as a CMS.

There are some cool projects (e.g. [react-notion-x](https://github.com/NotionX/react-notion-x)) that can be used for the same purpose, but I wanted to base my solution on an official Notion tools. 

I had tons of fun playing with their API to render components and show everything I needed to create my personal website, so I’ve decided to make this project open-source. 

I hope it can be helpful to someone.

### Demo

You can check the demo [here](https://notion-as-a-cms.vercel.app/).

### TLDR

To implement this project, you would need to duplicate [Notion database](https://tinyurl.com/mpearp29) to your workspace, create a new [Notion integration](https://developers.notion.com/docs/create-a-notion-integration) to get an API key, clone the [notion-as-a-cms repository](https://github.com/WojtekTheWebDev/notion-as-a-cms), configure the environment variables with your Notion credentials, and deploy the Next.js application to your preferred hosting platform.

### Database

First, you need to duplicate the project’s Notion database - available [here](https://www.notion.so/CMS-19eabb8900388044bae4c08a4d020786?pvs=21).

It contains the list of pages that would be rendered in your project. After cloning it, you should see **Getting started** page. Don’t remove it yet, it would be helpful to ensure that everything in the setup has been done correctly.

Once you’ve duplicated the database, save it’s ID - it would be necessary in project setup. You can check it in the Notion url -[`https://www.notion.so/<DB_NAME>-<DB_ID>`](https://www.notion.so/CMS-19eabb8900388044bae4c08a4d020786?pvs=21)

Each item in the database is a page that contains properties and content.

The properties are:

- Slug
- Meta title
- Meta description
- SEO Keywords

A slug would be necessary to render your page. Home page uses `home` by default.

After creating a new page, simply navigate to `<yourdomain>.<extension>/<slug>` or [`localhost:300/<slug>`](http://localhost:300/<slug>) for local development.

### Notion integration

To fetch the data, it’s necessary to create a Notion integration. It can be an internal integration. Follow the [guide](https://developers.notion.com/docs/create-a-notion-integration#getting-started) to create one. Save your **Internal Integration Secret**, it would be necessary in project setup.

After creating an integration, give the permissions (as the [guide](https://developers.notion.com/docs/create-a-notion-integration#give-your-integration-page-permissions) explains) to the duplicated database in your Notion space.

### Project

To start, simply use this [template](https://github.com/WojtekTheWebDev/notion-as-a-cms) to create a new GitHub repository and clone it.

Then, copy the *.env.example* and rename it to *.env*. Use your **Internal Integration Secret** and **Database ID** (from previous steps) as `NOTION_SECRET` and `NOTION_DATABASE_ID`.

Optionally, set `SITE_THEME` to pick a style theme (`notion` — the default — or `minimal`). It falls back to `notion` when unset, so you can deploy the same codebase to multiple sites with different looks just by changing this one variable.

It’s all. 

You can run `npm run dev`. 

If everything went properly, you should see this **Getting started** page. 

Now, feel free to remove it, edit the content and do whatever you want.

### Deployment

The whole project is based on a Next.js app. The easiest way to deploy it is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## How-tos

### Setting Up Image Ratio

In this project, images are displayed with a specific width and height to maintain a consistent aspect ratio. This is necessary because Next.js requires both width and height to properly optimize and render images.

The default width and height are defined in the `constants.ts` file:

```typescript
export const defaultWidth = 500;
export const ratio = 16 / 9;
export const defaultHeight = defaultWidth / ratio;
```

You can adjust the `defaultWidth` and `ratio` values to change the dimensions of the images. The `defaultHeight` is automatically calculated based on the width and ratio.

For example, if you want to change the aspect ratio to 4:3, you can update the `ratio` value:

```diff
- export const ratio = 16 / 9;
+ export const ratio = 4 / 3;
```

This will ensure that all images maintain the new aspect ratio while being rendered.

### Adding a new theme

Themes restyle the **same Notion content** — they swap the palette, fonts, and a few element rules; they don't change the page structure. Each theme lives in its own folder under `src/themes/<name>/` and is activated per deployment with the `SITE_THEME` env var (unknown/empty falls back to `notion`). The repo ships with `notion` (the default) and `minimal`.

#### Option A — let the agent do it (recommended)

This repo bundles an **`add-theme`** skill for [Claude Code](https://claude.com/claude-code). Just point it at a design and ask — it scaffolds the theme, wires everything up, and verifies it builds and renders:

```
Add a theme based on this design: ./mockup.png
```

It also accepts a text brief (“warm cream background, serif headline, terracotta accent”), a code/markup prototype, or a URL/Figma link. The skill triggers on phrasing like “add/create a theme”, “make the site look like this”, or any mockup/screenshot you hand it. It follows the manual steps below for you and screenshots the result against your design.

#### Option B — do it manually

Using `src/themes/minimal/` as a template, touch these five places (replace `<name>` with your theme, lowercase, no spaces):

1. **`src/themes/<name>/fonts.ts`** — load the theme’s fonts via `next/font` and export their CSS variables (use `preload: false` so other deployments don’t ship them):

   ```ts
   import { Fraunces } from "next/font/google";
   const fraunces = Fraunces({ subsets: ["latin"], weight: ["400"], variable: "--font-fraunces", preload: false });
   export const fontVariables = [fraunces.variable];
   ```

2. **`src/themes/<name>/<name>.css`** — the theme block. Scope everything to `[data-site-theme="<name>"]`, override the tokens, point the semantic font vars at your fonts, and restyle the elements you care about:

   ```css
   [data-site-theme="<name>"] {
     --notion-background: #0e0e10;
     --notion-default: #e7e2d6;
     --font-body: var(--font-inter), system-ui, sans-serif;
     --font-display: var(--font-fraunces), Georgia, serif;
   }
   [data-site-theme="<name>"] h1 { font-family: var(--font-display); color: #f5efe1; }
   [data-site-theme="<name>"] a  { border-bottom: 1px solid #b4533a; text-decoration: none; }
   ```

   Pick the accent/link color straight from the design and write it into the theme CSS. Only override what the design changes — everything else inherits the `notion` base.

3. **`src/themes/index.ts`** — register the name:

   ```diff
   - const themeNames = ["notion", "minimal"] as const;
   + const themeNames = ["notion", "minimal", "<name>"] as const;
   ```

4. **`src/app/globals.css`** — import the theme CSS **after** `notion` (cascade order = priority):

   ```diff
     @import "../themes/notion/notion.css";
     @import "../themes/minimal/minimal.css";
   + @import "../themes/<name>/<name>.css";
   ```

5. **`src/themes/fonts.ts`** — add the theme’s fonts to the aggregator that’s applied to `<html>`:

   ```diff
   + import { fontVariables as nameFonts } from "./<name>/fonts";
   - export const fontVariables = [...notionFonts, ...minimalFonts].join(" ");
   + export const fontVariables = [...notionFonts, ...minimalFonts, ...nameFonts].join(" ");
   ```

Then set `SITE_THEME=<name>` and run `npm run dev`. Restart the dev server after editing `globals.css` or theme CSS — the Turbopack dev server doesn’t reliably hot-reload them (`rm -rf .next` if it stays stale). Note: a design that needs a different page *structure* (header/footer, multi-column) requires a per-theme layout component, which isn’t part of this CSS-only theming.
