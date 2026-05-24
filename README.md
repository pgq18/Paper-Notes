# Paper Notes

一个适合长期维护的个人论文库。笔记用 Markdown 写，论文元数据放在 frontmatter 里，脚本会自动生成首页、论文索引、标签索引和 VitePress 侧边栏。

## 本地使用

需要 Node.js 22 或更高版本。

```bash
npm install
npm run docs:dev
```

常用命令：

```bash
npm run generate      # 重新生成首页、论文索引、标签索引和侧边栏数据
npm run new-paper     # 交互式创建一篇新论文笔记
npm run docs:build    # 构建静态站点
npm run docs:preview  # 预览构建结果
```

## 添加论文：本地方式

```bash
npm run new-paper
```

按提示填写标题、年份、分类、标签、论文链接和一句话总结。脚本会创建：

```text
papers/<category>/<slug>-<year>.md
```

然后编辑正文，最后运行：

```bash
npm run generate
git add .
git commit -m "add: paper title note"
git push
```

## 添加论文：GitHub 网页方式

1. 打开 `templates/paper.md`。
2. 复制内容。
3. 在 `papers/<category>/` 下新建一个 Markdown 文件。
4. 填好 frontmatter 和正文。
5. 提交到 `main` 分支。

GitHub Actions 会自动运行 `npm run generate` 和 `npm run docs:build`，然后部署到 GitHub Pages。

## 笔记格式

每篇论文至少需要这些 frontmatter 字段：

```yaml
---
title: "Paper Title"
year: 2026
category: "foundation-models"
tags: ["tag-1", "tag-2"]
summary: "One sentence summary."
---
```

推荐使用完整模板：

```yaml
---
title: "Paper Title"
shortTitle: "Short Name"
year: 2026
date: 2026-05-25
category: "foundation-models"
tags: ["tag-1", "tag-2"]
authors: ["Author A", "Author B"]
paper: "https://arxiv.org/abs/..."
code: ""
project: ""
summary: "One sentence summary for cards, search results, and indexes."
status: "read"
rating: 4
---
```

分类定义在 `data/categories.yml`。新增分类时，先在这个文件里增加分类，再在对应目录下添加论文。

## GitHub Pages 部署

1. 把仓库推送到 GitHub。
2. 进入仓库的 `Settings -> Pages`。
3. `Source` 选择 `GitHub Actions`。
4. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动发布。

默认 GitHub Pages 路径是 `/<repo-name>/`。如果你使用自定义域名或 `username.github.io` 仓库，在 GitHub 仓库变量里设置：

```text
VITEPRESS_BASE=/
```

## 项目结构

```text
.
|-- data/categories.yml
|-- papers/
|-- scripts/generate-index.mjs
|-- scripts/new-paper.mjs
|-- templates/paper.md
|-- .vitepress/
`-- .github/workflows/deploy.yml
```

## 维护建议

- 一篇论文只放一个 Markdown 文件。
- 分类用于主目录，标签用于跨方向检索。
- `summary` 写得越清楚，首页、索引和搜索结果越好用。
- 不要手动改 `index.md`、`papers/index.md`、`tags/index.md` 或 `.vitepress/generated/*`；它们由 `npm run generate` 生成。
