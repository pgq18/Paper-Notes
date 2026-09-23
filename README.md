# Paper Notes

一个适合长期维护的个人论文库。笔记用 Markdown 写，论文元数据放在 frontmatter 里，脚本会自动生成首页、论文索引、标签索引和 VitePress 侧边栏。

当前唯一类别是 **RL Post-Training**（`rl-post-training`），用于保存强化学习后训练相关的论文笔记与主题调研。

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
papers/rl-post-training/<slug>-<year>.md
```

然后编辑正文，最后运行以下命令，将笔记路径替换为实际文件名，并确认只提交本次改动：

```bash
npm run generate
git add 'papers/rl-post-training/<slug>-<year>.md' index.md papers/index.md tags/index.md .vitepress/generated/
git commit -m "docs(papers): add paper note"
git push
```

## 添加论文：GitHub 网页方式

1. 在 `papers/rl-post-training/` 下新建 `<slug>-<year>.md`。
2. 按下方“笔记格式”填写必填 frontmatter，`category` 使用 `rl-post-training`。
3. 写入笔记正文，核对来源链接。
4. 提交到 `main` 分支。

GitHub Actions 会自动运行 `npm run generate` 和 `npm run docs:build`，然后部署到 GitHub Pages。

## 添加主题调研

主题调研是围绕某个问题、综合多篇文献的报告。RL 后训练相关报告与论文笔记共用 RL Post-Training 类别，通过标题和标签区分内容类型与研究主题。

1. 在 `papers/rl-post-training/<主题名称>-<年份>.md` 新建报告。
2. 填写必填 frontmatter 和正文，使用 `category: "rl-post-training"`。`year` 填报告年份，`tags` 可包含 `主题调研` 和具体研究方向，推荐用 `date` 记录报告日期。
3. 运行 `npm run generate` 更新索引。

调研报告会进入首页、索引、标签和搜索，并显示在 RL Post-Training 类别下。

## 使用 AI 精读、审阅与上传

仓库提供两个独立 skill：

- `skills/paper-library-reader/`：阅读论文、核实发表来源，按十部分生成中文笔记，先交给用户审阅。
- `skills/paper-library-uploader/`：将用户确认的论文笔记或主题调研加入正式文献库，完成检查，并按授权上传和发布。

其他 AI agent 也可以直接读取相应目录下的 `SKILL.md` 执行。

在已安装该 skill 的 Codex 中，可以这样调用：

```text
使用 $paper-library-reader 阅读这篇论文：<论文链接或 PDF 路径>。
补充背景与相关工作，按十部分生成中文精读笔记，先给我审阅。
```

笔记采用自然连贯的讲解，关键论断有据可查，未验证的设想保留必要的不确定性措辞。内容包括基于历史知识的思路重建、真实方法案例、数学解释、一周检验与经过近邻文献核查的 follow-up idea。开头列出发表刊物/会议、发表状态、最早公开时间、正式发表时间、所读版本和核验链接。

待审阅成品默认保存在 `.tools/paper-drafts/`，不会参与正式索引、站点构建或 Git 提交。生成后 agent 会展示完整文档，询问修改意见和是否上传；确认后再进入上传流程。分类始终以当前 `data/categories.yml` 为准，本库中的 RL 后训练论文笔记与相关主题调研均使用 `rl-post-training`。

确认成品后可以这样调用：

```text
使用 $paper-library-uploader 将我已确认的这份笔记上传到当前文献库：<Markdown 路径>。
```

若只想加入本地库，可明确说“仅本地入库，不推送”。上传 skill 会保留已有内容，检查格式、重复条目、附件、索引和构建，区分本地完成、远端已推送与站点已上线。

个人安装时，将两个 skill 目录分别复制到 `$CODEX_HOME/skills/`（未设置时为 `~/.codex/skills/`）。仓库中的 skill 源文件不参与站点页面构建；发布沿用仓库已有的部署流程。

## 笔记格式

每篇论文笔记或调研报告至少需要这些 frontmatter 字段：

```yaml
---
title: "Paper Title"
year: 2026
category: "rl-post-training"
tags: ["tag-1", "tag-2"]
summary: "One sentence summary."
---
```

`year` 对论文使用所采用书目版本的年份，对主题调研使用报告年份。可按实际内容补充 `date`、`authors`、`paper`、`code` 等字段；已核实的会议、期刊与发表时间也应在正文中展示。

分类定义在 `data/categories.yml`，当前只保留 `rl-post-training`。新增内容使用现有合法分类；只有明确需要调整库的分类时，才修改该文件。

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
|-- papers/rl-post-training/
|-- archive/papers/foundation-models/attention-is-all-you-need.md
|-- scripts/generate-index.mjs
|-- scripts/new-paper.mjs
|-- skills/paper-library-reader/
|-- skills/paper-library-uploader/
|-- .vitepress/
`-- .github/workflows/deploy.yml
```

旧 Transformer 示例保存在 `archive/`，不参与正式索引或站点构建。站点不再提供论文或调研模板页面；skill 内部的精读骨架仍保留，用于生成待审阅笔记。

## 维护建议

- 一篇论文只放一个 Markdown 文件。
- 一份主题调研报告只放一个 Markdown 文件，参考文献在正文中统一列出。
- 分类用于主目录，标签用于跨方向检索。
- `summary` 写得越清楚，首页、索引和搜索结果越好用。
- 不要手动改 `index.md`、`papers/index.md`、`tags/index.md` 或 `.vitepress/generated/*`；它们由 `npm run generate` 生成。
