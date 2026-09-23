# Paper Notes

用 Markdown 维护自己的论文笔记和主题调研报告。这里保留精读摘要、方法拆解、实验结论、专题调研和个人思考，方便之后快速查阅。

- [论文索引](/papers/)
- [RL Post-Training](/papers/#rl-post-training)
- [标签索引](/tags/)

## Recent Notes

| Paper | Category | Year | Summary |
| --- | --- | ---: | --- |
| [RL-100](/papers/rl-post-training/rl-100-2026) | RL Post-Training | 2026 | RL-100 将示范初始化、带离线评估门控的迭代离线 RL、在线 PPO 和一步蒸馏串成真实机器人训练流程，在限定任务协议下提高成功率与执行效率。 |

## Categories

| Category | Notes | Scope |
| --- | ---: | --- |
| [RL Post-Training](/papers/#rl-post-training) | 1 | 围绕强化学习后训练的论文笔记与主题调研。 |

## Update Workflow

本地新增：

```bash
npm run new-paper
npm run generate
```

论文笔记和相关主题调研均保存在 `papers/rl-post-training/`，分类填写 `rl-post-training`。填写标题、年份、标签、摘要和正文后运行 `npm run generate`。
