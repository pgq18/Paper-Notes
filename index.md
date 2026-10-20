# Paper Notes

个人研究文献库。论文笔记帮助理解单篇工作的研究逻辑，主题调研围绕一个问题串联多篇文献，两者分别归档与分类。

- [论文笔记](/papers/)：15 篇。围绕单篇论文理解研究问题、方法和实验。
- [主题调研](/research/)：5 篇。围绕一个研究问题综合多篇文献，梳理路线、证据和未解问题。
- [标签索引](/tags/)：按共同主题查阅两个轨道的内容。

## 论文笔记

### 近期内容

| 标题 | 分类 | 年份 | 摘要 |
| --- | --- | ---: | --- |
| [PolicyTrim](/papers/rl-post-training/policytrim-2026) | RL Post-Training | 2026 | 通过两阶段强化学习扩展 VLA 的可靠动作执行窗口，并奖励稳定的短步数成功轨迹，降低完成操作任务所需的推理调用与物理动作开销。 |
| [UBER：用计划失准筛选经验](/papers/continual-rl/uncertainty-based-experience-replay-2025) | 持续强化学习 | 2025 | 根据真实状态纠正后的未来奖励分布偏差，筛选经验并触发重规划；积累足够新数据后更新动力学模型，减少重复存储与计算。 |
| [TwinRL](/papers/rl-post-training/twinrl-2026) | RL Post-Training | 2026 | 利用数字孪生扩展示范覆盖、提供交互回放并选择真机练习配置，提高四项桌面操作任务中的VLA在线强化学习效率。 |
| [VLA-RL](/papers/rl-post-training/vla-rl-2025) | RL Post-Training | 2025 | 从已完成模仿微调的 OpenVLA 出发，以在线 PPO、伪过程奖励和并行训练改善 LIBERO 操作成功率，同时辨明泛化、推理扩展与实现完整性的证据边界。 |
| [Critical States：把探索放在合适的位置](/papers/rl-exploration/identifying-critical-states-2020) | RL Exploration | 2020 | 用同一状态下不同动作的 Q 值方差识别决策关键点，并在这些位置偏向利用，以减少关键失误、改善后续状态的探索。 |

### 分类

| 分类 | 篇数 | 范围 |
| --- | ---: | --- |
| [RL Post-Training](/papers/#rl-post-training) | 10 | 围绕强化学习后训练的论文精读与方法分析。 |
| [Test-Time Policy Steering](/papers/#test-time-policy-steering) | 2 | 围绕部署时通过价值引导、候选动作重排与策略选择改善机器人行为的论文精读。 |
| [Real-Time VLA](/papers/#real-time-vla) | 1 | 围绕视觉语言动作策略的异步推理、动作分块、延迟补偿与执行调度的论文精读。 |
| [RL Exploration](/papers/#rl-exploration) | 1 | 围绕强化学习中的探索与利用、关键决策状态及探索策略的论文精读。 |
| [持续强化学习](/papers/#continual-rl) | 1 | 围绕持续强化学习中的知识保留、经验管理与任务适应的论文精读。 |

## 主题调研

### 近期内容

| 标题 | 分类 | 年份 | 摘要 |
| --- | --- | ---: | --- |
| [自适应执行窗口与闭环验证](/research/real-time-control/adaptive-action-execution-2026) | 机器人实时控制 | 2026 | 比较动作块起点选择执行长度与执行期间利用新观测触发重规划两类接口，梳理强化学习、可靠性代理和未来后果验证路线，并界定局部重规划收益学习相对现有工作的差异。 |
| [真机在线 RL 的缺口识别与定向探索](/research/robot-online-rl/active-gap-real-robot-rl-2026) | 机器人在线强化学习 | 2026 | 比较机械臂真机在线学习中基于不确定性、成功率、访问覆盖与学习收益的主动采集机制，梳理缺口诊断、到达复位、策略更新和实机证据，并深入解释 TwinRL 的孪生诊断与 DBAP 的任务图规划。 |
| [Chunked Policy 的块间纠正与在线适配](/research/long-horizon-robotics/chunk-boundary-physical-correction-and-online-adaptation-2026) | 机器人长程任务 | 2026 | 比较块间物理纠正、动作残差、恢复与持续控制权切换，梳理 RecoveryChaining 等近邻、训练价值差异及在线适配的证据边界。 |
| [两阶段读取不同时刻新观测：从接口组合到可检验的研究问题](/research/real-time-control/two-observation-steering-2026) | 机器人实时控制 | 2026 | 围绕生成式机器人策略在去噪前与生成后读取不同时刻新观测的问题，综合噪声引导、动作残差、滚动去噪和快慢反馈文献，厘清已有方法的覆盖范围，提出以信息到达时机、执行期限和晚期可修正性为核心的研究假设与验证方案。 |
| [机器人子任务完成检测与技能切换](/research/long-horizon-robotics/robot-subtask-completion-and-skill-switching-2026) | 机器人长程任务 | 2026 | 梳理学习式成功检测、策略内生终止、视觉语言验证及进度奖励模型，比较其监督来源、在线技能切换证据与跨任务泛化边界。 |

### 分类

| 分类 | 篇数 | 范围 |
| --- | ---: | --- |
| [机器人长程任务](/research/#long-horizon-robotics) | 2 | 围绕机器人长程任务的分层执行、子任务完成检测、技能切换与失败恢复的主题调研。 |
| [机器人实时控制](/research/#real-time-control) | 2 | 围绕生成式机器人策略的推理延迟、观测时效、异步执行与闭环反馈的主题调研。 |
| [机器人在线强化学习](/research/#robot-online-rl) | 1 | 围绕真实机器人在线与离线到在线强化学习的主动探索、练习调度、反馈与自主复位的主题调研。 |
