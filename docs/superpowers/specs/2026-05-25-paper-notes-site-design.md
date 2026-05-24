# Personal Paper Notes Site Design

## Goal

Build a GitHub-hosted personal paper library for long-term reading notes. The site should be easy to browse, easy to search, and easy to update from either GitHub's web editor or a local editor.

## Recommended Approach

Use VitePress as the static site framework, following the proven structure of `jiabingyang01/llm-paper-notes` but reducing manual maintenance with generated navigation and indexes.

The key improvement is that each paper note owns its metadata in YAML frontmatter. Scripts scan `papers/` and generate derived navigation/index files, so adding a new note does not require hand-editing the sidebar, homepage counts, or paper index.

## Repository Structure

```text
.
|-- .github/workflows/deploy.yml
|-- .vitepress/
|   |-- config.mts
|   `-- theme/
|       |-- index.ts
|       `-- style.css
|-- data/
|   `-- categories.yml
|-- papers/
|   |-- index.md
|   `-- <category>/<paper-slug>.md
|-- scripts/
|   |-- generate-index.mjs
|   `-- new-paper.mjs
|-- templates/
|   `-- paper.md
|-- index.md
|-- package.json
`-- README.md
```

## Paper Data Model

Every paper note is a Markdown file with frontmatter:

```yaml
---
title: "Paper Title"
shortTitle: "Short Name"
year: 2026
date: 2026-05-25
category: "reasoning"
tags: ["reasoning", "rl", "agent"]
authors: ["Author A", "Author B"]
paper: "https://arxiv.org/abs/..."
code: "https://github.com/..."
project: "https://..."
summary: "One sentence summary for cards, search results, and indexes."
status: "read"
rating: 4
---
```

Required fields: `title`, `year`, `category`, `tags`, and `summary`.

Optional fields: `shortTitle`, `date`, `authors`, `paper`, `code`, `project`, `status`, `rating`, `venue`, `notes`.

## Browsing Experience

The site will include:

- Home page with recent notes, category counts, and a concise project description.
- Paper index with category groups and compact summary tables.
- Tag index so related papers can be found across folders.
- VitePress local full-text search.
- Sidebar generated from the `papers/` tree and frontmatter titles.
- Clean Chinese-first typography with math support and readable tables.

The first version should avoid custom client-side filtering beyond VitePress search. Static generated pages are simpler, faster, and easier to host on GitHub Pages.

## Update Workflow

There are two supported ways to add a paper:

- GitHub web editor: copy `templates/paper.md`, create a new Markdown file under `papers/<category>/`, fill frontmatter and content, commit.
- Local editor: run `npm run new-paper`, answer prompts, write the generated Markdown file, then commit and push.

Before build/deploy, `npm run generate` scans notes and regenerates derived files. GitHub Actions runs the same generation step before building the site.

## Deployment

Deploy with GitHub Pages using GitHub Actions:

1. Push to `main`.
2. Install dependencies with `npm ci`.
3. Run `npm run generate`.
4. Build with `npm run docs:build`.
5. Publish `.vitepress/dist`.

This keeps the repository portable and does not require Vercel or a backend.

## Error Handling

`scripts/generate-index.mjs` should fail fast when:

- A note is missing required frontmatter.
- A note references an unknown category.
- Two notes produce the same route or slug.
- A frontmatter field has the wrong type.

The error message should include the offending file path and field name.

## Testing And Verification

Verification commands:

```bash
npm run generate
npm run docs:build
```

When a local dev server is available:

```bash
npm run docs:dev
```

Then verify in the browser that the home page, paper index, a sample note, search, dark mode, and mobile layout render correctly.

## Initial Content

Seed the site with:

- Category definitions for common LLM research areas.
- One realistic sample paper note.
- A detailed reusable note template.
- README instructions for local update, GitHub web update, and GitHub Pages setup.

## Non-Goals For The First Version

- No database.
- No backend service.
- No authentication.
- No PDF hosting workflow beyond normal static files.
- No complex client-side faceted search until the static index becomes insufficient.

## Design Decisions

- The site title can start as "Paper Notes" and can be renamed later.
- GitHub Pages will be the primary hosting target.
- The project can use Node/VitePress tooling even if the local machine needs Node PATH cleanup later.
