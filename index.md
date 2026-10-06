# Paper Notes

个人研究文献库。论文笔记帮助理解单篇工作的研究逻辑，主题调研围绕一个问题串联多篇文献，两者分别归档与分类。

- [论文笔记](/papers/)：8 篇。围绕单篇论文理解研究问题、方法和实验。
- [主题调研](/research/)：4 篇。围绕一个研究问题综合多篇文献，梳理路线、证据和未解问题。
- [标签索引](/tags/)：按共同主题查阅两个轨道的内容。

## 论文笔记

### 近期内容

| 标题 | 分类 | 年份 | 摘要 |
| --- | --- | ---: | --- |
| [FutureRTC](/papers/real-time-vla/futurertc-2026) | Real-Time VLA | 2026 | 利用已承诺动作预测交接时刻的视觉特征与机器人状态，让冻结的VLA从未来执行上下文生成动作，缓解异步推理的时间错位。 |
| [Real-Time EXPO-FT](/papers/rl-post-training/real-time-expo-ft-2026) | RL Post-Training | 2026 | 用延迟感知的 VLA 提前生成动作候选，再在执行边界依据最新观测进行强化学习驱动的快速修正与价值筛选，提高动态任务中的成功率。 |
| [SARL：通过强化学习选择机器人的语言指令](/papers/rl-post-training/sarl-2026) | RL Post-Training | 2026 | SARL 固定通用机器人策略，通过在线强化学习选择状态相关的语言指令，调用和组合已有技能以适应新的多步骤任务。 |
| [RL-100](/papers/rl-post-training/rl-100-2026) | RL Post-Training | 2026 | RL-100 从扩散模仿策略出发，通过带离线评估门控的迭代强化学习、真机数据扩充和在线微调提升操作可靠性，再用一致性蒸馏降低部署延迟。 |
| [Steerable Policies](/papers/test-time-policy-steering/steerable-policies-2026) | Test-Time Policy Steering | 2026 | 用多粒度语言与像素坐标重标注机器人演示，训练可接受多种指令的 VLA，使高层模型能根据观察与执行反馈选择控制接口，改善真实机器人分层控制。 |

### 分类

| 分类 | 篇数 | 范围 |
| --- | ---: | --- |
| [RL Post-Training](/papers/#rl-post-training) | 5 | 围绕强化学习后训练的论文精读与方法分析。 |
| [Test-Time Policy Steering](/papers/#test-time-policy-steering) | 2 | 围绕部署时通过价值引导、候选动作重排与策略选择改善机器人行为的论文精读。 |
| [Real-Time VLA](/papers/#real-time-vla) | 1 | 围绕视觉语言动作策略的异步推理、动作分块、延迟补偿与执行调度的论文精读。 |

## 主题调研

### 近期内容

| 标题 | 分类 | 年份 | 摘要 |
| --- | --- | ---: | --- |
| [真机在线 RL 的缺口识别与定向探索](/research/robot-online-rl/active-gap-real-robot-rl-2026) | 机器人在线强化学习 | 2026 | 比较机械臂真机在线学习中基于不确定性、成功率、访问覆盖与学习收益的主动采集机制，梳理缺口诊断、到达复位、策略更新和实机证据，并深入解释 TwinRL 的孪生诊断与 DBAP 的任务图规划。 |
| [Chunked Policy 的块间纠正与在线适配](/research/long-horizon-robotics/chunk-boundary-physical-correction-and-online-adaptation-2026) | 机器人长程任务 | 2026 | 比较块间物理纠正、动作残差、恢复与持续控制权切换，梳理 RecoveryChaining 等近邻、训练价值差异及在线适配的证据边界。 |
| [两阶段读取不同时刻新观测：从接口组合到可检验的研究问题](/research/real-time-control/two-observation-steering-2026) | 机器人实时控制 | 2026 | 围绕生成式机器人策略在去噪前与生成后读取不同时刻新观测的问题，综合噪声引导、动作残差、滚动去噪和快慢反馈文献，厘清已有方法的覆盖范围，提出以信息到达时机、执行期限和晚期可修正性为核心的研究假设与验证方案。 |
| [机器人子任务完成检测与技能切换](/research/long-horizon-robotics/robot-subtask-completion-and-skill-switching-2026) | 机器人长程任务 | 2026 | 梳理学习式成功检测、策略内生终止、视觉语言验证及进度奖励模型，比较其监督来源、在线技能切换证据与跨任务泛化边界。 |

### 分类

| 分类 | 篇数 | 范围 |
| --- | ---: | --- |
| [机器人长程任务](/research/#long-horizon-robotics) | 2 | 围绕机器人长程任务的分层执行、子任务完成检测、技能切换与失败恢复的主题调研。 |
| [机器人实时控制](/research/#real-time-control) | 1 | 围绕生成式机器人策略的推理延迟、观测时效、异步执行与闭环反馈的主题调研。 |
| [机器人在线强化学习](/research/#robot-online-rl) | 1 | 围绕真实机器人在线与离线到在线强化学习的主动探索、练习调度、反馈与自主复位的主题调研。 |
