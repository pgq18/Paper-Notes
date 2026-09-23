import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import matter from 'gray-matter'
import yaml from 'js-yaml'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const baseCategory = { id: 'rl-post-training', title: 'RL Post-Training', description: '强化学习论文。' }

async function fixture(t, categories = { papers: [baseCategory], research: [] }) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'paper-tracks-test-'))
  t.after(() => fs.rm(dir, { recursive: true, force: true }))
  await fs.mkdir(path.join(dir, 'scripts'))
  await fs.mkdir(path.join(dir, 'data'))
  await fs.symlink(path.join(project, 'node_modules'), path.join(dir, 'node_modules'), 'dir')
  for (const file of ['library.mjs', 'generate-index.mjs', 'new-category.mjs', 'new-paper.mjs']) {
    await fs.copyFile(path.join(project, 'scripts', file), path.join(dir, 'scripts', file))
  }
  await fs.writeFile(path.join(dir, 'data/categories.yml'), yaml.dump(categories))
  return dir
}

function run(dir, script, args = [], input) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts', script), ...args], {
    cwd: dir, encoding: 'utf8', input,
  })
}

function success(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout)
}

async function note(dir, track, category, title, overrides = {}, slug = 'example-2026') {
  const file = path.join(dir, track, category, slug + '.md')
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, matter.stringify('# ' + title, {
    title, year: 2026, category, tags: ['共享主题'], summary: title + '的摘要', ...overrides,
  }))
}

async function generated(dir) {
  return import(pathToFileURL(path.join(dir, '.vitepress/generated/papers.mjs')).href)
}

test('论文与调研使用相同分类 ID 时仍有独立条目、路由和索引', async (t) => {
  const dir = await fixture(t, {
    papers: [baseCategory],
    research: [{ ...baseCategory, title: '后训练调研', description: '跨论文比较。' }],
  })
  await note(dir, 'papers', baseCategory.id, '论文样本A')
  await note(dir, 'research', baseCategory.id, '调研样本B', { type: 'research' })
  success(run(dir, 'generate-index.mjs'))
  const data = await generated(dir)
  assert.equal(data.papers.length, 1)
  assert.equal(data.research.length, 1)
  assert.equal(data.papers[0].type, 'paper')
  assert.equal(data.research[0].type, 'research')
  assert.equal(data.papers[0].route, '/papers/rl-post-training/example-2026')
  assert.equal(data.research[0].route, '/research/rl-post-training/example-2026')
  assert.equal(data.categories[0].title, 'RL Post-Training')
  assert.equal(data.researchCategories[0].title, '后训练调研')
  const papers = await fs.readFile(path.join(dir, 'papers/index.md'), 'utf8')
  const research = await fs.readFile(path.join(dir, 'research/index.md'), 'utf8')
  assert(papers.includes('论文样本A') && !papers.includes('调研样本B'))
  assert(research.includes('调研样本B') && !research.includes('论文样本A'))
  const tags = await fs.readFile(path.join(dir, 'tags/index.md'), 'utf8')
  assert(tags.includes('/papers/rl-post-training/example-2026'))
  assert(tags.includes('/research/rl-post-training/example-2026'))
})

test('空调研轨道仍生成独立入口，不创建虚构分类或内容', async (t) => {
  const dir = await fixture(t)
  success(run(dir, 'generate-index.mjs'))
  const data = await generated(dir)
  assert.deepEqual(data.researchCategories, [])
  assert.deepEqual(data.research, [])
  assert.deepEqual(data.papers, [])
  const home = await fs.readFile(path.join(dir, 'index.md'), 'utf8')
  assert(home.includes('/papers/') && home.includes('/research/'))
  assert((await fs.readFile(path.join(dir, 'research/index.md'), 'utf8')).includes('主题调研'))
})

test('新建调研分类并创建报告：不改变论文分类，不要求单论文来源字段', async (t) => {
  const dir = await fixture(t)
  success(run(dir, 'new-category.mjs', ['--type', 'research', '--id', 'reward-models', '--title', '奖励模型', '--description', '比较奖励信号与建模路线。']))
  const categories = yaml.load(await fs.readFile(path.join(dir, 'data/categories.yml'), 'utf8'))
  assert.deepEqual(categories.papers, [baseCategory])
  assert.equal(categories.research[0].id, 'reward-models')
  const input = ['奖励模型调研', 'reward-survey', '2026', 'reward-models', '奖励,比较', '比较不同奖励模型的能力与局限。', 'draft', '', ''].join('\n')
  success(run(dir, 'new-paper.mjs', ['--type', 'research'], input))
  const file = path.join(dir, 'research/reward-models/reward-survey-2026.md')
  const { data } = matter(await fs.readFile(file, 'utf8'))
  assert.equal(data.type, 'research')
  assert.equal(data.summary, '比较不同奖励模型的能力与局限。')
  assert(!Object.hasOwn(data, 'paper') && !Object.hasOwn(data, 'authors') && !Object.hasOwn(data, 'venue'))
  success(run(dir, 'generate-index.mjs'))
  assert.equal((await generated(dir)).research.length, 1)
})

test('创建论文流程保留代码与项目链接且不会覆盖既有笔记', async (t) => {
  const dir = await fixture(t)
  const input = ['Paper Title', 'paper-demo', '2026', 'rl-post-training', 'RL', 'https://example.org/paper', 'https://example.org/code', 'https://example.org/project', 'A specific summary.', 'read', '', ''].join('\n')
  success(run(dir, 'new-paper.mjs', [], input))
  const file = path.join(dir, 'papers/rl-post-training/paper-demo-2026.md')
  const original = await fs.readFile(file, 'utf8')
  assert.equal(matter(original).data.type, 'paper')
  assert.equal(matter(original).data.project, 'https://example.org/project')
  assert.notEqual(run(dir, 'new-paper.mjs', [], input).status, 0)
  assert.equal(await fs.readFile(file, 'utf8'), original)
})

test('重复分类和目录穿越 ID 被拒绝，分类文件不变', async (t) => {
  const dir = await fixture(t)
  const file = path.join(dir, 'data/categories.yml')
  const original = await fs.readFile(file, 'utf8')
  for (const [id, title] of [['rl-post-training', '另一名称'], ['../escape', '非法路径'], ['another-id', 'RL Post-Training']]) {
    const result = run(dir, 'new-category.mjs', ['--type', 'paper', '--id', id, '--title', title, '--description', '范围'])
    assert.notEqual(result.status, 0)
    assert.equal(await fs.readFile(file, 'utf8'), original)
  }
})

test('中文标题默认生成的文件名可以被索引', async (t) => {
  const dir = await fixture(t)
  const input = ['中文论文标题', '', '2026', 'rl-post-training', 'RL', '', '', '', '明确的问题与方法。', 'read', '', ''].join('\n')
  success(run(dir, 'new-paper.mjs', [], input))
  success(run(dir, 'generate-index.mjs'))
  assert.equal((await generated(dir)).papers[0].route, '/papers/rl-post-training/中文论文标题-2026')
})

test('报告不能借用仅论文轨道中存在的分类', async (t) => {
  const dir = await fixture(t)
  await note(dir, 'research', baseCategory.id, '错误轨道报告')
  assert.notEqual(run(dir, 'generate-index.mjs').status, 0)
})

test('显式内容类型和目录或分类目录不一致时拒绝生成', async (t) => {
  for (const [folder, metadata] of [['rl-post-training', { type: 'research' }], ['other', { category: 'rl-post-training' }]]) {
    const dir = await fixture(t)
    await note(dir, 'papers', folder, '错误放置', metadata)
    assert.notEqual(run(dir, 'generate-index.mjs').status, 0)
  }
})
