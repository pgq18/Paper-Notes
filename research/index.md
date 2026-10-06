# 主题调研

围绕一个研究问题综合多篇文献，梳理路线、证据和未解问题。

## 机器人长程任务 {#long-horizon-robotics}

围绕机器人长程任务的分层执行、子任务完成检测、技能切换与失败恢复的主题调研。

| 标题 | 摘要 | 标签 | 年份 |
| --- | --- | --- | ---: |
| [Chunked Policy 的块间纠正与在线适配](/research/long-horizon-robotics/chunk-boundary-physical-correction-and-online-adaptation-2026) | 比较块间物理纠正、动作残差、恢复与持续控制权切换，梳理 RecoveryChaining 等近邻、训练价值差异及在线适配的证据边界。 | action-chunking、adaptation、online-rl、policy-switching、recovery、residual-rl、robotics | 2026 |
| [机器人子任务完成检测与技能切换](/research/long-horizon-robotics/robot-subtask-completion-and-skill-switching-2026) | 梳理学习式成功检测、策略内生终止、视觉语言验证及进度奖励模型，比较其监督来源、在线技能切换证据与跨任务泛化边界。 | 成功检测、技能终止、机器人长程任务、视觉语言模型、进度与奖励模型 | 2026 |

## 机器人实时控制 {#real-time-control}

围绕生成式机器人策略的推理延迟、观测时效、异步执行与闭环反馈的主题调研。

| 标题 | 摘要 | 标签 | 年份 |
| --- | --- | --- | ---: |
| [两阶段读取不同时刻新观测：从接口组合到可检验的研究问题](/research/real-time-control/two-observation-steering-2026) | 围绕生成式机器人策略在去噪前与生成后读取不同时刻新观测的问题，综合噪声引导、动作残差、滚动去噪和快慢反馈文献，厘清已有方法的覆盖范围，提出以信息到达时机、执行期限和晚期可修正性为核心的研究假设与验证方案。 | 动作反馈、噪声引导、实时控制、异步推理、视觉语言动作模型 | 2026 |

## 机器人在线强化学习 {#robot-online-rl}

围绕真实机器人在线与离线到在线强化学习的主动探索、练习调度、反馈与自主复位的主题调研。

| 标题 | 摘要 | 标签 | 年份 |
| --- | --- | --- | ---: |
| [真机在线 RL 的缺口识别与定向探索](/research/robot-online-rl/active-gap-real-robot-rl-2026) | 比较机械臂真机在线学习中基于不确定性、成功率、访问覆盖与学习收益的主动采集机制，梳理缺口诊断、到达复位、策略更新和实机证据，并深入解释 TwinRL 的孪生诊断与 DBAP 的任务图规划。 | 主动探索、机器人强化学习、离线到在线强化学习、练习调度、自主复位 | 2026 |
