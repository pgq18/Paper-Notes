import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import yaml from 'js-yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const papersDir = path.join(root, 'papers')
const categoriesPath = path.join(root, 'data', 'categories.yml')
const generatedDir = path.join(root, '.vitepress', 'generated')

const requiredFields = ['title', 'year', 'category', 'tags', 'summary']

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function assertField(condition, filePath, field, message) {
  if (!condition) {
    const relative = toPosix(path.relative(root, filePath))
    throw new Error(`${relative}: invalid frontmatter field "${field}" - ${message}`)
  }
}

function normalizeDate(value) {
  if (!value) return ''
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10)
  }
  return String(value).slice(0, 10)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function slugifyTag(tag) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function readCategories() {
  const raw = await fs.readFile(categoriesPath, 'utf8')
  const categories = yaml.load(raw)
  if (!Array.isArray(categories)) {
    throw new Error('data/categories.yml must contain a YAML list')
  }

  const seen = new Set()
  for (const category of categories) {
    if (!category || typeof category !== 'object') {
      throw new Error('data/categories.yml contains a non-object category')
    }
    for (const field of ['id', 'title', 'description']) {
      if (typeof category[field] !== 'string' || !category[field].trim()) {
        throw new Error(`data/categories.yml: category missing string field "${field}"`)
      }
    }
    if (seen.has(category.id)) {
      throw new Error(`data/categories.yml: duplicate category id "${category.id}"`)
    }
    seen.add(category.id)
  }

  return categories
}

async function walkMarkdown(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkMarkdown(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
      files.push(fullPath)
    }
  }
  return files
}

function validatePaper(filePath, data, categoryIds) {
  for (const field of requiredFields) {
    assertField(data[field] !== undefined && data[field] !== null, filePath, field, 'field is required')
  }

  assertField(typeof data.title === 'string' && data.title.trim(), filePath, 'title', 'must be a non-empty string')
  assertField(Number.isInteger(data.year), filePath, 'year', 'must be an integer')
  assertField(typeof data.category === 'string' && data.category.trim(), filePath, 'category', 'must be a non-empty string')
  assertField(categoryIds.has(data.category), filePath, 'category', `unknown category "${data.category}"`)
  assertField(Array.isArray(data.tags) && data.tags.length > 0, filePath, 'tags', 'must be a non-empty string array')
  assertField(data.tags.every((tag) => typeof tag === 'string' && tag.trim()), filePath, 'tags', 'must be a non-empty string array')
  assertField(typeof data.summary === 'string' && data.summary.trim(), filePath, 'summary', 'must be a non-empty string')

  if (data.authors !== undefined) {
    assertField(Array.isArray(data.authors), filePath, 'authors', 'must be a string array')
    assertField(data.authors.every((author) => typeof author === 'string' && author.trim()), filePath, 'authors', 'must be a string array')
  }
  if (data.rating !== undefined) {
    assertField(Number.isInteger(data.rating) && data.rating >= 1 && data.rating <= 5, filePath, 'rating', 'must be an integer from 1 to 5')
  }
}

async function readPapers(categories) {
  const categoryIds = new Set(categories.map((category) => category.id))
  const files = await walkMarkdown(papersDir)
  const routes = new Set()
  const papers = []

  for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf8')
    const parsed = matter(source)
    validatePaper(filePath, parsed.data, categoryIds)

    const relativeFile = toPosix(path.relative(root, filePath))
    const route = `/${relativeFile.replace(/\.md$/, '')}`
    if (routes.has(route)) {
      throw new Error(`${relativeFile}: duplicate generated route "${route}"`)
    }
    routes.add(route)

    papers.push({
      title: parsed.data.title.trim(),
      shortTitle: typeof parsed.data.shortTitle === 'string' && parsed.data.shortTitle.trim()
        ? parsed.data.shortTitle.trim()
        : parsed.data.title.trim(),
      year: parsed.data.year,
      date: normalizeDate(parsed.data.date),
      category: parsed.data.category,
      tags: parsed.data.tags.map((tag) => tag.trim()).sort((a, b) => a.localeCompare(b)),
      authors: Array.isArray(parsed.data.authors) ? parsed.data.authors.map((author) => author.trim()) : [],
      paper: parsed.data.paper || '',
      code: parsed.data.code || '',
      project: parsed.data.project || '',
      summary: parsed.data.summary.trim(),
      status: parsed.data.status || '',
      rating: parsed.data.rating || null,
      route,
      file: relativeFile,
    })
  }

  return papers.sort((a, b) => {
    const byDate = (b.date || '').localeCompare(a.date || '')
    if (byDate) return byDate
    const byYear = b.year - a.year
    if (byYear) return byYear
    return a.title.localeCompare(b.title)
  })
}

function groupByCategory(papers, categories) {
  return categories.map((category) => ({
    ...category,
    papers: papers.filter((paper) => paper.category === category.id),
  }))
}

function buildSidebar(groups) {
  return {
    '/papers/': [
      {
        text: 'Paper Library',
        items: [
          { text: 'All Papers', link: '/papers/' },
          ...groups.map((group) => ({
            text: `${group.title} (${group.papers.length})`,
            collapsed: group.papers.length > 4,
            items: group.papers.map((paper) => ({
              text: `${paper.shortTitle} (${paper.year})`,
              link: paper.route,
            })),
          })),
        ],
      },
    ],
    '/tags/': [
      {
        text: 'Tags',
        items: [
          { text: 'Tag Index', link: '/tags/' },
        ],
      },
    ],
  }
}

function paperLink(paper) {
  return `[${paper.shortTitle}](${paper.route})`
}

function writeHome(groups, papers) {
  const recent = papers.slice(0, 8).map((paper) => {
    const category = groups.find((group) => group.id === paper.category)
    return `| ${paperLink(paper)} | ${category?.title || paper.category} | ${paper.year} | ${paper.summary} |`
  }).join('\n')

  const categories = groups.map((group) => {
    return `| [${group.title}](/papers/#${group.id}) | ${group.papers.length} | ${group.description} |`
  }).join('\n')

  return `# Paper Notes

用 Markdown 维护自己的论文笔记。这里保留精读摘要、方法拆解、实验结论和个人思考，方便之后快速查阅。

- [论文索引](/papers/)
- [标签索引](/tags/)
- [笔记模板](/templates/paper)

## Recent Notes

| Paper | Category | Year | Summary |
| --- | --- | ---: | --- |
${recent || '| No papers yet | - | - | Add your first note with `npm run new-paper`. |'}

## Categories

| Category | Notes | Scope |
| --- | ---: | --- |
${categories}

## Update Workflow

本地新增：

\`\`\`bash
npm run new-paper
npm run generate
\`\`\`

GitHub 网页新增：复制 \`templates/paper.md\` 到 \`papers/<category>/\`，填好 frontmatter 和正文后提交。
`
}

function writePaperIndex(groups) {
  const sections = groups.map((group) => {
    const rows = group.papers.map((paper) => {
      const tags = paper.tags.map((tag) => `\`${tag}\``).join(' ')
      return `| ${paperLink(paper)} | ${paper.summary} | ${tags} | ${paper.year} |`
    }).join('\n') || '| No notes yet | - | - | - |'

    return `## ${group.title} {#${group.id}}\n\n${group.description}\n\n| Paper | Summary | Tags | Year |\n| --- | --- | --- | ---: |\n${rows}\n`
  }).join('\n')

  return `# Paper Index\n\nThis page is generated from paper note frontmatter. Edit notes under \`papers/\`, then run \`npm run generate\`.\n\n${sections}`
}

function writeTagIndex(papers) {
  const tags = new Map()
  for (const paper of papers) {
    for (const tag of paper.tags) {
      if (!tags.has(tag)) tags.set(tag, [])
      tags.get(tag).push(paper)
    }
  }

  const sections = [...tags.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, taggedPapers]) => {
      const rows = taggedPapers
        .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
        .map((paper) => `- ${paperLink(paper)} (${paper.year}) - ${paper.summary}`)
        .join('\n')
      return `## ${escapeHtml(tag)} {#${slugifyTag(tag)}}\n\n${rows}`
    })
    .join('\n\n')

  return `# Tag Index\n\nTags are generated from paper note frontmatter.\n\n${sections || 'No tags yet.'}\n`
}

async function writeGenerated(categories, papers, groups) {
  await fs.mkdir(generatedDir, { recursive: true })
  await fs.mkdir(path.join(root, 'tags'), { recursive: true })

  const sidebar = buildSidebar(groups)
  await fs.writeFile(
    path.join(generatedDir, 'sidebar.mjs'),
    `export default ${JSON.stringify(sidebar, null, 2)}\n`,
    'utf8',
  )
  await fs.writeFile(
    path.join(generatedDir, 'papers.mjs'),
    [
      `export const categories = ${JSON.stringify(categories, null, 2)}`,
      `export const papers = ${JSON.stringify(papers, null, 2)}`,
      '',
    ].join('\n'),
    'utf8',
  )
  await fs.writeFile(path.join(root, 'index.md'), writeHome(groups, papers), 'utf8')
  await fs.writeFile(path.join(papersDir, 'index.md'), writePaperIndex(groups), 'utf8')
  await fs.writeFile(path.join(root, 'tags', 'index.md'), writeTagIndex(papers), 'utf8')
}

const categories = await readCategories()
const papers = await readPapers(categories)
const groups = groupByCategory(papers, categories)
await writeGenerated(categories, papers, groups)

console.log(`Generated indexes for ${papers.length} paper(s) across ${categories.length} categories.`)
