# 论文笔记

围绕单篇论文理解研究问题、方法和实验。

## RL Post-Training {#rl-post-training}

围绕强化学习后训练的论文精读与方法分析。

| 标题 | 摘要 | 标签 | 年份 |
| --- | --- | --- | ---: |
| [SARL：通过强化学习选择机器人的语言指令](/papers/rl-post-training/sarl-2026) | SARL 固定通用机器人策略，通过在线强化学习选择状态相关的语言指令，调用和组合已有技能以适应新的多步骤任务。 | 分层控制、在线强化学习、机器人基础模型、语言动作、长程任务 | 2026 |
| [RL-100](/papers/rl-post-training/rl-100-2026) | RL-100 从扩散模仿策略出发，通过带离线评估门控的迭代强化学习、真机数据扩充和在线微调提升操作可靠性，再用一致性蒸馏降低部署延迟。 | 一致性蒸馏、扩散策略、机器人操作、真实世界强化学习、离线到在线强化学习 | 2026 |
| [VLA-RL](/papers/rl-post-training/vla-rl-2025) | 从已完成模仿微调的 OpenVLA 出发，以在线 PPO、伪过程奖励和并行训练改善 LIBERO 操作成功率，同时辨明泛化、推理扩展与实现完整性的证据边界。 | PPO、VLA、在线强化学习、机器人操作、过程奖励 | 2025 |

## Test-Time Policy Steering {#test-time-policy-steering}

围绕部署时通过价值引导、候选动作重排与策略选择改善机器人行为的论文精读。

| 标题 | 摘要 | 标签 | 年份 |
| --- | --- | --- | ---: |
| [Steerable Policies](/papers/test-time-policy-steering/steerable-policies-2026) | 用多粒度语言与像素坐标重标注机器人演示，训练可接受多种指令的 VLA，使高层模型能根据观察与执行反馈选择控制接口，改善真实机器人分层控制。 | embodied-reasoning、hierarchical-control、instruction-following、synthetic-data、vision-language-action | 2026 |
| [V-GPS：用价值函数挑选机器人动作](/papers/test-time-policy-steering/v-gps-2025) | V-GPS 用离线强化学习预训练的语言条件价值函数，在部署时重排冻结通用策略的候选动作，改善所测机器人操作任务的平均成功率。 | 价值函数、机器人基础模型、测试时动作选择、离线强化学习 | 2025 |
