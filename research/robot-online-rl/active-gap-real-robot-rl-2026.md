---
type: "research"
title: "机械臂真机在线强化学习中的缺口识别与定向补充探索"
shortTitle: "真机在线 RL 的缺口识别与定向探索"
year: 2026
date: "2026-10-06"
category: "robot-online-rl"
tags: ["机器人强化学习", "主动探索", "离线到在线强化学习", "练习调度", "自主复位"]
summary: "比较机械臂真机在线学习中基于不确定性、成功率、访问覆盖与学习收益的主动采集机制，梳理缺口诊断、到达复位、策略更新和实机证据，并深入解释 TwinRL 的孪生诊断与 DBAP 的任务图规划。"
---

# 机械臂真机在线强化学习中的缺口识别与定向补充探索

机器人可以根据当前经验主动安排下一次真实练习，但“缺口”有不同含义：模型未知、访问不足、任务失败或练习收益尚高，分别对应不同的选择机制。本报告比较这些机制如何选择动作、目标、初始配置或技能，怎样在真实机械臂上获得新经验，以及新数据究竟更新什么；重点区分完整系统有效与主动组件已被独立验证。

广泛文献检索截至 **2026-09-28**，初稿完成于 2026-09-29；**2026-10-06** 定向复核并补充 TwinRL、DBAP 的实现与证据边界，未将这次补充视为全领域检索刷新。覆盖 offline-to-online 与直接 online 学习，包括固定机械臂、带臂移动机器人及相关灵巧操作。以论文全文、正式论文集、作者项目与官方代码为依据，区分已发表工作、作者声明录用和预印本。检索与纳入规则见第 14 节。

关联精读：[ActiveRL：主动采集增强离线强化学习](/papers/rl-post-training/active-rl-2025)。

阅读入口：第 3–5 节是 15 项重点工作的机制与真机证据；第 6–9 节比较恢复、求助、学习底座与范围不符的近邻；第 10–12 节衔接 ActiveRL 并分析研究空间；第 13 节给出阅读顺序和代码入口。

## 1. 核心结论：已经有直接先例，但“缺口”有几种不同含义

本报告考察的闭环是：

**用当前策略和已有数据判断哪里值得继续学习 → 主动改变下一批真实交互 → 把新经验用于策略改进 → 再次判断缺口。**

这个方向已经用于真机机械臂。最直接的几组证据是：

| 研究问题 | 代表工作 | 已有机制与关键边界 |
|---|---|---|
| 找到当前策略不擅长的场景，再定点补练 | **TwinRL** | 孪生中评估低成功率初始配置，优先安排真实在线 RL；依赖孪生及人工协助 |
| 找到已有经验覆盖不足的目标，自己走过去练 | **DBAP** | 访问熵选择目标，任务图安排到达路径，真机 AWAC 持续更新 |
| 选择最能减少模型未知性的动作 | **AERM、主动在线抓取** | 信息增益或 Q ensemble 的认知不确定性引导真实动作；任务与动作层次各有范围 |
| 决定有限预算应该花在哪个技能上 | **EES、Deliberate Practice** | 预测练习收益并考虑任务依赖；真机学习的是技能参数，非端到端深度 RL |
| 当前执行卡住了，自动产生纠正数据 | **UniIntervene** | 价值趋势检测停滞，检索恢复目标并执行，接入真机 RL；偏恢复与提高有效交互率 |
| 整个长任务只在几个环节失败，集中修补 | **PARTS、RL Token** | 在指定瓶颈阶段做真实在线 RL；瓶颈识别或训练交接仍有人参与 |

这些不是同一种 ActiveRL 的不同名称：有的补**知识缺口**，有的补**访问覆盖**，有的补**任务能力**，有的处理**恢复能力或奖励标签**。来源分别见 [TwinRL §III-E](https://arxiv.org/html/2602.09023v4)、[DBAP §IV–VI](https://arxiv.org/html/2203.15755)、[AERM](https://arxiv.org/abs/2210.12806)、[EES](https://www.roboticsproceedings.org/rss20/p040.pdf)、[Deliberate Practice](https://arxiv.org/html/2608.13415v1)、[UniIntervene](https://arxiv.org/html/2606.12372v1)、[PARTS](https://arxiv.org/html/2609.21788v1)。

本次最重要的判断是： **“在线微调已有策略”已经很常见；“自动诊断值得修补的缺口，并把到达、复位、人工及学习收益放进同一个采样决策”仍没有被这些工作统一解决。** 后半句是跨论文比较得到的研究判断，不是对整个领域的不存在性证明。

## 2. 如何判断一篇论文是否真正形成主动补练闭环

筛选依据是以下四个问题，标题里的 active、online、uncertainty 不构成充分条件：

1. **缺口从哪里来？** 当前模型分歧、当前成功率、近期学习进展、访问密度、失败事件，还是人指定？
2. **它改变什么？** 下一动作、下一段轨迹、下一练习技能、真实初始配置、求助对象，还是仅仅 replay 中的采样权重？
3. **机器人如何实际获得数据？** 自己到达、恢复策略准备、另一只手布置、人工重置，还是只在仿真中 reset？
4. **什么被更新？** 任务 actor/critic、技能参数、动力学模型、奖励模型，还是行为克隆模型？

这四点共同决定一项工作能否作为完整闭环的直接前作，或只能提供其中的组件。

| 信号 | 它真正回答的问题 | 不应直接等同于 |
|---|---|---|
| 认知不确定性 / ensemble disagreement | 模型对这里知道多少？ | 再采样一定能提高任务成功率 |
| 环境随机性 / aleatoric uncertainty | 结果本身有多随机？ | 可以靠更多数据消除的知识不足 |
| 低成功率 | 当前策略会不会做？ | 这个区域可学、可达、值得练 |
| 学习进展 | 继续练是否还会提升？ | 当前表现最差 |
| 低访问密度 | 数据有没有覆盖这里？ | 这里对部署任务重要 |
| 价值停滞 / 失败风险 | 当前 rollout 是否还能产生有效进展？ | 应提高该区域的未来访问频率 |
| 人类接管 / 纠正分歧 | 人认为哪些行为需要修正？ | 算法已经自动发现了缺口 |

举例：某插孔位置成功率一直为零，可能因为没练过，也可能因为物体夹持姿态使插入不可能。前者值得补采，后者可能要先练上游抓取或重新布置。仅按失败率排序不能区分这两种情况。

## 3. 直接相关的真机闭环

### 3.1 TwinRL：用低成本诊断决定真实世界去哪里练

**Qinwen Xu 等，2026 预印本，核查 v4（2026-05-19）。** 全名：*TwinRL: Digital Twin–Driven Reinforcement Learning for Real-World Robotic Manipulation*。

这是与“发现当前能力缺口，再定向补充真机 RL”非常接近的一篇。先用真实与合成示范初始化策略，再在孪生中做 RL，随后用当前策略在孪生中执行不同初始配置的 rollout，统计经验成功率：

$$
\mathcal S_{\mathrm{target}}=\{s_0:\widehat{SR}(s_0)<\tau\}.
$$

真实在线训练优先从这些配置开始，困难执行中允许人类纠正，新经验继续训练策略。选择对象是物体初始配置，缺口指标是经验成功率；它没有直接估计继续练习的边际收益。[论文 §III-C–E](https://arxiv.org/html/2602.09023v4)

**扫描证据与实现细节。** 最具体的验证来自附录 D4：在六角块插入任务上，固定使用真实与合成数据混合训练的 SFT checkpoint，在相同初始配置下比较孪生与真机；每个网格各执行 5 次，Fig.14 展示成功率热图。作者报告两者的难易相对排序较一致。这里使用的是尚未经过在线 RL 的固定策略，5 次也只是该实验的评估预算，不能作为所有在线扫描轮次的固定参数。[论文 Appendix D4 / Fig.14](https://arxiv.org/html/2602.09023v4)

应区分目标配置扫描与结果归格：§IV-A 按任务完成时物体中心位置把 episode 归入网格；这一评估协议不足以证明在线阶段逐个遍历同一初始状态网格。§IV-B 的每 2k 步、每区至少 10 次 rollout 是真实训练评价协议，也不能当作孪生扫描刷新频率。正文给出了按阈值选择困难初始配置的框架，但未充分披露阈值数值、每轮候选数、抽样权重与策略同步周期。附录的碰撞约束与几何一致性也不足以复原一般接触动力学和自动成功判定的完整实现。因而可借鉴其诊断结构，复现时仍需补齐这些环节。[论文 §III-E、§IV-A/B、Appendix C/D4](https://arxiv.org/html/2602.09023v4)

**真机证据与成本。** FR3、四个操作任务；作者报告平均约 20 分钟真实在线阶段，较对照收敛更快。时间从第一条真实 rollout 到连续十次无人干预成功，**不包括示范采集、SFT 和孪生准备**。各方法均使用 30 条真实示范，但 TwinRL 另有合成数据和孪生交互，不能把全部优势归给“选低成功率状态”。论文也做组件消融；“w/o buffer”只去掉孪生 replay，仍保留其他孪生机制。[论文 §IV / Fig.6](https://arxiv.org/html/2602.09023v4)

**可迁移的思路。** 低成本孪生诊断决定昂贵的真实练习配置。关键条件是模拟难度排序与真实难度相关；摆出配置的时间也需要计入成本。论文的 reset 优先级不等于已经学会自主到达任意选定状态。[项目](https://twinrl.github.io/)

### 3.2 DBAP：按覆盖缺口选目标，用任务图解决“怎么到那里”

**ICRA 2023。** *Demonstration-Bootstrapped Autonomous Practicing via Multi-Task Reinforcement Learning*。

从 play 示范建立离散目标和有向任务图，用 AWAC 初始化目标条件策略。图中的边表示示范出现过相应转移，不能直接解释为当前策略的成功概率。真实厨房的柜门、滑门、旋钮各有两个目标状态，组合为 8 个配置节点；episode 结束后，按物体状态阈值确定当前节点，低层控制仍使用连续状态与动作。[论文 §IV-A、§V、Appendix A-D](https://arxiv.org/html/2203.15755)

**路径怎样评分。** Algorithm 1 对每个候选终点先用 Dijkstra 找最短路径，再假设把路径访问加入历史统计，选择更新后访问熵最大的路径。这是对各终点最短路径的比较，没有枚举所有可能路线，也不需要在物理仿真中逐条预测动作轨迹。

为说明原文简写的 $\rho'=\rho+\tau$，可用访问计数展开：令 $c_j$ 为节点 $j$ 的历史计数，$\Delta_j(\tau)$ 为假设沿路径 $\tau$ 执行所增加的计数，则

$$
\rho'_j(\tau)=\frac{c_j+\Delta_j(\tau)}{\sum_k[c_k+\Delta_k(\tau)]},\qquad
H(\rho')=-\sum_j\rho'_j\log\rho'_j.
$$

熵越高，目标配置的访问越均匀。这里的计数形式是解释性展开；原文将加号重载为密度更新，没有细写统计窗口、平滑或路径起点的计数约定。[论文 Algorithm 1 / §IV-A](https://arxiv.org/html/2203.15755)

下面是教学例子，数字不来自论文实验。假设当前在 $A$，局部路径为 $A\to B\to C\to D$，历史次数为 $(8,8,1,1)$；对每个未来抵达节点加一次，不重复计当前节点：

| 候选终点 | 路径 | 假设更新后的次数 | 访问熵（自然对数） |
|---|---|---|---:|
| $B$ | $A\to B$ | $(8,9,1,1)$ | 1.028 |
| $C$ | $A\to B\to C$ | $(8,9,2,1)$ | 1.106 |
| $D$ | $A\to B\to C\to D$ | $(8,9,2,2)$ | **1.179** |

算法选择通向 $D$ 的路线，但本轮仅下达子目标 $B$。尽管 $B$ 已访问很多次，经过它可以接近欠覆盖的 $C,D$；这解释了为什么需要看整条路线。原分布熵约为 1.042，走第一段甚至可能暂时降低熵，因此“选最大熵路径”不保证每一步覆盖都更均匀。

**怎样执行与更新。** 低层策略 $\pi_\theta(a\mid s,B)$ 执行一个子任务 episode，其中包含多次机械臂动作；结束后从实际到达的配置重新规划。新数据进入 replay，由 AWAC 更新策略。完整路径的计数更新只是假设评分，不能提前记成真实访问。这个滚动规划机制把“练什么”与“怎样从当前位置过去”连接起来，也能在部分执行失败后重新选择目标。[论文 Algorithm 2 / §IV-A](https://arxiv.org/html/2203.15755)

真机为 Franka 厨房中的门、滑门和旋钮，8 个目标配置。约 500 条示范、2.5 小时采集，之后在线超过 25 小时；仍约每小时人工 reset。Table I 的长任务成功率由离线 AWAC 的 **0.83±0.058** 提高到 **0.95±0.05**；原文未充分解释误差项的统计口径。目标选择等隔离消融主要在仿真。[正式论文 DOI](https://doi.org/10.1109/ICRA48891.2023.10161447)、[项目](https://dbap-rl.github.io/)

**研究定位：覆盖驱动的自主补练。** 它补的是“访问少”的缺口；没有证明访问少必然比当前表现差或未来学习收益高更值得练。已经熟练但访问次数少的配置仍可能被选中，反复访问但仍不会的技能也未必获得额外优先级。离散目标图还限制了新技能结构的发现。

### 3.3 PTP：用规划补上离线短技能的组合缺口

**IROS 2022。** *Planning to Practice: Efficient Online Fine-Tuning by Composing Goals in Latent Space*。

离线学习视觉表示、子目标生成器与 IQL 策略；在线规划潜空间子目标，让机器人实际尝试离线数据没有完整示范过的长任务组合，再以新经验微调。它为“下一段练习轨迹怎么构造”提供答案，但没有显式按学习进展给失败类型排序。[论文 §V–VI](https://arxiv.org/html/2205.08129)

Sawyer 真机使用 2,344 条遥操作轨迹，每任务微调 10,000 个真实环境步。Table I 三个任务的 PTP 离线→在线成功率为 **12.5→62.5%、75→100%、25→50%**；GCP 对照为 **12.5→0%、50→75%、25→12.5%**。真机评估分母和独立训练重复数未明确给出，不能套用仿真统计协议。[项目](https://sites.google.com/view/planning-to-practice/)、[代码](https://github.com/patrickhaoy/ptp)

PTP 和 DBAP 一起说明：已有离线经验不仅能初始化参数，也能提供可到达的练习结构，帮助在线阶段突破原有轨迹覆盖。

### 3.4 UniIntervene：检测当前执行停滞，主动制造有效恢复经验

**官网与代码仓库标注 CoRL 2026 已录用；论文 v1，2026-06-10。** *UniIntervene: Agentic Intervention for Efficient Real-World Reinforcement Learning*。

先预测动作的未来表征与价值，再用时间窗口识别价值持续下降或停滞。触发后，从历史纠正记忆中检索高价值目标，由目标条件恢复策略实际执行，恢复转移进入 replay，继续 off-policy RL。恢复策略本身用 BC 训练，人仍处理记忆外困难。[论文 §3 / Algorithm 1](https://arxiv.org/html/2606.12372v1)

UR7e 真机五任务包括插管、RAM 插入、擦板和折毛巾。Table 1 相对 HIL-SERL：平均成功率 **81%→88%（+7 个百分点，相对 +8.6%）**；人工干预步数占比 **34.3%→14.6%（相对减少约 57%）**。每任务最终 20 次评估，干预率来自三次训练运行；两任务消融支持时间趋势和恢复目标的作用。[结果及录用状态](https://denghaoyuan123.github.io/UniIntervene-project/)

**它补的是有效交互与恢复能力，不能直接称为最大信息增益探索。** 触发器依赖预训练后冻结的代理价值；低价值趋势不一定意味着可学习的知识缺口。[官方代码](https://github.com/Denghaoyuan123/UniIntervene)目前提供离线训练链，明确不包含机器人部署、HIL-SERL 集成、轨迹和权重，不能视为完整开箱即用真机系统。

### 3.5 AERM：以模型信息增益规划真实探索轨迹

**IROS 2022。** *Active Exploration for Robotic Manipulation*。

概率网络 ensemble 学习动力学与奖励模型，MPC 通过 CEM 优化外部奖励与模型参数的信息增益。新轨迹更新模型，下一轮重新规划；这构成了“当前模型不知道什么 → 主动获取信息 → 学会任务”的闭环。相比 ActiveRL 从候选状态出发，它直接优化一段动作轨迹的信息价值。[论文 §III](https://arxiv.org/html/2210.12806v1)

UR10 真机在斜台推球，无仿真预训练，约 **150,000 个环境步、21 小时**。奖励目标事先未知，逐渐从探索转向成功操作。真实实验运行 MI 版本；与 PETS、SAC、MBPO 的系统比较主要在仿真，不能当作真机对照。状态来自运动捕捉，任务具有自动回球装置，真实设置关闭末端旋转。[论文 §IV / Fig.6](https://arxiv.org/html/2210.12806v1)、[MERL 正式记录](https://www.merl.com/publications/TR2022-139)

**研究定位：模型信息探索的真机 RL 前作。** 其证据集中在有限任务，真实训练成本较高，尚未覆盖长任务、多技能的能力诊断。[项目](https://sites.google.com/view/aerm)、[代码](https://github.com/TimSchneider42/aerm)

### 3.6 Online grasp：用认知不确定性修补已有抓取策略

**ICRA 2024。** *Uncertainty-driven Exploration Strategies for Online Grasp Learning*。

从离线场景初始化三个 ConvSAC 网络，分离认知不确定性和结果随机性，以乐观 Q 分数引导下一次吸取点与姿态。真实成功/失败回流更新网络。其兴趣与“已有模型哪里判断错了，去补充尝试”直接吻合。[论文 §III–IV](https://arxiv.org/html/2309.12038v2)

Franka 配吸盘，离线使用 300 个场景；在线有标准探索、不同不确定性与调度策略对照。报告的最佳抓取成功率约 **79%**，物体清空率超过 **90%**，两者不同。文中的在线 **3,000 步是梯度训练步**，一次真实抓取约对应六次更新，不能写成 3,000 次真机抓取。[ICRA 正式记录](https://publikationen.bibliothek.kit.edu/1000174339)

**边界：** 选择的是完整抓取原语，不能直接外推到几百步的接触控制；其真机主动组件对照比仅展示完整系统的工作更有针对性。

### 3.7 IDA：从原语的信息价值出发选择接触尝试

**ICRA 2024。** *Information-driven Affordance Discovery for Efficient Robotic Manipulation*。早期 UAD workshop 版本与本篇合并计数。

多个成功预测器的 Bernoulli 分布分歧近似信息增益，结合奖励预测选择下一次原语参数，每次交互以二元结果更新。作者明确采用 contextual bandit 表述。[论文 §III](https://arxiv.org/html/2405.03865v1)

xArm 6 对四个玩具从随机初始化在线学习抓取，25/50/100/250 次交互后各做 20 次评估；训练加评估约 90 分钟，最后达到 **90%**。真实对照包括 Random、Where2Act；25 次交互时 IDA 反而较差，说明信息探索可能有初期代价。物体由人重新摆放；抽屉、堆叠结果来自仿真。[论文 §V-B / Fig.5–6](https://arxiv.org/html/2405.03865v1)、[项目](https://mazpie.github.io/ida/)

它提供清楚的“选择新物理数据”证据，但更新的是原语成功模型，运动执行依赖已有规划器。

### 3.8 BORGES → LEGS：针对特定困难物体反复试抓

**BORGES，CoRL 2020 / PMLR 2021。** *Exploratory Grasping: Asymptotically Optimal Algorithms for Grasping Challenging Polyhedral Objects*。按物体稳定姿态维护抓取候选与成功后验，结合先验和 Thompson sampling 选择下一次尝试，成功后旋转物体再释放，以访问其他姿态。

ABB YuMi 在两个困难物体上各试抓 200 次，末 100 次成功率分别为 **89% vs Dex-Net 49%**、**87% vs 37%**，平均提高 **45 个百分点**。这是“原抓取器对某物体失效 → 在线补练”的直接证据，学习层次主要是结构化 bandit。[正式论文 §6.2](https://proceedings.mlr.press/v155/danielczuk21a/danielczuk21a.pdf)、[项目](https://sites.google.com/view/exploratory-grasping/home)

**LEGS，ICRA 2022。** *LEGS: Learning Efficient Grasp Sets for Exploratory Grasping*。进一步用置信区间淘汰明显劣质候选并补充 active set；当总体质量置信下界达到要求时可停止探索。三种真实物体、每物体三次试验，全部真机实验在三小时内；其中两类物体相较 BORGES 改善明显。[论文 §IV / §VI](https://arxiv.org/pdf/2111.15002)、[作者发表记录](https://mjd3.github.io/publications/2022-legs)

**注意：LEGS 的停止规则有效性实验主要在仿真。** 真机曲线不能替代“自动知道何时练够了”的独立验证。这条线值得借鉴置信界与候选集合维护，但不能直接称为长时序神经策略微调。

### 3.9 ReLMM：把局部能力的不确定性连接到移动采集

**CoRL 2021 / PMLR 2022。** *Fully Autonomous Real-World Reinforcement Learning with Applications to Mobile Manipulation*。

抓取成功 ensemble 提供乐观分数，决定抓取尝试并给导航提供学习信号。抓取是 contextual bandit，导航用 SAC；成功后把物体放回，形成持续物理练习循环。[论文 §4](https://arxiv.org/html/2107.13545v3)

LoCoBot 与 WidowX200 臂在真实房间学习约 25–50 小时/环境；每环境只训练一次，最终做三次 15 分钟评估，不能说有三个训练 seed。独立去除 uncertainty bonus 的消融在仿真；真机结果证明整个采集与学习系统可运行，但不足以把收益全部归因于 uncertainty。[正式页](https://proceedings.mlr.press/v164/sun22a.html)、[项目](https://sites.google.com/view/relmm/home)

## 4. 主动分配练习预算：从能力估计到技能选择

### 4.1 EES：估计“多练一次对最终任务有多少帮助”

**RSS 2024。** *Practice Makes Perfect: Planning to Learn Skill Parameter Policies*；EES = **Estimate, Extrapolate, Situate**。

用成功记录估计技能熟练度，外推额外练习收益，再结合任务分布与规划，选择最可能改善整体表现的技能。机器人先执行准备动作满足该技能的启动条件，再练习和更新。因而它不是单纯选择最差技能，准备练习本身也可能需要很长的技能序列。[论文 §III–V](https://www.roboticsproceedings.org/rss20/p040.pdf)

Spot 带臂真机上，Ball-Ring 在 0/120/240 个技能步后的平均成功率为 **0/0.20/0.80**；Cleanup 为 **0.53/0.93/0.93**。每环境五个学习 seed、每 seed 三个评估任务，每个 seed 运行约 1–3 小时。但七个选择策略 baseline 的系统比较在仿真，真机只运行 EES。[论文 Tables I–II](https://arxiv.org/html/2402.15025v2)

**关键边界：** 学习的是参数选择分类器与候选搜索，属于技能级主动学习/上下文 bandit 范畴；不是低层 SAC/VLA actor 的端到端训练。需要技能库、前置条件和规划抽象。[项目](https://ees.csail.mit.edu/)、[代码 release](https://github.com/rai-opensource/predicators/releases/tag/planning-to-practice-ees)

### 4.2 Deliberate Practice：考虑技能依赖，而不只看眼前收益

**2026-08-13 预印本 v1。** *Deliberate Practice: Learning Robot Skills under a Budget*。

根据当前能力与在线估计的学习速度，外推技能在不同预算下的成功率，再联合规划整个练习预算；初始化仍依赖领域特定的能力先验。它能投资几个短期没有独立收益、组合起来才解锁高奖励任务的技能。执行时从当前可到达前置条件的技能开始。[论文 §5–6](https://arxiv.org/html/2608.13415v1)

双 Panda 真机通过 CMA-ES 搜索阻抗控制路径点等参数：30 次技能试验预算主要练启动烤面包机，60 次预算则学习开关微波炉并完成奖励更高的任务。每轮六组候选真实执行；学习是黑盒策略参数优化。多 baseline、五 seed 结果主要来自仿真；真机没有完整报告独立重复、评估分母、墙钟与 reset 成本。[论文 Fig.6 / Appendix A.3–A.5](https://arxiv.org/html/2608.13415v1)

**研究意义：** “选最薄弱技能”已有更强的替代问题——选择在剩余预算下最能提高部署收益的技能组合。若把这条思路接到神经网络在线 RL，仍需处理共享参数、遗忘和技能间数据迁移，这些不由独立熟练度曲线自动解决。

## 5. 长任务的局部强化：有明确瓶颈，但自主诊断尚有边界

### 5.1 PARTS：把失败子步骤变成可重复练习的小任务

**2026-09-18 预印本 v1。** *From Pretraining to Proficiency: Real-World Subtask RL for Long-Horizon Manipulation with Minimal Human Intervention*。

人观察基础策略失败，定义瓶颈的进入条件、可修正动作坐标、局部成功标准和预算。固定 π0.5 负责常规行为，瓶颈处训练有界残差 TD3+BC；选择器、成功验证器和复位程序支持重复尝试。周期性保留全部成功和部分失败经验，重新训练残差后再部署。[论文 §III](https://arxiv.org/html/2609.21788v1)

YAM 双臂耳机插入、LEGO 分类及 FR3 拔插线缆是真机在线实验。FR3 完整任务 20 次评估：SFT **10/20**、DSRL **13/20**、EXPO-FT **4/20**、RLT **14/20**、PARTS **19/20**。这是本文统一取消在线纠正、匹配 rollout 运行时间的协议，排除 reset 和更新暂停，不能代表原版基线完整系统的一般性排名。LEGO 报告十块积木完成比例，不能与二元成功率混为一项。[官方结果](https://destiny000621.github.io/PARTS/)、[论文 §IV-B](https://arxiv.org/html/2609.21788v1)

**不是自动发现瓶颈。** 原文明确由人识别，重训后也由操作者选择 checkpoint；耳机仍有人检查奖励，耳机与线缆任务仍需人工 reset。作者指出反复从同一局部状态开始会造成过拟合，完整评估应使用上游策略真实产生的进入状态。代码尚为 coming soon。[论文 Table I / §III-D / §IV](https://arxiv.org/html/2609.21788v1)

### 5.2 RL Token：很实用的瓶颈学习接口，但选择器不是核心贡献

**2026 预印本，v2。** *RL Token: Bootstrapping Online RL with Vision-Language-Action Models*。

让 VLA 输出紧凑表征，训练小 actor–critic 改进动作，并以基础策略为锚点。真机包括螺丝安装、扎带、充电器和网线插入；重点训练人为识别的 5–20 秒关键阶段，完整任务则可能长达 30–120 秒。训练阶段有人负责 VLA 到 RL 的交接。[论文 §V–VI](https://arxiv.org/html/2604.23073v2)

每任务还使用约 1–10 小时示范，在线约 400–1,000 episodes；论文的 15 分钟至 5 小时数据时长排除了 reset 等开销。因此“几分钟练好关键步骤”不能解释为从零完成整个系统的总时间。

它可作为主动调度器的底层学习器：调度问题是“用 RLT 练哪些状态或子阶段”，轻量 RL head 本身没有给出缺口选择机制。

### 5.3 ENPIRE：外层自动诊断与修改训练方法的新近系统

**2026 预印本。** *ENPIRE: Agentic Robot Policy Self-Improvement in the Real World*。

机器人执行、自动判定和 reset 后，代码代理分析日志与失败，修改策略代码、学习算法和超参数，再安排真实试验。插销任务确实尝试 BC、online、offline 与 offline-to-online RL；它也包括完全基于程序的启发式策略，所以不能把所有结果归给 RL。[论文 §2 / §3.2](https://arxiv.org/html/2606.19980v1)

其外层更接近“自动实验与算法改进”，没有统一的 epistemic-gap 采集准则。项目展示的 **99% 是 pass@8**：子任务最多八次依历史失败进行重试，不是单次成功率；机器人数量增加带来的墙钟缩短也伴随更多资源投入。[官方项目与指标解释](https://research.nvidia.com/labs/gear/enpire/)

它提示一个更宽的缺口诊断层：发现失败来自奖励、初始化、动作约束还是探索策略，再选择相应修复。是否优于固定算法下的主动采样，需要另行做控制变量比较。

## 6. 恢复、主动求助和奖励查询：改变采集，但目标各不相同

### 6.1 FARL 与 Recovery RL：哪些失败应该避开或修复

**FARL，2026，作者主页列 ICRA 2026，正式 proceedings 本次未独立核实。** world model 沿当前策略预测未来违规成本，超过阈值便自动切换到恢复策略。真实在线阶段更新任务策略，模型和恢复策略固定；因此确实改变后续物理轨迹，但不是主动提高欠训练状态的访问频率。[论文 §IV / §VI-C](https://arxiv.org/html/2601.07821v1)、[作者发表记录](https://cheryyunl.github.io/)

Franka 三个推物任务，每任务在线 50 episodes。摘要中的物理失败减少 73.1% 指违规 **state–action pairs**，不是失败 episode；回报提高 11.3% 也不是成功率提高 11.3 个百分点。示范还包含任务、恢复和失败数据，人工准备成本需单列。[项目](https://failure-aware-rl.github.io/)

**Recovery RL，RA-L 2021。** 安全 critic 估计未来违规概率，任务动作超风险阈值时执行恢复动作。dVRK 真机从图像学绕障到达，使用 6,000 条安全预训练转移，其中 649 条含违规；每算法三次真机运行。真实任务主要是避障到达，复杂抓取/抽取场景在仿真。[论文 §V / Appendix XIV](https://arxiv.org/pdf/2010.15920)、[正式 DOI](https://doi.org/10.1109/LRA.2021.3070252)、[代码](https://github.com/abalakrishna123/recovery-rl)

这类方法提供重要约束： **应练的困难状态，与应先退出的不可恢复状态，需要不同的决策。** “降低失败数量”本身不能证明模型更有效地发现并补足了知识缺口。

### 6.2 ThriftyDAgger：最接近主动请求纠正，但任务学习为 IL

**CoRL 2021 / PMLR 2022。** 用策略 ensemble 的新颖性和当前策略到达目标的失败风险决定是否向人求助，并根据切换预算调整阈值。它确实主动获取新的纠正动作，但任务策略以监督模仿更新，Q 函数用于门控，不能因此把整个算法称为任务 RL。[论文 §4](https://proceedings.mlr.press/v164/hoque22a/hoque22a.pdf)

da Vinci 真机线缆绕柱：25 条初始示范、1,500 在线步，最终自主成功 **12/15**，HG-DAgger **10/15**，BC **0/15**。人工动作数量的各项指标并非全都更低。其公开仓库主要支持仿真，物理接口需联系作者。[正式页](https://proceedings.mlr.press/v164/hoque22a.html)、[代码](https://github.com/ryanhoque/thriftydagger)

如果研究“让 RL 主动要求人补示范”，这篇必须比较；更换底层学习器并不会消除其主动门控先例。

### 6.3 VICE-RAQ：主动补充奖励知识

**RSS 2019。** 定期间隔从新访问、未标注的图像中，选成功分类器**预测最可能成功**的状态，询问人是否真的成功，修正奖励模型后继续 SAC。它旨在排除虚假高奖励，并不是选择最大熵状态，也没有专门前往高不确定区域。[论文 §IV / §VII](https://www.roboticsproceedings.org/rss15/p73.pdf)

Sawyer 推杯、盖布和书架任务分别使用 **25/50/75 次标签查询**，约 **1.5/4/3 小时**。这是真机 RL 的主动反馈查询，但主动选择对象是奖励标签，不是下一练习起点。[正式页](https://www.roboticsproceedings.org/rss15/p73.html)

## 7. 到达、复位与持续运行：把“想练”变成“真能练”

选择目标状态后，如何实际到达它，在真机上是一个独立而昂贵的问题。以下工作支撑持续运行与数据采集，但持续训练能力本身不代表自动发现能力缺口。

| 工作与状态 | 实际如何形成下一次练习 | 真机与证据边界 |
|---|---|---|
| **GEAR**，*Autonomous Robotic RL with Asynchronous Human Feedback*，CoRL 2023 | 从已有状态筛选当前可达子目标，再按人类反馈学得的目标距离选择；hindsight GCSL 更新 | Franka 推物，10 条初始示范、约 200 比较标签；不是 SAC，真机选择器 baseline 有限。[论文 §4 / §5.4](https://arxiv.org/html/2310.20608) |
| **MEDAL++**，*Self-Improving Robots: End-to-End Autonomous Visuomotor RL*，CoRL 2023 | backward policy 匹配示范状态分布，把系统带回任务相关起点；forward policy 继续练习 | Panda，布料、覆盖、软插入等；约 300k 转移/30 小时，仍平均每小时需人工干预；不是按当前最弱状态安排 reset。[正式论文](https://proceedings.mlr.press/v229/sharma23b/sharma23b.pdf) |
| **MTRF**，*Reset-Free RL via Multi-Task Learning*，ICRA 2021 | 手工任务图根据当前状态激活拾取、居中、翻转、重定向或插拔策略 | Sawyer＋16 DoF D'Hand，真实在线约 60/25 小时；图与子任务由人定义。[论文](https://arxiv.org/html/2104.11203) |
| **RoboFuME**，*Robot Fine-Tuning Made Easy*，ICRA 2024 | 预训练策略与奖励，交替执行任务和恢复，CalQL 继续学习 | WidowX250，在线 30k 步/2–4 小时，仍周期性人工 reset；不按学习进展排序目标。[论文](https://arxiv.org/html/2310.15145) |
| **Continuously Improving Mobile Manipulation with Autonomous Real-World RL**，CoRL 2024 | 持续保持可操作场景，支持移动操作的自主练习与恢复 | Spot 带臂、四任务；会议年 2024，PMLR 出版年 2025；不是已验证的技能收益排序器。[正式页](https://proceedings.mlr.press/v270/mendonca25a.html) |
| **R3L**，*The Ingredients of Real-World Robotic RL*，ICLR 2020 | 任务控制器与新颖性驱动的扰动控制器交替 | 确有真机学习，但物理平台是独立 DClaw；与 MTRF 的臂手联合系统区分。[作者实验说明](https://bair.berkeley.edu/blog/2020/04/27/ingredients/) |

它们解决的工程问题可以与主动调度组合：目标选择器提出练习需求，准备/恢复策略实现它，任务策略再从新的初始分布训练。实际准备失败也应反馈给调度器，否则理论上高价值的练习可能长期占用机器人。

## 8. 很相关的 offline-to-online / VLA 工作，哪些只是学习器或优化组件

| 工作、状态与主源 | 为什么值得关注 | 与“主动识别并补采”之间的距离 |
|---|---|---|
| **AWAC**，2020 预印本，本次未核正式 venue；[v6](https://arxiv.org/html/2006.09359v6) | 离线数据起步，优势加权更新，继续真机学习 | 没有单独的缺口采集器；是基础 offline-to-online 对照 |
| **SERL**，ICRA 2024；[论文](https://arxiv.org/html/2401.16013v1) | 真机高效 off-policy 学习、奖励与系统工程 | 可做主动调度器的底座，不能仅凭样本效率称 active |
| **HIL-SERL**，Science Robotics 2025；[论文](https://arxiv.org/html/2410.21845v3) | 人发现困难并接管，数据进入 RL | 主要由人决定何时纠正；是“人诊断缺口”的强基线 |
| **RLIF**，ICLR 2024；[论文](https://arxiv.org/html/2311.12996v2) | 人接管前一步给负奖励，利用干预的评价信息 | 真机 SpaceMouse 接管由人触发；理论/仿真的 Q 门控不能移植为真机事实 |
| **E2HiL**，RA-L 2026；[v2](https://arxiv.org/html/2601.19969v2) | 用样本对策略熵的影响筛选 actor 梯度，改善探索保持 | active 操作发生在已有 replay 内，没有主动请求新样本 |
| **MoRI**，2026 预印本；[论文](https://arxiv.org/html/2604.10165v1) | BC/RL 专家按动作一致性与置信信号切换，真机长任务在线学习 | 局部策略路由影响动作，但不是全局诊断“下一场景练什么”；动作方差不自动等于认知不确定性 |
| **EXPO-FT**，2026 预印本；[论文](https://arxiv.org/html/2605.25477) | VLA 在线微调，结合动作块和人工纠正 | 强学习器对照；未核到自动缺口定位器。约 19.1 分钟平均数据量不能替代总墙钟 |
| **BORA**，2026 预印本；[论文](https://arxiv.org/html/2605.30226v1) | 离线 IQL 与在线残差适配衔接 | 主要解决策略/价值迁移与更新，未见主动选择薄弱场景 |
| **SiLRI**，2025 预印本；[项目](https://silri-rl.github.io/) | 处理次优人类干预，平衡 RL 和约束 | 建模人工动作质量，尚不等于自动发起 query |
| **GAINS**，2026 预印本；[项目](https://gains-hil.github.io/) | distributional Q 处理人工干预时机的不一致 | 不确定性描述人类反馈/价值分布，接管仍由人决定 |
| **WHIRL**，官网标 CoRL 2026 已录用；[项目](https://whirl-dexterous.github.io/) | world model 预测干预概率，约束灵巧策略的风险 | 人脚踏接管提供数据；预测干预不等于自动请求接管 |
| **BEE**，2026-09-23 预印本；[论文](https://arxiv.org/html/2609.27450v1) | 人类纠正一致性决定各动作维度的约束强度 | 调节哪里允许偏离人类，不是挑选新场景。总体 91.2% 混合三真机与一仿真任务，且部分只评关键阶段，不能当整任务真机平均 |

两项值得保留的实证提醒：HIL-SERL 的训练时间并非全部 1–2.5 小时，Timing Belt 任务为 **6 小时**；去掉在线纠正对 RAM/仪表板影响很大，对翻转任务则小。E2HiL 的优势说明改善更新也能提高后续探索，但如果研究问题是主动补采，应在相同底层更新规则下比较采集策略。[HIL-SERL Table 1](https://arxiv.org/html/2410.21845v3)、[E2HiL §III / Table I](https://arxiv.org/html/2601.19969v2)

## 9. 容易误收为真机主动在线 RL 的近邻

以下均有方法参考价值；最后一列说明为何不能拿来直接支撑“真机机械臂主动补采 RL 已经实现”的同一结论。

| 工作与年份 | 可借鉴内容 | 核实后的边界 |
|---|---|---|
| [ActiveRL，AAAI 2025](https://arxiv.org/html/2412.13106v2) | 按不确定性选起点、动作及结束时机 | 主要是模拟控制/迷宫；真实 Go1 数据不等于真机在线微调，更非机械臂证据 |
| [VIME，NeurIPS 2016](https://arxiv.org/pdf/1605.09674) | 动力学参数信息增益 | 文中连续控制模拟实验 |
| [MAX，ICML 2019](https://proceedings.mlr.press/v97/shyam19a.html) | 模型 ensemble 分歧与探索规划 | 文中仿真任务 |
| [Plan2Explore，ICML 2020](https://proceedings.mlr.press/v119/sekar20a.html) | 潜空间想象探索 | DM Control，不是真实操作学习 |
| [Self-Supervised Exploration via Disagreement，ICML 2019](https://proceedings.mlr.press/v97/pathak19a.html) | Sawyer 真实探索，预测分歧驱动新动作 | 真机通过可微目标直接优化；报告对象接触率，不是外部操作任务 RL 成功率 |
| [VaPRL，NeurIPS 2021](https://arxiv.org/html/2107.12931) | 当前可完成任务范围内选择课程起点，并先走过去 | 核实实验为模拟机器人 |
| [MEDAL，ICML 2022](https://proceedings.mlr.press/v162/sharma22a.html) | backward occupancy 匹配示范分布 | 真机证据来自后续 MEDAL++，不能归给原篇 |
| [PAINT，NeurIPS 2022](https://arxiv.org/html/2210.10765) | 判断不可逆性，主动求 reset，reset 前补不可逆区域数据 | 仿真连续控制；机械臂任务名不足以证明物理实验 |
| [When Learning Is Out of Reach, Reset，2023](https://arxiv.org/html/2303.17600) | 低多样性/停滞检测与 reset 请求 | AI2-THOR、RoboTHOR、Sawyer-Peg 仿真 |
| [IBC，ICML 2023](https://proceedings.mlr.press/v202/kim23d.html) | 双向隐式课程 | 仿真验证 |
| [RISC，ICLR 2024](https://arxiv.org/html/2405.01684) | 熟练区域提前切换正反策略，少花无效步数 | EARL/Minigrid 仿真；success critic 也并非天然校准概率 |
| [RSA，NeurIPS 2025](https://proceedings.neurips.cc/paper_files/paper/2025/file/56d748a1d7128158681280be7668e0d3-Paper-Conference.pdf) | 中间难度起点、可恢复性与不可逆检测 | Gymnasium-Robotics 仿真；HandManipulate 是模拟手 |
| [MoReFree，TMLR 2025](https://arxiv.org/html/2408.09807) | world-model 探索兼顾初始/目标分布 | 八个仿真任务；相对 imagined rollout 的 real environment 不是实物机器人 |
| [Bayesian Active Exploration，2024](https://arxiv.org/html/2404.01867v1) | 贝叶斯动力学不确定性 | RLBench/CoppeliaSim；realistic 不等于 real |
| [UGES，2022](https://arxiv.org/pdf/2212.08232) | Q 方差选择专家数据 | 从已有 replay 取样，纯离线且仿真，不是请人采新示范 |
| [Multi-Fingered Active Grasp Learning，IROS 2020](https://arxiv.org/html/2006.05264v2) | 成功、分类不确定性和覆盖之间主动选择 | 主动训练在仿真，KUKA＋Allegro 是训练后物理评估 |
| [ActivePusher，ICRA 2026，v4](https://arxiv.org/html/2506.04646v4) | 主动动力学学习与可靠推物规划 | 实验先建真实数据池，再模拟主动挑样；物理执行评估不能补足在线主动采集证据 |
| [RoboMD，ICLR 2026](https://somsagar07.github.io/papers/robomd/) | RL 诊断器找失败变化，定向微调原策略 | RL 用在诊断器；BC 策略的针对性训练不等于真机任务策略在线 RL。[全文 §4.4 / G](https://arxiv.org/html/2412.02818v4) |
| [Hi-WM，2026](https://arxiv.org/html/2604.21741) | 世界模型中定位失败、人工纠正与分支练习 | 主要补充虚拟经验，真实部署评估不等于持续物理在线补练 |
| [OmniReset，ICLR 2026](https://omnireset.github.io/) | 多样化 reset 改善操作 | 仿真训练、zero-shot 真机迁移，不是真机在线更新 |
| [ASID，ICLR 2024](https://weirdlabuw.github.io/asid/) | 主动真机采集用于系统辨识 | 随后在模拟中训练任务策略并迁移；不等于真实任务策略在线 RL |

此外，[KGRL（RA-L 2025）](https://elib.dlr.de/216474/)及其平滑探索扩展确有 BNC 插接真机 RL，但探索结构主要来自**示范方差**，不能当成随在线学习变化的知识缺口；[Contact-safe MBRL（RA-L 2021）](https://arxiv.org/pdf/2010.08169)用不确定性限制未知区域的动作幅度，主要解决允许怎样探索。这两类可作为采集约束组件。

## 10. 从 ActiveRL 迁移到真机：候选、到达与不确定性

### 10.1 真机上应把“状态候选”换成可执行的练习请求

状态候选既有计算规模问题，也有物理执行成本。ActiveRL 的主设置允许从选定候选状态直接启动；无法直接 reset 的到达策略扩展在 Maze2d 上评估，不能自动当成真实机械臂的到达能力。公开代码默认从状态池抽取 20 个候选、选择 2 个，表明评分可以在子集上进行，但这仅是可覆盖的代码默认值，候选池覆盖与未抽中关键状态的问题仍在。[论文 §3 / 附录 D](https://arxiv.org/html/2412.13106v2)、[固定提交的候选参数](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/td3bc_active.py#L41-L45)

真机文献采用的候选通常已有结构：物体空间配置（TwinRL）、图上的目标节点（DBAP）、技能及启动条件（EES）、可达视觉子目标（PTP/GEAR）、抓取原语候选（BORGES/LEGS/IDA）。这些抽象缩小搜索范围，也明确了实践动作的单位。

因此一个更实际的候选可以写成：

$$
z=(\text{任务/技能},\ \text{场景配置},\ \text{进入或恢复方案},\ \text{练习预算}).
$$

这样，“选择 z”才包含物理上怎样执行和收集经验。候选集合可以大，但应先受可达性、任务相关性与可准备性筛选，再计算较昂贵的学习价值。这是上述文献的共同工程启示，不是某篇论文的统一原公式。

### 10.2 不确定性只是一个代理，最终应验证新增数据是否有用

ActiveRL v2 的独立潜空间存在可构造的坐标歧义：在单个模型内部同时置换状态和动作表征的坐标，内积与动态误差不变，跨模型向量距离却可能改变。因此，分歧可能包含表示方式的差异；这一机制分析尚未证明它主导实际采集排序或使实验失效。[ActiveRL v2 §3](https://arxiv.org/html/2412.13106v2)

论文机制与公开代码还应分别描述。核查提交 `cb367f31da874b50388faa930af09587d3a93887` 以均方误差监督物理状态增量，距离计算也没有平方；输出坐标由物理量固定，上述任意潜坐标置换的论证不能原样套用。[监督目标](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/utils_uncertainty.py#L56-L76)、[距离计算](https://github.com/sml-iisc/ActiveRL/blob/cb367f31da874b50388faa930af09587d3a93887/utils_uncertainty.py#L101-L115)

迁移到真机时，可比较同一语义量，如任务成功概率、物理状态增量、奖励或违规概率，再检查预测分歧是否对应真实学习收益。共享输出语义有助于可比性，但不能独自保证评分反映可学习缺口。

这里更强的判据是：选择器评分高的练习，在相同新增真实数据预算下，是否比随机练习带来更大的部署分布性能提升。始终无法完成任务的配置可能获得高评分，却未必带来目标任务的性能提升；不确定性不高的上游抓取姿态，反而可能决定后续插入是否可完成。

### 10.3 “不去未知区域”和“有意访问未知区域”需要协调

风险恢复倾向退出危险状态，信息探索倾向访问未知状态，瓶颈修复则希望在可学习的困难状态反复尝试。三个目标可以同时存在，不能用同一个 uncertainty threshold 不加区分地处理。FARL/Recovery RL 适合限定可采集范围，AERM/IDA 适合选信息，EES/DP 适合选练习收益；它们解决的层次不同。

## 11. 从已有工作中看见的研究空间

下表是基于已核文献的综合判断，既说明可切入处，也列出会直接影响创新定位的前作。

| 问题 | 前作已经做了什么 | 仍值得验证的具体主张 | 最关键的证据 |
|---|---|---|---|
| **从“不确定”到“值得学”** | AERM/IDA 选信息；EES/DP 预测技能练习收益 | 在共享神经策略中，预测新增真实数据对部署成功率的边际收益，比单纯分歧或低成功率更有效 | 固定数据量、相同学习器，比较实际更新后的收益，而不只看 uncertainty 校准 |
| **把到达与 reset 成本纳入采样** | DBAP/PTP/GEAR 提供到达路径，MEDAL++/MTRF 提供恢复 | 准备困难的高价值状态，是否应输给便宜且可反复练的次优状态 | 总墙钟、准备失败率、人工分钟与任务性能的联合曲线 |
| **长任务的因果瓶颈** | PARTS 人指定局部瓶颈；RLT 强化关键阶段 | 自动辨别“插入失败”来自插入控制，还是上游抓姿/部件位置，并修补正确阶段 | 改单阶段后的端到端收益，真实上游状态分布下验证，检查其他阶段遗忘 |
| **虚拟诊断与真实缺口是否一致** | TwinRL 用孪生选困难配置，RoboMD 定位漏洞 | 少量真机探测能否校准模拟的失败排序，避免预算集中在孪生特有错误 | 同一候选集合的模拟/真实排序，目标采样与均匀采样的同预算比较 |
| **何时停止一个缺口、切换下一个** | LEGS 置信界停止，EES/DP 分配技能预算，RISC 提前交棒 | 在非平稳深度 RL 中，识别收益饱和、不可学和遗忘回退，并可靠切换 | 真机达标置信度、预算利用率、重新诊断的收益及多任务尾部表现 |

可以把整体决策写成下面的研究抽象：

$$
z_t^*\approx\arg\max_{z\in\mathcal F_t}
\frac{\widehat{\Delta J_{\mathcal T}(\pi_t;z,B_z)}}
{c_{\mathrm{practice}}(z)+c_{\mathrm{reach}}(z)+c_{\mathrm{reset}}(z)+\alpha c_{\mathrm{human}}(z)}.
$$

其中分子是练习后在目标任务分布 $\mathcal T$ 上的预期改进；$\mathcal F_t$ 是当前可执行的候选集合，$\alpha$ 将人工成本换算为统一代价。这是本报告的综合问题表达。真正困难在于估计分子，以及处理技能依赖和共享参数：逐次贪心选择可能错过需要连续投入才能解锁的技能链，Deliberate Practice 已经说明这种结构的重要性。

**若以此形成课题，较弱的创新表述是“把 uncertainty 加到 HIL-SERL 上”。较有辨识度的问题是“在真实可达与复位成本下，识别能改善完整任务的可学习缺口，并自适应安排补练”。** 后者仍必须与上述直接前作比较；不能只对照普通 SAC 或 SFT。

## 12. 如何选基线、任务与评价口径

### 12.1 对照应该拆开“采集器”和“学习器”

若研究的是采集规则，优先固定底层 learner、初始数据、模型规模、奖励与动作空间，再比较：

| 对照 | 它排除的替代解释 |
|---|---|
| 原部署分布均匀采样 / 普通 online FT | 提升是否只因增加在线数据 |
| 低成功率优先 | 是否只是困难样本挖掘 |
| ensemble uncertainty / UCB 优先 | 是否只是现成乐观探索 |
| 访问覆盖优先 | 是否主要来自数据多样化 |
| 近期学习进展优先 | 是否需要更复杂的收益模型 |
| 人指定瓶颈 / 人触发纠正 | 自动诊断相对人工策略的价值和人工成本 |
| 只有 replay 优先级、没有定向新采集 | 收益究竟来自更新方式还是新增数据分布 |
| 相同选择器但不计准备成本 | 成本感知是否真的提高单位墙钟效率 |

这里列的是与文献机制对齐的对照轴，不要求把所有论文原系统原样搬到同一机器人。高层 EES/CMA-ES 与低层 SAC 不能仅凭最终成功率直接排名；应在共同候选与预算接口下比较选择机制。

### 12.2 适合验证不同主张的现有任务来源

| 研究主张 | 文献中的任务族 | 为什么合适 |
|---|---|---|
| 局部知识缺口与新采集 | IDA/online grasp 的困难抓取对象 | 候选明确、二元反馈清楚、易隔离采样策略 |
| 失败配置定向微调 | TwinRL 的空间配置变化、SERL/HIL-SERL 的插入任务 | 可以独立划定已知区、困难区与保留测试区 |
| 长任务瓶颈修补 | PARTS 耳机/线缆、PTP 抽屉组合任务 | 可区分局部成功与完整任务成功，检查上游影响 |
| 自主准备与调度 | DBAP 厨房任务图、EES 技能序列 | 选择目标以后还需实际到达，能测准备成本 |
| 大量前期方法消融 | EARL、RSA 的 Gymnasium-Robotics 等模拟设置 | 可多 seed、可重复诊断；结论仍须单独真机验证 |

离线机器人数据能提供初始化和候选覆盖，但静态数据集本身无法验证主动采集闭环。上述论文的平台与指标差异很大，本次未发现可直接汇总成统一排行榜的真机 benchmark。

### 12.3 最有区分力的指标

除最终成功率，至少保留以下三组：

- **学习效果：** 目标部署分布上的成功率—交互预算曲线；最弱配置/技能的表现；补练区域和未补练区域分别的收益与遗忘。最终评估不沿着采样器偏好的场景分布进行。
- **采集效率：** 总真实环境步、尝试次数、成功数据数、准备/恢复/复位次数和耗时、总墙钟、人工分钟。初始示范与孪生/奖励模型准备分开列出。
- **诊断质量：** 被判值得练的候选，实际补练后是否提高性能；能否区分不可达、噪声大和欠训练；何时宣布达标，达标后是否回退。

一次训练中做很多评估 rollout，不能替代多个独立训练 seed；“成功率 100%”也必须附分母。按图估计的数值、完整任务与关键阶段、pass@1 与多次重试，应分别标注。真机组件消融较少，正是这条文献线目前的重要证据缺口。

## 13. 阅读顺序与实现入口

**如果目标是做“真机深度 RL + 主动补数据”：** 先读 **TwinRL → DBAP → AERM → UniIntervene → PARTS**。它们依次回答在哪里练、怎么安排覆盖并到达、动作层如何选信息、卡住时如何恢复、如何把瓶颈变成可训练局部任务。再用 online grasp/IDA 检查主动选择的实机消融证据。

**如果目标是做“自动识别能力缺口并分配练习预算”：** 先读 **EES → Deliberate Practice → DBAP → PARTS**。重点看前置条件、技能依赖、能力外推和人工诊断边界；再考虑如何接到 SERL/HIL-SERL/RLT 一类学习器。

| 可复用入口 | 检索时核实到的资产 | 使用时要保留的范围 |
|---|---|---|
| [AERM](https://github.com/TimSchneider42/aerm) | 官方方法代码 | 真机装置和感知仍需适配 |
| [PTP](https://github.com/patrickhaoy/ptp) | 官方代码 | 潜空间规划＋IQL，不是现成多任务缺口调度器 |
| [EES](https://github.com/rai-opensource/predicators/releases/tag/planning-to-practice-ees) | 指定代码 release | 技能/符号规划框架 |
| [GEAR](https://github.com/guided-exploration-autonomous-rl/gear-code/tree/main) | 官方代码 | GCSL 与可达子目标实现 |
| [MEDAL++](https://github.com/rehaanahmad2013/self-improving-robots/) | 官方代码 | 自主复位与 visuomotor 学习 |
| [MTRF](https://github.com/facebookresearch/MTRF) | 官方代码 | 特定臂手与任务图 |
| [SERL](https://github.com/rail-berkeley/serl) / [HIL-SERL](https://github.com/rail-berkeley/hil-serl) | 真机学习系统代码 | 适合作为底座；主动诊断和调度需另外实现 |
| [RLIF](https://github.com/pd-perry/RLIF) | 官方代码 | 人工接管反馈转奖励 |
| [UniIntervene](https://github.com/Denghaoyuan123/UniIntervene) | 离线训练管线 | 未包含物理部署/HIL 集成与训练数据 |
| [ThriftyDAgger](https://github.com/ryanhoque/thriftydagger) | 主动门控与模拟代码 | 物理接口需另行取得 |
| [E2HiL](https://github.com/E2HiL/E2HiL-project-a1x) | A1_X 实现，另有 LeRobot 分支 | 更新规则组件，不能代替主动采集器 |

这些是已核实的入口，不代表逐仓库运行复现。PARTS/FARL 项目显示代码尚未完整发布；TwinRL、DBAP、IDA、LEGS 等未在本次报告中确认完整可运行的官方真机训练包，不能把项目页上的 Code 按钮直接当复现完成。

## 14. 检索范围与证据边界

本报告通过关键词检索、作者项目和前后向引用追踪，覆盖四条线：不确定性与信息增益采集；能力估计与练习预算；失败恢复、主动求助与奖励查询；offline-to-online、数字孪生指导与基础策略的局部修补。代表性查询包括 `real robot manipulation reinforcement learning active exploration uncertainty`、`robot active practice skill competence learning budget` 和 `offline to online robot reinforcement learning targeted exploration failure states`。主文献范围截止 2026-09-28；2026-10-06 仅定向补充前述方法解释与证据边界。

优先使用正文、附录与正式论文集，其次为作者机构记录、项目和官方代码。纳入时分别核对主动信号、被改变的采集决策、实际物理执行和被更新的模型。仿真训练、训练后真机部署、在线模仿学习、离线数据池挑样以及仅更新奖励或动力学的工作，保留在相应近邻层次，未混作真机任务策略在线 RL 的直接证据。

部分工作未完整报告独立训练次数、评估分母、误差定义或总墙钟，正文保留这些缺项。没有运行机器人训练或逐仓库复现；代码入口的可访问性不证明完整真机系统可运行。KGRL 扩展的正式录用状态、部分尚未稳定访问的项目与后续代码发布仍需另行核实。本报告属于围绕机制的深入调研，不提供数据库穷尽性或新颖性保证；若形成具体研究主张，应按该主张继续做更窄的引用追踪。
