# Paper Notes Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a VitePress-based personal paper notes site with Markdown notes, generated indexes/navigation, and GitHub Pages deployment.

**Architecture:** Paper notes live as Markdown files under `papers/` with YAML frontmatter. A Node script scans categories and notes, validates metadata, writes generated VitePress data files plus Markdown index pages, and fails early on invalid content. VitePress consumes the generated data for navigation and renders a static site deployable by GitHub Actions.

**Tech Stack:** VitePress, TypeScript config, Node ESM scripts, `gray-matter`, `js-yaml`, GitHub Actions, Markdown.

---

## File Structure

- `package.json`: npm scripts and dependencies.
- `.gitignore`: generated/build/cache exclusions.
- `data/categories.yml`: canonical categories shown in the site.
- `papers/sample-paper.md`: seed paper note for generation and UI verification.
- `templates/paper.md`: copyable paper note template.
- `scripts/generate-index.mjs`: validates note frontmatter and writes generated content.
- `scripts/new-paper.mjs`: CLI helper that creates a new note from prompts.
- `.vitepress/config.mts`: imports generated sidebar/categories and configures VitePress.
- `.vitepress/theme/index.ts`: loads custom theme CSS.
- `.vitepress/theme/style.css`: typography and paper-note visual polish.
- `index.md`: generated home page, overwritten by `npm run generate`.
- `papers/index.md`: generated paper index, overwritten by `npm run generate`.
- `tags/index.md`: generated tag index, overwritten by `npm run generate`.
- `.github/workflows/deploy.yml`: GitHub Pages deployment.
- `README.md`: usage, update workflow, deployment setup.

## Task 1: Project Skeleton And Dependencies

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Add package scripts and dependencies**

Create `package.json`:

```json
{
  "name": "personal-paper-notes",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "generate": "node scripts/generate-index.mjs",
    "new-paper": "node scripts/new-paper.mjs",
    "docs:dev": "npm run generate && vitepress dev --host 127.0.0.1",
    "docs:build": "npm run generate && vitepress build",
    "docs:preview": "vitepress preview --host 127.0.0.1"
  },
  "devDependencies": {
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0",
    "vitepress": "^1.6.4"
  }
}
```

- [ ] **Step 2: Add ignore rules**

Create `.gitignore`:

```gitignore
node_modules/
.vitepress/cache/
.vitepress/dist/
.superpowers/
*.log
```

- [ ] **Step 3: Commit skeleton**

Run:

```bash
git add package.json .gitignore
git commit -m "chore: add project skeleton"
```

## Task 2: Data Fixtures And Failing Generator Test

**Files:**
- Create: `data/categories.yml`
- Create: `papers/sample-paper.md`
- Create: `templates/paper.md`
- Create: `scripts/generate-index.mjs`

- [ ] **Step 1: Create category and note fixtures**

Create `data/categories.yml` with IDs used by note frontmatter:

```yaml
- id: foundation-models
  title: Foundation Models
  icon: "🏗️"
  description: Architecture, pre-training, scaling laws, MoE, tokenizer, and long context.
- id: alignment-safety
  title: Alignment & Safety
  icon: "🛡️"
  description: RLHF, DPO, RLAIF, constitutional AI, red teaming, and safety evaluation.
- id: reasoning
  title: Reasoning
  icon: "💡"
  description: Chain-of-thought, math reasoning, code generation, planning, and test-time compute.
- id: multimodal
  title: Multimodal
  icon: "🖼️"
  description: VLMs, image/video understanding, speech, and multimodal generation.
- id: agents
  title: Agents
  icon: "🤖"
  description: Tool use, web agents, coding agents, planning, memory, and multi-agent systems.
- id: rag-knowledge
  title: RAG & Knowledge
  icon: "🔍"
  description: Retrieval, vector search, knowledge graphs, grounding, and hallucination mitigation.
- id: efficiency
  title: Efficiency
  icon: "⚡"
  description: Quantization, pruning, distillation, KV cache, LoRA, and speculative decoding.
- id: evaluation
  title: Evaluation
  icon: "📊"
  description: Benchmarks, evaluation methodology, LLM-as-judge, and leaderboard analysis.
```

Create `papers/sample-paper.md`:

```markdown
---
title: "Attention Is All You Need"
shortTitle: "Transformer"
year: 2017
date: 2026-05-25
category: "foundation-models"
tags: ["transformer", "attention", "sequence-modeling"]
authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"]
paper: "https://arxiv.org/abs/1706.03762"
summary: "Introduces the Transformer architecture, replacing recurrence with self-attention for efficient sequence modeling."
status: "read"
rating: 5
---

# Attention Is All You Need

## One-Sentence Summary

The paper shows that self-attention can replace recurrence and convolution as the main mechanism for sequence transduction.

## Problem And Motivation

Recurrent models process tokens sequentially, which limits parallelism and makes long-range dependencies harder to optimize.

## Core Method

The Transformer stacks multi-head self-attention and feed-forward blocks. Scaled dot-product attention is:

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

## Experiments

The model improves machine translation quality while training faster than recurrent baselines.

## Limitations

The original work focuses on supervised translation and does not directly address long-context memory or pretraining scale.

## Personal Notes

This is the architectural base for most modern LLMs, so it is useful as a reference note for later papers.
```

Create `templates/paper.md` with the same frontmatter shape but blank instructional content.

- [ ] **Step 2: Write a failing generator stub**

Create `scripts/generate-index.mjs`:

```js
throw new Error('generate-index not implemented yet');
```

- [ ] **Step 3: Run generator and verify failure**

Run:

```bash
npm run generate
```

Expected: command fails with `generate-index not implemented yet`.

## Task 3: Implement Metadata Parsing And Generated Indexes

**Files:**
- Modify: `scripts/generate-index.mjs`
- Create generated: `.vitepress/generated/sidebar.mjs`
- Create generated: `.vitepress/generated/papers.mjs`
- Create/overwrite generated: `index.md`
- Create/overwrite generated: `papers/index.md`
- Create/overwrite generated: `tags/index.md`

- [ ] **Step 1: Implement generator**

Replace `scripts/generate-index.mjs` with a Node ESM script that:

- Reads `data/categories.yml` with `js-yaml`.
- Recursively scans `papers/**/*.md` except `index.md`.
- Parses frontmatter with `gray-matter`.
- Validates required fields: `title`, `year`, `category`, `tags`, `summary`.
- Validates category IDs against `categories.yml`.
- Sorts notes by `date`, then `year`, then title.
- Writes generated data and Markdown index files.

- [ ] **Step 2: Run generator and verify success**

Run:

```bash
npm run generate
```

Expected: exit code 0, generated files are created, and the sample paper appears in `papers/index.md`.

- [ ] **Step 3: Commit generator and content**

Run:

```bash
git add data papers templates scripts .vitepress/generated index.md tags
git commit -m "feat: generate paper indexes"
```

## Task 4: VitePress Site Configuration And Theme

**Files:**
- Create: `.vitepress/config.mts`
- Create: `.vitepress/theme/index.ts`
- Create: `.vitepress/theme/style.css`

- [ ] **Step 1: Add VitePress config**

Create `.vitepress/config.mts` that imports `./generated/sidebar.mjs`, enables local search, math, Chinese labels, GitHub social link placeholder, and GitHub Pages-compatible `base: '/'`.

- [ ] **Step 2: Add theme files**

Create `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import './style.css'

export default DefaultTheme
```

Create `style.css` with Chinese-friendly typography, brand colors, readable tables, link cards, blockquotes, and mobile-safe layout rules.

- [ ] **Step 3: Build site**

Run:

```bash
npm run docs:build
```

Expected: VitePress exits 0 and writes `.vitepress/dist`.

- [ ] **Step 4: Commit site shell**

Run:

```bash
git add .vitepress package-lock.json index.md papers/index.md tags/index.md
git commit -m "feat: add vitepress site"
```

## Task 5: New Paper CLI

**Files:**
- Create: `scripts/new-paper.mjs`

- [ ] **Step 1: Write CLI helper**

Create `scripts/new-paper.mjs` that:

- Reads categories from `data/categories.yml`.
- Prompts for title, short title, year, category, tags, paper URL, summary, status, and rating.
- Generates a slug from short title or title.
- Writes `papers/<category>/<slug>.md`.
- Refuses to overwrite an existing file.
- Prints the created path and next command: `npm run generate`.

- [ ] **Step 2: Run a dry creation test**

Run:

```bash
node scripts/new-paper.mjs
```

Use a temporary title and verify a Markdown file is created under the selected category. Delete only this temporary file after confirming the CLI works.

- [ ] **Step 3: Commit CLI helper**

Run:

```bash
git add scripts/new-paper.mjs
git commit -m "feat: add paper note helper"
```

## Task 6: Deployment And Documentation

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

- [ ] **Step 1: Add GitHub Pages workflow**

Create `.github/workflows/deploy.yml` using `actions/checkout@v4`, `actions/setup-node@v4`, `npm ci`, `npm run generate`, `npm run docs:build`, and `actions/deploy-pages@v4`.

- [ ] **Step 2: Add README**

Document:

- Local setup with `npm install`.
- Local preview with `npm run docs:dev`.
- Adding notes through GitHub web editor.
- Adding notes with `npm run new-paper`.
- Running `npm run generate`.
- Enabling GitHub Pages with "GitHub Actions" as source.

- [ ] **Step 3: Final verification**

Run:

```bash
npm run generate
npm run docs:build
git status --short
```

Expected: generator and build pass. `git status --short` should show only intended uncommitted deployment/docs files before the final commit.

- [ ] **Step 4: Commit docs and deployment**

Run:

```bash
git add .github README.md
git commit -m "docs: add deployment and update workflow"
```

## Self-Review

- Spec coverage: Tasks cover VitePress site, Markdown notes, frontmatter metadata, generated indexes/sidebar, template, new-paper helper, GitHub Pages deployment, README, and verification.
- Placeholder scan: No `TBD` or unspecified implementation step remains; implementation details are concrete enough for execution.
- Type consistency: Category IDs, required frontmatter fields, generated module names, and npm script names are consistent across tasks.
