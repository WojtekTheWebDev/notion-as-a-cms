# notion-as-a-cms

## 0.8.0

### Minor Changes

- dcec97e: Add an environment-driven style theme system so one codebase can be deployed to multiple sites with different looks. `SITE_THEME` selects the active theme — `notion` (the default) or the new serif `minimal` — and falls back to `notion` when unset, so existing deployments render exactly as before. Themes now live in self-contained `src/themes/<name>/` directories — a stylesheet scoped to `[data-site-theme="<name>"]` plus its `next/font` loaders — with `globals.css` reduced to the Tailwind setup that imports them in cascade order (notion first as the base). A README "Adding a new theme" guide and an `add-theme` skill cover authoring new ones.

## 0.7.0

### Minor Changes

- 50dce54: Upgrade TypeScript from 5.9.3 to 6.0.3. The bundled `@typescript-eslint/*` 8.59.4 (resolved via `eslint-config-next@16`) declares `typescript >=4.8.4 <6.1.0` as a peer, so TS 6 is accepted without overrides. `tsconfig.json` is unchanged — none of the options it sets (`target: ES2017`, `lib`, `module: esnext`, `moduleResolution: bundler`, `strict: true`, `esModuleInterop`, `jsx: react-jsx`, `incremental`) were removed or deprecated in TS 6, and the new TS 6 defaults that shifted (notably `noUncheckedSideEffectImports: true`, `types: []`) are masked by our explicit values.

## 0.6.0

### Minor Changes

- 21e813a: Upgrade Tailwind CSS from 3.4 to 4.3, moving to the new Oxide engine and CSS-first configuration. `postcss.config.mjs` now references `@tailwindcss/postcss` (a new devDependency) instead of the old `tailwindcss` plugin entry. `src/app/globals.css` replaces the `@tailwind base/components/utilities` directives with a single `@import "tailwindcss"`, and `tailwind.config.ts` is gone — its `theme.extend.colors.notion` palette is rewritten as `--color-notion-*` tokens inside an `@theme` block that delegates to the existing `--notion-*` CSS variables, so the runtime light/dark switch via `[data-theme="dark"]` still works. The v3 catch-all `safelist` regexes (`/bg-./`, `/text-./`, `/border-./`) are replaced by a narrow `@source inline("{bg,text}-notion-{default,gray,brown,orange,yellow,green,blue,purple,pink,red}")` listing exactly the classes `renderRichText` synthesizes from Notion annotation colors. No component or rendering API changed.

## 0.5.0

### Minor Changes

- b399899: Upgrade Next.js from 15.5 to 16.2 (and `eslint-config-next` to the matching 16.x). The `next lint` command is removed in 16, so `npm run lint` now invokes `eslint .` directly and `eslint.config.mjs` imports `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` instead of routing through `FlatCompat` — `@eslint/eslintrc` is no longer a direct devDependency. Turbopack is the default in `next dev`, so the `--turbopack` flag is dropped from the `dev` script. `tsconfig.json` is updated for Next 16: `jsx` is set to `react-jsx` (the automatic runtime is mandatory) and `.next/dev/types/**/*.ts` is added to `include`. The async dynamic API enforcement in Next 16 was already satisfied by the existing `Promise<{ slug: string }>` typing in `src/app/[slug]/page.tsx`, so no route handlers changed. Two transitive `postcss <8.5.10` advisories nested under `next` remain (next 9.3.4-canary → 16.3.0-canary.5); they will only clear in a future Next 16.3 release.

## 0.4.0

### Minor Changes

- f15d0eb: Upgrade `@notionhq/client` from v2.3.0 to v5.x (Notion API `2025-09-03`). The page-fetch path in `src/lib/notion/database.ts` now uses `client.databases.retrieve` + `client.dataSources.query({ data_source_id })` in place of the removed `client.databases.query({ database_id })`, picking the first data source on the configured `NOTION_DATABASE_ID`. Deep type imports from `@notionhq/client/build/src/api-endpoints` are replaced with the package-root re-exports — the only supported import path since v3. Existing `NOTION_DATABASE_ID` values continue to work because legacy single-data-source databases expose exactly one data source; no env, schema, or renderer changes. Costs one extra Notion API call per page render (caching remains out of scope).

## 0.3.2

### Patch Changes

- b57fc48: Refresh patch/minor dependency baseline within current majors: React 19.2, ESLint 9.39, `eslint-config-next` 15.5, `@types/node` 22, plus matching `@types/react*`, `postcss`, `tailwindcss` (3.x), and `typescript` (5.x). No behavior change; clears transitive audit advisories.
- 4dfa065: Add `@changesets/cli` ^2.31.0 as a devDependency. The repo already had `.changeset/config.json` and workflow references in `AGENTS.md` / `CLAUDE.md`, but the CLI itself was missing — `.changeset/baseline-dep-bumps.md` was authored by hand because `npx changeset` had no local binary to resolve. Installing the package enables the standard Changesets workflow locally, including scaffolding empty entries with:

  ```bash
  npx changeset add --empty
  ```

  A Claude Code skill at `.claude/skills/generate-changeset/` is included to drive this command from a working-tree diff — it proposes the bump level, drafts a message in the house style, and fills in the file scaffolded by `--empty`.

## 0.3.1

### Patch Changes

- Empty paragraphs are now visible.

## 0.3.0

### Minor Changes

- 258d977: Node 22 support.

### Patch Changes

- Update next version

## 0.2.0

### Minor Changes

- Added support for page mentions

## 0.1.0

### Minor Changes

- Added support for Paragraphs
- Added support for Headings
- Added support for Lists (bulleted, numbered and to-do)
- Added support for Images
- Added support for rich text formatting (bold, italic, underline, strikethrough, code, link, color)
