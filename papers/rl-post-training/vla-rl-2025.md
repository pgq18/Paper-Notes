---
type: "paper"
title: "VLA-RL: Towards Masterful and General Robotic Manipulation with Scalable Reinforcement Learning"
shortTitle: "VLA-RL"
year: 2025
date: "2026-09-25"
category: "rl-post-training"
tags: ["VLA", "机器人操作", "在线强化学习", "PPO", "过程奖励"]
authors: ["Guanxing Lu", "Wenkai Guo", "Chubin Zhang", "Yuheng Zhou", "Haonan Jiang", "Zifeng Gao", "Yansong Tang", "Ziwei Wang"]
paper: "https://arxiv.org/abs/2505.18719"
code: "https://github.com/GuanxingLu/vlarl"
project: ""
venue: "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS 2026；作者主页列示，track 未核实)"
venueType: "conference"
publicationStatus: "accepted"
firstPublished: "2025-05-24"
publishedAt: ""
publicationSources: ["https://arxiv.org/abs/2505.18719", "https://guanxinglu.github.io/"]
summary: "从已完成模仿微调的 OpenVLA 出发，以在线 PPO、伪过程奖励和并行训练改善 LIBERO 操作成功率，同时辨明泛化、推理扩展与实现完整性的证据边界。"
status: "read"
---

# VLA-RL：让会模仿的机器人从自己的尝试中继续学习

VLA-RL 研究怎样把预训练机器人策略变成能够继续试错、改进动作的策略。它的价值集中在自回归动作模型、在线策略优化和训练系统的衔接；最直接的证据是 OpenVLA 在 LIBERO 四个任务套件上的平均成功率由 76.5% 提高到 81.0%。

## 论文来源

| 项目 | 信息与来源 |
| --- | --- |
| 发表场所与状态 | 第一作者主页将论文列为 **IROS 2026**，据此记为作者报告录用；会议论文集、具体 track 和正式出版日期尚未核实。[作者主页](https://guanxinglu.github.io/) |
| 最早公开时间 | 可核实的论文全文版本为 **2025-05-24，arXiv v1**。官方仓库有 2025 年 4 月代码及博客链接提交，但提交日期不足以确定材料首次对外公开日。[版本记录](https://arxiv.org/abs/2505.18719) |
| 正式发表时间 | 未核实；不以会议举行日期或作者主页更新日替代。 |
| 所读版本 | [arXiv v1 PDF](https://arxiv.org/pdf/2505.18719v1)，15 页，含正文和参考文献，无附录；当前 arXiv 记录仅此版本。笔记书目年份采用所读预印本的 2025 年。 |
| 官方代码 | [GuanxingLu/vlarl](https://github.com/GuanxingLu/vlarl)，论文首页及作者主页均指向该仓库。当前公开训练入口以环境结果奖励为主，不能据此认定论文完整 RPRM 流程已公开。 |
| 项目主页 | 官方 README 指向同名 [Notion 博客](https://congruous-farmhouse-8db.notion.site/VLA-RL-Towards-Masterful-and-General-Robotic-Manipulation-with-Scalable-Reinforcement-Learning-1953a2cd706280ecaad4e93a5bd2b8e3)，本次未能读取内容；独立项目主页未核实，`project` 暂留空。 |

已阅读全文并核对关键公式、图表与当前官方实现。历史推导仅采用 2025 年 4 月前的工作，以避开早期博客时间的不确定性；后续工作检索截至 **2026-09-24**，重点覆盖 VLA 泛化与机器人过程奖励。RPRM 的标签编码和奖励映射等缺口在方法部分说明。

## 1. 研究问题、背景与价值

机器人接到“把橙汁放进篮子”的指令，能够走近物体，却可能在稍偏的位置提前闭合夹爪。接下来，它看到的场景已经偏离成功示范；只学过正确抓取的策略未必知道如何重新对齐。关键困难在于动作会改变下一步输入，早期误差能够不断放大。

本文希望利用已有 OpenVLA 的视觉、语言和动作能力，通过与环境继续交互来改善执行。实际实验对象是 LIBERO 仿真中的 40 项操作任务：分别从四个套件的 SFT 检查点出发做 RL，不能把这些结果解读为同一个策略已经掌握开放世界操作。[P0，§4.1](https://arxiv.org/html/2505.18719v1#S4.SS1)

## 2. 从前人工作，怎样走到这个 idea

**首先，已有 VLA 提供了可执行、可计算概率的动作起点。** OpenVLA 把连续动作的每一维离散化为 token，在图像和指令条件下预测动作序列。模仿学习通过动作 token 的交叉熵，让示范中的动作更可能被生成。这既借用了视觉语言模型的表示能力，也避免从随机动作开始摸索机器人控制。[P1，§3.2](https://arxiv.org/html/2406.09246v1)

但示范损失主要约束专家访问过的状态。策略自己夹偏、碰歪物体后，产生的新状态未必得到过监督。DAgger 很早就指出这种序贯决策中的分布偏移，并通过让当前策略采集状态、请专家补标动作来处理它。由此可以推出一个设计要求：学习数据应包含策略实际会遇到的局面。在线 RL 则可以使用任务回报评价自己的尝试，减少对逐状态专家动作标注的依赖。[P2，§1、算法 3.1](https://proceedings.mlr.press/v15/ross11a.html)

**接下来的问题是怎样稳定地更新大模型。** VLA-RL 之前的 iRe-VLA 已探索在线 RL：先冻结视觉语言主干，强化学习动作头，再用成功轨迹监督更新全模型。这说明在线交互有用，也说明直接更新大规模 VLA 的稳定性和算力负担需要单独处理。对于 OpenVLA，动作本身已有概率表达，因此可尝试直接用策略梯度提高高回报动作的概率；大规模采样和更新能否稳定运行，仍取决于训练系统。[P3，§IV](https://arxiv.org/html/2501.16664v1)

最后，长任务往往只在结尾给成功或失败。两条都没完成的轨迹，一条可能已抓起物体，另一条还没接触目标，终局标签却无法直接表达这一区别。过程监督提供了可借鉴的线索：中间反馈能更准确地定位进展或错误。Let’s Verify Step by Step 在数学解答评分中验证过这种思路；它并未用 RL 更新生成器，机器人领域仍需自己的标签来源与验证。[P4，§2.1、§6.1](https://arxiv.org/html/2305.20050v1)

沿着这条因果链，候选想法就清楚了：**利用预训练 VLA 缩小探索范围，按完整交互回报更新动作概率，再从成功轨迹中提取中间进展，帮助在线学习。** 这是根据历史材料重建的合理动机。PPO、GAE 和过程监督已有前史；本文重点是它们如何接入自回归机器人策略，以及伪奖励和系统细节是否真正改善训练。

## 3. 核心 intuition

示范给机器人一个有用的起点，环境交互让它看到自己会犯的错误，回报决定哪些尝试值得保留。中间奖励希望缩短“做了某个动作”与“知道它是否有帮助”之间的距离。这里的关键前提是：这些中间信号确实对应任务进展，否则更有效的优化也可能放大奖励误差。

## 4. 方法与一个简单例子

整体循环是：**策略生成动作 → 并行环境执行 → 环境与奖励模型评分 → 估计优势 → PPO 更新策略和价值模型 → 再采样。** 训练期间有策略、价值模型和冻结的过程奖励模型；普通部署执行只需改进后的策略。

**第一步：把机器人动作接入序列策略优化。** 时刻 $t$ 的输入是图像 $o_t$ 和任务指令 $c$，OpenVLA 生成 7 个动作 token，再解码为位置增量、旋转增量和夹爪控制。“多轮对话”描述的是观察与动作交替发生，并不要求机器人先生成文字推理链，也不意味着这里额外设计了长历史记忆。

记动作 token 为 $z_{t,1:7}$，利用自回归概率的乘法法则，可得到整个动作的对数概率：

$$
\ell_t(\theta)=\log\pi_\theta(a_t\mid o_t,c)
=\sum_{i=1}^{7}\log p_\theta(z_{t,i}\mid o_t,c,z_{t,<i}).
$$

这里为便于理解显式补出了前序 token 条件；论文式（1）将其省写。这样，七个 token 共同构成一次环境动作，可以用该动作后续带来的回报来更新，而无需给每个 token 单独编造物理奖励。[P0，§3.3、式（1）](https://arxiv.org/html/2505.18719v1#S3.SS3)

**第二步：准备中间奖励。** 启发式标注开始前，已经有来自专家示范和先前模型运行的成功轨迹。论文 §3.4 对收集步骤只给出一句来源说明：“We collect a dataset of diverse successful trajectories from expert demonstrations and previous model runs.” 随后直接进入夹爪分段和关键帧标注，未说明具体专家数据子集、轨迹数量、两类来源比例、先前模型的身份与检查点，或筛选成功轨迹的操作协议。§4.1 的 SFT 初始化设置也不足以证明这些轨迹必然由该 SFT 检查点生成。[P0，§3.4](https://arxiv.org/html/2505.18719v1#S3.SS4)

在这些已视为成功的轨迹上，先依据夹爪开合的明显变化划分阶段，再在阶段内寻找末端速度接近零的关键帧，为通向这些位置的动作序列标注正向伪奖励。因此，启发式主要负责补充中间进展标签，不能据此认定它还承担了整条轨迹的成功筛选。

接着用这些标签离线微调视觉语言模型，得到 RPRM。**在后续在线 PPO 训练中，RPRM 就已冻结**；更新的是策略和价值模型，并非等部署时才冻结奖励模型。算法 1 也直接把已训练的 RPRM 列为输入，没有描述每轮 RL 收集成功轨迹后再重训它。在线学习时，将其预测奖励与环境稀疏奖励相加；普通固定策略部署只需策略，继续在线学习才需要保留奖励路径。[P0，§3.2、算法 1](https://arxiv.org/html/2505.18719v1#S3.SS2)

$$r_t=r_t^{\mathrm{sparse}}+r_t^{\mathrm{RPRM}}.$$

论文式（3）写成下一 token 预测的负对数似然目标，但相邻文字提到的“伪奖励加权”未在公式中显式出现，奖励 token 如何编码、概率如何变成标量奖励、失败负例如何处理也没有交代完整。因此可以讲清标签来源和反馈用途，却无法从 v1 唯一还原其训练配方。所核对的公开代码版本 `212379e` 中，主 PPO 入口的过程奖励调用被注释，直接使用环境奖励。[P0，§3.4、算法 1](https://arxiv.org/html/2505.18719v1#S3.SS4)；[官方实现对应位置](https://github.com/GuanxingLu/vlarl/blob/212379e840376e07505cba398c0c587d96a13678/ppo_vllm_ray_fsdp_v3.py#L1450-L1458)

**第三步：根据整段交互更新动作概率。** 价值模型预测当前状态的未来回报，GAE 把之后的奖励和价值估计汇总为优势 $A_t$，表达某次动作的后续表现比当前预期好多少。新旧策略对已采样动作的概率比为 $\rho_t=\exp(\ell_t(\theta)-\ell_t(\theta_{\mathrm{old}}))$。论文使用已有的 PPO 目标：

$$
\max_\theta\ \mathbb E_t\left[\min\left(
\rho_t A_t,\ \operatorname{clip}(\rho_t,1-\epsilon,1+\epsilon)A_t
\right)\right].
$$

正优势鼓励提高这类动作的概率，负优势鼓励降低概率；截断项限制过大的概率变化继续带来目标收益。策略通过 LoRA 更新，采样前将更新后的权重同步到推理端。这里的“轨迹级”指学习信号来自多步交互，实际 PPO 仍按时刻计算动作概率比与优势。[P0，§3.3](https://arxiv.org/html/2505.18719v1#S3.SS3)

**第四步：让循环稳定、足够快。** 先只训练价值模型进行 warmup，减轻随机价值估计对策略的误导；用并行环境、批量动作生成和分布式训练提高吞吐量。

其中，**课程采样控制下一次在线 episode 从哪种任务情境开始**，不负责挑选专家数据的训练 minibatch。论文以指令和初始状态描述情境；所核对的公开代码在给定任务内选择初始状态，按 `(task_id, state_id)` 保存运行成败。流程是根据已有结果估计成功率、采样起点、执行 rollout，再把结果加入历史；PPO 随后使用采集的数据更新策略。[P0，§3.5](https://arxiv.org/html/2505.18719v1#S3.SS5)；[课程采样实现](https://github.com/GuanxingLu/vlarl/blob/212379e840376e07505cba398c0c587d96a13678/envs/wrappers.py#L182-L211)

文字上的目标是优先练习当前成功率约为 50% 的情境。假设 A、B、C 当前成功率分别为 90%、50%、10%，B 会成为重点；这些只是教学例子，论文没有预先划定这三档难度。同一个 B 随策略进步从 10% 变成 50%、再变成 90% 时，其采样优先级也会改变。**初始状态是可调的采样变量，难度则是相对于当前策略的经验成功率。** 任务目标、策略能力、机器人动力学、观测质量与随机扰动都会影响成败；这个模块把它们的影响汇总到成功率中，没有逐项建模。

这里有一处需保留的差异：论文式（4）$P(j)\propto\exp((0.5-s_j)/\tau)$ 在正温度下单调偏向低成功率，不能实现文字所说的“优先约 50%”。公开代码使用的核心权重则为

$$w_j=\left(\frac{1}{|s_j-0.5|+10^{-9}}\right)^{1/\tau},$$

再归一化采样，并支持最小概率设置；这个表达式才在成功率靠近 50% 时给出更高权重。两者不能拼成同一份已确定的实验配方，当前代码也不能反证论文实验究竟采用哪一式。这里的课程温度控制起点采样分布，与动作生成的采样温度是两个参数。

**把流程放进一个具体场景。** 以下借用图 3 的“把橙汁放进篮子”任务作教学推演，不是论文的逐步执行日志。预训练策略看到橙汁，生成七个 token，让夹爪靠近；环境执行后返回新图像。有一次尝试在夹偏后重新对齐、抓起、移动并释放，另一次始终空抓。最终成功信号会区分两条轨迹；过程模型还试图在抓取、稳定持物等阶段提供更早反馈。GAE 将这些回报与原有价值预期比较，PPO 随之提高有利动作在相应状态下出现的概率。多轮更新后，再遇到类似偏差时，策略有机会生成更好的调整动作。若过程模型误把空抓后的停顿认作进展，同一循环也可能强化错误，这正是奖励可靠性的重要性。

## 5. 实验：问题、关键数据与结论

**在线 RL 是否改善已有策略？** 四个套件各 10 项任务，按套件从 SFT 检查点分别微调。下表均为论文报告的成功率（%，越高越好）。

| 方法 | Spatial | Object | Goal | Long | 四套件平均 |
| --- | ---: | ---: | ---: | ---: | ---: |
| OpenVLA，SFT | 84.7 | 88.4 | 79.2 | 53.7 | 76.5 |
| GRAPE，DPO | 87.6 | 91.2 | 82.2 | 55.8 | 79.2 |
| VLA-RL | **90.2** | **91.8** | **82.2** | **59.8** | **81.0** |
| π₀-FAST，参考模型 | 96.4 | 96.8 | 88.6 | 60.2 | 85.5 |

来源：[P0，表 1，PDF p.8](https://arxiv.org/pdf/2505.18719v1#page=8)。正文称每套件评估 500 episodes，但未澄清各基线是否重跑及跨种子汇总方式；没有报告方差。保留原始百分比，不反推成功次数。π₀-FAST 的训练数据和模型不同，作为参考。

相对 SFT，平均提升 **4.5 个百分点**；相对 GRAPE 提升 1.8 个百分点。Long 提升 6.1 个百分点，但终点仍只有 59.8%。摘要的“匹敌 π₀-FAST”应收窄：Long 两者接近，四套件平均仍相差 4.5 个百分点。

**收益来自哪些条件？** 以下消融仅在 LIBERO-Spatial 上进行，指标为最终成功率。

| 设置 | 成功率（%，↑） |
| --- | ---: |
| 完整 VLA-RL | 90.2 |
| 移除 RPRM | 85.8 |
| 移除课程采样 | 88.0 |
| 采样温度从 1.5 改为 1.0 | 85.8 |
| critic warmup 从 5 改为 0 | 80.0 |
| 学习率从 $2\times10^{-5}$ 改为 $2\times10^{-4}$ | 0.2 |

来源：[P0，表 2，PDF p.8](https://arxiv.org/pdf/2505.18719v1#page=8)。该表未单独说明评估次数、重复次数与误差范围。

RPRM 在这套配置下对应 4.4 个百分点增益；课程采样替换成均匀随机采样后降低 2.2 个百分点，但这不证明目标成功率 50% 普遍最优。warmup 和学习率对稳定性的影响更大。数据支持多个环节有贡献，但“移除任何组件都会迅速崩溃”的表注过强：移除课程仍有 88.0%，真正接近完全失败的是学习率增大十倍。单因素消融也没有直接量化组件之间的协同作用。

**更多计算对应什么改善？** 图 4 每隔 2500 个 RL 训练步评估一次，下面保留两个套件的图中标注值。

| RL 训练步数 | Spatial 成功率（%，↑） | Long 成功率（%，↑） |
| ---: | ---: | ---: |
| 0 | 84.0 | 54.0 |
| 2500 | 85.6 | 55.8 |
| 5000 | 88.2 | 58.0 |
| 7500 | 88.2 | 55.8 |
| 10000 | 90.2 | 59.8 |

来源：[P0，图 4，PDF p.7](https://arxiv.org/pdf/2505.18719v1#page=7)。这些是图中明确标注的数值；起点与表 1 的 SFT 值略有不同，分别保留。

曲线展示的是增加环境交互并更新参数后的改善，Long 中途还有回落。它支持“继续 RL 后训练有收益”，尚未建立固定模型在单次部署中增加推理预算的规律，也没有给出可外推的 scaling law 拟合。文中另报 48 GPU 小时，但未提供足够完整的硬件及预算口径来复算效率。

## 6. Take-aways

1. **预训练的价值包含探索起点。** 已经会接近、抓取物体的策略，让在线学习更有机会获得有区分度的反馈。
2. **奖励质量与优化稳定性共同决定收益。** 更密的反馈值得尝试，critic 初始化和更新步长同样可能决定训练成败。
3. **广泛操作能力需要分项证据。** 四套件上的成功率提升有价值，开放世界泛化、真实机器人和固定权重推理扩展需要各自对应的实验。

## 7. 比较脆弱的假设

**成功轨迹中的运动事件能够代表任务进展。** 夹爪变化和低速关键帧是容易提取的线索，但空抓、碰撞后停住也可能产生相似信号。一旦在线策略进入示范之外的状态，冻结的 RPRM 可能给出错误奖励；直接相加会让这个误差进入策略优化。论文也承认启发式标签难以覆盖更灵巧的操作。[P0，§5](https://arxiv.org/html/2505.18719v1#S5)

**基准内提升能延伸到所需的泛化维度。** 本文主要依靠套件成绩、二维动作分布和个例分析支撑鲁棒性，动作覆盖更广本身不等于能处理新视觉、新语义和新动力学。稍晚公开的同期工作 What Can RL Bring to VLA Generalization?（2025-05-26）分别测试这些维度，发现执行层面收益更明显，语义有改善，视觉鲁棒性与 SFT 相近。这提示应具体问“哪一种变化下更稳”。[P5，项目结果及论文](https://rlvla.github.io/)

**环境允许持续获得足够的试错经验。** 本文的收益建立在可并行、可重置的仿真交互上，v1 只在 LIBERO 中评估，§5 将大规模真实世界经验列为未来方向。按离散状态编号重置、重复试验并估计成功率，在真机上会受到复位成本、连续位置和隐含接触条件的限制；样本少时，“50%”也可能只是估计误差或随机扰动，未必代表可学习的能力边界。并行采集与可靠的成功判定同样有成本。这是根据其采样机制分析出的迁移困难，不能当作本文已完成的真机实验结论。[P0，§5](https://arxiv.org/html/2505.18719v1#S5)

课程思想仍可用于真机，但实现时可能需要按可复现的情境类别或位置范围统计成功率，并配合人工或自动复位，而非照搬精确状态编号。这些是实现建议，VLA-RL 尚未验证。已有真机研究 *Automating Reinforcement Learning with Example-based Resets* 专门研究自动复位，也表明重置是一项需要解决的系统条件，而非课程思想无法应用于真机的理由。[P6，摘要](https://arxiv.org/abs/2204.02041)

## 8. Follow-up：用真实后果校准中间进展

沿着 RPRM 的薄弱处，值得追问：**一个看起来更接近完成的动作，是否真的提高了当前策略最终成功的机会？** 可在仿真中从同一状态分叉，执行不同候选动作，再用相同的当前策略续跑，以最终成功率的差异及其采样不确定性校准过程评分。这样，暂时远离目标但有助于重新抓取的恢复动作，也可能获得正向评价。

这个方向需要与已有进展拉开具体距离。Robo-Dopamine 已研究阶段感知的相对进度与奖励塑形；2026-08-16 公开的 Robo-Dopamine 2.0 又加入历史条件、合成分布外失败和恢复的有符号进度。因此，“增加历史或失败负例”已经有直接近邻。[P7，§3](https://arxiv.org/html/2512.23703v1#S3)；[P8，方法](https://arxiv.org/html/2608.15680v1)

这里拟研究的差异是用**同状态分叉后的实际交互结局**校准与当前策略能力相关的进展。Robo-Dopamine 2.0 的奖励模型使用离线构造的监督，在下游 RL 中保持冻结；这一候选则让当前策略的真实后果参与校准。一个有区分度的预测是：在需要先撤回、再重新对齐的场景，这种评分比表面进度更能识别有效恢复。它是否值得额外采样成本仍需验证，当前检索不构成新颖性保证。[P8，实验设置、附录 C](https://arxiv.org/html/2608.15680v1)

## 参考来源

- **P0**：Guanxing Lu, Wenkai Guo, Chubin Zhang, Yuheng Zhou, Haonan Jiang, Zifeng Gao, Yansong Tang, Ziwei Wang. *VLA-RL: Towards Masterful and General Robotic Manipulation with Scalable Reinforcement Learning*. arXiv:2505.18719v1，2025。[全文](https://arxiv.org/html/2505.18719v1)；[官方代码](https://github.com/GuanxingLu/vlarl)。
- **P1**：Moo Jin Kim et al. *OpenVLA: An Open-Source Vision-Language-Action Model*. arXiv:2406.09246v1，2024。用于动作 token 与模仿目标。[论文](https://arxiv.org/html/2406.09246v1)。
- **P2**：Stéphane Ross, Geoffrey Gordon, Drew Bagnell. *A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning*. AISTATS 2011。用于策略诱导分布与 DAgger。[正式来源](https://proceedings.mlr.press/v15/ross11a.html)。
- **P3**：Yanjiang Guo et al. *Improving Vision-Language-Action Model with Online Reinforcement Learning*. arXiv:2501.16664v1，2025-01-28。用于 iRe-VLA 的两阶段更新及先前在线 RL 路线。[论文](https://arxiv.org/html/2501.16664v1)。
- **P4**：Hunter Lightman et al. *Let’s Verify Step by Step*. arXiv:2305.20050v1，2023-05-31。用于过程监督与信用分配动机。[论文](https://arxiv.org/html/2305.20050v1)。
- **P5**：Jijia Liu et al. *What Can RL Bring to VLA Generalization? An Empirical Study*. 首次公开于 2025-05-26，NeurIPS 2025。用于视觉、语义、执行泛化的区别。[论文](https://arxiv.org/abs/2505.19789)；[项目](https://rlvla.github.io/)。
- **P6**：Jigang Kim, J. hyeon Park, Daesol Cho, H. Jin Kim. *Automating Reinforcement Learning with Example-based Resets*. arXiv:2204.02041，2022。用于真机复位困难与自动复位方案的背景；本次核查摘要。[论文](https://arxiv.org/abs/2204.02041)。
- **P7**：Huajie Tan et al. *Robo-Dopamine: General Process Reward Modeling for High-Precision Robotic Manipulation*. arXiv:2512.23703v1，2025-12-29。用于阶段进度与奖励塑形的近邻比较；本次核查方法。[论文](https://arxiv.org/html/2512.23703v1)。
- **P8**：Yijie Xu et al. *Robo-Dopamine 2.0: History-Conditioned and OOD-Aware Process Reward Modeling for Robotic Manipulation*. arXiv:2608.15680v1，2026-08-16。用于历史条件、分布外失败及恢复监督的近邻比较；本次核查方法及相应附录。[论文](https://arxiv.org/html/2608.15680v1)。
