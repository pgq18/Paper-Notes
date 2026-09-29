---
type: "paper"
title: "Reinforcement Learning for Real-Time Vision-Language-Action Policies"
shortTitle: "Real-Time EXPO-FT"
year: 2026
date: "2026-09-29"
category: "rl-post-training"
tags: ["vision-language-action", "reinforcement-learning", "real-time-control", "action-chunking", "residual-policy"]
authors: ["Perry Dong", "Kuo-Han Hung", "Dorsa Sadigh", "Chelsea Finn"]
paper: "https://arxiv.org/abs/2609.18207"
code: "https://github.com/pd-perry/expo-ft"
project: "https://pd-perry.github.io/real-time-expo-ft/"
venueType: "preprint"
publicationStatus: "preprint"
firstPublished: "2026-09-16"
publicationSources: ["https://arxiv.org/abs/2609.18207", "https://pd-perry.github.io/index.html"]
summary: "用延迟感知的 VLA 提前生成动作候选，再在执行边界依据最新观测进行强化学习驱动的快速修正与价值筛选，提高动态任务中的成功率。"
status: "read"
---

# Real-Time EXPO-FT：让强化学习用上动作执行前的新信息

VLA 生成一段动作需要时间，机器人真正执行时，物体可能已经移动。本文让大模型在后台提前提出动作方案，把执行前的最后一次决策交给轻量网络：根据最新观测修正候选动作，再用学到的价值函数选择更可能成功的方案。这样，VLA 提供已有行为能力，强化学习利用新信息提高动作的适时性，并把成功经验反馈给基础策略。[P0](https://arxiv.org/html/2609.18207v1)

## 论文来源

| 项目 | 信息与来源 |
| --- | --- |
| 作者 | Perry Dong、Kuo-Han Hung（共同一作）、Dorsa Sadigh、Chelsea Finn；Stanford University |
| 发表场所与状态 | arXiv 预印本；[作者主页](https://pd-perry.github.io/index.html)也标为预印本，截至本次检索未核实到正式会议或期刊版本 |
| 最早可核实公开时间 | 2026-09-16，见 [arXiv v1 记录](https://arxiv.org/abs/2609.18207) |
| 正式发表时间 | 尚未核实 |
| 所读版本 | arXiv:2609.18207v1；[HTML 全文](https://arxiv.org/html/2609.18207v1)及 [17 页 PDF](https://arxiv.org/pdf/2609.18207v1)，包含附录 |
| 官方代码 | [pd-perry/expo-ft](https://github.com/pd-perry/expo-ft)，由项目页链接；README 明确同时支持 EXPO-FT 与 Real-Time EXPO-FT，包含学习器和实时控制流程 |
| 项目主页 | [Real-Time EXPO-FT](https://pd-perry.github.io/real-time-expo-ft/)，标题、作者及论文链接对应 |

思路重建以 2026-09-16 为历史边界；相关与后续工作检索截至 2026-09-29。已核对正文、附录、关键图表及部分官方实现；没有执行训练。正文公式存在时间参数化和块级折扣记号差异，下文按机制及实现解释。

## 1. 研究问题、背景与价值

考虑在转盘上抓取一个小方块。相机看到它的位置后，VLA 还要处理图像、语言和动作去噪。等夹爪开始闭合，方块可能已经离开。提高静态抓取精度无法直接消除这种由信息过时引起的失败。

本文关心的是：**已有一个具备任务能力的 VLA，怎样在推理延迟真实存在的条件下，用少量在线交互进一步提高成功率？** 这里既要连续执行动作，也要让在线学习改善执行时真正需要的决策。研究范围是十个动态控制仿真环境和四个任务专门微调的真机策略，未测试一个策略在四个任务间统一泛化。[P0，§IV–V](https://arxiv.org/html/2609.18207v1#S4)

## 2. 从前人工作，怎样走到这个 idea

动作分块一次预测未来多步，能摊薄大模型推理成本。代价是两次生成之间需要执行已经确定的动作，环境却仍在变化。Training-Time RTC 给出了一条有效路径：把推理期间必然执行的动作作为干净前缀，让模型学习接在这段前缀后面继续行动。前缀使新旧动作连贯，也让机器人在计算期间保持运动。[P1](https://arxiv.org/html/2512.05964v1)

但前缀只告诉模型机器人将做什么。球受到随机扰动、另一只机械臂突然改向等变化，在启动推理时还没有发生。只靠提前预测，无法使用这些后来才到达的信息。由此得到一个设计要求：**必须有一部分决策在昂贵生成完成后进行，并且能读取执行前的新观测。**

EXPO 恰好已有可用于这一位置的机制。它用生成式策略提供候选动作，再由小型高斯策略输出有界修正，通过价值函数学习怎样把候选推向高回报区域；随后在原始和修正候选中选优。大模型保留监督学习目标，价值梯度主要作用于小型编辑策略。这种分工让局部改进不必等待一次完整的大模型更新或重新生成。EXPO-FT 又把这一机制接到了 VLA 动作块和机器人在线学习上。[P2，§4](https://arxiv.org/html/2507.07986v1#S4)；[P3，§4](https://arxiv.org/html/2605.25477v1#S4)

于是可以提出本文的候选想法：RTC 负责在旧观测和已承诺动作下生成连贯的候选，EXPO 的编辑与选优则延后到新观测到达之后；训练也按照这个时间关系构造数据和下一步价值目标。两部分的衔接分别处理了动作连续性与信息过时。

这条技术路线已有重要近邻。A2C2 在 2025 年就通过示范残差监督，学习每个控制步的最新观测修正。2026-08-24 公开的 ARLI 则直接研究延迟下的 VLA 强化学习，在视觉语言编码结束后、动作去噪前，用中途新观测和已承诺动作引导噪声。本文更具体的特点是：**在候选动作已经生成后，进行由 RL 学到的动作空间编辑和 Q 选择。** 这些联系解释了设计的可行性，不代表作者私下的思考顺序，也不能据此声称本文首次提出快慢控制或延迟下 RL。[P4，§3](https://arxiv.org/html/2509.23224v1#S3)；[P5，§4.1](https://arxiv.org/html/2608.23831v1#S4.SS1)

## 3. 核心 intuition

大模型提出的动作可以作为一个有用的起点，是否继续采用它，要由更新的信息决定。编辑器只需修正短时间内出现的偏差，价值函数则允许保留原方案或换用另一候选。收益依赖于候选仍覆盖可行行为，以及小网络能根据新观测识别、纠正关键偏差。

## 4. 方法与一个简单例子

### 4.1 推理：提前生成，在执行边界编辑

记 $H$ 为生成长度，$C$ 为每次实际执行长度，$d$ 为推理延迟对应的控制步数。真机使用 $H=16$、$C=8$；动态抓取取 $d=3$，其余任务取 $d=5$。当当前动作队列还剩 $d$ 步时启动下一次推理。

1. **固定已承诺前缀。** VLA 接收旧观测 $s_t$ 和未来 $d$ 步必然执行的动作，用不同噪声生成 $N$ 个候选。前缀在生成时保持不变，保留候选的 $[d,d+C)$ 部分，准备在 $t+d$ 开始执行。
2. **读取新观测并编辑。** 到达 $t+d$，编辑策略接收 $s_{t+d}$ 和候选 $A^i$，输出受幅度约束的修正 $\Delta A^i$，得到 $\widetilde A^i=A^i+\Delta A^i$。
3. **按当前价值选优。** 价值函数预测从当前状态执行一整块动作后的回报，在原始候选与编辑候选中选择：

$$
A^*=\arg\max_{A\in\bigcup_{i=1}^{N}\{A^i,\widetilde A^i\}}Q(s_{t+d},A).
$$

真机每次有 32 个基础候选和 32 个编辑候选，共比较 64 个方案。编辑器与 critic 共用轻量视觉特征；Q 使用集成网络以减轻过高估值。编辑幅度约束意味着它偏向局部修正，保留原始候选也给系统留下不采用某次修正的选项。[P0，式(4)–(6)、附录§VII-E2](https://arxiv.org/html/2609.18207v1#S4.SS2)

这里要区分两个频率：机器人以 **30 Hz 执行动作**，编辑和选优发生在每个 **8 步动作块的边界**。按此设置计算，名义新决策频率为 $30/8=3.75$ Hz，块内仍连续执行已选动作，不能理解成每隔 33 毫秒都重新看图修正。

### 4.2 训练：三个组件各自学什么

在线阶段，**动作残差策略、Q 和基础 VLA 都继续学习**，各自使用不同的损失。编辑器通过 RL 改善当前动作，基础 VLA 通过监督学习吸收在线经验，两条学习路径共同保留。

**VLA 学习生成连贯、成功的动作。** 先用任务示范做带前缀条件的监督微调，初始化到能够偶尔完成任务的水平。训练输入的前缀保持干净，只对后缀加噪声并计算 flow-matching 损失。真机在线阶段继续用示范和成功轨迹更新基础 VLA；仿真则使用全部在线轨迹。真机 VLA 的更新包括语言模型 LoRA、视觉编码器等可训练参数；语言模型的非 LoRA 权重保持冻结，因此这里的在线微调不等于全参数更新。Q 梯度无需穿过整条动作生成链。[P0，§IV-C、附录§VII-C2及§VII-E](https://arxiv.org/html/2609.18207v1#S4.SS3)

**编辑器学习提高回报的局部改动。** 它优化的目标可写成：

$$
\max_\theta\;\mathbb E\left[Q_\phi(s,A+\Delta A)-\alpha\log\pi_\theta^{\rm edit}(\Delta A\mid s,A)\right].
$$

第一项鼓励更高价值，第二项通过熵保留探索。监督学习教 VLA 复现已有好行为，RL 则依据成功奖励学习哪些修正更好。[P0，式(8)](https://arxiv.org/html/2609.18207v1#S4.SS2)

**Q 学习执行整个动作块的后果。** 为说清时间尺度，用 $R_t^{(C)}=\sum_{j=0}^{C-1}\gamma^j r_{t+j}$ 表示块内折扣奖励之和，$z$ 表示该块是否终止。按实现展开的块级目标为：

$$
y_t=R_t^{(C)}+\gamma^C(1-z)Q_{\phi'}(s_{t+C},A^*_{t+C}),\qquad
\mathcal L_Q=\mathbb E[(Q_\phi(s_t,A_t)-y_t)^2].
$$

这里把每个控制步的折扣明确累计到 $C$ 步；正文式(9)简写为 $r_t+\gamma Q$，附录和实现采用块级折扣。构造下一块候选时也要复现“旧观测生成、新观测编辑”的顺序，避免训练目标假装大模型可以瞬间得到未来信息。[块级 TD 实现](https://github.com/pd-perry/expo-ft/blob/803381fc3b4c91a0c47904f1b688fc5e35904f50/expo_ft/agents/alg/realtime_expo_ft.py#L1067)；[回放奖励聚合](https://github.com/pd-perry/expo-ft/blob/803381fc3b4c91a0c47904f1b688fc5e35904f50/expo_ft/data/replay_buffer.py#L520)

每次 Q 更新都完整去噪 32 个候选很贵。作者借鉴 FASTER 的价值过滤思想，先用另一个小型价值网络给 32 份噪声打分，只将胜出的一份送入 VLA，再比较该动作和一次编辑。这个网络回归动作 critic 给出的价值，因此是在学习便宜的候选筛选。它用于**训练时的 Bellman 目标构造（backup）**，减少每次 Q 更新所需的完整去噪次数；部署时仍生成 32 个基础候选，随后用最新观测编辑与选优。[P0，式(10)–(11)、附录§VII-E2](https://arxiv.org/html/2609.18207v1#S4.SS2)；[P6](https://arxiv.org/abs/2604.19730)

### 4.3 一个转盘抓取的教学例子

下面用简化的时序演示，动作和候选内容均为教学设定，并非论文日志。沿用抓取任务的 $d=3,C=8,H=16$，省略首次启动过程。

| 时刻 | 发生的事情 |
| --- | --- |
| 第 0 步 | 夹爪继续执行队列里剩下的第 0–2 步；VLA 看见方块在转盘左侧，并以这 3 步为固定前缀，生成朝不同拦截点移动的候选 |
| 第 3 步 | 候选可用；新图像显示方块比旧计划预计的位置更靠右。编辑器修改候选的平移和夹爪动作，Q 在原始与修正方案中选出一段第 3–10 步动作 |
| 第 8 步 | 当前块还剩第 8–10 步，下一次 VLA 推理启动；机器人继续执行这 3 步，下一批候选在第 11 步接受新观测修正 |

关键变化发生在第 3 步：生成模型无需重跑，选中的抓取方案已经用上了推理期间才出现的位置信息。若方块在第 4 步又突然被碰走，这个实现仍要等后续决策边界才能再次修正，这也说明固定执行长度带来的限制。

## 5. 实验：问题、关键数据与结论

### 5.1 在真机上，比 EXPO-FT＋RTC 多改善了多少？

基础模型为 $\pi_{0.5}$，按任务做监督微调后进行在线 RL。每个方法、每个任务评测 30 次；训练在某策略达到 30/30 或累计 10 分钟在线交互时停止。下表从完整基线中保留基础策略、带 RTC 的基线及本文。成功数越高越好。

| 任务 | SFT | SFT＋RTC | DSRL＋RTC | EXPO-FT＋RTC | Real-Time EXPO-FT |
| --- | ---: | ---: | ---: | ---: | ---: |
| 动态抓取 | 19/30 | 22/30 | 25/30 | 24/30 | **30/30** |
| 托盘平衡球 | 8/30 | 12/30 | 15/30 | 23/30 | **28/30** |
| 机械臂传物 | 10/30 | 22/30 | 23/30 | 27/30 | **30/30** |
| 躲避守门员射门 | 13/30 | 16/30 | 17/30 | 26/30 | **28/30** |
| 四任务合计 | 50/120 | 72/120 | 80/120 | 100/120 | **116/120** |
| 等权平均成功率 | 41.7% | 60.0% | 66.7% | 83.3% | **96.7%** |

来源：[P0，Table I](https://arxiv.org/html/2609.18207v1#S5.T1)。合计与百分比按表中成功次数计算；四行对应不同任务策略。原文未报告真机多训练种子的均值或误差区间。

相较最接近的 EXPO-FT＋RTC，提升为 **13.3 个百分点，120 次评测多成功 16 次**；仅把 SFT 的 41.7% 与最终结果比较，会掩盖已有 RL 与 RTC 已贡献的收益。平衡球的 23/30→28/30 与最新观测修正对动态扰动有用的解释相符，但没有将编辑、Q 选优及额外状态特征的贡献逐项完全拆开。

EXPO-FT＋RTC 本身已有动作编辑器、Q 选优和基础 VLA 微调。附录说明其学习器结构、候选数及优化等设置与本文匹配，RTC 使用相同延迟；本文强调的变化，是把快速编辑和选择安排在执行边界，读取比 VLA 生成时更新的观测。不过，论文和已检查的公开实现尚未完整给出该实验基线的编辑时刻、观测时间戳和运行配置。因此，这组结果支持整个实时方案的收益，对“仅改变编辑输入的新旧就带来全部提升”的归因仍需更明确的基线配置。[P0，附录§VII-F](https://arxiv.org/html/2609.18207v1#Sx1.SS6)

延迟设置也影响比较含义：本机 VLA 约需 67 ms；除动态抓取外，另加 100 ms，模拟更慢硬件。异步设置用 $d=3$ 或 $5$ 个控制步表示；$d=3$ 在 30 Hz 下约为 100 ms，和原生 67 ms 不能当作精确相同的延迟。**10 分钟是在线机器人交互预算**，不含示范、预训练、监督微调及全部更新和复位耗时；在线轨迹没有人工接管纠错，但部分复位和独立成功核验仍由人完成。[P0，§V-C、§VI、附录§VII-E3](https://arxiv.org/html/2609.18207v1#S5.SS3)

### 5.2 仿真是否支持在多种动态任务中有效？

Kinetix 实验使用符号状态和预训练 flow policy，**没有 VLA 或图像输入**。每个 RL 设置在线训练 10 万环境步，按 4 个随机种子、每种子每任务 100 次评测汇总。下表为十任务平均成功率；BC/RTC 参考策略每任务评测 512 次。

十个任务为 Car Launch、Cartpole Thrust、Catapult、Catcher、Unicycle、Hard Lunar Lander、Half-Cheetah、Trampoline、Chain Lander 和 Grasp，覆盖发射、平衡、接取、运动与抓取等动态控制。配置为 $H=8,C=4,d=4$，环境执行动作另加入标准差 0.1 的高斯噪声。[P0，Table II、附录§VII-B/C](https://arxiv.org/html/2609.18207v1#Sx1.SS2)

| 方法 | 基础策略推理延迟 | 平均成功率 ↑ |
| --- | ---: | ---: |
| BC 参考 | 0 步 | 90.7% |
| RLPD | 0 步 | 81.4% |
| RTC，无在线 RL | 4 步 | 80.0% |
| DSRL＋RTC | 4 步 | 76.1% |
| EXPO-FT＋RTC | 4 步 | 81.7% |
| Real-Time EXPO-FT | 4 步；编辑器按零额外延迟建模 | **96.2%** |

来源：[P0，Table II、附录§VII-B/C](https://arxiv.org/html/2609.18207v1#Sx1.SS2)。延迟为 4 的策略每 4 步重规划。不同延迟的行用于展示参照范围。

这里的延迟是仿真中人为设置的基础策略延迟，编辑计算按零额外延迟处理，因而实验检验的是这种算法分工在动态控制中的作用，不能直接给出真实 VLA 的端到端时延表现。RLPD 使用结合示范训练的高斯策略，也与本文的预训练生成式策略不同；其零延迟结果应作为另一种方法的参照。[P0，§V-B、附录§VII-B/C](https://arxiv.org/html/2609.18207v1#S5.SS2)

结果支持本文在这些动态控制环境中有较强的平均表现，比 EXPO-FT＋RTC 高 14.5 个百分点。但摘要的“10/10 最好”不能按数值第一理解：Cartpole 为 98%，另一 RL 基线为 99%；Hard Lunar Lander 为 94% 对 95%；Chain Lander 为 92% 对 96%。按表中报告值，本文在 **7/10 个任务最高或并列最高**；十个任务均进入最佳 RL 结果的 95% 范围，这才与表中全部加粗的规则一致。

### 5.3 延迟与候选筛选消融说明了什么？

Unicycle 的延迟消融将基础推理延迟从 0 增至 4 步，并在每个延迟设置下分别训练策略。本文方法的曲线保持较高成功率，RTC 随延迟增加下降；这支持匹配延迟训练后的鲁棒性，不能解释成同一个已训练策略直接适应任意延迟。[P0，Fig.6、附录§VII-A](https://arxiv.org/html/2609.18207v1#Sx1.SS1)

附录在 Car Launch、Catcher、Half-Cheetah 和 Grasp 四个仿真任务上以训练计算量为横轴，对比是否使用噪声层过滤。同等计算量下，过滤版本的学习曲线通常更靠前：它让每次 backup 可以考虑 32 个噪声候选，却只完整去噪 1 个。这个证据支持降低目标构造开销，图中没有足够精确的汇总数据可得出统一加速倍数，也不能把它解释成部署推理快了 32 倍。[P0，Fig.7、附录§VII-A](https://arxiv.org/html/2609.18207v1#Sx1.SS1)

## 6. Take-aways

- **信息到达的时刻值得作为策略设计变量。** 候选生成可以提前，最终选择越接近执行时刻，越有机会利用无法提前预测的变化。
- **表达能力和局部在线优化可以由不同组件承担。** 大模型提供好的搜索起点，小型编辑器与价值函数利用有限交互学习局部改进。
- **样本效率需要连同前置条件阅读。** 本文展示了任务示范、可用初始策略和成功检测器已经准备好时，少量在线数据带来的收益。

## 7. 比较脆弱的假设

**局部修正需要仍然可行的候选。** 编辑受幅度限制，每块执行 8 步；若物体突然换到另一侧，或碰撞使原动作序列失效，所有候选都可能超出可修复范围。Q 选优只能在已有候选中决策，无法凭空生成缺失的动作模式。

**最新观测需要包含决定动态变化的信息。** 平衡球任务额外提供球的位置、速度和托盘中心，射门任务提供守门员的位置、速度，供 critic、噪声过滤器和编辑器使用；平衡球还使用三帧外部相机图像。这些信息由任务检测流程提取，对快速反应很有帮助，也使结果依赖相应感知条件。原文明确给部分基线 critic 同样的附加状态，但未完整说明所有 actor 的输入对等性。[P0，附录§VII-D3/D4](https://arxiv.org/html/2609.18207v1#Sx1.SS4)

**读到新状态不自动消除全部历史依赖。** 本文称编辑后策略保持马尔可夫性，但候选仍由旧观测和承诺动作生成；同一当前观测，可能对应不同队列和候选。严格建模通常需要把相关队列或历史摘要纳入状态，本文没有给出仅靠最新观测编辑即可恢复马尔可夫性的完整证明。更稳妥的理解是，它在最终决策中补回了关键的新信息，并取得经验上的提升。ARLI 对已承诺动作进行状态增广，提供了值得对照的处理方式。[P0，式(8)之后](https://arxiv.org/html/2609.18207v1#S4.SS2)；[P5，§4.1](https://arxiv.org/html/2608.23831v1#S4.SS1)

## 8. Follow-up：新信息应该在生成的哪一阶段介入？

一个值得研究的问题是：**给定新观测的到达时刻和动作执行期限，何时应引导尚未去噪的候选，何时还值得修正已生成的动作？** ARLI 已在去噪前使用中途新观测，RFS 已联合优化噪声与动作残差。进一步研究需要厘清两次信息到达、剩余计算时间和晚期可修正范围之间的关系，简单组合两种操作已有直接前例。[P5](https://arxiv.org/html/2608.23831v1#S4.SS1)；[P7，§4.1.2](https://arxiv.org/html/2602.01789v1#S4.SS1.SSS2)

本文没有与 ARLI、A2C2 做同协议对比，也未验证上述信息时序问题。更广的文献关系与研究边界见[两阶段新观测引导的独立主题调研](/research/real-time-control/two-observation-steering-2026)。

## 参考来源

- **P0** — Perry Dong, Kuo-Han Hung, Dorsa Sadigh, Chelsea Finn. *Reinforcement Learning for Real-Time Vision-Language-Action Policies*. arXiv:2609.18207v1，2026-09-16。[全文](https://arxiv.org/html/2609.18207v1)；[官方实现](https://github.com/pd-perry/expo-ft)。
- **P1** — Kevin Black, Allen Z. Ren, Michael Equi, Sergey Levine. *Training-Time Action Conditioning for Efficient Real-Time Chunking*. arXiv:2512.05964v1，2025-12-05。[论文](https://arxiv.org/html/2512.05964v1)。
- **P2** — Perry Dong, Qiyang Li, Dorsa Sadigh, Chelsea Finn. *EXPO: Stable Reinforcement Learning with Expressive Policies*. arXiv:2507.07986v1，2025-07-10。[论文](https://arxiv.org/html/2507.07986v1)。
- **P3** — Perry Dong, Kuo-Han Hung, Tong Gao, Dorsa Sadigh, Chelsea Finn. *EXPO-FT: Sample-Efficient Reinforcement Learning Finetuning for Vision-Language-Action Models*. arXiv:2605.25477v1，2026-05-25。[论文](https://arxiv.org/html/2605.25477v1)。
- **P4** — Kohei Sendai, Maxime Alvarez, Tatsuya Matsushima, Yutaka Matsuo, Yusuke Iwasawa. *Leave No Observation Behind: Real-time Correction for VLA Action Chunks*. arXiv:2509.23224v1，2025-09-27。[论文](https://arxiv.org/html/2509.23224v1)。
- **P5** — Brian Zhu, Momen Khalil, E Harrison 等. *Learning to Act While Waiting: RL Finetuning of Generalist Robot Policies Under Inference Latency*（ARLI）. arXiv:2608.23831v1，2026-08-24。[论文与作者记录](https://arxiv.org/abs/2608.23831)；[方法](https://arxiv.org/html/2608.23831v1#S4.SS1)。
- **P6** — Perry Dong, Alex Swerdlow, Dorsa Sadigh, Chelsea Finn. *FASTER: Value-Guided Sampling for Fast RL*. arXiv:2604.19730，2026-04-21。[论文](https://arxiv.org/abs/2604.19730)。
- **P7** — Entong Su, Tyler Westenbroek, Anusha Nagabandi, Abhishek Gupta. *RFS: Reinforcement Learning with Residual Flow Steering for Dexterous Manipulation*. arXiv:2602.01789v1，2026-02-02。[论文](https://arxiv.org/html/2602.01789v1)。
