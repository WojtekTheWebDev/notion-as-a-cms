# AGENTS.md

Guidance for coding agents working in this repository. Read this first; it captures things you cannot derive by reading the code alone.

## What this project is

`notion-as-a-cms` is a Next.js 16 (App Router, Turbopack) site that uses a Notion database as its CMS. Pages are not authored in code — they live as rows in a Notion database, fetched at request time via the official `@notionhq/client`, and rendered to React using a small block-to-component dispatcher.

Stack: Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 3 · `@notionhq/client` v5 (Notion API `2025-09-03`).

## Coding principles

This repo follows the 30 principles in [PRINCIPLES.md](./PRINCIPLES.md) (Kent Beck's *Smalltalk Best Practice Patterns*, generalized). Read them once; apply them as refactoring targets when you notice friction, not as a checklist.

The ones that come up most often in this codebase:

- **#2 Intention-revealing names** — `getPageBySlug`, `renderRichText`, `getIconString` describe purpose, not mechanism. Match this when adding helpers.
- **#3 Replace comments with clear code** — there are essentially no comments in `src/`. Don't introduce explanatory ones; extract a function instead.
- **#5 Single responsibility** — atoms render one block type; `lib/notion/*` files each own one concern (client / database / page / richText). Don't merge them.
- **#6 Say things once** — block-type dispatch lives only in `NotionRenderer`. Don't create a parallel switch elsewhere.
- **#9 Guard clauses** — `getPageBlocks`, `renderMention`, `renderRichText`, `getIconString` all bail early on missing/invalid input. Keep the main path flat.
- **#13 Polymorphism over conditionals** — if `NotionRenderer`'s switch grows past a handful more cases, consider a `BLOCK_RENDERERS` map keyed by `block.type` before piling on cases.
- **#19 Named constants** — `homeSlug`, `defaultWidth`, `ratio`, `defaultHeight` already live in `src/app/constants.ts`. Add new magic values there.

## Commands

```bash
npm run dev      # next dev (Turbopack is the default in Next 16)
npm run build    # next build
npm run start    # next start (after build)
npm run lint     # eslint . (ESLint flat config, next/core-web-vitals + next/typescript)
```

There is no test suite. Validation = `npm run lint` + `npm run build` + manual verification in the browser against a real Notion DB.

## Environment

Required in `.env` (see `.env.example`):

- `NOTION_SECRET` — Internal integration token from Notion.
- `NOTION_DATABASE_ID` — ID of the CMS database. Each row is a page.
- `NOTION_IMAGE_HOSTNAME` — Hostname for `next/image` `remotePatterns` (defaults to `prod-files-secure.s3.us-west-2.amazonaws.com`). Used in `next.config.ts:8`.

Optional (theming — see "Styling system"):

- `SITE_THEME` — Style theme. `notion` (default) or `minimal`. Unset/unknown falls back to `notion`.

Without `NOTION_SECRET` / `NOTION_DATABASE_ID`, every page renders 404 because the database query throws.

## How a request becomes a page

This is the single most important flow in the codebase. Trace it before changing anything in `src/lib/notion/` or the renderer.

1. Request hits `src/app/[slug]/page.tsx` (or `src/app/page.tsx` for `/`, which delegates to `DynamicPage` with `slug = homeSlug = "home"` from `src/app/constants.ts:2`).
2. `getPageBlocks(slug)` is called (`src/lib/notion/page.ts:80`):
   - `getNotionClient()` creates a `Client` with `NOTION_SECRET` (`src/lib/notion/client.ts`).
   - `getDatabase(client)` calls `client.databases.retrieve({ database_id })` to resolve the database's first data source, then runs `client.dataSources.query({ data_source_id })` against it (`src/lib/notion/database.ts`). Returns the full data-source query result — **no pagination, no filter, no sort**. Two API calls per request.
   - `getPageBySlug` linearly scans `database.results` and finds the row whose `Slug` property equals the requested slug (string compare).
   - `client.blocks.children.list({ block_id: page.id })` fetches top-level blocks. **No recursion** into nested children.
3. If `blocks` is `null`, the route calls `notFound()` → renders `src/app/not-found.tsx` → `NotFoundPage` organism.
4. Otherwise blocks are handed to `NotionRenderer` (`src/app/components/molecules/NotionRenderer.tsx`), which switches on `block.type` and dispatches to an atom component.
5. Each atom calls `renderRichText(block.X.rich_text)` from `src/lib/notion/richText.tsx` to turn Notion rich-text spans into React.
6. `generateMetadata` separately calls `getPageMeta(slug)` (`src/lib/notion/page.ts:57`), which reads the page properties (`Name`, `Slug`, `Meta title`, `Meta description`, `SEO keywords`, `icon`) and feeds them to `getMetadata` (`src/lib/metadata/index.ts`).

The Notion DB schema the code assumes:

| Property          | Type      | Used as                                            |
| ----------------- | --------- | -------------------------------------------------- |
| `Name`            | title     | Fallback for `<title>` when `Meta title` is empty  |
| `Slug`            | rich_text | URL segment; `home` is the index route             |
| `Meta title`      | rich_text | `<title>`                                          |
| `Meta description`| rich_text | `<meta name="description">`                        |
| `SEO keywords`    | rich_text | `<meta name="keywords">`                           |
| page icon         | emoji/file/external | favicon (`<link rel="icon">`)            |

Renaming or removing any of these in Notion breaks pages — `getPropertyValue` throws on non-text properties (`src/lib/notion/page.ts:30`).

## Code style and conventions

- **Atomic Design** under `src/app/components/`: `atoms/`, `molecules/`, `organisms/`. Files are `PascalCase.tsx`, one component per file, named exports preferred (some use `export default` for Next route conventions only).
- **Path alias**: `@/*` → `./src/*` (`tsconfig.json:22`). Use `@/lib/notion`, `@/app/constants`, etc. in component imports. Relative imports are fine within the same subtree.
- **Re-exports**: `src/lib/notion/index.ts` is the barrel for `lib/notion`. Add new public surface area there.
- **TypeScript**: `strict: true`. Don't add `any`; the Notion SDK exports discriminated unions — narrow with `if (block.type === "...")` rather than casting.
- **Server components by default**: every component here runs on the server. Don't add `"use client"` unless you genuinely need browser APIs — Notion data fetching must stay server-side (the secret would leak).
- **No tests, no CI config in repo.** Don't add testing scaffolding unless explicitly asked.
- **Changesets**: `.changeset/` is present and the project versions via Changesets. When you make a user-visible change, ask whether to add a changeset (`npx changeset`) rather than guessing.

## Styling system

- Tailwind 4, configured entirely in CSS. There is **no `tailwind.config.ts`**. `src/app/globals.css` is now thin: `@import "tailwindcss"`, the `@theme` color map, the `@source inline(...)` directive (keeps `renderRichText`'s dynamic `text-notion-*` / `bg-notion-*` class names alive), and `@import`s of the theme CSS files. Color utilities like `text-notion-blue` are declared as `--color-*` in `@theme` — extend that pattern rather than adding a config file.
- **Themes live in `src/themes/`**, one self-contained directory per theme:
  - `src/themes/index.ts` — selection: `themeNames` and `getActiveThemeName()` (resolves `SITE_THEME`, default `notion`, falls back safely).
  - `src/themes/<name>/<name>.css` — the theme's styles. `notion/notion.css` is the base: it defines the **Notion color tokens** (`--notion-*`, light `:root` + dark `[data-theme="dark"]`) and the bare element styles (`body`, `.content`, `h1`-`h3`, `p`, `li`, `a`, `.code`, `.equation`). Other themes (e.g. `minimal/minimal.css`) are a `[data-site-theme="<name>"]` block overriding tokens/fonts/elements. `globals.css` `@import`s them notion-first, so later themes win at equal specificity. Notion content color annotations on a span still override a theme's element color — that's intended.
  - `src/themes/<name>/fonts.ts` — the theme's `next/font` loaders, each exposing a CSS variable. `src/themes/fonts.ts` aggregates them into `fontVariables`, which `layout.tsx` applies to `<html>` (alongside `data-site-theme`). A font is only downloaded when the active theme's CSS references its variable; non-default fonts use `preload: false`. The semantic `--font-body` / `--font-display` vars are what theme CSS points at the loaded fonts.
- Global element styles live in `notion/notion.css` (the base), not per-component — atoms render bare elements (`<h1>{...}</h1>`) and let theme CSS style them. Don't add per-component typography classes that fight this; theme-specific overrides go in that theme's `[data-site-theme=...]` block.

## Known limitations / gotchas

- **No pagination.** `getDatabase` returns the first page of results (≤100 rows) — `client.dataSources.query` is not iterated. Same for `blocks.children.list`. A database with >100 published pages will silently drop entries.
- **First data source only.** `getDatabase` picks `database.data_sources[0]`. Multi-data-source databases (Notion API ≥ `2025-09-03`) will silently ignore the rest.
- **No caching.** Each request triggers a full DB query plus a blocks fetch. There is no `unstable_cache`, `revalidate`, or ISR config — every nav is a live Notion API call. If you're asked to add caching, this is where.
- **No nested blocks.** `getPageBlocks` lists one level. Toggle children, nested list items, callout bodies, column children, etc. won't render even if you add the atom.
- **`richTextToPlainText` joins spans with `" "`** (`src/lib/notion/richText.tsx:11-13`). That means `**Hello**, world` round-trips with a stray space. It's used for property values and image captions — fine for SEO meta, surprising elsewhere.
- **Mentions only support `page` mentions.** Database, user, date, link-preview, and template mentions log a warning and render nothing (`src/lib/notion/richText.tsx:28-56`). A mention also incurs an extra `pages.retrieve` API call per mention per render.
- **Images**: fixed `defaultWidth = 500`, `ratio = 16/9` (`src/app/constants.ts`). Notion's actual image dimensions are not read. `NOTION_IMAGE_HOSTNAME` must match the host of the URL Notion returns or `next/image` will reject it.
- **External link target**: all external links open with `target="_blank"` but **no `rel="noopener noreferrer"`** (`src/lib/notion/richText.tsx:66`). If you touch that file, fix this.
- **Slug matching is exact and case-sensitive.** Two pages with the same slug → the first one in DB order wins.

## Working in this repo

- For UI / rendering changes: run `npm run dev`, open a Notion page that exercises the change, and visually verify before reporting done. There is no other way to validate.
- Don't introduce dependencies casually — the package set is intentionally minimal (Notion SDK + Next + React). Justify additions.
- Don't commit `.env`. It is gitignored.
- Don't generate URLs that aren't already in the repo or user message; the demo URL and Notion template URL in `README.md` are the canonical references.

## When to stop and ask

- Schema changes (renaming Notion DB columns, repurposing properties) — affects every deployment of this boilerplate.
- Adding caching/revalidation — has correctness vs. freshness trade-offs the user should pick.
- Adding client-side interactivity — moves data fetching surface around and risks leaking `NOTION_SECRET` if done wrong.
- Adding a new theme — create `src/themes/<name>/` with `<name>.css` (a `[data-site-theme="<name>"]` block) and `fonts.ts` (any `next/font` loaders), register the name in `src/themes/index.ts` (`themeNames`), `@import` the CSS in `globals.css` after `notion`, and add the theme's fonts to the aggregator in `src/themes/fonts.ts`. Themes that need a different page *structure* (header/footer chrome, multi-column) rather than just restyled blocks will need a per-theme shell component — that's a bigger change worth confirming first.
- Removing the hard-coded `data-theme="dark"` — the light-mode tokens exist but aren't wired up; the user may or may not want light mode.
