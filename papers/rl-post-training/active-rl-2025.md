---
type: "paper"
title: "Active Reinforcement Learning Strategies for Offline Policy Improvement"
shortTitle: "ActiveRL：主动补齐离线数据"
year: 2025
date: "2026-09-28"
category: "rl-post-training"
tags: ["Offline RL", "Offline-to-Online RL", "Active Learning", "Exploration", "Uncertainty"]
authors: ["Ambedkar Dukkipati", "Ranga Shaarad Ayyagari", "Bodhisattwa Dasgupta", "Parag Dutta", "Prabhas Reddy Onteru"]
paper: "https://arxiv.org/html/2412.13106v2"
code: "https://github.com/sml-iisc/ActiveRL"
project: "https://sml.csa.iisc.ac.in/Blog/Active_RL/index.html"
venue: "AAAI 2025 — AAAI Technical Track on Machine Learning II"
venueType: "conference"
publicationStatus: "published"
firstPublished: "2024-12-17"
publishedAt: "2025-04-11"
publicationSources: ["https://arxiv.org/abs/2412.13106v2", "https://ojs.aaai.org/index.php/AAAI/article/view/33803"]
summary: "在离线数据覆盖不足且新增交互有限的条件下，以模型集成分歧选择采集起点和探索动作，并截断低不确定性轨迹，再用增广数据改善离线策略。"
status: "read"
---

# ActiveRL：把有限的新交互用在离线数据的缺口上

离线策略可能已经熟悉大部分环境，却始终学不会经过一小片缺少数据的关键区域。ActiveRL 的想法是先估计现有数据留下的知识缺口，再决定从哪里开始采集、尝试哪些动作，以及什么时候停止一条轨迹。它用多个模型的分歧引导这些决定，让新增数据集中补充欠缺的经验，随后继续用已有的离线强化学习算法更新策略。

| 论文来源 | 核实信息 |
| --- | --- |
| 发表场所与状态 | AAAI 2025 主会，Technical Track on Machine Learning II；已发表，39(16):16418–16425。[出版方记录](https://ojs.aaai.org/index.php/AAAI/article/view/33803) |
| 最早可核实公开时间 | 2024-12-17，arXiv v1。[版本历史](https://arxiv.org/abs/2412.13106) |
| 正式发表时间 | 2025-04-11，以出版方 Published 字段为准。[AAAI](https://ojs.aaai.org/index.php/AAAI/article/view/33803) |
| 所读版本 | arXiv v2，2024-12-26；正文、附录 A–D 与关键图表。[全文 P0](https://arxiv.org/html/2412.13106v2) |
| 官方代码 | [sml-iisc/ActiveRL](https://github.com/sml-iisc/ActiveRL)，由论文首页直接链接 |
| 官方项目介绍 | [IISc 实验室论文专页](https://sml.csa.iisc.ac.in/Blog/Active_RL/index.html)，亦由[作者论文列表](https://www.csa.iisc.ac.in/~ambedkar/papers.html)链接 |

思路重建以 2024-12-17 为历史边界；后续工作检索截至 2026-09-28，覆盖主动采集、不确定性探索及离线到在线学习。一个影响理解的版本差异是：当前官方代码的不确定性模型用均方误差预测状态增量，论文则描述对比学习得到的表征；下文方法统一按 v2 讲解，不将两者拼成同一实现。代码差异的具体依据见文末来源，尚不能据此确定原实验使用了哪一版模型。

## 1. 研究问题：已有数据以后，还应该去哪里收集？

想象一个导航机器人：历史轨迹覆盖了多数走廊，偏偏缺少通往目标的最后一段。继续训练可以更好地利用已有轨迹，却无法保证补出缺失区域的转移和奖励；直接让当前策略出门采集，又容易重复它已经熟悉的路线。

本文考虑的约束是：给定离线数据集，还允许有限次数的环境交互。目标是在这笔预算下，让增广数据训练出的策略获得更高回报。采集阶段可以拥有比正常评估更灵活的起点选择权；最终策略仍在原任务的初始状态分布上评估。起点、动作和轨迹长度都影响预算利用率，因此必须一起考虑。[P0，§2](https://arxiv.org/html/2412.13106v2#S2)

## 2. 从前人工作，怎样走到这个 idea

离线强化学习首先解决的是如何可靠利用固定数据。以 IQL 为例，$Q(s,a)$ 估计动作的长期回报，$V(s)$ 则对数据中动作的 Q 值做偏向高值的 expectile 拟合。忽略终止掩码时，Q 的学习目标为 $r+\gamma V(s')$，不需要在下一状态查询策略新生成动作的 Q 值。提取策略时，以 $\exp[\beta(Q(s,a)-V(s))]$ 给数据动作的对数似然加权，$\beta>0$ 控制偏好强度：高于基准 V 的动作获得更大模仿权重。[P1，§4](https://arxiv.org/html/2110.06169v1)

例如，同一状态的两个数据动作等频出现，示意 Q 值为 2 和 8，expectile 参数 $\tau=0.8$ 时，V 为 6.8；两个优势分别为 −4.8 和 1.2，策略因而更偏好第二个动作。这里“数据内”约束的是训练目标中的 Q 查询，不保证部署输出严格落在已记录动作上。在线采到新转移后，可以并入数据继续这些更新，因此 IQL 适合作为微调起点；但重新利用旧数据无法保证补出从未观察过的关键转移。[P1，§4–5](https://arxiv.org/html/2110.06169v1)

由此产生的采集要求很具体：新增经验应该填补当前数据缺少、且可能影响任务完成的转移。仅沿当前策略加少量随机扰动，未必能及时抵达这些位置；如果每次都从默认起点走一遍熟悉路段，预算还会大量花在重复访问上。

已有探索方法提供了两个可借用的抓手。RND 用预测固定随机网络输出的误差衡量陌生程度，说明探索可以由数据覆盖程度驱动。UFLP 则利用模拟器可重置到历史状态的能力，优先从高不确定性状态重新探索，说明改变探索起点本身就能影响样本效率。前者回答如何识别陌生经验，后者回答如何更直接地接近它。[P2](https://arxiv.org/abs/1810.12894)、[P3](https://arxiv.org/abs/2301.12579)

把这两条认识放进离线数据增广问题，可以得到一个候选思路：先从已有转移中学习环境相关的表示，以模型分歧标记欠缺区域，再让这一指标同时控制起点、局部动作和停止时机。新经验交回现有离线算法，改善数据覆盖便有机会转化为策略提升。这是基于当时知识的一条合理推导；本文具体选择的表征和分歧公式，需要由实验检验。

## 3. 核心 intuition

一条有价值的新轨迹应当补上旧数据的缺口。若能够靠近缺口开始探索，并在回到熟悉区域时结束，就可能用同样的交互数获得更多有用经验。这里最关键的前提是：模型分歧能够识别可学习的缺口，而且这些缺口与最终任务有关。

## 4. 方法：先过一遍流程，再走一个小例子

输入是离线转移集 $\mathcal D=\{(s,a,s',r,d)\}$、基础离线算法 $\mathsf{Alg}$ 和新增交互预算 $B$；输出是用旧数据与新数据训练出的策略。TD3+BC、IQL、CQL 等承担策略学习，本文主要改动采集过程。[P0，§3](https://arxiv.org/html/2412.13106v2#S3)

### 4.1 学习与转移有关的表示

先训练初始离线策略，同时训练 $K=5$ 个不共享权重的表示模型。每个模型包含状态编码器 $E_k^s$ 和动作编码器 $E_k^a$，并定义

$$
E_k(s)=E_k^s(s),\qquad
E_k(s,a)=E_k^s(s)+E_k^a(a).
$$

对一条转移，记 $v=E_k^s(s)$、$v^+=E_k^s(s')$，再从数据中采样另一个状态 $s''$，得到负样本 $v^-=E_k^s(s'')$。上标 $+$ 表示真实后继这一正样本，与奖励高低无关。状态加动作的表示 $\hat v^+=v+E_k^a(a)$ 应接近下一状态表示。原文最大化的目标为

$$
L_k=\log\sigma(v^\top v^+)
+\log\bigl(1-\sigma(v^\top v^-)\bigr)
-\lambda\|\hat v^+-v^+\|_2^2.
$$

前两项分别奖励真实转移两端的高内积、惩罚当前状态与随机负样本的高内积，可理解为正负样本的二分类对数似然。它们要求的是**相邻关系可区分**，不要求 $v$ 逐坐标拟合 $v^+$；向量未归一化时，提高内积甚至不保证欧氏距离减小。这里的 sigmoid 分数也不能直接解释为环境的真实转移概率。

第三项才是平方误差拟合：让 $v+E_k^a(a)\approx v^+$，即动作表示近似承担 $E_k^s(s')-E_k^s(s)$ 这一潜空间位移。例如暂固定 $v=(1,0)$、$v^+=(1,1)$，动作表示从 $(0,0.4)$ 改成 $(0,1)$，动态误差就从 0.36 降为 0，而两项对比得分不变。这是教学示例；实际训练中状态编码也会改变，不能仅凭公式假定右端被冻结。负样本提供区分状态的压力，动态项提供动作条件下的预测结构；只保留动态项会容许全部输出为零的退化解。

实验取 $\lambda=1$。若优化器最小化损失，应整体使用 $-L_k$；最大化这一写法本身不是创新。奖励没有进入此目标，原文也没有由它推出不确定性校准或最优采样定理。[P0，§3、附录 C](https://arxiv.org/html/2412.13106v2#A3)

**这个目标有哪些先例？** 利用 $1-\sigma(x)=\sigma(-x)$，前两项正是经典 sigmoid 负采样的结构，word2vec 的负采样目标已有此形式。[P8，§2.2、式 4](https://arxiv.org/html/1310.4546) 潜空间动态一致性也有前例：C-SWM 学习 $z+T(z,a)\approx z'$，并配合负样本 hinge 约束；其转移函数依赖状态和动作，而本文的 $E_k^a$ 只输入动作。[P9，§2.2](https://arxiv.org/html/1911.12247) ActiveRL 在公式附近没有给出这两项工作的直接引用，因此可以确认组成机制已有先例，却不能据此断言作者实际借鉴了哪篇论文，或完整组合是首次提出。本文把这一表征集成用于主动选择起点、动作与终止时机。

### 4.2 用分歧选择起点和动作

对状态或状态动作对 $x$，定义

$$
U(x)=\max_{i,j}\|E_i(x)-E_j(x)\|_2^2.
$$

它取集成中距离最大的一对表示，作为认知不确定性的代理。给定候选起点集合 $\mathcal C$，选择 $s_0=\arg\max_{s\in\mathcal C}U(s)$。主设置假定环境允许直接从选中的候选状态启动，例如模拟器通过设置状态完成重置；并非先让当前策略从默认起点一路走到那里。候选集合由采集环境提供，不意味着可以任意重置到整个连续状态空间。

在轨迹的每一步，令 $s$ 为智能体**当前实际所处的状态**，从当前策略附近产生 $M$ 个候选动作。随机策略可以直接采样；确定性策略则在输出上加高斯噪声。以概率 $\epsilon$ 执行 $U(s,a)$ 最大的候选动作，其余时候执行当前策略动作。下一状态由真实环境转移产生，无须每步先指定并抵达一个全局高不确定性状态。这里按正文和附录 C 的概率定义解释；附录伪代码的条件不等号与文字存在不一致。[P0，§3、附录 C](https://arxiv.org/html/2412.13106v2#S3)

**候选池很大时怎样计算？** 应区分完整状态池和每轮参与评分的子集。公开脚本默认 `candidate_size=20`、`selection_size=2`：从池中随机抽取 20 个状态，在主动不确定性分支按分数选出前 2 个。它实现的是子集内筛选，不是每轮遍历全池求全局最大值；这些只是可覆盖的代码默认值，不能认定为所有论文实验的实际配置。每个候选比较的是 5 个模型输出，无须对所有候选状态两两计算距离；不过全池阈值统计、可视化和随机排列仍有随池规模增长的开销。[候选参数](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/td3bc_active.py#L41-L45)、[筛选代码](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/utils_uncertainty.py#L328-L356)

候选覆盖同样重要。若关键区域只占大池的 1%，一次随机抽 20 个时至少命中一个的概率约为 $1-0.99^{20}\approx18.2\%$；未抽中就不会在本轮参与评分。公开 TD3+BC 入口先保留完整 D4RL 数据的状态作为池，再加载裁剪后的训练数据，说明“知道某个状态可作为起点”不等于“其转移已用于训练”。这是该入口的实现事实，不能扩展成所有任务的统一协议。池中完全没有的状态不能直接选作起点，但仍可能沿探索轨迹到达。[状态池构造](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/td3bc_active.py#L125-L132)

### 4.3 截断、更新，再采集

当当前状态的不确定性低于阈值，或者环境回合结束，就停止这条轨迹。积累一批转移后，把它们并入 $\mathcal D$，同时更新策略和表示集成，再开始下一批采集，直到用完预算。部署时使用更新后的任务策略；主动选点服务于训练数据获取。

若起点不能直接重置，论文另训练目标条件策略：先从默认起点前往靠近高不确定性候选点的区域，再切换到探索策略。离线状态被构造成距离加权图并聚类，帮助选择到达目标。这个扩展在 Maze2d 上评估，仍依赖旧数据足以训练出可靠的到达策略。[P0，§3、附录 D](https://arxiv.org/html/2412.13106v2#A4)

### 4.4 一个小迷宫例子

以下数值仅用于教学。旧数据覆盖走廊 A，B 位于覆盖边缘，B 后面的支路可能通向目标。剩余预算为 20 步。为简化，只展示两个模型：它们在 A 的表示是 $(1,0)$、$(1.1,0)$，故 $U(A)=0.01$；在 B 的表示是 $(0,0)$、$(2,0)$，故 $U(B)=4$。

1. 候选起点包含 A、B，于是选择 B，省掉反复经过 A 的采集。
2. 在 B，当前策略提出的候选动作包括回到熟悉走廊、转入未知支路，两者的 $U(s,a)$ 假设为 0.5 和 3。若这一步进入探索分支，就选择后者。
3. 机器人实际走出 6 步，得到一段包含新转移和奖励的轨迹；随后进入 $U(s)=0.02$ 的熟悉区域。若终止阈值为 0.05，就结束本段，剩余 14 步用于其他采集。
4. 新轨迹加入旧数据后，基础算法可以学习这条支路的价值，表示模型也获得了相关训练样本。若更新后 B 的分歧降低，下轮采集便可能转向别的缺口。

从起点到停止，$U$ 决定的是把交互花在哪里；新增奖励和转移最终通过基础离线算法改善任务策略。

## 5. 实验：哪些数据支持这条主线？

### 补数据能否改善策略？

Maze2d 删除了目标附近的轨迹；AntMaze 与 locomotion 仅保留原数据约 30% 的轨迹。三列都先离线训练，再新增交互并更新策略；AC 本身也会微调，FT 是普通采集微调这一对照设置的名字。

| 设置 | 新数据怎样收集 | 后续学习 |
| --- | --- | --- |
| Offline + FT | 从原任务初始状态分布出发，用学得的策略采集 | TD3+BC 逐步放松行为克隆约束；IQL/CQL 继续更新 |
| Offline + RND | 作者标为 RND 的蒸馏探索基线；具体配置披露不完整 | 新增经验用于继续训练 |
| Offline + AC | 主动选择高分歧起点，在策略候选中探索，低分歧时终止 | 合并新旧数据，更新策略与不确定性模型 |

标准 RND 固定一个随机目标网络，训练预测器拟合其输出，以预测误差作为探索奖励。[P2](https://arxiv.org/abs/1810.12894) 但本文 §5 把该基线描述为将离线学得的策略蒸馏到小网络集成中用于探索，与标准机制的表述不同；起点、终止和奖励混合等细节也未充分交代。因此可以解释 RND 的一般原理，但不能据名称补全本文配置，或认定三组除采集外的预算逐项完全匹配。附录明确 FT/AC 每轮收集 5,000 条转移，TD3+BC 更新 25,000 次、IQL 更新 50,000 次，没有同等细化 RND 设置。[P0，§5、附录 D](https://arxiv.org/html/2412.13106v2#S5)

以下是 Table 1 报告的代表性归一化回报，越高越好，分数可以超过 100；原文未明确除行为克隆外的检查点汇总规则，因此不将表值解释为最后一次评估的得分。

| 任务 | 新增交互预算 | 仅离线 | Offline + FT | Offline + RND | Offline + AC |
| --- | ---: | ---: | ---: | ---: | ---: |
| maze2d-large-easy-v1 | 80,000 步 | -2.0 | 21.7 | 10.2 | 197.3 |
| maze2d-large-hard-v1 | 80,000 步 | -2.0 | 6.0 | 1.0 | 201.7 |
| antmaze-umaze-diverse-v0 | 40,000 步 | 56.0 | 43.9 | 39.2 | 71.6 |
| halfcheetah-medium-v2 | 50,000 步 | 48.3 | 59.1 | 58.1 | 62.7 |

来源：[P0，Table 1、附录 D](https://arxiv.org/html/2412.13106v2#S4.T1)。预算由每批 5,000 步乘批次数得到；Maze2d/locomotion 使用 TD3+BC，AntMaze 使用 IQL。附录说明实验重复 5 个随机种子，图中阴影为标准差；此表未逐项列出标准差，论文也未明确每次评估的回合数。

最大的提升出现在刻意缺少关键区域数据的迷宫，这与补齐覆盖的动机相符。AntMaze 的普通微调甚至低于初始离线策略，说明增加交互数量本身不保证改善。主比较还同时包含起点访问能力的差异，结果反映的是整套采集方案。

### “最多节省 75%”究竟节省了什么？

Table 1 的最后一列统计：达到相应 FT 基线最佳表现时，AC 所需**额外交互量**的相对减少。maze2d-large-easy 是 75%，large-hard 是 62.5%，halfcheetah-medium 是 50%；walker2d-medium 则没有得出明确减少结论。它既不表示所有任务均节省 75%，也不包含前期离线数据成本或计算成本。[P0，§5、Table 1](https://arxiv.org/html/2412.13106v2#S5)

75% 应保留为作者的主表报告值：附录 Fig. 12 中 large-easy 的两根柱高约为 80 和 25，对应减少约 68.75%，与主表不一致；图注的批次单位也与附录训练设置不对应。现有材料无法消除这一差异。[P0，Fig. 12，PDF 第 19 页](https://arxiv.org/pdf/2412.13106v2#page=19)

### 改善主要来自起点，还是动作选择？

Table 2 分别改变起点与探索策略。I 表示保持原始起点，A 表示主动选起点；R 为随机动作，P 为离线策略动作，U 为不确定性动作选择。指标仍为归一化回报，越高越好。

| 起点与探索组合 | maze2d-large-easy | maze2d-large-hard |
| --- | ---: | ---: |
| I + R | 45.5 | 25.0 |
| I + P | 0.7 | 0.2 |
| I + U | 51.1 | -1.5 |
| A + R | 88.1 | 74.6 |
| A + P | 92.9 | 139.9 |
| A + U | 133.8 | 176.3 |

来源：[P0，Table 2](https://arxiv.org/html/2412.13106v2#S5.T2)。同样探索策略下，主动选起点的增益非常明显；A + U 在这两项任务中最好。但 large-hard 的 I + U 低于 I + R 与 I + P，表中均值并不支持“不确定性选动作单独使用总有益”。这是由数据得出的阅读结论；作者 §6 反而概括 U 无论起点如何都更好，且正文和附录没有针对该反例分析原因。附录关于随机探索在低维迷宫中有效的讨论也不是该行结果的归因。缺少逐项方差，不能进一步断言显著退化或已确定的失败机制。[P0，§6](https://arxiv.org/html/2412.13106v2#S6)

Table 2 的完整组合数值与主表不同，文中没有充分交代差异，因此只在各表内部比较。

固定起点的两阶段扩展也在三种 Maze2d 曲线中优于 FT，支持其在受限起点下仍有用途；覆盖范围尚限于这些迷宫。另一项从零在线学习的消融中，ActiveRL 每步更新 5 次，TD3 每步更新 1 次，结果混有计算量差异，不能单独证明采集策略的贡献。[P0，Fig. 4、附录 D](https://arxiv.org/html/2412.13106v2#S6.F4)

## 6. Take-aways

- **数据缺口的位置值得单独优化。** 当关键转移缺失时，定向补数据可能比继续强化已有行为更有效。
- **起点访问能力是采样效率的重要条件。** 讨论探索算法时，应同时说明它能从哪里开始，以及到达那里是否计入成本。
- **这套方法可与不同离线学习器组合。** 可迁移的思路是显式设计数据获取过程；具体分歧指标的可靠性仍需结合任务判断。

## 7. 比较脆弱的假设

**独立表征的距离能代表知识缺口。** 潜向量的每个坐标没有预先固定的物理含义，两个模型可能学会相同的转移关系，却采用不同的坐标约定。对单个模型的状态和动作表示同时施加坐标置换 $P$，有

$$
(Pv)^\top(Pv^+)=v^\top v^+,\qquad
\|P(\hat v^+-v^+)\|_2^2=\|\hat v^+-v^+\|_2^2.
$$

负样本内积同样不变，所以训练目标无法区分置换前后的模型。以下是一个构造的教学例子，B 把 A 的两个坐标统一交换：

| 表示或得分 | 模型 A | 模型 B |
| --- | --- | --- |
| 当前状态 $E^s(s)$ | $(1,0)$ | $(0,1)$ |
| 动作 $E^a(a)$ | $(1,1)$ | $(1,1)$ |
| 后继状态 $E^s(s')$ | $(2,1)$ | $(1,2)$ |
| 负样本 $E^s(s'')$ | $(-1,0)$ | $(0,-1)$ |
| 正样本内积 / 负样本内积 / 动态误差 | $2\;/\;-1\;/\;0$ | $2\;/\;-1\;/\;0$ |

两者的目标值完全相同，但同一状态的跨模型距离平方为 $\|(1,0)-(0,1)\|^2=2$。因此，模型内部学到一致的动态关系，不足以保证模型之间逐坐标可比；论文也没有给出显式的跨模型坐标对齐机制。若所有模型共同应用同一个置换，跨模型距离仍不变，问题来自各模型独立的坐标自由度。[P0，§3](https://arxiv.org/html/2412.13106v2#S3)；相关不变性背景见 [P4，§2.2](https://proceedings.mlr.press/v97/kornblith19a/kornblith19a.pdf)。

这个构造只说明大分歧可能混入表示方式差异，尚未证明实际训练一定产生这种歧义，更未证明它主导采集排序或使实验失效。还要区分论文与代码：当前官方实现以真实状态增量 $s'-s$ 监督输出，输出坐标已由环境固定，这个潜空间置换论证不能直接套在该实现上。它们应作为两个版本分别判断。

**陌生经验对任务有用。** 表示目标没有使用奖励来区分重要缺口和无关变化，最大的分歧也容易受个别模型影响。若高分歧来自无关区域，预算可能被引离任务；若未知支路要先经过熟悉区域，过早终止还可能阻止抵达它。迷宫实验把缺失区域放在目标附近，使这一假设较容易成立。

**到达与重置足够便宜。** 主方案允许从候选状态启动，预算按新增转移计数。实际机器人可能需要很长的到达过程或人工重置；两阶段扩展只能部分缓解这个问题。因此，交互步数上的优势能否转成真实采集时间优势，仍依赖访问条件。[P0，§2–3、附录 D](https://arxiv.org/html/2412.13106v2#A4)

## 8. Follow-up：让采集收益与真实成本相匹配

值得继续研究的是：**在到达、重置和继续执行都有成本时，联合决定下一条轨迹从哪里开始、怎样走、何时结束，以提升单位采集成本带来的策略改善。** 这样可以处理一个最大分歧规则忽略的情形：较近、分歧中等的区域，可能比很远、分歧最大的区域更值得采集。

截至本次检索，2026 年的 *Sample Efficient Active Algorithms for Offline Reinforcement Learning* 已用高斯过程价值不确定性提出主动采集与条件性理论分析；*Information-Directed Offline-to-Online Reinforcement Learning* 已研究即时损失和剩余信息增益的权衡；*Active Offline-to-Online Reinforcement Learning* 则把预算分配给不同候选策略的微调过程。因此，单纯引入价值不确定性、信息收益或预算分配已有直接重叠。[P5](https://arxiv.org/html/2602.01260v1)、[P6](https://arxiv.org/html/2605.29405v1)、[P7](https://arxiv.org/html/2607.11720v1)

这里尚待检验的区别，是把访问成本和轨迹终止纳入同一个采集决策。一个可区分的预测是：当重置成本升高时，合理的采集器应更愿意继续当前轨迹，并减少跨区域切换。这是候选研究问题，现有检索不能保证其独创性。

## 参考来源

- **P0** — Ambedkar Dukkipati、Ranga Shaarad Ayyagari、Bodhisattwa Dasgupta、Parag Dutta、Prabhas Reddy Onteru. *Active Reinforcement Learning Strategies for Offline Policy Improvement*. arXiv v2, 2024；AAAI, 2025。[所读全文](https://arxiv.org/html/2412.13106v2)；[正式发表记录](https://ojs.aaai.org/index.php/AAAI/article/view/33803)。
- **P1** — Ilya Kostrikov、Ashvin Nair、Sergey Levine. *Offline Reinforcement Learning with Implicit Q-Learning*. arXiv, 2021；ICLR, 2022。[原始记录](https://arxiv.org/abs/2110.06169)。用于解释数据内价值学习和在线微调背景。
- **P2** — Yuri Burda、Harrison Edwards、Amos Storkey、Oleg Klimov. *Exploration by Random Network Distillation*. arXiv, 2018；ICLR, 2019。[原始记录](https://arxiv.org/abs/1810.12894)。用于解释陌生度驱动探索。
- **P3** — Dong Yin、Sridhar Thiagarajan、Nevena Lazic、Nived Rajaraman、Botao Hao、Csaba Szepesvari. *Sample Efficient Deep Reinforcement Learning via Local Planning*. 2023。[原始记录](https://arxiv.org/abs/2301.12579)。用于解释高不确定性状态重置。
- **P4** — Simon Kornblith、Mohammad Norouzi、Honglak Lee、Geoffrey Hinton. *Similarity of Neural Network Representations Revisited*. ICML, 2019。[出版方页面](https://proceedings.mlr.press/v97/kornblith19a.html)。用于跨模型表征比较背景；本文的坐标置换分析来自 P0 的公式。
- **P5** — Soumyadeep Roy、Shashwat Kushwaha、Ambedkar Dukkipati. *Sample Efficient Active Algorithms for Offline Reinforcement Learning*. arXiv, 2026-02-01。[全文](https://arxiv.org/html/2602.01260v1)。核查价值 GP、不确定性采集及理论条件；其分析不等同于证明 P0 的神经表征版本。
- **P6** — Keru Chen. *Information-Directed Offline-to-Online Reinforcement Learning*. arXiv, 2026-05-28。[全文](https://arxiv.org/html/2605.29405v1)。核查剩余信息、遗憾与采集权衡。
- **P7** — Alper Kamil Bozkurt、Shangtong Zhang、Yuichi Motai. *Active Offline-to-Online Reinforcement Learning*. arXiv, 2026-07-13。[全文](https://arxiv.org/html/2607.11720v1)。核查候选策略之间的微调预算分配。
- **P8** — Tomas Mikolov、Ilya Sutskever、Kai Chen、Greg S. Corrado、Jeff Dean. *Distributed Representations of Words and Phrases and their Compositionality*. NeurIPS, 2013。[全文](https://arxiv.org/html/1310.4546)。用于 sigmoid 负采样目标的早期先例，不代表 ActiveRL 明确引用该工作。
- **P9** — Thomas Kipf、Elise van der Pol、Max Welling. *Contrastive Learning of Structured World Models*. arXiv, 2019；ICLR, 2020。[全文](https://arxiv.org/html/1911.12247)。用于潜空间动态一致性与对比约束的先例，具体损失和转移模型与 ActiveRL 不同。
- **官方实现核对** — 仓库提交 `cb367f31da874b50388faa930af09587d3a93887`：[模型结构](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/utils_uncertainty.py#L4-L26)、[状态增量监督与均方误差](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/utils_uncertainty.py#L56-L76)、[最大欧氏距离](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/utils_uncertainty.py#L101-L115)。代码拼接状态和动作分支，预测 $s'-s$，分歧没有平方；这些均与 v2 表述有差异。本次只核读实现，未运行训练。
