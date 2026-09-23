import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const tracks = [
  { type: 'paper', key: 'papers', directory: 'papers', label: '论文笔记', description: '围绕单篇论文理解研究问题、方法和实验。' },
  { type: 'research', key: 'research', directory: 'research', label: '主题调研', description: '围绕一个研究问题综合多篇文献，梳理路线、证据和未解问题。' },
]
export const categoriesPath = path.join(root, 'data', 'categories.yml')
const safeCategoryId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function getTrack(type) {
  const track = tracks.find((item) => item.type === type)
  if (!track) throw new Error(`Unknown content type "${type}"; use paper or research`)
  return track
}

export function validateCategories(categories) {
  if (!categories || typeof categories !== 'object' || Array.isArray(categories)) {
    throw new Error('data/categories.yml must contain separate papers and research lists')
  }
  for (const key of Object.keys(categories)) {
    if (!tracks.some((track) => track.key === key)) throw new Error(`Unknown category track "${key}"`)
  }
  for (const track of tracks) {
    const entries = categories[track.key]
    if (!Array.isArray(entries)) throw new Error(`data/categories.yml: ${track.key} must be a list`)
    const ids = new Set()
    const titles = new Set()
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new Error(`${track.key}: each category must be an object`)
      }
      for (const field of ['id', 'title', 'description']) {
        if (typeof entry[field] !== 'string' || !entry[field].trim() || entry[field] !== entry[field].trim()) {
          throw new Error(`${track.key}: category ${field} must be a non-empty, trimmed string`)
        }
      }
      if (!safeCategoryId.test(entry.id)) throw new Error(`${track.key}: invalid category id "${entry.id}"; use lowercase words separated by hyphens`)
      if (ids.has(entry.id)) throw new Error(`${track.key}: duplicate category id "${entry.id}"`)
      const titleKey = entry.title.normalize('NFKC').toLowerCase()
      if (titles.has(titleKey)) throw new Error(`${track.key}: duplicate category title "${entry.title}"`)
      if (entry.icon !== undefined && typeof entry.icon !== 'string') throw new Error(`${track.key}: category icon must be a string`)
      ids.add(entry.id)
      titles.add(titleKey)
    }
  }
  return categories
}

export async function readCategories() {
  return validateCategories(yaml.load(await fs.readFile(categoriesPath, 'utf8')))
}
