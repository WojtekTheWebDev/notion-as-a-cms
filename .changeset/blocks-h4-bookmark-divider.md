---
"notion-as-a-cms": minor
---

Render three more Notion block types that previously fell through the dispatcher and disappeared from pages: `heading_4`, `bookmark` / `link_preview`, and `divider`. Headings now style an `h4` level alongside `h1`–`h3` in both themes. Bookmark and link-preview blocks render as a self-contained card — the Notion API only returns the bare URL, so the title and description are fetched server-side from the target page's OpenGraph metadata (with a hostname fallback when a fetch fails or times out) and no remote images are loaded. Dividers render as a themed `hr`. Each block is a single-responsibility atom wired through `NotionRenderer`, with element styles living in the theme stylesheets.
