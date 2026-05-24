import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline/promises'
import { env, stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const categoriesPath = path.join(root, 'data', 'categories.yml')
const papersDir = path.join(root, 'papers')

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function todayLocalDate() {
  const timeZone = env.TZ || 'Asia/Shanghai'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

async function readCategories() {
  const raw = await fs.readFile(categoriesPath, 'utf8')
  const categories = yaml.load(raw)
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('data/categories.yml must contain at least one category')
  }
  return categories
}

async function readPipedLines() {
  const chunks = []
  for await (const chunk of input) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8').split(/\r?\n/)
}

async function createPrompter() {
  if (input.isTTY) {
    const rl = readline.createInterface({ input, output })
    return {
      async question(prompt) {
        return rl.question(prompt)
      },
      close() {
        rl.close()
      },
    }
  }

  const lines = await readPipedLines()
  return {
    async question(prompt) {
      output.write(prompt)
      return lines.shift() ?? ''
    },
    close() {},
  }
}

async function ask(prompter, label, fallback = '') {
  const suffix = fallback ? ` (${fallback})` : ''
  const answer = await prompter.question(`${label}${suffix}: `)
  return answer.trim() || fallback
}

async function chooseCategory(prompter, categories) {
  output.write('\nCategories:\n')
  categories.forEach((category, index) => {
    output.write(`  ${index + 1}. ${category.id} - ${category.title}\n`)
  })

  const answer = await ask(prompter, 'Category id or number', categories[0].id)
  const byNumber = Number.parseInt(answer, 10)
  if (Number.isInteger(byNumber) && byNumber >= 1 && byNumber <= categories.length) {
    return categories[byNumber - 1].id
  }

  const match = categories.find((category) => category.id === answer)
  if (!match) {
    throw new Error(`Unknown category "${answer}"`)
  }
  return match.id
}

function buildMarkdown(frontmatter) {
  const yamlText = yaml.dump(frontmatter, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  }).trim()

  return `---\n${yamlText}\n---\n\n# ${frontmatter.title}\n\n## One-Sentence Summary\n\n${frontmatter.summary}\n\n## Problem And Motivation\n\n\n\n## Core Method\n\n\n\n## Experiments\n\n\n\n## Limitations\n\n\n\n## Personal Notes\n\n\n\n## References\n\n- \n`
}

const categories = await readCategories()
const prompter = await createPrompter()

try {
  const today = todayLocalDate()
  const title = await ask(prompter, 'Title')
  if (!title) throw new Error('Title is required')

  const shortTitle = await ask(prompter, 'Short title', title)
  const yearText = await ask(prompter, 'Year', String(new Date().getFullYear()))
  const year = Number.parseInt(yearText, 10)
  if (!Number.isInteger(year)) throw new Error('Year must be an integer')

  const category = await chooseCategory(prompter, categories)
  const tags = splitTags(await ask(prompter, 'Tags, comma-separated'))
  if (tags.length === 0) throw new Error('At least one tag is required')

  const paper = await ask(prompter, 'Paper URL')
  const code = await ask(prompter, 'Code URL')
  const project = await ask(prompter, 'Project URL')
  const summary = await ask(prompter, 'One-sentence summary')
  if (!summary) throw new Error('Summary is required')

  const status = await ask(prompter, 'Status', 'read')
  const ratingText = await ask(prompter, 'Rating 1-5')
  const rating = ratingText ? Number.parseInt(ratingText, 10) : undefined
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    throw new Error('Rating must be an integer from 1 to 5')
  }

  const slug = slugify(shortTitle || title)
  if (!slug) throw new Error('Could not create a file slug from the title')

  const frontmatter = {
    title,
    shortTitle,
    year,
    date: today,
    category,
    tags,
    authors: [],
    paper,
    code,
    project,
    summary,
    status,
  }
  if (rating !== undefined) frontmatter.rating = rating

  const categoryDir = path.join(papersDir, category)
  const filePath = path.join(categoryDir, `${slug}-${year}.md`)

  await fs.mkdir(categoryDir, { recursive: true })
  try {
    await fs.writeFile(filePath, buildMarkdown(frontmatter), { encoding: 'utf8', flag: 'wx' })
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Refusing to overwrite existing file: ${path.relative(root, filePath)}`)
    }
    throw error
  }

  output.write(`\nCreated ${path.relative(root, filePath)}\n`)
  output.write('Next: edit the note, then run npm run generate.\n')
} finally {
  prompter.close()
}
