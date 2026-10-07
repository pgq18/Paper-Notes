---
type: "paper"
title: "Uncertainty-driven Exploration Strategies for Online Grasp Learning"
shortTitle: "Uncertainty-driven Grasp Learning"
year: 2024
date: "2026-10-07"
category: "rl-post-training"
tags: ["机器人抓取", "主动探索", "不确定性估计", "离线到在线强化学习", "吸附抓取"]
authors: ["Yitian Shi", "Philipp Schillinger", "Miroslav Gabriel", "Alexander Qualmann", "Zohar Feldman", "Hanna Ziesche", "Ngo Anh Vien"]
paper: "https://arxiv.org/abs/2309.12038v2"
code: ""
project: ""
venue: "2024 IEEE International Conference on Robotics and Automation (ICRA 2024), pp. 781–787"
venueType: "conference"
publicationStatus: "published"
firstPublished: "2023-09-21"
publishedAt: "2024-08-08"
publicationSources: ["https://arxiv.org/abs/2309.12038", "https://publikationen.bibliothek.kit.edu/1000174339", "https://doi.org/10.1109/ICRA57147.2024.10610056"]
summary: "在离线初始化的像素抓取网络上分解模型与数据不确定性，用模型知识缺口引导真机试抓和在线更新，改善陌生困难物体的箱内吸取。"
status: "read"
---

# Uncertainty-driven Grasp Learning：下一次抓哪里，才能学得更快？

面对陌生、透明或曲面物体，离线抓取网络可能把好位置判坏，也可能对坏位置过度自信。本文让机器人同时预测各位置的抓取收益和不确定性，优先尝试仍有成功机会、但模型缺少经验的位置，再用实际成功或失败更新网络。关键在于区分可通过新经验减少的模型不确定性与数据本身的随机性，让有限的真机抓取更有学习价值。

## 论文来源

| 项目 | 信息与来源 |
| --- | --- |
| 发表来源与状态 | 已发表于 **2024 IEEE International Conference on Robotics and Automation（ICRA 2024）主会论文集**，781–787 页。[作者所属 KIT 的正式记录](https://publikationen.bibliothek.kit.edu/1000174339)、[出版 DOI](https://doi.org/10.1109/ICRA57147.2024.10610056)。 |
| 最早可核实公开时间 | **2023-09-21**，arXiv v1。[版本历史](https://arxiv.org/abs/2309.12038)。 |
| 正式发表时间 | **2024-08-08**，KIT 记录明确标注的在线发表日期；会议举行于 2024 年 5 月，二者含义不同。 |
| 所读版本 | **arXiv v2，2024-04-24**，全文 7 页，包含方法、实验和参考文献，无独立附录。[PDF](https://arxiv.org/pdf/2309.12038v2)、[HTML](https://arxiv.org/html/2309.12038v2)。 |
| 官方代码 | 本次检索未找到可靠的公开入口，`code` 留空。 |
| 项目主页 | 本次检索未找到独立项目页，`project` 留空；论文提供了[演示视频入口](https://youtu.be/fPKOrjC2QrU)。 |

历史动机以 2023-09-21 为界，相关进展核查截至 2026-10-06。IEEE 排版版访问受限，以下方法和数值据 arXiv v2；视频未能打开，代码未运行。

## 1. 研究问题、背景与价值

机械臂用吸盘清空料箱时，透明容器可能让深度传感器读到背景，曲面又可能增加密封难度。吸盘需要边缘整圈贴合表面，抽气后依靠内外压差保持吸力；曲率、吸盘尺寸或接近方向不匹配时，边缘缝隙会漏气。曲面能否吸住也取决于吸盘的柔软程度与适形能力。[P12，吸盘产品说明](https://media.schmalz.com/MAM_Library/Dokumente/Datenblatt_Produktfamilie/0_/060/06004/b0891d59063e_Datasheet_Bellows%20Suction%20Cups%20SAXB_en-EN.pdf)

一个在不透明规则物体上学出的网络，到了这样的料箱就会遇到训练分布之外的情况。

在线更新可以纠正判断，但机器人必须先选择试抓位置。总选当前评分最高的位置，可能长期忽略被低估的区域；随意增加动作随机性，又会耗费尝试。本文的问题是：**怎样从一个可用的离线起点出发，让下一次真实抓取同时服务于当下成功和后续学习？** 实验对象是箱内吸附抓取，关注陌生困难物体集上的适应。[P0，§I、§IV](https://arxiv.org/pdf/2309.12038v2)

## 2. 从前人工作，怎样走到这个 idea

抓取结果本身已经能提供学习信号。QT-Opt 根据实际成功或失败训练视觉价值函数，并结合离线经验与在线交互改善策略。这说明无需为每个新物体手工标注所有好抓点；不过，该系统使用超过 58 万次抓取，有限真机预算下的适应还需要更有选择地获取经验。[P1，§§3–5](https://arxiv.org/pdf/1806.10293)

一个已有方向是把抓取候选视为需要探索的选项。LEGS 利用成功概率的置信界，在单个物体的不同稳定姿态下维护少量活跃候选，逐渐淘汰差的抓法。它把尝试集中到“仍有希望、尚不确定”的候选上。但杂乱料箱的遮挡会随取走物体而变化，吸盘方向还需要连续调整，直接维护固定的姿态与候选表会变得困难。因此，需要让成功预测和未知程度都随当前图像更新，并细化到空间位置。[P2，§§I–III](https://arxiv.org/pdf/2111.15002)

ConvSAC 已提供一个合适接口：逐像素生成抓取方向，再由 critic 评价这些动作。下一步缺少的是“评分有多可靠”。SUNRISE 已把多个价值网络的分歧用于 SAC 的上置信界探索：在预计收益之外给不确定动作一个奖励，使策略有机会纠正已有判断。这样的分歧可以接到像素价值图上，从而改变下一次试抓的空间分布。[P3，§IV-B.1](https://arxiv.org/pdf/2111.01510)、[P4，§4.2](https://proceedings.mlr.press/v139/lee21g/lee21g.pdf)

还需要判断哪种未知值得试。一个位置的结果波动很大，既可能因为模型缺少经验，也可能因为传感器或接触条件本来就不稳定。Clements 等已在回报分布估计中将两者分开：先看模型之间对同一分位点的分歧，再看模型平均后不同分位点的跨度。由此得到一个候选：**分别估计知识缺口与结果随机性，把探索主要投向有望通过新增反馈改善的知识缺口。** 这是基于已有证据的动机解释。[P5，§2.2](https://arxiv.org/html/1905.09638)

这一基本探索思想已有紧邻的独立工作：Mazzaglia 等在 2023-08-28 的 v1 已用像素级模型集成与不确定性奖励学习操作。本文的具体贡献落在 ConvSAC、杂乱料箱吸取的离线到在线适应，以及不同不确定性和预测表示的真机对照；没有证据将该近作写成作者的灵感来源。[P6，§III](https://arxiv.org/pdf/2308.14915v1)

## 3. 核心 intuition

模型之间意见不一致的位置，可能存在尚未学清楚的抓取规律，一次真实结果就能帮助修正判断。多个模型已经一致认为结果随机的位置，继续试抓未必能消除随机性。探索需要把这两种情况分开，并随着经验积累降低对未知位置的额外偏好。

## 4. 方法与一个简单例子

系统输入俯视场景的颜色图、表面法向图和高度图，输出抓取位置与吸盘方向。一次决策经过“生成方向 → 评价收益与不确定性 → 选择位置 → 执行并更新”。每次吸取成功奖励为 1，失败为 0。价值及其不确定性估计服务于这个在线探索闭环，动作生成与动作评价都会随反馈更新。[P0，§III](https://arxiv.org/pdf/2309.12038v2)

### 先取得一个能开始试抓的模型

离线数据包含 300 个场景，每场景 5–10 个物体。作者用背景分离定位物体区域，依据局部表面法向的变化构造近似收益标签：表面越平整，通常越适合吸盘密封；方向标签取表面法向的反方向。这些几何标签给模型一个起点，后续真实结果再纠正它。

actor 为每个像素预测方向的高斯分布，critic 接收场景特征与动作，输出对应收益。位置从离散的 $H\times W$ 像素网格中选择，再映射到空间坐标；高度 $z$ 由高度图读取，倾斜角 $\alpha,\beta$ 连续预测，绕吸盘自身轴的旋转因轴对称而忽略。因此，自由参数可写为 $(x,y,\alpha,\beta)$。论文未给出评分图实际的 $H,W$，无法确定实验的具体候选点数；物体数、模型数和分位点数都不等于候选位置数。[P0，§III-A、§III-B、§IV-B](https://arxiv.org/pdf/2309.12038v2)

### 用两种 critic 表示不确定性

MV 与 QR 是分别训练、评估的两种备选方案，各自在内部集成 $N=3$ 个模型，论文没有把两者的输出再融合。下面始终固定同一场景、像素和动作：**分歧沿模型 $j$ 比较判断；波动描述该条件下可能收益的分散程度。** 这些量来自 critic 的收益预测，区别于 actor 生成方向时的动作随机性。

**MV-ConvSACs：预测均值与方差。** 每个模型 $j$ 输出收益均值 $Q_j$ 和条件方差 $v_j$，用高斯负对数似然训练 critic：

$$
L_j=\frac{(y-Q_j)^2}{2v_j}+\frac12\log v_j+C,\qquad v_j>0.
$$

这里 $y$ 是训练目标，离线时来自几何近似标签，在线时获得真实抓取反馈。高斯是收益分布的建模近似。方差头无需额外的“方差标签”：固定输入 $x$ 和均值预测 $\mu$，最小化期望损失可得

$$
v^*=\mathbb E[(Y-\mu)^2\mid x]
=\operatorname{Var}(Y\mid x)
+\bigl(\mu-\mathbb E[Y\mid x]\bigr)^2.
$$

同时把均值学到 $\mu^*=\mathbb E[Y\mid x]$ 时，第二项为零，方差头就对应条件方差。若均值还没学准，预测方差可能吸收均值偏差。因此，$v_j$ 能作为数据不确定性的估计，但有限数据和优化误差下并不保证纯粹反映物理噪声。网络通过共享参数从相近输入学习这个函数，无需每个精确输入都重复试验。[P10，§3.1、Eq.5、7](https://proceedings.neurips.cc/paper_files/paper/2017/file/2650d6089a6d640c5e85b2b88265dc2b-Paper.pdf)

模型集成后的量定义为：

$$
\begin{aligned}
\bar Q&=\frac1N\sum_{j=1}^{N}Q_j,\\
V_{\rm ale}&=\frac1N\sum_{j=1}^{N}v_j,\\
V_{\rm epi}&=\frac1N\sum_{j=1}^{N}(Q_j-\bar Q)^2.
\end{aligned}
$$

$V_{\rm ale}$ 平均各模型内部的方差，表示预测结果的波动，称为数据不确定性；$V_{\rm epi}$ 比较不同模型的均值，作为知识缺口的代理。例如，三个模型均值都为 0.5、方差都为 0.09 时，分歧为零，但它们共同预测了较宽的结果分布。若把集成看作等权高斯混合，全方差公式给出 $V_{\rm all}=V_{\rm ale}+V_{\rm epi}$；这一代数分解不意味着三个网络构成精确的贝叶斯后验。[P0，§III-B.1](https://arxiv.org/pdf/2309.12038v2)

**QR-ConvSACs：预测多个分位点。** 每个模型的 $K$ 个输出头分别对应预先指定的分位水平 $\tau_k$，直接预测收益分位点 $q_{k,j}$，避免预设高斯分布形状。$\tau_k$ 是分位水平，$q_{k,j}$ 是收益值；例如在连续分布中，$\tau_k=0.9$ 对应约 90% 的可能收益低于该值。

各个头从相同的收益目标学习，通过不对称损失确定各自的位置。基础分位数损失为：

$$
L_\tau(y,q)=
\begin{cases}
\tau(y-q),&y\ge q,\\
(1-\tau)(q-y),&y<q.
\end{cases}
$$

当 $\tau=0.9$，预测偏低时以 0.9 的权重向上调整，偏高时以 0.1 的权重向下调整。对连续条件收益分布，期望损失的导数为 $F_{Y\mid x}(q)-\tau$，理想平衡位置满足 $F_{Y\mid x}(q)=\tau$，因此学到相应分位点。本文使用分位数 Huber 损失：保留这组不对称权重，并在小误差处平滑，用作分位点学习的近似。具体 $\tau_k$ 网格和 Huber 阈值未见报告，不能把教学示例当作实验配置。[P0，§III-B.2](https://arxiv.org/pdf/2309.12038v2)、[P11，Eq.8–10](https://arxiv.org/pdf/1710.10044)

记 $\bar q_k=N^{-1}\sum_jq_{k,j}$，则

$$
\begin{aligned}
Q&=\frac1K\sum_{k=1}^{K}\bar q_k,\\
V_{\rm epi}&=\frac1K\sum_{k=1}^{K}\frac1N\sum_{j=1}^{N}(q_{k,j}-\bar q_k)^2,\\
V_{\rm ale}&=\frac1K\sum_{k=1}^{K}(\bar q_k-Q)^2.
\end{aligned}
$$

计算 $V_{\rm epi}$ 时，先固定分位点 $k$，比较各模型 $j$ 的预测，再平均所有分位点上的分歧。计算 $V_{\rm ale}$ 时，先平均模型得到共识分位点 $\bar q_k$，再计算不同分位点的分散程度。这样能减轻单个模型没学准分布形状却被解释成数据噪声的混淆。[P0，§III-B.2](https://arxiv.org/pdf/2309.12038v2)、[P5，§2.2](https://arxiv.org/html/1905.09638)

下面用教学输出展示这两个维度，数值不是论文测量：

| 分位点 | 模型 1 | 模型 2 | 模型 3 | 模型平均 $\bar q_k$ |
| --- | ---: | ---: | ---: | ---: |
| 低 | 0.1 | 0.2 | 0.3 | 0.2 |
| 中 | 0.4 | 0.5 | 0.6 | 0.5 |
| 高 | 0.7 | 0.8 | 0.9 | 0.8 |

横向计算同一行的模型方差，再平均三行，得到 $V_{\rm epi}\approx0.0067$；纵向计算最后一列相对 $Q=0.5$ 的方差，得到 $V_{\rm ale}=0.06$。模型对分位点的判断比较接近，却共同预测了较宽的收益分布。这里三个分位点是分布中的位置，并非三次抓取样本。MV 只用均值衡量分歧，QR 还可反映均值相同、分布形状不同的模型分歧。

以上按均值定义统一记号：v2 的 MV 均值表达式漏写 $1/N$，QR 数据方差内的求和上限印为 $j$，应对应 $N$；两处均已核对 PDF，公开实现尚无法核查。

### 把估计转成下一次抓取

推理时平均各 actor 的方向预测，按下面的乐观评分选择像素 $i$：

$$
S_i=Q_i+\delta V_i,\qquad i^*=\arg\max_i S_i.
$$

每个模型一次前向计算输出整张预测图，$\arg\max$ 比较 $H\times W$ 网格上的分数，机器人只执行选中的一个抓取；无需每个像素分别运行完整网络，也没有枚举该位置所有连续方向。$Q_i$ 偏向当前预测收益高的位置，$\delta V_i$ 给不确定位置额外的探索机会。$S_i$ 是选点分数，可超过 1；“探索奖励”指这里的加分，环境反馈仍是成功 1、失败 0。

本文分别试验 $V_{\rm epi}$、$V_{\rm ale}$ 和总方差；公式直接使用方差，未开平方。固定探索设 $\delta=1$，自适应版本让它按余弦从 1 衰减至 0，逐渐转向依据收益行动。当 $\delta=0$，选点就只依据当前平均收益。

结果进入共享数据缓冲区，各模型从中更新。真实反馈只给实际执行的像素提供监督，未尝试位置没有此次真值；但共享参数的更新仍可能改变其他位置和相似场景的预测。每 10 次更新向推理进程同步参数。训练更新与新增真实抓取的报告比率为 6:1，表示平均每新增一次抓取经验进行约六次更新，并重复利用缓冲区数据；正文没有细分到每个集成成员的计数。critic 按抓取标签监督训练，正文未展开完整的多步 Bellman 目标，这里据其明确写出的选择与更新过程解释。[P0，§III-C、Eq.1](https://arxiv.org/pdf/2309.12038v2)

### 用三个候选位置走通

以下是用于理解 MV 版本的教学数值，均非实测。假设 actor 已为箱子中央 A、陌生透明容器 B 和易打滑曲面 C 生成方向，三个 critic 得到：

| 候选 | 三个收益预测 $Q_j$ | 均值 $\bar Q$ | 模型方差 $V_{\rm epi}$ | 数据方差 $V_{\rm ale}$ | $\bar Q+V_{\rm epi}$ |
| --- | --- | ---: | ---: | ---: | ---: |
| A | 0.60、0.60、0.60 | 0.60 | 0 | 0.02 | 0.60 |
| B | 0.10、0.70、0.85 | 0.55 | 0.105 | 0.02 | 0.655 |
| C | 0.50、0.50、0.50 | 0.50 | 0 | 0.20 | 0.50 |

只按均值会选 A；知识缺口奖励让机器人先试 B。C 的模型已一致，但预测结果波动大。若奖励总方差，C 的分数变为 0.70，超过 B 的 0.675，就可能把尝试转向难以消除的波动。

假设 B 试抓失败，这个位置的标签为 0，模型用它更新评价和方向。为了演示后续选择，再设更新后的三个预测变成 0.20、0.25、0.30：均值约 0.25，模型方差约 0.0017，探索分数随之降到约 0.252，下一次便更可能选择 A。一次失败并不保证真实网络立刻这样变化；例子展示的是反馈如何改变候选排序。

## 5. 实验：问题、关键数据与结论

论文报告的在线学习、评估和消融均在真机上进行，未报告独立仿真实验。硬件是 Franka Emika 机械臂、Schmalz 吸盘和 RealSense D415。前面的“离线预训练”表示用已有场景数据训练，其几何标签不等于每个候选点都经过真实试抓。

在线采样使用含 10–17 个困难物体的料箱；评估有两个预设场景，每场景 17 个物体，物体来自在线对象集。每回合最多 25 次抓取，清空可提前结束。**抓取成功率＝成功抓取数／实际尝试数；清空率＝移除物体数／17。** 结果在场景间平均；原文未报告精确总尝试数、独立训练次数及误差计算细节，图中的标准差不能当作置信区间。[P0，§IV](https://arxiv.org/pdf/2309.12038v2)

### 哪类不确定性适合奖励？

在各自 MV 或 QR 架构内对照，均集成 3 个模型；online 基线使用标准 SAC 探索。技术设置报告 4000 步基础训练，各探索消融追加 3000 次训练更新；下表为 Fig.4 柱内标注的抓取成功率。

| 策略 | MV 成功率（%，↑） | QR 成功率（%，↑） |
| --- | ---: | ---: |
| 离线模型 | 42.0 | 52.8 |
| 在线基线 | 65.3 | 62.3 |
| 奖励数据不确定性 | 63.5 | 45.9 |
| 奖励模型不确定性 | 77.3 | 75.6 |
| 奖励总不确定性 | 55.8 | 59.6 |
| 模型不确定性＋探索衰减 | **79.1** | **79.1** |

**在本文真机设置下，模型不确定性 $V_{\rm epi}$ 最适合作为探索加分，配合探索衰减效果最好。** 自适应策略比在线基线分别高 **13.8、16.8 个百分点**。数据和总不确定性奖励均低于对应在线基线；部分仍高于离线模型，不能概括为比所有基线都差。这个结果与“交互可以补足知识缺口，而结果波动可能持续存在”的解释一致，但实验没有独立证明两种物理来源已被完美分离。[P0，Fig.4、§IV-C.1，PDF p.5](https://arxiv.org/pdf/2309.12038v2)

### 适应是否平稳，交互量怎样理解？

下表选取自适应模型不确定性探索的几个检查点，数值来自 Fig.5 的柱内标注。

| 在线训练更新步数 | MV 成功率（%，↑） | QR 成功率（%，↑） |
| ---: | ---: | ---: |
| 0 | 42.0 | 52.8 |
| 500 | 59.3 | 44.6 |
| 1000 | 66.1 | 49.0 |
| 3000 | 79.1 | 79.1 |

终点明显改善，但 QR 前 1000 步低于起点，适应存在短期代价。横轴是训练更新，3000 步不能写成 3000 次真机抓取；按所述 6:1 比率推算约为 500 次，作者未直接报告该精确采样数。[P0，Fig.5、§III-C.1](https://arxiv.org/pdf/2309.12038v2)

### 分位点越多是否越好？

QR 的自适应探索改变分位点数量 $K$，其他预算沿用该消融设置。

| 分位点数量 $K$ | 成功率（%，↑） | 清空率（%，↑，正文报告范围） |
| ---: | ---: | ---: |
| 10 | **79.1** | >90 |
| 20 | 63.3 | >70 |
| 100 | 68.1 | >75 |

成功率为原图标注，清空率范围来自正文。10 个分位点最好，100 个较 20 个回升；数据支持“加大分布表示容量未带来更好终点”，没有支持严格的单调关系。这一对照同时改变了模型表示，无法只归因于探索质量。[P0，Fig.6、§IV-C.3，PDF p.6](https://arxiv.org/pdf/2309.12038v2)

## 6. Take-aways

- 在线适应的效率还取决于经验怎样被选出来，已有评分会影响模型以后有机会学到什么。
- 不确定性奖励应优先对应可减少的知识缺口；结果本身不稳定的位置可能持续消耗探索预算。
- 本文提供了困难物体集上有效的真机实例，短期退化与小规模评估也提醒我们关注适应过程的代价。

## 7. 比较脆弱的假设

**模型分歧需要能够反映知识缺口。** 三个模型若共享数据和偏差，可能一致地误判透明区域，导致探索奖励偏小；分歧也可能源于训练不稳定。Charpentier 等在经典控制中观察到，常见 ensemble 的不确定性可能不随数据增加而正确收敛。这里的抓取提升说明该代理在测试场景有用，校准与安全性仍缺少相应验证。[P7，§§4–5](https://arxiv.org/pdf/2206.01558)

**观察必须足以承载能学的规律。** 本文仍从俯视深度生成高度和法向。若透明表面持续缺失，反馈可以纠正收益，却未必恢复可执行的真实位置；被归为数据噪声的一部分，也可能通过换视点或增加接触观测变得可知。因此，两类不确定性的区分依赖当前传感器和状态表示。[P0，§III-A、§IV-C.2](https://arxiv.org/pdf/2309.12038v2)

**新反馈的收益需要值得付出失败成本。** 奖励为成功 1、失败 0，没有单列碰撞、易碎物损坏或时间成本。又因评估物体来自在线对象集，证据主要覆盖这批对象上的适应，对全新对象继续泛化的幅度尚不明确。QR 早期退化也使失败预算成为实际应用中的关键条件。[P0，§III-A、§IV-B、Fig.5](https://arxiv.org/pdf/2309.12038v2)

## 8. Follow-up：让探索对应后续任务收益

值得继续考虑的是：**一次反馈更新模型后，能改善多少后续抓取？** 可以估计候选试抓对剩余料箱或同类物体未来成功率的影响，再结合失败成本排序。这样便能区分局部分歧很大、但经验难迁移的位置，与一次尝试能澄清一类表面抓取规律的位置。

截至本次核查，IDA 的 2024 年版本已用模型信息增益选择操作；同一第一作者的 MS-MEM（2026-09-02）又以共同信息收益比较视点、推和抓，并约束对已有场景认知的扰动。因此，直接提出多技能信息探索已有接近方案。上述候选把评价目标收紧为**在线参数更新后的可迁移任务收益与失败预算**；若机制有效，应在相近尝试成本下改善后续抓取。如何可靠预测更新收益、它与已有信息奖励到底有多大差异，仍待核实。[P8，§III](https://arxiv.org/pdf/2308.14915v3)、[P9，§§IV-B、IV-D](https://arxiv.org/html/2609.02493v1)

## 参考来源

- **P0** Yitian Shi, Philipp Schillinger, Miroslav Gabriel, Alexander Qualmann, Zohar Feldman, Hanna Ziesche, Ngo Anh Vien. *Uncertainty-driven Exploration Strategies for Online Grasp Learning*. ICRA 2024；所读 arXiv v2，2024-04-24。[全文](https://arxiv.org/pdf/2309.12038v2)。发表日期另据 [KIT 官方记录](https://publikationen.bibliothek.kit.edu/1000174339)。
- **P1** Dmitry Kalashnikov et al. *QT-Opt: Scalable Deep Reinforcement Learning for Vision-Based Robotic Manipulation*. 2018。[论文](https://arxiv.org/pdf/1806.10293)。
- **P2** Letian Fu et al. *LEGS: Learning Efficient Grasp Sets for Exploratory Grasping*. ICRA 2022，2021 年预印本。[论文](https://arxiv.org/pdf/2111.15002)。
- **P3** Zohar Feldman, Hanna Ziesche, Ngo Anh Vien, Dotan Di Castro. *A Hybrid Approach for Learning to Shift and Grasp with Elaborate Motion Primitives*. ICRA 2022，2021-11-02 首次公开。[论文](https://arxiv.org/pdf/2111.01510)，用于核对 ConvSAC 像素动作与价值图。
- **P4** Kimin Lee, Michael Laskin, Aravind Srinivas, Pieter Abbeel. *SUNRISE: A Simple Unified Framework for Ensemble Learning in Deep Reinforcement Learning*. ICML 2021，2020 年首次公开。[正式论文](https://proceedings.mlr.press/v139/lee21g/lee21g.pdf)。
- **P5** William R. Clements, Bastien Van Delft, Benoît-Marie Robaglia, Reda Bahi Slaoui, Sébastien Toth. *Estimating Risk and Uncertainty in Deep Reinforcement Learning*. 2019 年首次公开。[论文](https://arxiv.org/html/1905.09638)，用于核对不确定性分解。
- **P6** Pietro Mazzaglia, Taco Cohen, Daniel Dijkman. *Uncertainty-driven Affordance Discovery for Efficient Robotics Manipulation*. arXiv v1，2023-08-28。[早期版本](https://arxiv.org/pdf/2308.14915v1)。
- **P7** Bertrand Charpentier, Ransalu Senanayake, Mykel J. Kochenderfer, Stephan Günnemann. *Disentangling Epistemic and Aleatoric Uncertainty in Reinforcement Learning*. 2022 年首次公开。[论文](https://arxiv.org/pdf/2206.01558)，用于核对 ensemble 局限。
- **P8** Pietro Mazzaglia, Taco Cohen, Daniel Dijkman. *Information-driven Affordance Discovery for Efficient Robotic Manipulation*. arXiv v3，2024-06-06；P6 的后续版本。[论文](https://arxiv.org/pdf/2308.14915v3)。
- **P9** Yitian Shi et al. *MS-MEM: Multi-Skill Manipulation-Enhanced Mapping via Uncertainty- and Disturbance-Aware Action Selection*. arXiv v1，2026-09-02。[论文](https://arxiv.org/html/2609.02493v1)，用于比较后续信息探索机制。
- **P10** Alex Kendall, Yarin Gal. *What Uncertainties Do We Need in Bayesian Deep Learning for Computer Vision?* NeurIPS 2017。[论文](https://proceedings.neurips.cc/paper_files/paper/2017/file/2650d6089a6d640c5e85b2b88265dc2b-Paper.pdf)，用于解释高斯负对数似然与条件方差学习。
- **P11** Will Dabney, Mark Rowland, Marc G. Bellemare, Rémi Munos. *Distributional Reinforcement Learning with Quantile Regression*. AAAI 2018，2017 年预印本。[论文](https://arxiv.org/pdf/1710.10044)，用于解释分位数损失及 Huber 平滑。
- **P12** Schmalz. *Bellows Suction Cups SAXB*。[官方产品资料](https://media.schmalz.com/MAM_Library/Dokumente/Datenblatt_Produktfamilie/0_/060/06004/b0891d59063e_Datasheet_Bellows%20Suction%20Cups%20SAXB_en-EN.pdf)，用于说明柔性密封边缘与曲面适形这一通用吸取背景。
