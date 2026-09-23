import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { root, tracks, readCategories } from './library.mjs'

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

// Metadata is plain text, even inside Markdown links, headings and table cells.
function escapeText(value) {
  return String(value)
    .replace(/[&<>"'\\`*_\[\]{}|#!~$]/g, (character) => `&#${character.codePointAt(0)};`)
    .replace(/[\r\n]+/g, ' ')
}

function slugifyTag(tag) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tag'
}

async function walkMarkdown(dir, isTrackRoot = true) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT' && isTrackRoot) return []
    throw error
  }
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkMarkdown(fullPath, false))
    } else if (entry.isFile() && entry.name.endsWith('.md') && !(isTrackRoot && entry.name === 'index.md')) {
      files.push(fullPath)
    }
  }
  return files.sort()
}

function validateNote(filePath, data, track, categoryIds) {
  const relative = toPosix(path.relative(path.join(root, track.directory), filePath))
  const parts = relative.split('/')
  if (parts.length !== 2 || !/^[a-z0-9\u4e00-\u9fa5]+(?:-[a-z0-9\u4e00-\u9fa5]+)*-\d{4}\.md$/.test(parts[1])) {
    throw new Error(`${track.directory}/${relative}: expected ${track.directory}/<category>/<slug>-<year>.md`)
  }

  for (const field of requiredFields) {
    assertField(data[field] !== undefined && data[field] !== null, filePath, field, 'field is required')
  }

  assertField(typeof data.title === 'string' && data.title.trim(), filePath, 'title', 'must be a non-empty string')
  assertField(Number.isInteger(data.year) && data.year >= 1000 && data.year <= 9999, filePath, 'year', 'must be a four-digit integer')
  assertField(Number(parts[1].match(/-(\d{4})\.md$/)[1]) === data.year, filePath, 'year', 'must match the filename year')
  assertField(typeof data.category === 'string' && data.category.trim(), filePath, 'category', 'must be a non-empty string')
  assertField(categoryIds.has(data.category), filePath, 'category', `unknown category "${data.category}" in ${track.key}`)
  assertField(data.category === parts[0], filePath, 'category', 'must match the parent directory')
  assertField(data.type === undefined || data.type === track.type, filePath, 'type', `must be "${track.type}" for ${track.directory}/`)
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

async function readNotes(track, categories) {
  const categoryIds = new Set(categories.map((category) => category.id))
  const files = await walkMarkdown(path.join(root, track.directory))
  const routes = new Set()
  const notes = []

  for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf8')
    const { data } = matter(source)
    validateNote(filePath, data, track, categoryIds)

    const relativeFile = toPosix(path.relative(root, filePath))
    const route = `/${relativeFile.replace(/\.md$/, '')}`
    if (routes.has(route)) {
      throw new Error(`${relativeFile}: duplicate generated route "${route}"`)
    }
    routes.add(route)

    notes.push({
      type: track.type,
      title: data.title.trim(),
      shortTitle: typeof data.shortTitle === 'string' && data.shortTitle.trim()
        ? data.shortTitle.trim()
        : data.title.trim(),
      year: data.year,
      date: normalizeDate(data.date),
      category: data.category,
      tags: [...new Set(data.tags.map((tag) => tag.trim()))].sort((a, b) => a.localeCompare(b)),
      authors: Array.isArray(data.authors) ? data.authors.map((author) => author.trim()) : [],
      paper: data.paper || '',
      code: data.code || '',
      project: data.project || '',
      summary: data.summary.trim(),
      status: data.status || '',
      rating: data.rating || null,
      route,
      file: relativeFile,
    })
  }

  return notes.sort((a, b) => {
    const byDate = (b.date || '').localeCompare(a.date || '')
    if (byDate) return byDate
    return b.year - a.year || a.title.localeCompare(b.title)
  })
}

function groupByCategory(notes, categories) {
  return categories.map((category) => ({
    ...category,
    notes: notes.filter((note) => note.category === category.id),
  }))
}

function buildSidebar(library) {
  const sidebar = {}
  for (const { track, groups } of library) {
    sidebar[`/${track.directory}/`] = [{
      text: track.label,
      items: [
        { text: `全部${track.label}`, link: `/${track.directory}/` },
        ...groups.map((group) => ({
          text: `${group.title} (${group.notes.length})`,
          link: `/${track.directory}/#${group.id}`,
          collapsed: group.notes.length > 4,
          items: group.notes.map((note) => ({
            text: `${note.shortTitle} (${note.year})`,
            link: note.route,
          })),
        })),
      ],
    }]
  }
  sidebar['/tags/'] = [{
    text: '标签索引',
    items: [
      { text: '全部标签', link: '/tags/' },
      ...library.map(({ track }) => ({ text: track.label, link: `/${track.directory}/` })),
    ],
  }]
  return sidebar
}

function noteLink(note) {
  return `[${escapeText(note.shortTitle)}](${note.route})`
}

function writeHome(library) {
  const entrances = library.map(({ track, notes }) => `- [${track.label}](/${track.directory}/)：${notes.length} 篇。${escapeText(track.description)}`).join('\n')
  const sections = library.map(({ track, notes, groups }) => {
    const recent = notes.slice(0, 5).map((note) => {
      const category = groups.find((group) => group.id === note.category)
      return `| ${noteLink(note)} | ${escapeText(category.title)} | ${note.year} | ${escapeText(note.summary)} |`
    }).join('\n')
    const categories = groups.map((group) => {
      return `| [${escapeText(group.title)}](/${track.directory}/#${group.id}) | ${group.notes.length} | ${escapeText(group.description)} |`
    }).join('\n')
    return `## ${track.label}\n\n### 近期内容\n\n${recent
      ? `| 标题 | 分类 | 年份 | 摘要 |\n| --- | --- | ---: | --- |\n${recent}`
      : `这里将收录${track.label}，目前还没有内容。`}\n\n### 分类\n\n${categories
      ? `| 分类 | 篇数 | 范围 |\n| --- | ---: | --- |\n${categories}`
      : '尚未设置分类，可在收录第一篇内容时建立。'}`
  }).join('\n\n')

  return `# Paper Notes\n\n个人研究文献库。论文笔记帮助理解单篇工作的研究逻辑，主题调研围绕一个问题串联多篇文献，两者分别归档与分类。\n\n${entrances}\n- [标签索引](/tags/)：按共同主题查阅两个轨道的内容。\n\n${sections}\n`
}

function writeTrackIndex({ track, groups }) {
  const sections = groups.map((group) => {
    const rows = group.notes.map((note) => {
      const tags = note.tags.map(escapeText).join('、')
      return `| ${noteLink(note)} | ${escapeText(note.summary)} | ${tags} | ${note.year} |`
    }).join('\n')
    return `## ${escapeText(group.title)} {#${group.id}}\n\n${escapeText(group.description)}\n\n${rows
      ? `| 标题 | 摘要 | 标签 | 年份 |\n| --- | --- | --- | ---: |\n${rows}`
      : '该分类暂时没有内容。'}`
  }).join('\n\n')

  return `# ${track.label}\n\n${escapeText(track.description)}\n\n${sections || '目前还没有分类或内容，可在收录第一篇内容时建立分类。'}\n`
}

function writeTagIndex(library) {
  const tags = new Map()
  for (const { notes } of library) {
    for (const note of notes) {
      for (const tag of note.tags) {
        if (!tags.has(tag)) tags.set(tag, [])
        tags.get(tag).push(note)
      }
    }
  }

  const usedIds = new Set()
  const sections = [...tags.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, taggedNotes]) => {
      const baseId = slugifyTag(tag)
      let id = baseId
      let suffix = 2
      while (usedIds.has(id)) id = `${baseId}-${suffix++}`
      usedIds.add(id)
      const groups = library.map(({ track }) => {
        const notes = taggedNotes.filter((note) => note.type === track.type)
        if (!notes.length) return ''
        const rows = notes
          .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
          .map((note) => `- ${noteLink(note)} (${note.year})：${escapeText(note.summary)}`)
          .join('\n')
        return `### ${track.label}\n\n${rows}`
      }).filter(Boolean).join('\n\n')
      return `## ${escapeText(tag)} {#${id}}\n\n${groups}`
    })
    .join('\n\n')

  return `# 标签索引\n\n同一标签下的内容按论文笔记与主题调研分别列出。\n\n${sections || '目前还没有标签。'}\n`
}

async function writeGenerated(categories, library) {
  await fs.mkdir(generatedDir, { recursive: true })
  await fs.mkdir(path.join(root, 'tags'), { recursive: true })
  for (const { track } of library) {
    await fs.mkdir(path.join(root, track.directory), { recursive: true })
  }

  await fs.writeFile(
    path.join(generatedDir, 'sidebar.mjs'),
    `export default ${JSON.stringify(buildSidebar(library), null, 2)}\n`,
    'utf8',
  )
  await fs.writeFile(
    path.join(generatedDir, 'papers.mjs'),
    [
      `export const categories = ${JSON.stringify(categories.papers, null, 2)}`,
      `export const papers = ${JSON.stringify(library.find(({ track }) => track.key === 'papers').notes, null, 2)}`,
      `export const researchCategories = ${JSON.stringify(categories.research, null, 2)}`,
      `export const research = ${JSON.stringify(library.find(({ track }) => track.key === 'research').notes, null, 2)}`,
      '',
    ].join('\n'),
    'utf8',
  )
  await fs.writeFile(path.join(root, 'index.md'), writeHome(library), 'utf8')
  for (const entry of library) {
    await fs.writeFile(path.join(root, entry.track.directory, 'index.md'), writeTrackIndex(entry), 'utf8')
  }
  await fs.writeFile(path.join(root, 'tags', 'index.md'), writeTagIndex(library), 'utf8')
}

const categories = await readCategories()
const library = []
for (const track of tracks) {
  const notes = await readNotes(track, categories[track.key])
  library.push({ track, notes, groups: groupByCategory(notes, categories[track.key]) })
}
await writeGenerated(categories, library)

console.log(library.map(({ track, notes, groups }) => `Generated ${notes.length} ${track.type} note(s) across ${groups.length} categories.`).join('\n'))
