import fs from 'node:fs/promises'
import { parseArgs } from 'node:util'
import yaml from 'js-yaml'
import { categoriesPath, getTrack, readCategories, validateCategories } from './library.mjs'

const { values } = parseArgs({
  options: {
    type: { type: 'string' },
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    icon: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
})

if (values.help) {
  console.log('Usage: npm run new-category -- --type paper|research --id category-id --title "分类名称" --description "分类范围" [--icon "图标"]')
} else {
  const track = getTrack(values.type)
  const categories = await readCategories()
  const entry = {
    id: values.id?.trim(),
    title: values.title?.trim(),
    description: values.description?.trim(),
  }
  if (values.icon) entry.icon = values.icon.trim()
  categories[track.key].push(entry)
  validateCategories(categories)
  await fs.writeFile(categoriesPath, yaml.dump(categories, { lineWidth: -1, noRefs: true, sortKeys: false }), 'utf8')
  console.log(`Created ${track.label} category: ${entry.title} (${entry.id})`)
  console.log('Next: add content in this track, then run npm run generate.')
}
