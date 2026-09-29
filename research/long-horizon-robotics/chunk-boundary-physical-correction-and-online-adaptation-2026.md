---
type: research
title: "Chunked Policy 的块间物理纠正与在线适配：残差、恢复和控制权切换调研"
shortTitle: "Chunked Policy 的块间纠正与在线适配"
year: 2026
date: "2026-09-29"
category: "long-horizon-robotics"
tags: ["robotics", "action-chunking", "online-rl", "residual-rl", "recovery", "policy-switching", "adaptation"]
summary: "比较块间物理纠正、动作残差、恢复与持续控制权切换，梳理 RecoveryChaining 等近邻、训练价值差异及在线适配的证据边界。"
---

# Chunked Policy 的块间物理纠正与在线适配：残差、恢复和控制权切换调研

检索与核验截至 2026-09-29。研究范围包括 chunked imitation/VLA policy、residual RL、物理恢复、持续控制权切换、混合技能与原子动作、输入及潜空间适配、执行长度和异步推理。机制判断依据论文方法章节、算法、正式论文集与作者项目；形式化归纳和研究问题单独标为分析。未做代码复现。

## 1. 核心结论

**“固定策略执行一段、独立 RL 策略进行物理纠正、交回固定策略，并在任务中反复发生”已有明确先例。** RouteRLT 最接近现代 chunked VLA 的执行系统；ASC 覆盖固定技能与独立纠正器的持续协作；MAPLE、Relative VIC 覆盖时间扩展技能与短原始动作的混合；IBRL 明确把未来再次选择 IL/RL 的机会写入价值备份。持续交替、非加性动作、纠正后交回控制，以及考虑未来再次干预，均不能单独作为新概念。

在已核查文献中，尚未确认一篇同时满足以下完整组合：

1. 基础策略是冻结的 chunked policy。
2. 只在其实际执行段结束后允许介入。
3. 纠正器执行有幅度与时间限制的独立物理动作，随后必须交回基础策略。
4. 根据纠正后的真实完整观测重新生成下一块。
5. 纠正器在目标真机环境中通过在线 RL 学习，价值目标覆盖后续反复纠正与基础策略共同执行的回报。

这只是检索范围内的未确认结果，不是“没有相关工作”的证明。更具体的研究问题是：**块间介入与短暂接管这两种限制，能否成为有效的在线适配约束；其收益是否来自改变下一次推理的物理起点，而不是额外执行一个有用动作、增加反馈频率或提供稳定时间。**

最相关的文献分为五组：

| 文献组 | 代表工作 | 已覆盖的关键机制 |
|---|---|---|
| 持续切换与混合控制 | RouteRLT、ASC、IBRL、PEX、MAPLE、Relative VIC、SkillS、DUGM-R、EMS | 固定模块与可学习行为反复配合；部分方法明确学习未来继续切换的价值 |
| 物理恢复后恢复主策略 | AFI、Rewind-IL、RecoveryChaining、Bridge Policy Learning、MetaReSkill | 真实动作改变状态，再重新启用 VLA、技能或规划器 |
| 动作残差与局部在线优化 | ResiP、ResFiT、Policy Decorator、BORA、BEE、ForceRFT、Real-Time EXPO-FT、PARTS | 每步或整块修改基础动作；边界决策不必包含独立物理修正 |
| 输入与生成条件适配 | DSRL、ZPRL、FutureRTC、VLASH | 在动作生成前改变 noise、latent 或预测观测，但不先移动真实机器人 |
| 执行与推理调度 | EQRL、DEHP、BCP、RTC、Q-chunking | 查询粒度 RL、执行长度、异步衔接与宏步价值学习 |

## 2. 问题定义：物理状态、模型输入与执行时钟

### 2.1 三种“修正”不能混用

设真实环境状态为 $x$，观测为 $o=(I,p,\ldots)$，其中 $p$ 为 proprioception。

| 修正对象 | 典型形式 | 是否先改变机器人真实状态 | 下一次基础推理的含义 |
|---|---|---|---|
| 动作输出 | $a_t=a_t^B+\Delta a_t$，或 $A_k=A_k^B+\Delta A_k$ | 修正与基础动作合成为同一执行命令 | 通常先有基础输出，再编辑或叠加 |
| 模型输入或内部条件 | $\tilde p=p+\Delta p$，或调整 embedding、latent、noise | 没有独立前置运动 | 改变生成条件；可能是校准、预测补偿或 steering |
| 真实物理状态 | 执行短动作得到 $x'$，重新采集 $o'=O(x')$ | 是 | 基础策略从新的真实起点生成后续动作 |

物理修正不只是“微调 proprio 数值”。它还可能改变物体位姿、接触、受力、遮挡和相机视角。除非传感通道消融支持专门归因，否则应称为**物理起始状态或观测分布修正**。只改 proprio tensor 属于另一条路线，也可能制造与当前图像不一致的条件输入。

基础策略预测长度为 $H$ 的 chunk，实际可能只执行前 $h\le H$ 步。因此，块间应定义为**实际执行段的边界**。如果研究要求完整执行所有预测动作，应另外明确 $h=H$，而不能把预测长度与执行长度默认等同。[Diffusion Policy 官方说明](https://diffusion-policy.cs.columbia.edu/)

一种块间物理纠正的时序可形式化为：

$$
A_k=\pi_B(o_k),\qquad x_k^-=F_h(x_k,A_k[0:h]),
$$
$$
\delta_k=\mu_\theta(o_k^-,\mathcal H_k),\qquad
x_k^+=F_{m_k}(x_k^-,C(\delta_k)),
$$
$$
o_k^+=O(x_k^+),\qquad A_{k+1}=\pi_B(o_k^+).
$$

其中 $C$ 将位姿增量、关节目标或短动作序列变为真实控制；$m_k$ 是纠正时长；$\mathcal H_k$ 可含历史、上一块动作及接触信息。顺序是：**基础推理 → 执行段 → 当前观测 → 独立纠正 → 新观测 → 下一次基础推理**。这是对研究对象的形式化归纳，不是某篇论文现成算法。

### 2.2 块间限制有两个独立维度

**介入时刻**决定何时允许纠正器开始控制：可以只在实际 chunk 结束时检查，也可以每个底层步检查并打断尚未执行完的 chunk。

**接管时长**决定纠正器开始后能控制多久：可以只执行一个受限短动作、至多 $m_{\max}$ 步便强制交回，也可以持续至阶段完成、风险消退或高层决定退出。

“只在边界开始”不代表“接管很短”；“接管很短”也不代表“只能在边界开始”。幅度限制是另一项约束，应与时长分别说明。每个边界进行决策，也不意味着每个边界必须移动：允许 $\delta=0$ 或显式 skip，可以避免为满足形式上的交替而引入无用运动。

“自由接管”也不是一个统一类别，需按论文的实际控制粒度拆开：

| 工作或控制安排 | 可以在哪个时刻改变控制权 | 接管后执行多久／如何退出 | 准确分类 |
|---|---|---|---|
| 受限块间物理纠正 | 基础实际执行段结束 | 有界短段，之后交回；可 skip | 两个限制同时存在 |
| RouteRLT | router 可在块内改变选择，并丢弃旧块剩余动作 | 阶段专家可接管，不强制一次短修正后返回 | 支持块内中断的阶段路由 |
| ASC | 根据状态在动作子空间上门控 | 纠正未被技能占用的子空间，之后可再启用技能 | 子空间协调；不同子空间可并行 |
| IBRL／PEX | 每个底层动作步重新仲裁 | 一步后再次选；可连续多步选同一策略 | 逐步候选动作选择，不是显式宏段接管 |
| EMS | 所选策略的完整输出执行后 | 执行下一被选策略的完整输出，再选择 | 输出边界上的模型选择，不支持任意块内中断 |
| MAPLE | 当前 primitive 完成后 | 多步模块执行到其边界；Atomic 执行一步 | 原语边界上的混合动作空间 |
| Relative VIC | 当前固定时长 skill 或单步 primitive 完成后 | 再由 meta-controller 选择 | 技能边界上的时间抽象 |
| RecoveryChaining | nominal 执行失败后 | 恢复器选择交回 nominal option | 失败触发恢复；训练有特殊终止语义 |
| Bridge Policy Learning | planner stuck 时 | bridge 可 CallPlanner；planner 再次 stuck 可返回 | 规划恢复；训练交接的细节仍有未核实项 |

因此，EMS 和 MAPLE 可以自由选择“下一段由谁执行”，但不能据此称它们支持任意时刻打断当前段。对比实验必须明确究竟放开了介入时刻、接管时长，还是两者同时放开。

例如，base 的实际执行段为 8 步，第 3 步出现偏差。边界限制意味着常规纠正要等到第 8 步结束；允许块内中断则可以在下一次门控检查时丢弃余下动作并接管。至于接管只持续 1–2 步，还是持续到插入成功，是第二个独立选择。RouteRLT 的判断也只发生在配置的 router 查询点，并受迟滞与最短驻留约束，不能描述为任何时刻都能无条件即时切换。

在观测、动作能力和控制查询机会相同，且一般调度器能表示固定边界规则的条件下，放开调度限制也能选择遵守块间安排，表达能力不会因此更弱。块间限制可能带来的价值在于缩小探索空间、保留基础行为或改善样本效率；这些是待验证的学习效果，不是表达能力更强的结论。

### 2.3 持续执行与持续学习是不同证据

至少需要分别核对五件事：同一任务中是否反复切换；交回时是否依据新观测重新推理；训练回报是否包含未来再次介入；介入是否限定在块间且接管短暂；纠正器本身是否在真机在线更新。

部署流程允许多次恢复，不能单独证明 critic 跨这些交接学习。反过来，某个恢复训练 MDP 把交回定义为 terminal，也不意味着整个部署系统只能恢复一次。模拟器 online RL、实时执行、离线训练 router，以及真机 online adaptation 必须分开。

## 3. 持续切换与混合控制：最直接的先例

### 3.1 RouteRLT：冻结 chunked VLA 与独立 RL 专家

**RouteRLT: Learning When and Which RL Specialist Should Control a Vision–Language–Action Policy**，2026-09-22 arXiv；稿件注明 IROS 2026 IARL Workshop accepted，非 IROS 主会。[原文 §III-B–E、Algorithm 1、§IV-B、§V](https://arxiv.org/html/2609.26467v1)

冻结 SmolVLA，阶段专家直接输出完整动作 chunk；VLA proposal 是条件和偏离惩罚的参考，不是显式的“base 加增量”。router 可在 chunk 内切换，清空未执行动作；返回 VLA 时按当前观测生成新块。执行流程包括 VLA、pickup 专家、VLA transport、insertion 专家、VLA retract，允许失败后重入。

各专家先在特权／标准化阶段窗口内进行离线到在线 actor–critic 训练，随后冻结；router 使用阶段标签监督训练。专家的多步 TD 可跨 replan window，但 next action 来自专家 actor，不能据此认定它联合评价未来全部 VLA／专家切换。论文未充分明确各 handoff 的 terminal mask，也不能反向断言所有交回都被置 terminal。

真机 insertion 仍有 operator-aligned handoff，尚未证明完全自主的多专家组合。它已经直接覆盖“冻结 VLA、独立专家接管、fresh query 返回、反复切换”的系统结构；区别应落在块间短纠正约束及组合系统的学习目标。

### 3.2 ASC：固定技能与独立纠正器共同优化整个任务

**Adaptive Skill Coordination for Robotic Mobile Manipulation**，2023 首稿；机制按已核查 arXiv 版本描述，未单独确认正式出版状态。[原文 §IV-B、§V、§VI、Appendix VIII-G](https://arxiv.org/html/2304.00410v2)；[官方项目](https://adaptiveskillcoordination.github.io/)

冻结 navigation、pick、place 技能；gate 决定激活哪些技能。某动作子空间未被技能占用时，corrective policy 才控制该子空间；之后可以重新激活技能。虽然 Eq.4 写成两项之和，Eq.3 在同一子空间内实施互斥，因此不是对正在执行的基础命令直接叠加残差。不同子空间可以并行，例如技能控制手臂、纠正器控制底盘。

gate 经 DAgger 预热，corrector 没有对应预热标签；二者随后用完整任务奖励共同进行 DDPPO 训练。任务回报包含后续技能执行与再次纠正的影响。实验报告 handoff 失败后重新激活导航或由纠正器移动机器人。训练位于 Habitat／ReplicaCAD，Spot 实验为 sim-to-real 部署，不是现场在线适配。

### 3.3 IBRL：未来再次选择 RL 已进入 Bellman 目标

**Imitation Bootstrapped Reinforcement Learning**，RSS 2024；2023 首稿。[方法 §4、Algorithm 1](https://arxiv.org/html/2311.02198v3)；[RSS 正式记录](https://www.roboticsproceedings.org/rss20/p056.html)；[官方项目](https://ibrl.hengyuanhu.com/)

冻结独立 IL policy，另学 RL actor。每步二者分别提出动作，critic 选择较优候选，动作不相加。最终输出仍是 hybrid policy，因此 IL 并不是仅用于初始化或一次性 roll-in。

略去 ensemble 与 target smoothing，critic target 为：

$$
y=r+\gamma\max\{\bar Q(s',\pi_{\mathrm{IL}}(s')),\bar Q(s',\pi_{\mathrm{RL}}(s'))\}.
$$

它明确保留未来继续选择 IL 或 RL 的机会，并非假设交回 IL 后余下任务只运行 IL。RSS 正式版及项目有真机在线学习证据；2023 v3 的实验版本主要是仿真，真机结论应引用正式版和项目。

原方法是逐步仲裁，RL 候选不必为小增量，也没有完整基础 chunk 后强制短纠正的结构。将 IL 候选扩展为有限时长 base option 是宏动作扩展，不能仅据此声称新的持续信用分配原则。

### 3.4 PEX：保留冻结旧策略的持续在线扩展

**Policy Expansion for Bridging Offline-to-Online Reinforcement Learning**，ICLR 2023。[原文 §4.1–4.2、Algorithm 1、Appendix A.2/A.3](https://arxiv.org/html/2302.00935v3)；[作者会议记录](https://sites.google.com/site/hczhang1/projects/pex)

冻结 offline policy，新增 online policy。每步两者提出候选动作，按 Q 值构造 softmax 分布选择执行；下一步重新仲裁。旧策略始终是组合策略的一部分，两种 actor 可以使用不同结构。

PEX 支持不同 RL 后端，不能把它统一写成 IBRL 的两候选最大值备份。IQL 版本的 critic target 仍为 $r+\gamma V(s')$，其中 $V$ 通过 replay 动作 Q 的 expectile 学习；actor 从组合策略采样动作进行加权更新。SAC 版本另有对应修改。实验证据来自 D4RL AntMaze／locomotion 仿真在线学习，非真机适配。

### 3.5 MAPLE：固定多步模块与可学习原子动作共存

**Augmenting Reinforcement Learning with Behavior Primitives for Diverse Manipulation Tasks**，ICRA 2022；2021 首稿。[原文 §III-A–C、Appendix Algorithm 1](https://arxiv.org/html/2110.03655)；[官方项目](https://ut-austin-rpl.github.io/maple/)；[代码](https://github.com/UT-Austin-RPL/maple)

RL 先选择 primitive 类型，再输出该 primitive 的参数。动作库包含固定的 reach、grasp、push、release 控制模块，也包含单步 Atomic；选择 Atomic 时，其参数就是独立的原始 robot action。模块有限执行后返回高层，任务未终止则继续选择，critic 对下一模块或 Atomic 继续 bootstrap。

实验中的多步模块为手写闭环控制器；一般接口允许接入 learned skill，但不能据此称实作已使用冻结 VLA。论文展示利用抓取、对准模块后切换 Atomic 完成接触丰富的插入。训练在仿真，真机是迁移部署。

MAPLE 直接覆盖长控制段与短原始动作反复组合，但没有要求每个模块后必做纠正。其原文按高层 PAMDP 决策步使用 $\gamma$，不能替作者改称已按底层持续时间实现 $\gamma^\tau$。

### 3.6 Relative VIC：冻结 learned skill 与 primitive 混合

**Relative Variational Intrinsic Control**，AAAI 2021。[正式记录](https://ojs.aaai.org/index.php/AAAI/article/view/16832)；[全文 p.6737，Hierarchical RL on Skills](https://cdn.aaai.org/ojs/16832/16832-13-20326-1-2-20210518.pdf)

技能预训练后冻结。下游 meta-controller 可选固定时长技能，也可选单步 primitive action；技能内奖励累计并折扣后返回高层，再继续选择。原始动作由 meta-controller 的 RL 决策学会使用，不是另一个固定 primitive actor。

与 MAPLE 的区别是：Relative VIC 使用已学习后冻结的技能与离散原始动作；MAPLE 的机器人实现使用固定控制 API 和连续参数。相关混合 HRL 实验在 Atari，不应把论文其他技能实验转述成混合控制已获真机验证。它提供的是通用时间抽象先例，而非针对 proprio 纠正的机器人方法。

### 3.7 SkillS：可变时长的冻结旧技能与新技能调度

**SkillS: Adaptive Skill Sequencing for Efficient Temporally-Extended Exploration**，TMLR 2023；2022 首稿。[全文 Fig.2、§4.1–4.3、§5](https://arxiv.org/pdf/2211.13743)；[TMLR 稿件](https://openreview.net/pdf?id=JwGKVpRfVD)

scheduler 选择 $[i;k]$：执行哪个技能、运行多少步。候选包含冻结旧技能和在线学的新技能；运行 $k$ 步后再次调度，允许旧→新→旧持续切换。新技能独立输出环境动作，从各技能采集的低层 transitions 以 CRR 学习；scheduler 以 HCMPO 优化完整 episode 回报。

重要区别是 scheduler 用于数据收集和探索，最终目标是独立的新策略。scheduler 的混合执行价值与新 actor 的 CRR 目标不能混写。实验为模拟 Sawyer 操作和 OP3 移动／足球，无真机在线纠正证据。

### 3.8 DUGM-R：冻结 nominal 后反复风险恢复

**DUGM-R: Uncertainty-Aware Dynamic Grid Mapping and Risk-Triggered Recovery for Learned Local Navigation**，2026-09-23 arXiv。[原文 §III-D，Eqs.15–22 及 buffer 说明](https://arxiv.org/html/2609.27338v1)

冻结 nominal policy 与风险估计器，PPO 学独立 recovery。训练说明明确：交回后 nominal 执行至下一次 recovery trigger 或真正任务终止；只有 recovery 控制的 transitions 进入 buffer，nominal 期间的终局和交接反馈回填前一 recovery transition。双阈值切换避免频繁来回切换。

这不只是部署重入，还包含训练中的循环交接。不过，跳过 nominal 区间后的精确 GAE、时长折扣与 bootstrap mask 没有充分交代，不能代作者补成严格 SMDP 实现。场景是导航风险恢复，仿真训练后零样本真机迁移，没有 VLA chunk 或真机现场在线学习。

### 3.9 EMS：完整输出边界上的模型选择

**Fast and Accurate: An Adaptive VLA Inference Framework through Environment-aware Model Selection**，2026-08 arXiv。[原文 §III-A–C、§IV-D](https://arxiv.org/html/2608.06434v1)

上一被选策略的整块或单步输出执行完后，gate 按当前观测选择 fast／slow policy；被选模型生成并执行完整输出，再进入下一次选择。它支持持续切换，但不等同于 RouteRLT 的块内中断。交接首动作使用平滑，其余动作由所选模型独立生成。

在线 Double DQN 的后继 target 仍选择未来模型，故 gate 学习包含以后再次切换的价值；论文也给出离线 IQL。动作策略来自 imitation／distillation，RL 学的是 gate。在线 DQN 在仿真，真机 gate 使用离线轨迹训练，不是在线学物理纠正。原文按决策步使用折扣，未给变时长 $\gamma^\tau$ 的完整处理。

### 3.10 持续控制证据汇总

| 方法 | 冻结基础模块 | 独立纠正或替代行为 | 未来再次切换的训练证据 | 真机在线学习的准确范围 |
|---|---|---|---|---|
| RouteRLT | 冻结 chunked VLA | 阶段专家完整 chunk | 部署确认；联合混合价值未证实 | 专家有在线训练；router 后续监督学习，硬件有人工对齐 |
| ASC | 冻结 nav／pick／place | 未被技能占用子空间的动作 | gate／corrector 全任务 RL | 仿真训练，真机部署 |
| IBRL | 冻结 IL | 每步 RL 候选动作 | next-state IL／RL 最大值备份明确 | 有真机在线 RL；原结构非 chunk |
| PEX | 冻结 offline policy | 每步新 actor 候选动作 | 持续组合参与训练；后端目标各异 | D4RL 仿真 |
| MAPLE | 固定控制模块 | Atomic 参数由 RL 学 | 下一模块／Atomic 继续 bootstrap | 仿真训练后迁移 |
| Relative VIC | 冻结已学技能 | 单步 primitive 选择 | 高层持续 RL | 混合控制实验为 Atari |
| SkillS | 旧技能冻结 | 新技能独立动作 | scheduler 全任务目标；新技能另用 CRR | 模拟操作与移动 |
| DUGM-R | nominal 冻结 | 独立 recovery | 下次触发与结果回填明确；跳步细节未知 | 仿真训练、零样本迁移 |
| EMS | 快慢执行策略 | 选择一个策略完整输出 | gate 未来选择价值明确 | 真机 gate 离线学习 |

## 4. 物理恢复、重新推理与交回控制

### 4.1 AFI：真实移动后依据更新观测查询 VLA

**Affordance Field Intervention: Enabling VLAs to Escape Memory Traps in Robotic Manipulation**，2025 首稿；CVPR 2026。[原文 §4.1–4.2](https://arxiv.org/html/2512.07472v1)；[CVF 论文](https://openaccess.thecvf.com/content/CVPR2026/papers/Xu_Affordance_Field_Intervention_Enabling_VLAs_to_Escape_Memory_Traps_in_CVPR_2026_paper.pdf)

检测停滞且远离目标后，先回退到历史低代价位置，再搜索局部 waypoint。§4.2.2 明确：机器人实际到达 waypoint，使用更新观测查询 VLA，再评估候选 chunk。真实移动→新观测→VLA 动作生成的顺序与块间物理纠正接近。

AFI 用几何 affordance 搜索，事件触发，没有在线 RL，也不要求每个块后短修正。机制依据 arXiv v1；正式来源用于核对出版状态，CVF 页面重访曾受访问限制。

### 4.2 Rewind-IL：恢复动作、清空队列、继续 chunk policy

**Rewind-IL: Online Failure Detection and State Respawning for Imitation Learning**，2026-04 arXiv。[原文 §IV、Algorithm 1](https://arxiv.org/html/2604.16683v1)

根据相邻 chunk 的不一致检测异常；检索 checkpoint 对应动作，实际驱动机器人恢复，清空 temporal ensemble 和 action queue，再重新开始主策略。实验涉及 ACT 与 flow policy。

它是物理恢复与重新推理的直接先例，但恢复来自 retrieval／replay，非 RL 学习的小增量。“Online”指在线检测和执行，不等于在线更新策略；checkpoint 动作也不构成任意物体与接触状态均能严格复原的保证。

### 4.3 RecoveryChaining：训练 terminal 与部署恢复次数必须分开

**RecoveryChaining: Learning Local Recovery Policies for Robust Manipulation**，2024 首稿；IROS 2025。[原文 §IV–V、VI-E](https://arxiv.org/html/2410.13979v2)；[MERL 会议记录](https://www.merl.com/publications/TR2025-152)

nominal controller 失败后，恢复策略通过原始动作把系统带到某个 nominal controller 能继续执行的状态，并可选择把控制权交给 nominal option。交回后的任务成败为恢复学习提供奖励，因此它不仅追踪几何误差，也学习何时、向哪个控制器交回。

关键在 §V-B：训练中的 nominal option 会执行剩余 nominal 技能序列，并作为**恢复 MDP 的 terminal action**。这种构造使其回报不依赖仍在学习的恢复器；它与“base 再运行有限段后回到下一个纠正决策，继续 bootstrap”不同。

这个训练差异不能推导成部署只能恢复一次。应比较具体价值目标，而不是把恢复器训练 terminal 误当成系统终生不可重入。恢复 PPO 在仿真训练，真机部署没有现场微调；基础模块为 nominal 技能控制器，非 VLA chunk。

### 4.4 Bridge Policy Learning：形式允许再次 stuck，训练边界未完全核实

**Learning to Bridge the Gap: Efficient Novelty Recovery with Planning and Reinforcement Learning**，2024 arXiv／NeurIPS Workshop on Open-World Agents，非主会。[原文 §3、Algorithm 2](https://arxiv.org/html/2409.19226v1)；[作者出版记录](https://nishanthjkumar.com/assets/pdf/Nishanth_CV.pdf)

planner 卡住时 bridge policy 接管，以 RL 动作解决局部障碍；CallPlanner 把控制权交回。§3.1 将 planner 执行到目标、horizon 或再次 stuck 的整段视为一个原子动作，§3.3 的部署允许重复 planner↔bridge。

这与 RecoveryChaining 一律 terminal 的 nominal option 不同：形式定义容纳再次 stuck 后返回非终局状态。但已读正文未给出足以确认实验 replay done flag 和完整跨交接 target 的细节；训练是否系统性考察多次 novelty 之间的联合信用分配仍不明确。不能把“停止执行 bridge policy”直接等同 MDP terminal，也不能仅凭多次部署推断训练同构。实验为模拟环境。

### 4.5 其他恢复与干预近邻

| 工作与出处 | 已核机制 | 与块间在线物理纠正的区别 |
|---|---|---|
| [MetaReSkill — Efficient Recovery Learning using Model Predictive Meta-Reasoning](https://arxiv.org/html/2209.13605v2)，ICRA 2023；[代码与会议记录](https://github.com/shivamvats/metareskill) | 为失败簇与 nominal 前置条件学习恢复技能，并分配训练预算 | 仿真恢复学习；真机“little fine-tuning”对应阻抗增益调整，不是现场 RL |
| [Recovery RL: Safe Reinforcement Learning with Learned Recovery Zones](https://arxiv.org/html/2010.15920v2)，RA-L／ICRA 2021 | safety critic 每步选择 task 或 recovery；组合在线数据更新恢复与任务策略 | 非加性恢复和真机实验已存在，但 task policy 也学习，目标是安全风险；风险递推不应冒充组合任务 critic |
| [UniIntervene: Agentic Intervention for Efficient Real-World Reinforcement Learning](https://arxiv.org/html/2606.12372v1)，2026-06 arXiv | 风险／停滞触发后检索高价值目标，goal-conditioned head 输出 corrective chunk，覆盖当前动作并反馈数据 | §3.4／Appendix F 的恢复头由片段 BC 训练；主系统有在线 RL 不代表纠正头为在线 RL，base 也非完全冻结 |
| [PATCH: Action-Chunk-Conditioned Latent Patch Innovation Monitoring for Robot Manipulation](https://arxiv.org/html/2606.16690v1)，2026-06 arXiv | 暂停主策略，按可用性路由到自身技能、其他机器人或人工，异常解除后继续 | 主要为监控与规则路由，不学习块间增量；干预也可能改变外部环境而非本体 proprio |
| [Back to the Manifold: Recovering from Out-of-Distribution States](https://arxiv.org/html/2207.08673)，IROS 2022；[作者会议记录](https://giovanni-marchetti.github.io/) | 数据密度梯度构造恢复方向，把真实机器人带回适合 BC 的分布 | Eq.3 为密度加权动作混合，没有独立段交替或 RL critic |
| [Learning Skills to Patch Plans Based on Inaccurate Models](https://arxiv.org/html/2009.13732)，IROS 2020；[CMU 记录](https://publications.ri.cmu.edu/learning-skills-to-patch-plans-based-on-inaccurate-models) | 模型失败后从示范学习局部 patch 技能及 initiation set，再接回规划 | 是技能／计划修补，但不是在线 actor–critic 块间短纠正 |
| [Robust Intervention Learning from Emergency Stop Interventions](https://personalrobotics.cs.washington.edu/publications/pronovost2026ril.pdf)，2026 | §6.5／B.2 区分 intervention truncation 和 termination，分析终止处理对优化目标的影响 | 微调 task policy 的干预反馈方法，非独立块间纠正器 |

## 5. 动作残差：需要直接比较的适配基线

动作残差修改的是准备执行的基础输出；块间物理纠正则在独立运动后重新生成后续块。边界上运行 residual actor，不意味着存在独立物理校正阶段。

| 工作与来源 | 年份／状态 | 修正对象与学习 | 关键区别 |
|---|---|---|---|
| [Residual Reinforcement Learning for Robot Control](https://arxiv.org/abs/1812.03201) | 2018 arXiv | 传统控制信号与 RL 输出叠加 | 经典动作相加范式，无 chunk 间物理桥接 |
| [ResiP — From Imitation to Refinement: Residual RL for Precise Assembly](https://arxiv.org/html/2407.16677v4) | 2024 首稿；ICRA 2025 | 冻结 chunked DP，每步依据最新状态用 PPO residual；仿真学习后视觉蒸馏 | chunk 内持续修正，非现场真机在线 RL |
| [ResFiT — Residual Off-Policy RL for Finetuning Behavior Cloning Policies](https://arxiv.org/html/2509.19301v2) | 2025 arXiv；另有 ICLR 2026 RSI workshop 版，非主会 | 冻结 BC，off-policy RL 逐步修正，critic 评价完整动作；真机直接学习 | 最重要的真机逐步残差基线 |
| [Policy Decorator — Model-Agnostic Online Refinement for Large Policy Model](https://arxiv.org/html/2412.13630v1) | ICLR 2025；[正式稿](https://proceedings.iclr.cc/paper_files/paper/2025/file/45c361d4117d598d4bb6568b407e9ac9-Paper-Conference.pdf) | 冻结基础模型，SAC、有界残差、渐进探索；DP 配置整块修正 | 主要仿真；没有执行后插入动作再查询 |
| [BORA — Bridging Offline RL and Online Residual Adaptation for Real-World Dexterous VLA Models](https://arxiv.org/html/2605.30226) | 2026-05 首稿，arXiv | 冻结 offline-trained VLA，整块残差与 human feedback | 先生成 base chunk，再相加执行 |
| [BEE — Intervention-Adaptive Real-World Reinforcement Learning with Vision-Language-Action Models](https://arxiv.org/html/2609.27450) | 2026-09-23 arXiv | 边界 query 冻结 VLA，输出整块 residual；纠正模型约束在线 RL | 边界循环仍是“query→residual→执行” |
| [ForceRFT — Refining VLA Actions through Force-Guided Residual Reinforcement Learning](https://arxiv.org/html/2609.22840) | 2026-09-19 arXiv | 用当前状态、力和力变化生成逐命令残差；绝对 TCP 目标相对当前测量重新表达 | 重新 anchor 动作不等于改 proprio 输入或独立移动后再推理 |
| [Real-Time EXPO-FT — Reinforcement Learning for Real-Time Vision-Language-Action Policies](https://arxiv.org/html/2609.18207) | 2026-09-16 arXiv | 异步预生成候选，到边界据最新观测编辑整块，由 Q 选择；真机在线 RL | 下一块已先推理，且 base 也在线更新 |
| [PARTS — From Pretraining to Proficiency: Real-World Subtask RL for Long-Horizon Manipulation with Minimal Human Intervention](https://arxiv.org/html/2609.21788v1) | 2026-09-18 arXiv | 冻结 base，在瓶颈子任务做真机在线整块有界残差 | 有局部介入范围和入口状态问题，但 §III-B Eq.2 仍相加 |
| [ReSkill — Learning an Adaptable Skill-based Action Space for Reinforcement Learning for Robotics](https://proceedings.mlr.press/v205/rana23a/rana23a.pdf) | CoRL 2022；PMLR 于 2023 出版 | 冻结 decoder／prior，高层选 latent，低层每步 residual | Algorithm 1 明确 $a=a_0+\delta a$，非独立 correction option；仿真 Fetch |

ResiP 的 §III-D4／Appendix J-A 比较逐步与整块残差：其设置下逐步反馈更有利。然而整块 residual 是一次修改未来动作序列，不等同“执行后物理纠正再重推理”。这个消融提示需要研究减少块内反馈的代价，不能直接用于否定块间物理纠正。

ResFiT 的 §III-B／Algorithm 1 给出真机 off-policy 实现；Real-Time EXPO-FT 的 §IV-B Eqs.4–9 给出“异步推理→执行边界最新状态→下一块编辑”的精确时序。PARTS 的入口状态问题则表明，一个子任务结束时的位姿会影响后续难度；这提供研究动机，但不能据此把其加法残差改称物理预修正。

## 6. 生成条件、输入状态与执行调度

### 6.1 不在 action space 加残差，不代表进行了物理纠正

| 工作与来源 | 年份／状态 | 已核机制 | 与物理纠正的关系 |
|---|---|---|---|
| [DSRL — Steering Your Diffusion Policy with Latent Space Reinforcement Learning](https://proceedings.mlr.press/v305/wagenmaker25a.html)；[全文](https://arxiv.org/html/2506.15799v1) | CoRL 2025 | RL 选冻结 diffusion／flow 的初始 noise；chunk 作为 macro-action；有真实在线适配实验 | 每次推理前学轻量决策已存在，但没有前置物理动作 |
| [ZPRL — Beyond Action Residuals: Real-World Robot Policy Steering via Bottleneck Latent Reinforcement Learning](https://arxiv.org/html/2605.19919v1) | 2026-05 arXiv | observation embedding 后增设 bottleneck；SAC 在 latent 上加增量，再经冻结生成器输出 chunk | 修正生成条件，非 raw proprio 或真实状态；有真机在线适配 |
| [FutureRTC — Real-Time Robot Execution with Anticipatory-Conditioned Action Chunking](https://arxiv.org/html/2607.24008v1) | 2026-07 arXiv | 前推已承诺动作预测下一起点，SCM 修正预测 proprio，并预测 visual latent；监督训练 | 估准机器人本来将到达的状态，不是主动把机器人移到另一状态 |
| [VLASH — Real-Time VLAs via Future-State-Aware Asynchronous Inference](https://arxiv.org/html/2512.01031v1) | 2025-11 首稿，arXiv | 用未来 execution-start state 和较旧图像条件化模型；通过时间偏移监督适配 | 无前置运动，也非在线 RL；需要适配基础策略 |
| [RL²-VLA — Adaptive RL Latent Compositional Steering with Test-Time Scaling for Vision-Language-Action Models](https://arxiv.org/html/2607.26991v1) | 2026-07 arXiv | 冻结 VLA latent 条件化 RL flow，混合 denoising velocity；失败检测器决定 steering | 离线 RL 与监督检测，不是真实时间中的 base／correction 串行执行 |
| [MATES — Learning Multi-Agent Interactions by Transforming Observations for Frozen Single-Agent Policies](https://arxiv.org/html/2609.26010v1) | 2026-09 arXiv | RL adapter 改观察输入，梯度经冻结单体策略更新 adapter | 是输入适配的广义先例；多智能体导航，非机械臂 chunk 物理纠正 |

DSRL §4／Appendix C.1 明确 latent-action MDP 与 chunk 宏动作。因此“每块一个低维 RL 决策”不足以单独区分。ZPRL 也明确说明 residual 可以位于 action space 之外。

FutureRTC 的 state correction 属于预测／观测对齐，物理纠正属于控制；即使公式都出现 $\Delta p$，优化对象仍不同。VLASH §4.2 发现仅推理时替换未来 state 不够，需要训练促进 state 的使用。这只提醒需要验证模型对 proprio 的依赖，不能推断所有 VLA 都忽略 proprio，或任意输入偏置都有益。

### 6.2 执行长度和异步推理是必要对照

| 工作与来源 | 年份／状态 | 控制变量与学习 | 需要保留的界限 |
|---|---|---|---|
| [EQRL — Elastic Queries Reinforcement Learning: Self-Aware Policy Execution for VLA Models](https://arxiv.org/html/2606.14375v1) | 2026-06 arXiv | query-level SAC 联合选 noise、去噪预算、执行长度；target 按实际时长折扣 | 无独立位姿修正；提供推理调用粒度 RL 参考 |
| [DEHP — Dynamic Execution Horizon Prediction for Chunk-based Robot Policies](https://arxiv.org/html/2606.11408v1) | 2026-06 arXiv | 冻结 base，PPO 根据状态和 chunk 选执行前缀长度；用 $\gamma^h$ | 学何时再推理；所有正文实验使用 state observations，不能泛化为视觉真机 VLA 验证 |
| [BCP — Continue or Replan? Bernoulli-Continuation Policy Learning for Adaptive Horizon Execution](https://arxiv.org/html/2608.03483v1) | 2026-08 arXiv | GRPO 学 continuation 概率，组合成 horizon 分布 | 每次查询一次性选长度，非每步重新观察后决策；无物理增量 |
| [RTC — Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339) | 2025 arXiv | 当前块执行时以前缀约束生成下一块 | 解决异步衔接，不插入独立纠正段 |
| [Q-chunking](https://arxiv.org/html/2507.07969v1) | 2025 arXiv | 在 chunk 动作空间学习价值 | 提供宏步价值基础，不含前置物理状态修正 |

如果缩短执行段、增加 replan 就能解决同一误差，那么新增纠正器的收益可能来自反馈频率。因此执行长度、基础模型调用次数与推理延时应纳入公平比较。

## 7. 其他背景与不应混同的工作

| 工作 | 有价值的关联 | 未覆盖的条件 |
|---|---|---|
| [JSRL — Jump-Start Reinforcement Learning](https://proceedings.mlr.press/v202/uchendu23a/uchendu23a.pdf)，ICML 2023 | 固定 guide 运行 episode 前缀，探索策略执行后半程；改变 roll-in 长度形成课程 | 原方案每 episode 一次交接，不反复切回 guide |
| [Skill-Critic: Refining Learned Skills for Hierarchical Reinforcement Learning](https://arxiv.org/html/2306.08388v3)，2023 首稿 | 联合优化高层技能选择与低层动作，保留技能先验正则 | 实际执行的低层技能也更新；prior 冻结不等于 base 冻结 |
| [HYDRA](https://proceedings.mlr.press/v229/belkhale23a/belkhale23a.pdf)，CoRL 2023 | waypoint 和 dense action 的混合表示与反复切换 | imitation learning，不是冻结 base 外加在线 RL 纠正 |
| [LS3 — Latent Space Safe Sets for Long-Horizon Visuomotor Control of Sparse Reward Iterative Tasks](https://proceedings.mlr.press/v164/wilcox22a.html)，CoRL 2021；PMLR 2022；[全文](https://arxiv.org/html/2107.04775) | 短程 MPC 接终端价值和 safe-set 约束，迭代学习长期可行性 | 单一持续 MPC，无冻结 base／corrector 两主体；规划终端价值不等于 RL terminal |
| [LEAGUE — Guided Skill Learning and Abstraction for Long-Horizon Manipulation](https://arxiv.org/html/2210.12631)，RA-L 2023 | 对 symbolic operator 学 SAC 技能，失败技能得到额外训练；仿真后真机迁移 | 技能持续更新；未见统一任务 critic 跨不同技能交接的同构设计 |
| [FLaRe](https://arxiv.org/html/2409.16578)，2024 首稿 | 用 PPO 适配预训练策略 | 直接微调基础策略，非冻结模型外的边界纠正 |
| [BUDS — Bottom-Up Skill Discovery from Unsegmented Demonstrations for Long-Horizon Robot Manipulation](https://ut-austin-rpl.github.io/BUDS-website/) | 技能发现、goal-conditioned BC 与组合执行 | 项目级筛查未显示在线块间 recovery；不列为直接机制证据 |

SPiRL、SkiMo、Relay Policy Learning 等可作为技能潜变量与层级控制背景，但没有以未经深入核查的机制支持“独立 primitive 与冻结 chunk policy 反复纠正”的结论。SHERPA 的检索摘要涉及分段 heuristic／RL relay，全文访问受限，未将其冻结、终止和真机学习细节升级为已核实事实。

## 8. 持续块间纠正的价值学习表述

以下是由已核文献归纳的建模方式，用来澄清比较对象，不是新的基本 Bellman 方程。

### 8.1 一般混合 options 与受限交替

令 $B_h$ 表示查询冻结 base 并执行前 $h$ 步的有限 option，$C_{\delta,m}$ 表示执行 $m$ 步的物理纠正。一般高层可选择：

$$
u_k\in\{B_h,\ C_{\delta,m}\}.
$$

受限块间控制进一步要求：

$$
B_h\to C_{\delta_1,m_1}\to B_h\to C_{\delta_2,m_2}\to\cdots,
\qquad m_k\le m_{\max}.
$$

可用 phase 与动作可用性约束表达这种结构，纠正允许为零或 skip。MAPLE／Relative VIC 已覆盖混合时间扩展行为与原始动作；限制为交替，不会自动生成一种全新的 RL 问题。

### 8.2 将“纠正＋下一段 base”合成一个宏观转移

在每个 base 执行段结束、纠正开始前记录决策状态 $z_k$。纠正执行 $m_k$ 步后采集新观测，让 base 再执行 $h_{k+1}$ 步，到下一个纠正决策点，形成：

$$
(z_k,\delta_k,R_k,\tau_k,z_{k+1}),\qquad
\tau_k=m_k+h_{k+1},
$$
$$
R_k=\sum_{j=0}^{\tau_k-1}\gamma^j r_{t_k+j},\qquad
y_k=R_k+\gamma^{\tau_k}(1-d_k)\bar V^{B,\mu}(z_{k+1}).
$$

这里 $V^{B,\mu}$ 是后续基础策略和纠正器共同执行的价值，不是仅估计“交回后永远只运行 base”的 $V^B$。如果只有一次恢复后评估完整 base suffix，就得到与持续纠正不同的目标；RecoveryChaining 的 terminal nominal option 是这一差异的具体例子。IBRL 则已明确给出未来再使用学习策略的 bootstrap 目标。

$d_k$ 需要对应所定义学习任务的真正终止，不能仅因控制权交回就自动设为 1。时间截断、成功终止及人为结束采集应按学习目标区分。不同论文的 terminal 语义不能仅靠“handoff”“terminate controller”等文字推断。

该宏步表述要求状态／历史表示足够、下层执行规则明确。若推理等待和 hold 消耗有意义的物理时间，应计入成本；固定时长可使用固定宏步折扣，变时长则应说明时间约定。Q-chunking、EQRL、DEHP 提供相关时间抽象参考，但不能把这个公式追溯声称为 MAPLE、PEX 等所有方法的原始实现。

### 8.3 学到哪里，比是否产生一个 delta 更关键

以下目标并不等价：追踪上一块的预期终点、靠近示范数据分布、进入 nominal skill 的 initiation set、最大化下一段 base 回报、最大化整个组合策略的回报。

仅奖励位置误差减小可能学成局部伺服器，不能支持“改善下一次推理起点”的解释。几何接近也不保证可达、接触可行、任务阶段正确或 base 能继续成功。RecoveryChaining 和 Bridge 将交回后的任务效果作为恢复价值来源；AFI 提供几何选择入口的另一种思路。

实现时可从低维末端位姿增量与现有低层控制器开始；单次目标与多步闭环纠正是不同能力。旋转需使用一致的表示与复合方式，不能任意相加四元数。修正结束后图像、proprio、接触信息和历史应按真实时间更新；失效的旧 chunk 不应继续当作当前状态下的新计划。

## 9. 最有区分力的对照与评价

### 9.1 先验证“重新推理”是否贡献收益

独立动作可能把机器人带到更适合 base 继续的状态，也可能直接替 base 完成最难的一步。两者都可能提高成功率，但研究解释不同。

最有区分力的实验是：**执行完全相同的物理纠正后，一组使用新观测重推理，另一组执行纠正前已经生成的下一块。** 差异才能支持“改变后续基础策略决策”的解释。proprio 通道的作用还需要传感通道消融，不能由机器人移动后成功率提高直接归因。

### 9.2 最小对照组

| 对照 | 回答的问题 |
|---|---|
| 原 base；原 base 加等时长 hold／settle | 收益是否来自稳定时间、额外观测和停顿，而非主动纠正？ |
| 缩短 base 执行前缀、提高 replan 频率 | 更频繁反馈是否已解决同一误差？ |
| ResFiT 风格逐步残差 | 块间限制相对连续反馈的收益与代价是什么？ |
| 边界处编辑下一 chunk | 区别来自低频决策，还是先物理移动、后重推理的顺序？ |
| 固定、几何或视觉伺服式块间修正 | 在线 RL 是否学到普通误差反馈之外的内容？ |
| 同一物理纠正后 fresh query／继续旧候选块 | 基础模型的后续决策是否确实被改善？ |
| 仅改 proprio 输入／真实物理修正 | 内部 steering 与改变真实状态是否被混淆？ |
| 固定边界／风险触发 | 为什么需要每块检查，而非已有恢复触发？ |
| 保持边界介入但放开接管时长 | 短纠正限制本身是否有效？ |
| 保持短接管但允许块内介入 | 边界限制本身是否有效，是否错过可恢复窗口？ |
| 同一 base 与同一小型 RL actor 的一般混合选择 | 强制交替相比持续选择 base option／纠正的价值是什么？ |
| 交回后只评价 base suffix／继续评价未来纠正 | 持续目标相对终止式恢复目标的实际作用是什么？ |

一般混合选择基线可以借鉴 ASC／MAPLE／IBRL 的结构，但应使用同一 chunked base 实现。它不应被含混地称为“自由接管”：需要标明是否能中断 chunk，以及是否能长时间控制。终止式恢复基线可分析与 RecoveryChaining 的具体差异，但不能替代对已有持续混合控制的比较。

### 9.3 评价条件与需要回答的失败模式

比较应匹配 base checkpoint、实际执行长度、传感器、奖励信息、训练样本与人类帮助预算。同时记录任务成功率、真实交互分钟数、完成任务总时间、模型调用次数、纠正次数／幅度／时长、接触失误和随机种子波动。

优先用可控的位姿、标定、末端姿态或抓持偏差检验机制，再加入更复杂动力学变化。物体丢失、拓扑性卡死和错误任务阶段未必能由短局部动作解决。若块内碰撞、滑落已越过不可恢复点，等到边界可能太晚；若绝对目标策略下一块又吸回原轨迹，则物理纠正可能被 base 抵消。

可参考 robomimic／精细装配、LIBERO 空间扰动与真实插入等已使用的设置，但不同论文任务与训练预算上的公开成功率不能直接排为算法名次。[Diffusion Policy benchmarks](https://diffusion-policy.cs.columbia.edu/)；[AFI 实验](https://arxiv.org/html/2512.07472v1)；[Q-chunking 实验](https://arxiv.org/html/2507.07969v1)

## 10. 研究定位与证据边界

“chunk-boundary physical correction”或“inter-chunk corrective control”可作为描述性名称，不代表已有统一术语。相较经典动作残差，它的可检验区别是：纠正后重新生成下一块，因此不仅当前运动改变，后续基础动作也可能改变。但若允许门控、保持动作和扩展时钟，串行控制仍可纳入更一般的混合／残差框架，不宜声称数学上完全脱离这些方法。

已有工作覆盖了冻结大策略、轻量在线模块、动作之外的 steering、恢复后交回、物理移动后 VLA 查询、chunk 粒度决策和持续混合价值。尚需证明的是更窄组合的作用：**在冻结 chunked policy 的执行边界，以受时间和幅度约束的物理动作改变下一次推理起点；使用同步新观测；只在线更新纠正模块；以整个反复交替系统的任务回报衡量适配。** 约束的组合本身不是价值证明。

最值得检验的问题包括：块间限制是否减少无效探索与长时间接管；短修正能否抵消随 chunk 累积的系统偏差；交接状态分布是否是主要瓶颈；以及收益是否超出更多重规划、停顿或简单伺服。RouteRLT 的阶段入口问题、PARTS 的子任务终态问题提供动机，但不构成这些假设已获验证的证据。

建议精读顺序为 **RouteRLT → ASC → IBRL → MAPLE → RecoveryChaining／Bridge → RLT → ResFiT → AFI／Rewind-IL**。其中 **RLT — RL Token** 也是必要近邻：冻结 VLA，actor 依据参考 chunk 直接输出新 chunk，并用偏离惩罚约束；真机在线 actor–critic 主要在人工指定 critical phase 训练至 RL 子任务终止，非每块后短纠正并强制回 base。[RLT 原文 §V](https://arxiv.org/html/2604.23073v2) Relative VIC 用于时间抽象背景，DUGM-R、EMS 补充持续切换语义，FutureRTC、ZPRL、EQRL 用于区分输入适配与调度。

检索使用公开技术关键词，覆盖 residual action chunk、inter-chunk／post-chunk correction、recovery／bridge policy、policy resumption、mixed skill／primitive action space、policy switching、generalist–specialist routing、proprioceptive state correction、latent steering 和 adaptive execution horizon。候选以标题与 arXiv ID 去重，回到 arXiv、OpenReview、PMLR、CVF、正式论文集及官方项目核查，未使用 MDPI 作为证据来源。

未核实正式录用的工作标为预印本；workshop 与主会明确分开。核心方法读至对应章节或算法，外围来源只支持已读取范围内的描述；未运行实现，也未独立复现数值。对 RouteRLT 的混合价值与 handoff mask、Bridge 的训练交接、DUGM-R 的跳步信用分配，以及部分可变时长方法的实现折扣保留明确未知项。“未确认完全一致”不应外推为整个领域不存在该组合。
