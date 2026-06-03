---
name: generate-changeset
description: Generate a Changesets entry (`.changeset/<slug>.md`) for the `notion-as-a-cms` repo by analyzing the working-tree diff, proposing a semver bump, and drafting an informative prose message in the project's house style. Use this whenever the user asks for a "changeset", says "add a changeset", "create a changeset", "make a changeset", wants to capture in-progress work for the next release, or asks how to document the current diff for versioning — even if they don't mention Changesets explicitly but are talking about versioning a user-visible change in this repo.
---

# Generate Changeset

Generates a `.changeset/<slug>.md` file for the `notion-as-a-cms` repo by reading the working-tree diff (staged + unstaged), inferring the right semver bump, and writing a message that explains the *why* of the change — not just the *what*.

This skill is specific to the `notion-as-a-cms` project. It hardcodes the package name (`notion-as-a-cms`) and assumes the Changesets config exists at `.changeset/config.json` with `commit: false`, and that `@changesets/cli` is installed as a devDependency. If you're invoked outside this repo, stop and tell the user.

The file itself is created by `npx changeset add --empty` (so the CLI handles the filename + frontmatter scaffolding the canonical way); the skill's job is then to overwrite the empty file with a meaningful frontmatter + message.

## Why this skill exists

Without help, changeset messages tend to be either too terse ("update deps") or just restate the file list. The existing entry `.changeset/baseline-dep-bumps.md` shows the house style: one prose paragraph with concrete specifics — versions, scope, behavior impact, *and the reason*. That tone is what you're aiming for. The diff has the facts; this skill turns them into a coherent narrative the next release notes can paste verbatim.

## The flow

Follow these steps in order. Don't write the file until the user has confirmed the bump level and message.

### 1. Verify the repo and tooling

Run from the repo root:

```bash
test -f .changeset/config.json \
  && grep -q '"name": "notion-as-a-cms"' package.json \
  && grep -q '"@changesets/cli"' package.json \
  && echo ok
```

If that doesn't print `ok`, stop and tell the user what's missing. The most common case is `@changesets/cli` not yet installed — guide the user to `npm install --save-dev @changesets/cli` rather than working around it, because this skill depends on the CLI to scaffold the file.

### 2. Read the working-tree diff

Capture both tracked changes and untracked files. The shape:

```bash
git status --short
git diff HEAD --stat
git diff HEAD
```

For untracked files, also read them directly (Read tool) so you can describe what's new.

If the diff is empty, stop and tell the user — there's nothing to write a changeset for.

### 3. Categorize the change

Walk through the diff and form a mental model of:

- **What category** — bug fix, feature, refactor, perf, docs, chore (deps/config), test, or breaking.
- **What surface area** — internal-only files (no behavior change), library exports (`src/lib/notion/index.ts` barrel), public components, env vars, the Notion DB schema the code assumes, build/lint config.
- **The "why"** — try to read intent from the diff. Renaming something? Look for the old name's last reference. Adding a parameter? Check the callers. Bumping a dep? Look at the lockfile entries or the changelog hint in the commit. If the diff genuinely doesn't justify the why, ask the user one short question rather than inventing motivation.

### 4. Propose the bump level

Use these heuristics for a single-package project (the package is `private: true`, but semver intent still matters for tracking):

- **patch** — bug fixes, dep bumps within the same major, internal refactors, type-only changes, docs, lint config, CI, perf with no observable API change. The default when in doubt for non-additive changes.
- **minor** — new features, new public exports, new components/atoms, new env vars with safe defaults, additive options on existing functions. Anything users of the boilerplate could opt into.
- **major** — breaking changes. Renamed/removed public exports; changed function signatures; renamed expected Notion DB property names (e.g., `Meta title` → `SEO title`); removed env vars; changed required env vars; behavior changes that silently break existing pages.

Edge cases worth noting:

- A dep bump that crosses a major (e.g., Next 15 → 16) is a **major** for *this* package even if your code didn't change, because consumers of the boilerplate inherit it.
- A refactor that changes the *public* API but preserves behavior (e.g., reorganizing `lib/notion/index.ts`) is **major** — barrel changes are visible.
- A purely internal rename (e.g., a local variable) inside an atom is **patch**.

Present the proposal as: `patch | minor | major — <one-line reason>`.

### 5. Draft the message

Follow the house style from `.changeset/baseline-dep-bumps.md`:

- **One paragraph**, prose, no bullet list (unless the change is genuinely a list of independent items, in which case a short bulleted list inside the paragraph is OK).
- **Concrete specifics**: file paths, version numbers, function names, env var names. Vague words like "improved" or "various changes" are not allowed.
- **End with the why or impact**: "No behavior change; clears transitive audit advisories." / "Ahead of the upcoming major upgrades." That trailing clause is what makes the entry useful months later.
- **No marketing tone, no emojis**, no "we" / "you". Past tense or noun phrases ("Refresh patch/minor dependency baseline...").
- **Length**: one to four sentences. The dep-bumps entry is the upper bound — most changes will be shorter.

#### Code examples — when to include

Include a fenced code block **only** when a reader couldn't understand the conceptual shift from prose alone. Triggers:

- A function signature changed and callers need to migrate.
- A new pattern or API was introduced and a one-liner shows how to use it.
- A renamed Notion DB property — show old → new mapping.

For mechanical changes (dep bumps, refactors with no API surface change, doc edits), **don't** add a code example — it's noise.

Format code blocks tightly. Two or three lines is usually enough; the changeset isn't documentation.

#### The first line: frontmatter

Always:

```markdown
---
"notion-as-a-cms": <patch|minor|major>
---

<message>
```

The quotes around the package name are required by Changesets.

### 6. Confirm with the user, then create + fill the file

Show the user the two pieces — **bump level + reason** and **message** — in one message and ask: "Create the changeset?"

Only proceed after explicit confirmation. Don't pre-create the file before the user has approved the content; if the user rejects, you'll have left an empty `.md` file lying around in `.changeset/`.

Once confirmed, run the Changesets CLI to scaffold the empty file:

```bash
npx changeset add --empty
```

The command prints a line like:

```
info /Users/.../notion-as-a-cms/.changeset/strict-boats-like.md
```

Parse that line to get the absolute path of the new file. (The filename is `<adjective>-<noun>-<verb>.md` from the Changesets CLI's built-in word list — don't try to predict or override it. The CLI also handles ordering and uniqueness for you.)

Now overwrite that file with the real content using the Write tool:

```markdown
---
"notion-as-a-cms": <patch|minor|major>
---

<your message>
```

After writing, tell the user:
- The file path that was filled in.
- That they may want to `git add` it (don't run it yourself).
- That the `commit: false` config means they need to commit it manually (don't commit it yourself).

## Example walkthrough

The existing `.changeset/baseline-dep-bumps.md` (written before the CLI was installed, hence the descriptive filename) was produced from a diff that bumped React, ESLint, `@types/node`, `postcss`, `tailwindcss`, and `typescript` within their current majors, with no source code changes. The reasoning:

- Category: chore (deps). No behavior, no API surface.
- Bump: **patch** — all bumps stayed within current majors and no consumer-visible behavior changed.
- Message: enumerates the specific packages and version ranges, states "No behavior change", and ends with the *why*: "clears transitive audit advisories ahead of the upcoming major upgrades (Notion SDK, Next 16, Tailwind 4)." That last clause is what makes the entry valuable — it tells future-you why this PR existed.

No code example was needed because there's no conceptual shift for a reader to absorb.

Going forward, new entries will have CLI-generated filenames (e.g. `strict-boats-like.md`). That's fine — readers find changes by reading the message body, not the filename, and the `commit: false` workflow means the message lands in `CHANGELOG.md` at release time anyway.

## What not to do

- Don't run plain `npx changeset` or `npx changeset add` (without `--empty`) — those are interactive and would block waiting for input. Always use the `--empty` flag.
- Don't run `git add` or `git commit` — leave staging and committing to the user. The repo's `commit: false` config exists precisely so the user controls the commit.
- Don't try to rename the CLI-generated file to something descriptive. The filename is part of the Changesets workflow and uniqueness scheme; renaming it adds churn for no real benefit.
- Don't invent motivation. If the diff doesn't say why, ask. One short question is fine.
- Don't write multiple changesets in one go unless the user explicitly asks. The convention here is one changeset per coherent change.
- Don't link to issues/PRs unless the user gave you a number — don't fabricate refs.
- Don't include "🤖 Generated with Claude Code" footers in the changeset body. The changelog ships to users.
