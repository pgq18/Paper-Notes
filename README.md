# Paper Notes

一个适合长期维护的个人文献库，使用 Markdown 保存内容，自动生成首页、索引、标签和 VitePress 侧边栏。内容分成两条独立轨道：

| 轨道 | 内容 | 正式文件 | 分类配置 |
| --- | --- | --- | --- |
| 论文 | 围绕一篇论文的问题、idea、方法和实验写精读笔记 | `papers/<category>/<slug>-<year>.md` | `data/categories.yml` 的 `papers` |
| 主题调研 | 围绕一个研究问题综合多篇文献、比较路线并梳理开放问题 | `research/<category>/<slug>-<year>.md` | `data/categories.yml` 的 `research` |

每条轨道有自己的索引和分类。同名分类可以分别存在于两条轨道，互不混计；主题调研本身不是论文分类。初始论文分类为 **RL Post-Training**（`rl-post-training`），主题调研尚无分类，可在首篇报告入库时创建。

## 本地使用

需要 Node.js 22 或更高版本。

```bash
npm install
npm run docs:dev
```

常用命令：

```bash
npm run generate      # 生成首页、论文与调研索引、标签和侧边栏数据
npm run new-paper     # 交互式创建论文笔记
npm run new-research  # 交互式创建主题调研
npm run new-category -- --type research --id rl-post-training --title "RL Post-Training" --description "强化学习后训练的主题调研。"
npm run docs:build    # 构建静态站点
npm run docs:preview  # 预览构建结果
npm test              # 检查双轨道归档和分类创建
```

## 分类与新增内容

先确定轨道，再选择该轨道内的分类。论文笔记即使包含背景综述，也仍属于论文轨道；主题调研引用已入库的论文，不构成重复笔记。

分类定义独立存放在 `data/categories.yml`：

```yaml
papers:
  - id: rl-post-training
    title: RL Post-Training
    description: 强化学习后训练相关论文笔记。
research: []
```

各分类包含 `id`、`title`、`description` 和可选 `icon`。在目标轨道没有合适分类时，可以创建新分类：

```bash
npm run new-category -- --type paper --id robot-learning --title "Robot Learning" --description "机器人学习相关论文笔记。"
npm run new-category -- --type research --id robot-learning --title "Robot Learning" --description "围绕机器人学习问题的主题调研。"
```

`--type` 必须为 `paper` 或 `research`，`--icon` 可选。同名分类在另一轨道存在时，仍需在目标轨道单独定义。新增分类与本次文档、生成结果一起检查和提交；不要只在 frontmatter 中填写尚未定义的分类。

### 添加论文

运行 `npm run new-paper`，按提示填写标题、年份、论文分类、标签、论文链接和一句话总结。也可以直接在 `papers/<category>/` 下新建 `<slug>-<year>.md`，填写下方格式与正文。

### 添加主题调研

运行 `npm run new-research`，按提示填写报告信息和调研分类；若尚无分类，先用 `new-category` 创建。已有报告可以直接保存到 `research/<category>/<slug>-<year>.md`。`year` 填报告年份，推荐用 `date` 记录更新日期，正文交代调研问题、范围、检索截止时间和参考文献。

调研报告按问题与证据组织，不要求套用单篇论文的作者、发表场所或方法章节。两类内容都会进入首页、标签和搜索，并在各自轨道的索引与侧边栏中展示。

### 检查与提交

完成正文后运行：

```bash
npm run docs:build
```

构建会先生成索引。检查文档路径、轨道、分类、来源、公式、表格和链接；然后只暂存本次文档、必要的新分类定义及受影响的生成文件。生成文件包括 `index.md`、`papers/index.md`、`research/index.md`、`tags/index.md` 和 `.vitepress/generated/`。

提交信息采用 Conventional Commits，例如 `docs(papers): add robot learning note` 或 `docs(research): add post-training survey`。推送到 `main` 后，GitHub Actions 会构建并部署到 GitHub Pages。在 GitHub 网页直接新建文件也使用相同目录和格式；新分类须同步更新 `data/categories.yml` 中对应列表。

## 使用 AI 精读、讨论与上传

仓库提供两个 skill：

- `skills/paper-library-reader/`：阅读单篇论文、核实来源，生成八部分中文初稿，再与用户持续讨论论文细节，保留补充、纠正及对应证据。
- `skills/paper-library-uploader/`：上传论文或主题调研前回顾相关讨论，将有效解释和纠正融入初稿，按目标轨道选择或创建分类，检查、入库并按授权发布。

其他 AI agent 也可以直接读取相应目录下的 `SKILL.md` 执行。

在已安装 skill 的 Codex 中，可以这样调用：

```text
使用 $paper-library-reader 阅读这篇论文：<论文链接或 PDF 路径>。
补充必要背景，讲清从已有知识到核心 idea 的逻辑，按八部分生成中文精读笔记，先给我审阅。
```

论文初稿帮助读者抓住问题、idea、方法和证据。相关工作与思路重建合并成连续推演：已有机制遇到什么瓶颈，由此需要什么能力，哪些已有知识能提供这项能力，进而得到什么候选 idea。方法先讲主要步骤，再用简单例子串起输入、处理和输出；原文确有核心数学推导时融入对应步骤。实验以精简表格呈现核实后的关键数据，随后总结可迁移认识、脆弱假设和简洁的 follow-up idea。

正文采用自然连贯的讲解，关键论断有据可查，未验证的设想保留必要的不确定性措辞。论文开头列出发表刊物/会议、发表状态、最早公开时间、正式发表时间、所读版本、官方代码、项目主页和核验链接。

初稿默认保存在 `.tools/paper-drafts/`，不会参与正式索引、站点构建或 Git 提交。生成后 agent 会展示完整文档，询问修改意见和上传意愿。之后可以持续追问公式、实现、实验或研究逻辑，agent 直接回答，无需每轮重写全文。长对话可在草稿旁保留不参与发布的讨论记录，供最终整合。reader 仅推荐论文轨道的分类；需要新分类时，在上传阶段创建。

阅读和讨论结束后，可以上传论文：

```text
使用 $paper-library-uploader 回顾我们关于这篇论文的讨论，将补充和纠正融入初稿，再上传到当前文献库的论文轨道：<Markdown 路径>。
```

主题调研也由同一个 uploader 处理：

```text
使用 $paper-library-uploader 将这份主题调研及后续讨论整合后上传到主题调研轨道，使用 Robot Learning 分类；没有该分类就创建：<Markdown 路径>。
```

用户要求上传时，授权包含讨论整合和入库所需的明确新分类创建，无需为常规整合或已明确的分类再确认。内容融入对应章节，不附聊天流水账；未验证的设想保留不确定性，已纠正的解释替换旧误解。核心结论仍有冲突，或分类名称、范围有会影响组织方式的歧义时，先展示可审阅稿再澄清具体问题。没有后续讨论的独立文档也可直接上传，不强求补齐讨论记录。

若只想加入本地库，可明确说“仅本地入库，不推送”；若只要求预览，候选文档和分类会在隔离副本中检查，不改动正式配置。上传 skill 会保留用户批注与有效内容，检查重复条目、附件、索引和构建，区分本地完成、远端已推送与站点已上线。

个人安装时，将两个 skill 目录分别复制到 `$CODEX_HOME/skills/`（未设置时为 `~/.codex/skills/`）。仓库中的 skill 源文件不参与站点页面构建；发布沿用仓库已有流程。

## 文档格式

每篇论文笔记或调研报告共同必填 `title`、`year`、`category`、`tags` 和 `summary`。推荐另写 `type`，论文为 `paper`，调研为 `research`；省略时由目录推断，填写时必须与目录一致。

论文示例，保存于 `papers/rl-post-training/example-2026.md`：

```yaml
---
type: paper
title: "Paper Title"
year: 2026
category: "rl-post-training"
tags: ["reinforcement-learning", "post-training"]
summary: "一句话概括论文问题与关键方法。"
---
```

主题调研示例，先在调研轨道创建 `robot-learning`，再保存于 `research/robot-learning/example-2026.md`：

```yaml
---
type: research
title: "真实机器人强化学习中的数据复用与安全探索"
year: 2026
date: "2026-09-23"
category: "robot-learning"
tags: ["robotics", "reinforcement-learning"]
summary: "比较数据复用与安全探索的主要路线、证据和未解决问题。"
---
```

`category` 必须在目标轨道定义，且与文件所在分类目录一致。`year` 对论文使用所采用书目版本的年份，对调研使用报告年份。论文按核实结果补充 `authors`、`paper`、`code`、`project`、发表来源和日期；调研无需强填一篇论文的作者、刊物、DOI 或发表时间，其参考文献各自保留书目信息。

## GitHub Pages 部署

1. 把仓库推送到 GitHub。
2. 进入仓库的 `Settings -> Pages`。
3. `Source` 选择 `GitHub Actions`。
4. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动发布。

默认 GitHub Pages 路径是 `/<repo-name>/`。使用自定义域名或 `username.github.io` 仓库时，在 GitHub 仓库变量中设置 `VITEPRESS_BASE=/`。

## 项目结构

```text
.
|-- data/categories.yml
|-- papers/rl-post-training/
|-- papers/index.md
|-- research/index.md
|-- archive/papers/foundation-models/attention-is-all-you-need.md
|-- scripts/generate-index.mjs
|-- scripts/library.mjs
|-- scripts/new-paper.mjs
|-- scripts/new-category.mjs
|-- skills/paper-library-reader/
|-- skills/paper-library-uploader/
|-- .vitepress/
`-- .github/workflows/deploy.yml
```

旧 Transformer 示例保存在 `archive/`，不参与正式索引或站点构建。站点不提供论文或调研模板页面；skill 内部的精读骨架用于生成待审阅的单篇论文笔记。

## 维护建议

- 一篇论文或一份调研各放一个 Markdown 文件，调研的参考文献在正文统一列出。
- 先按论文或主题调研区分轨道，再用分类组织领域，用标签跨方向检索。
- `summary` 写清问题和内容，便于首页、索引和搜索检索。
- 不要手动改 `index.md`、`papers/index.md`、`research/index.md`、`tags/index.md` 或 `.vitepress/generated/*`；它们由 `npm run generate` 生成。
