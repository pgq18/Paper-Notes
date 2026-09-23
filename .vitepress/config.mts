import { defineConfig } from 'vitepress'
import sidebar from './generated/sidebar.mjs'

const repository = process.env.GITHUB_REPOSITORY || ''
const base = process.env.VITEPRESS_BASE || '/'
const socialLinks = repository
  ? [{ icon: 'github' as const, link: `https://github.com/${repository}` }]
  : []

export default defineConfig({
  title: 'Paper Notes',
  description: '分别归档论文笔记与主题调研的个人研究文献库',
  lang: 'zh-CN',
  base,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  srcExclude: ['docs/superpowers/**', 'skills/**', '.tools/**', 'archive/**'],

  markdown: {
    math: true,
  },

  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['link', { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>' }],
  ],

  themeConfig: {
    siteTitle: 'Paper Notes',

    nav: [
      { text: '首页', link: '/' },
      { text: '论文笔记', link: '/papers/' },
      { text: '主题调研', link: '/research/' },
      { text: '标签', link: '/tags/' },
    ],

    sidebar,

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: 'enter',
              navigateText: '导航',
              navigateUpKeyAriaLabel: 'up arrow',
              navigateDownKeyAriaLabel: 'down arrow',
              closeText: '关闭',
              closeKeyAriaLabel: 'escape',
            },
          },
        },
      },
    },

    outline: {
      level: [2, 3],
      label: '目录',
    },

    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
    socialLinks,
    footer: {
      message: 'Built with VitePress and Markdown.',
      copyright: 'Personal paper notes library.',
    },
  },
})
