# Paper Notes

个人研究文献库。论文笔记帮助理解单篇工作的研究逻辑，主题调研围绕一个问题串联多篇文献，两者分别归档与分类。

- [论文笔记](/papers/)：6 篇。围绕单篇论文理解研究问题、方法和实验。
- [主题调研](/research/)：2 篇。围绕一个研究问题综合多篇文献，梳理路线、证据和未解问题。
- [标签索引](/tags/)：按共同主题查阅两个轨道的内容。

## 论文笔记

### 近期内容

| 标题 | 分类 | 年份 | 摘要 |
| --- | --- | ---: | --- |
| [SARL：通过强化学习选择机器人的语言指令](/papers/rl-post-training/sarl-2026) | RL Post-Training | 2026 | SARL 固定通用机器人策略，通过在线强化学习选择状态相关的语言指令，调用和组合已有技能以适应新的多步骤任务。 |
| [RL-100](/papers/rl-post-training/rl-100-2026) | RL Post-Training | 2026 | RL-100 从扩散模仿策略出发，通过带离线评估门控的迭代强化学习、真机数据扩充和在线微调提升操作可靠性，再用一致性蒸馏降低部署延迟。 |
| [Steerable Policies](/papers/test-time-policy-steering/steerable-policies-2026) | Test-Time Policy Steering | 2026 | 用多粒度语言与像素坐标重标注机器人演示，训练可接受多种指令的 VLA，使高层模型能根据观察与执行反馈选择控制接口，改善真实机器人分层控制。 |
| [ActiveRL：主动补齐离线数据](/papers/rl-post-training/active-rl-2025) | RL Post-Training | 2025 | 在离线数据覆盖不足且新增交互有限的条件下，以模型集成分歧选择采集起点和探索动作，并截断低不确定性轨迹，再用增广数据改善离线策略。 |
| [V-GPS：用价值函数挑选机器人动作](/papers/test-time-policy-steering/v-gps-2025) | Test-Time Policy Steering | 2025 | V-GPS 用离线强化学习预训练的语言条件价值函数，在部署时重排冻结通用策略的候选动作，改善所测机器人操作任务的平均成功率。 |

### 分类

| 分类 | 篇数 | 范围 |
| --- | ---: | --- |
| [RL Post-Training](/papers/#rl-post-training) | 4 | 围绕强化学习后训练的论文精读与方法分析。 |
| [Test-Time Policy Steering](/papers/#test-time-policy-steering) | 2 | 围绕部署时通过价值引导、候选动作重排与策略选择改善机器人行为的论文精读。 |

## 主题调研

### 近期内容

| 标题 | 分类 | 年份 | 摘要 |
| --- | --- | ---: | --- |
| [Chunked Policy 的块间纠正与在线适配](/research/long-horizon-robotics/chunk-boundary-physical-correction-and-online-adaptation-2026) | 机器人长程任务 | 2026 | 比较块间物理纠正、动作残差、恢复与持续控制权切换，梳理 RecoveryChaining 等近邻、训练价值差异及在线适配的证据边界。 |
| [机器人子任务完成检测与技能切换](/research/long-horizon-robotics/robot-subtask-completion-and-skill-switching-2026) | 机器人长程任务 | 2026 | 梳理学习式成功检测、策略内生终止、视觉语言验证及进度奖励模型，比较其监督来源、在线技能切换证据与跨任务泛化边界。 |

### 分类

| 分类 | 篇数 | 范围 |
| --- | ---: | --- |
| [机器人长程任务](/research/#long-horizon-robotics) | 2 | 围绕机器人长程任务的分层执行、子任务完成检测、技能切换与失败恢复的主题调研。 |
