---
type: "paper"
title: "FutureRTC: Real-Time Robot Execution with Anticipatory-Conditioned Action Chunking"
shortTitle: "FutureRTC"
year: 2026
date: "2026-09-29"
category: "real-time-vla"
tags: ["VLA", "异步推理", "动作分块", "未来视觉预测", "延迟补偿"]
authors: ["Hai Jiang", "Yixian Zou", "Binbin Liang", "Boqian Liu", "Fanman Meng", "Shuaicheng Liu"]
paper: "https://arxiv.org/abs/2607.24008v1"
code: "https://github.com/JianghaiSCU/FutureRTC"
project: "https://jianghaiscu.github.io/FutureRTC_proj/"
venue: ""
venueType: "preprint"
publicationStatus: "under-review"
firstPublished: "2026-07-27"
publicationSources:
  - "https://arxiv.org/abs/2607.24008"
  - "https://jianghaiscu.github.io/FutureRTC_proj/"
summary: "利用已承诺动作预测交接时刻的视觉特征与机器人状态，让冻结的VLA从未来执行上下文生成动作，缓解异步推理的时间错位。"
status: "read"
---

# FutureRTC：让策略依据动作开始执行时的场景做决定

机器人一边运动、一边计算下一段动作时，计算所依据的画面会在结果出来前过时。FutureRTC 利用这段等待期间已经确定会执行的动作，预测交接时刻的机器人状态和视觉特征，再交给原有 VLA 生成下一段动作。视觉预测先按运动搬运已有特征，再补充遮挡变化等无法靠搬运解释的内容，并用策略的动作响应约束预测质量。这样可以保持基础策略冻结，同时减少因时间错位造成的动作衔接错误。

## 论文来源

| 项目 | 信息与来源 |
| --- | --- |
| 发表场所与状态 | arXiv 预印本；[作者项目页](https://jianghaiscu.github.io/FutureRTC_proj/)标注 Under review。正式会议、期刊及 track 未核实 |
| 最早可核实公开时间 | 2026-07-27，[arXiv v1 记录](https://arxiv.org/abs/2607.24008) |
| 正式发表时间 | 未核实 |
| 所读版本 | 2026-07-27 v1，[HTML 全文](https://arxiv.org/html/2607.24008v1)、[PDF及附录](https://arxiv.org/pdf/2607.24008v1) |
| 官方代码 | [JianghaiSCU/FutureRTC](https://github.com/JianghaiSCU/FutureRTC)，与项目页互链；已有 LIBERO、Kinetix、实机分支 |
| 项目主页 | [FutureRTC](https://jianghaiscu.github.io/FutureRTC_proj/)，由 arXiv 记录直接链接 |

历史背景以 2026-07-27 为界；后续检索截至 2026-09-29，覆盖异步 VLA、未来视觉预测和自适应执行。已阅读全文、附录及关键图表，并核对部分官方实现；当前代码的训练阶段和若干结构细节与 v1 简式不同，下文以 v1 方法和实验为主。

## 1. 研究问题、背景与价值

设想双臂机器人正把杯子挂到架子上。策略根据当前画面生成一串动作，推理需要约 170 毫秒；在这期间，夹爪已经向杯架移动。若下一串动作仍从旧画面理解夹爪与杯架的关系，交接时就可能重复靠近、突然修正方向，甚至错过接触位置。

动作分块把一次推理成本摊到多步控制上；异步执行进一步让旧动作覆盖推理等待。但两者并未自动解决“在什么时刻看见场景”和“在什么时刻使用决策”之间的差距。本文处理的技术问题是：**在未来真实观测尚不可得时，怎样低成本地构造交接时刻的策略输入，使现有策略能连续执行？** 价值落在延迟部署中的成功率、耗时和运动连续性。[P0，Preliminaries](https://arxiv.org/html/2607.24008v1#Sx3)

## 2. 从前人工作，怎样走到这个 idea

异步执行最先暴露的是动作块衔接问题。RTC 利用一个事实：推理期间仍要执行的旧动作已经确定。因此，它把这段动作作为生成约束，通过动作补全产生后续部分，保持新旧轨迹连续。这个机制修复动作之间的关系，却仍可能依据一张已经过时的画面生成动作。[P1，§4](https://arxiv.org/html/2506.07339v1)

Temporal Ensembling（TE）则在输出端加权合并多个动作块对**同一执行时刻**的预测。例如，时刻 12 的动作可以由时刻 8 生成的第 4 项和时刻 10 生成的第 2 项共同决定，索引从 0 开始。它平滑的是重叠计划的分歧，输入画面仍可能过时；组合规则本身无额外训练。原 ACT 通过更频繁地查询策略增加重叠，异步 VLA 能否达到该频率仍受推理成本限制。本文没有详述 TE 的权重配置。[P10，§IV-A](https://arxiv.org/html/2304.13705v1)

VLASH 把注意力移到策略输入：用承诺动作前滚机器人状态，再微调策略，使其从旧视觉 $o_q$ 和未来状态 $s_{q+\delta}$ 生成未来动作。训练时随机时间偏移，促使策略结合状态理解画面。然而，夹爪移动也改变图像中的位置、遮挡和物体关系，两种输入仍有时间差。[P2，§4.1–4.2](https://arxiv.org/html/2512.01031v1)

由此产生的要求是：把视觉也推进到同一交接时刻，并控制预测成本。已有动作条件视频预测提供了一条可行途径：将外观与运动分开，利用动作预测内容怎样移动，再变换已有图像，无需重新生成全部外观。Finn 等人的工作已经验证这类运动变换思路；它可解释本文设计为何合理，但不代表作者公开自述的灵感来源。[P3，§3](https://arxiv.org/pdf/1605.07157)

这里还需补齐两项非常接近的历史工作。2026 年 4 月的 F2F-AP 已同时处理未来视觉与状态：从历史图像预测物体运动，把运动信息画到当前图上，再训练视觉表征接近真实未来图。7 月 14 日的近同期 Jetson-PI 则已经用已承诺动作预测未来 VLM 表征，但需要训练压缩器和动作专家。因此，FutureRTC 的定位应收窄到：**在冻结整个现有 VLA 的条件下，用轻量、具有运动结构的预测器，补齐可直接消费的未来上下文。** [P4，§III](https://arxiv.org/html/2604.02408v1)；[P5，§4.1](https://arxiv.org/html/2607.12659v1)

这个约束导向本文的设计：在现成视觉编码器的特征空间搬运已知内容，补足无法搬运的变化，再检查冻结策略的动作响应。三种方法的区别由此清楚：TE 合并输出；VLASH 微调策略来适应旧视觉与未来状态；FutureRTC 训练输入预测器，把两种感知对齐到未来，并保持基础策略冻结。后两者都需要训练。

## 3. 核心 intuition

推理延迟窗口内，机器人自己的动作已经部分确定，所以未来并非完全未知。只要这些动作能解释主要场景变化，就可以提前构造更接近交接时刻的输入。预测标准还要包含策略行为：背景信息偏差和杯沿相对位置偏差，即使造成相近的特征均方误差，也可能对抓取方向有不同影响。这里的“关键位置”指决策相关信息，不能直接等同于独立像素或特征 token。

## 4. 方法与一个简单例子

为简化记号，令 $q$ 为采集旧观测并开始推理的时刻，$h=q+d$ 为新动作块开始执行的交接时刻，$d$ 是延迟对应的控制步数。输入包括旧图像 $o_q$、旧状态 $s_q$、已承诺动作 $a_{q:h-1}$ 和初始帧参考；输出是未来视觉特征 $\hat z_h$ 与未来状态 $\hat s_h$。

从功能上看，SCM 与 OPM 合起来可理解为**动作条件的短期潜在世界模型**：根据当前信息和动作预测未来上下文。此处动作已经承诺，模型服务于延迟补偿；本文没有在其中搜索多个候选动作，或进行长程想象规划。

### 先校正动作前滚得到的状态

用已承诺动作前滚旧状态，得到 $\tilde s_h$。命令位移与实际运动会因跟踪误差、接触等原因不同，状态修正模块 SCM（State Correction Module）因此再预测残差：

$$
\hat s_h=\tilde s_h\oplus\phi_{\mathrm{SCM}}(\tilde s_h,d/d_{\max}).
$$

$\oplus$ 按位姿语义组合，旋转使用相对旋转复合；不能把所有状态分量都理解成普通相加。训练用示范中真实的 $s_h\ominus\tilde s_h$ 监督残差，校正结果同时用于视觉预测与后续策略输入。[P0，式 3–4](https://arxiv.org/html/2607.24008v1#Sx4)

### 再预测视觉：搬运已有内容，补足新变化

先用原 VLA 的视觉编码器提取 $z_q=\mathcal E(o_q)$。OPM 全称 **Observation Prediction Module，观测预测模块**，包含动作编码、条件融合、特征搬运和残差补全。它预测原编码器的未来特征，不生成未来像素图。

动作编码器将每步动作、累计位移、动作变化、累计路径和时间进度组成轨迹特征，经时间注意力得到运动条件，再与 $z_q$、校正状态、相机和位置编码融合。随后，线性层与卷积层处理融合条件，分别支持搬运和补全两个支路。

网络据此预测二维特征位移 $\Delta p$ 及门控 $\alpha$：

$$
z_{\mathrm{trans}}=(1-\alpha)z_q+
\alpha\,\mathcal W(z_q,p-\Delta p).
$$

$\mathcal W$ 是双线性采样：目标位置从旧特征图相应位置取值。静态区域可保留原特征，移动区域更多使用搬运结果。这里的物理先验来自已知动作轨迹；特征流仍由网络学习，并非通过相机几何精确算出的真实光流。

搬运只能重新排列已有内容。夹爪移开后露出的区域、接触导致的形变需要额外处理。残差支路读取包含旧视觉、运动和校正状态的融合条件、已搬运的变化以及初始帧特征 $z_0$，预测补充内容 $r$ 和门控 $\beta$：

$$
\hat z_h=z_{\mathrm{trans}}+\beta r,
\qquad
\mathcal L_{\mathrm{obs}}=\|z_h-\hat z_h\|_2^2.
$$

初始帧可以提供静态背景参考，但没有见过的内容仍要依靠学习预测。两种门控分别控制搬运和补充的强度。[P0，式 5–8、图 3–4](https://arxiv.org/html/2607.24008v1#Sx4)

当前 LIBERO 实现把这条结构具体化为：动作序列经两层时间自注意力、池化形成运动摘要；视觉 token 加入运动、状态和相机等条件，再经过逐 token 残差前馈层及局部卷积。时间注意力作用于动作序列，视觉主干没有采用全局自注意力。搬运分支还预测幅度增益，残差解码器拼接主干特征、搬运变化和初始帧特征后输出补充量与门控。因此，上述公式对应 v1 主线，不能视为当前代码的逐项展开；实现尺寸也不宜直接推广到其他分支。[P6，模型实现](https://github.com/JianghaiSCU/FutureRTC/blob/sim/libero/predictor/model.py)

### 让预测对策略有用，并按正确时间执行

仅匹配特征可能平均掉对操作关键的细节。本文增加策略一致性损失，让同一个冻结策略在真实未来输入与预测输入下给出相近动作：

$$
\mathcal L_{\mathrm{policy}}=
\|\pi_\theta(z_h,s_h)-\pi_\theta(\hat z_h,\hat s_h)\|_2^2,
$$

总目标为状态误差、视觉误差及 $10\mathcal L_{\mathrm{policy}}$ 的和。训练随机采样预测延迟，并用**一次 flow 计算近似整段动作生成**，以降低一致性项的成本。“单步”指生成过程的近似，比较对象仍是动作块；部署仍使用原策略的生成流程。

**冻结策略权重不妨碍梯度穿过策略回到输入预测器。** 当前 LIBERO 实现先独立训练 SCM，再训练视觉预测器；一致性阶段的梯度只回到预测视觉特征。教师与学生共享噪声和中间动作，避免把采样差异误当预测误差。这个目标使预测输入下的行为接近同一策略使用真实未来输入时的行为，不能保证该策略的动作绝对正确。[P0，式 9](https://arxiv.org/html/2607.24008v1#Sx4)；[P6，一致性实现](https://github.com/JianghaiSCU/FutureRTC/blob/sim/libero/predictor/policy_loss/base.py)

推理时，预测特征直接注入原策略。新动作块已经以 $h$ 为起点，故从第一个动作执行。本文主表的 Naive Async. 基线仍以旧上下文生成，并跳过前 $d$ 个过时动作。输入的时间含义与动作切片必须一致。

### 一个夹爪靠近杯子的教学例子

以下坐标和动作仅用于说明流程。时刻 $q=10$，夹爪位于 $x=2$，旧动作块已承诺再向右移动两步，每步 $+1$；新动作将在 $h=12$ 接管。计算期间旧动作继续执行，前滚得到 $x=4$，SCM 根据学到的跟踪偏差将估计修正到 $x=3.6$。

假设使用固定桌面相机，视觉预测把夹爪特征移向右侧、保留静态桌面，再借助初始帧和残差支路补足新显露的杯沿。腕部相机随运动改变视野时，桌面特征也可能需要搬运。初始帧只能提供曾经看见的内容，其他部分依赖学习预测。

策略根据预测的 $h$ 时刻上下文生成“微调、闭合、抬起”，第 0 项“微调”就对应 $h=12$，应立即执行。若误跳过 $d=2$ 项，将直接抬起，漏掉抓取前置动作。相对地，旧上下文可能生成“靠近、靠近、微调、闭合”，其第 0 项对应 $q=10$；Naive Async. 跳两项是在补偿旧计划的时间索引，但无法重新理解交接时刻的真实场景。预测质量和动作起点对齐，两者缺一不可。

## 5. 实验：问题、关键数据与结论

### 大延迟下，能否超过现有异步方法？

LIBERO 使用 Spatial、Object、Goal、Long 四套任务，执行长度 $K=25$。下表取 $d=20$，单元格为“成功率 % ↑／平均执行步数 ↓”。推理时方法与 FutureRTC 使用相同的已微调冻结基础权重；训练型基线按各自方法适配，因此比较也包含训练方案差异。

| 方法 | $\pi_{0.5}$ | SmolVLA-450M |
| --- | ---: | ---: |
| Naive Async. | 68.3／210.9 | 56.2／232.8 |
| RTC | 73.7／200.5 | 58.7／226.3 |
| VLASH | 74.5／197.4 | 61.9／220.9 |
| Temporal Ensembling | 74.8／197.0 | 59.7／224.2 |
| **FutureRTC** | **88.5／175.1** | **69.4／209.4** |

来源：[P0，表 1](https://arxiv.org/html/2607.24008v1#Sx5.T1)。两种基础策略分别比同表最佳成功率基线高 **13.7、7.5 个百分点**。从 $d=5$ 增至 $20$，FutureRTC 成功率分别从 94.2% 降到 88.5%、75.8% 降到 69.4%，仍有残余延迟损失。论文未明确仿真每任务评估次数、重复种子及置信区间。四套平均领先也不意味着每个任务集领先，例如 $\pi_{0.5}$ 的 Goal、$d=5$，REMAC 为 94.0%，FutureRTC 为 93.6%。

### 视觉预测是否真正重要？

先看可诊断原因的理想输入实验。固定 $d=20$，全部从新动作块首项执行，表中是真实未来信息与预测信息的替换对照，指标为平均成功率 % ↑。

| 输入 | $\pi_{0.5}$ | SmolVLA |
| --- | ---: | ---: |
| 旧视觉＋旧状态 | 2.5 | 0.7 |
| 旧视觉＋真实未来状态 | 1.9 | 6.6 |
| 真实未来视觉＋旧状态 | 95.8 | 16.4 |
| 真实未来视觉＋真实未来状态 | 96.6 | 77.6 |
| FutureRTC 预测视觉＋预测状态 | 88.5 | 69.4 |

来源：[P0，表 3](https://arxiv.org/html/2607.24008v1#Sx7.T3)。真实未来输入是部署时不可获得的诊断条件。结果说明：$\pi_{0.5}$ 在这里主要受视觉错位影响；SmolVLA 则需要视觉、状态共同对齐，不能将前者的模态依赖推广给所有策略。

SmolVLA 的累积模块消融进一步说明各部件的作用：

| 配置 | $d=5$ 成功率 % ↑ | $d=20$ 成功率 % ↑ |
| --- | ---: | ---: |
| 旧输入，直接从首项执行 | 26.1 | 0.7 |
| 加状态修正 SCM | 45.9 | 5.8 |
| 再加视觉预测 OPM | 74.1 | 67.5 |
| 再加策略一致性损失 | **75.8** | **69.4** |

来源：[P0，表 2](https://arxiv.org/html/2607.24008v1#Sx5.T2)。**本表弱基线没有跳过过时前缀，不能把 0.7%→69.4% 当作相对标准异步方案的收益。** 标准 Naive Async. 在同延迟下是上一表的 56.2%。消融支持整个 OPM 的作用，尚未单独隔离搬运、残差、门控和初始帧的贡献；一致性损失多数设置有效，但 $\pi_{0.5}$、$d=5$ 有 94.3%→94.2% 的小幅回落。

### 实机收益和计算代价如何？

双臂 AgileX Cobot Magic 使用 $\pi_{0.5}$、$K=25$，每任务 100 条示范、20 次随机初始位置与姿态的评估。下表取约 320 毫秒延迟，作者标为 $d=10$；单元格为“成功数/20 ↑；执行时间秒 ↓”，成功数由图示百分比和评估分母换算。

| 方法 | 叠盘 | 折毛巾 | 挂杯 |
| --- | ---: | ---: | ---: |
| Naive Async. | 11/20；39.7 | 7/20；42.4 | 6/20；41.2 |
| RTC | 15/20；34.9 | 8/20；41.0 | 11/20；33.4 |
| VLASH | 15/20；28.3 | 13/20；33.6 | 11/20；31.7 |
| **FutureRTC** | **17/20；26.1** | **16/20；31.9** | **13/20；27.6** |

来源：[P0，图 6](https://arxiv.org/html/2607.24008v1#Sx5.F6)。三项任务均改善，但每个任务样本较少。原文未明确耗时是否仅对成功轨迹统计，且报告的步数不能按标称 30 Hz 直接换算成耗时，故可据此比较报告值，尚不能认定已证明端到端严格无停顿。

适配器给 $\pi_{0.5}$ 增加 6.45M 参数、3.64 ms，给 SmolVLA 增加 5.19M 参数、3.04 ms；两者基础推理时间为 98.8、35.4 ms。额外开销较小，但训练适配器仍有成本。平滑性主要由 $d=5$ 的动作速度和加速度曲线支持，不能单凭步数减少推得。[P0，表 4、图 7](https://arxiv.org/html/2607.24008v1#Sx7.T4)

## 6. Take-aways

- 异步执行需要同时对齐输入时间和动作起点；只处理动作块边界会遗漏感知错位。
- 已承诺动作提供了有用的短期预测条件。复用视觉特征中的已有内容，可以降低未来预测的成本。
- 预测器应服务于策略行为。冻结基础策略、训练输入适配器是一条有效路径，但其收益取决于策略怎样使用视觉和状态。

## 7. 比较脆弱的假设

**自身动作能够解释主要变化。** 若人突然移动杯子，或物体受外力运动，已承诺的机器人动作不足以确定未来图像；错误特征可能被当作确定事实输入策略。初始帧参考也无法提供此前从未看见的内容。这是论文明确承认的适用边界。[P0，Limitations](https://arxiv.org/html/2607.24008v1#Sx11)

**预测时刻与真实交接时刻足够接近。** 已有结果以指定延迟测试为主。网络训练时覆盖多个 $d$，与应对部署中不可预知的网络抖动仍有区别：即使准确预测了 $h$，实际晚到数步也会重新错位。超过训练延迟范围、频繁接触和多种可能未来的条件下，还缺少充分证据。

**代理目标能约束完整执行中的偏差。** 单次 flow 近似下的动作接近，不能直接保证完整迭代生成及闭环执行也同样接近；特征均方误差更不直接衡量接触失败风险。这是目标与最终行为之间仍需实验证据连接的环节。

更晚的 CereVLA 在不同执行配置中报告了 FutureRTC 收益随基础策略变化的情况。由于缺少与本文延迟扫描完全对应的配置核验，该结果不能当作同协议反驳，也不能归因于单步一致性近似。它提示复现时应检查预测器与策略权重、特征编码器、延迟和动作切片约定是否匹配。[P7，§IV、表 I](https://arxiv.org/html/2609.27468v1#S4.T1)

## 8. Follow-up：预测有多准，怎样变成可用程度？

一个尚未验证的后续问题是：**当未来特征误差大小相近时，能否提前识别哪些误差会显著改变冻结策略的动作？** 同样大小的杯沿位置偏差，在空中接近与即将接触时，可能引起不同的动作变化。候选机制是在昂贵策略推理之前，用轻量判断器估计这次预测的行为偏差，再决定是否采用预测或触发观测更新。

用一个局部近似解释其动机：固定状态、指令及采样噪声，令 $e=\hat z-z$，则

$$
\Delta A=\pi(z+e)-\pi(z)\approx J_\pi(z)e,
\qquad
\|\Delta A\|^2\approx e^\top J_\pi(z)^\top J_\pi(z)e.
$$

特征误差只看 $\|e\|^2$，动作影响还取决于误差方向与当前策略敏感性。这个公式是教学性分析，并非本文定理，也不要求在线显式计算完整雅可比矩阵。动作偏差仍只是代理：不同动作可以同样成功，与原策略一致也不保证任务成功。

部署的难点在于，$q$ 时刻尚无真实 $z_h$，无法直接计算这次预测的真实误差。一个候选路径是：离线用预测与真实未来上下文分别运行完整冻结策略，共享采样噪声，得到动作偏差标签；在线轻量判断器仅使用旧观测、承诺动作、预测上下文、延迟和已经发生的历史误差等可得信息。策略一致性训练减少平均偏差，判断器则估计每次预测剩余偏差。若输出超限概率，还需检验概率与实际频率是否相符，才能称为风险校准；刷新观测的成本也必须计入调度。

这已有很近的竞争方案：Jetson-PI 用特征预测误差监督置信度并调度视觉刷新；FFDC 结合已有计划、预测和真实反馈判断剩余执行长度；CereVLA 对残差动作修正的后果做门控。Streaming-WAM 则已把承诺动作用于视觉与动作的联合生成。仅将置信度监督换成动作误差并增加阈值，贡献可能仍然有限。[P5](https://arxiv.org/html/2607.12659v1#S4.SS2)；[P8](https://arxiv.org/html/2605.06222v1#S3)；[P7](https://arxiv.org/html/2609.27468v1)；[P9](https://arxiv.org/html/2609.28927v1)

首先应固定预测器、策略和延迟等条件，在**真实特征误差相近**的离线样本中，检验在线可用的评分能否比特征误差评分更准确地区分动作偏差；真实未来信息只能用于标签和评估，不能泄漏给在线判断器。若能区分，再在相同计算或刷新预算下检验闭环收益。若做不到，这条路线尚没有超出已有置信度调度的充分理由。

## 参考来源

- **P0** Hai Jiang et al. *FutureRTC: Real-Time Robot Execution with Anticipatory-Conditioned Action Chunking*. arXiv:2607.24008v1，2026-07-27。[全文与附录](https://arxiv.org/html/2607.24008v1)。
- **P1** Kevin Black, Manuel Y. Galliker, Sergey Levine. *Real-Time Execution of Action Chunking Flow Policies*. arXiv:2506.07339v1，2025-06-09。[方法](https://arxiv.org/html/2506.07339v1)。
- **P2** Jiaming Tang et al. *VLASH: Real-Time VLAs via Future-State-Aware Asynchronous Inference*. arXiv:2512.01031v1，2025-11-30。[方法](https://arxiv.org/html/2512.01031v1)。
- **P3** Chelsea Finn, Ian Goodfellow, Sergey Levine. *Unsupervised Learning for Physical Interaction through Video Prediction*. 2016。[论文](https://arxiv.org/pdf/1605.07157)，用于动作条件运动变换背景。
- **P4** Haoyu Wei et al. *F2F-AP: Flow-to-Future Asynchronous Policy for Real-time Dynamic Manipulation*. arXiv:2604.02408v1，2026-04-02。[方法](https://arxiv.org/html/2604.02408v1)。
- **P5** Zebin Yang et al. *Jetson-PI: Towards Onboard Real-Time Robot Control via Foresight-Aligned Asynchronous Inference*. arXiv:2607.12659v1，2026-07-14。[方法与调度](https://arxiv.org/html/2607.12659v1)。
- **P6** FutureRTC 官方实现，`sim/libero` 分支，查阅于 2026-09-29。[训练说明](https://github.com/JianghaiSCU/FutureRTC/tree/sim/libero)、[模型结构](https://github.com/JianghaiSCU/FutureRTC/blob/sim/libero/predictor/model.py)、[策略一致性实现](https://github.com/JianghaiSCU/FutureRTC/blob/sim/libero/predictor/policy_loss/base.py)。
- **P7** Shuai Zeng et al. *CereVLA: Cerebellum-Inspired Consequence-Aware Residual Governance for Efficient Vision-Language-Action Execution*. arXiv:2609.27468v1，2026-09-23。[方法与比较协议](https://arxiv.org/html/2609.27468v1)。
- **P8** Rui Wang et al. *When to Trust Imagination: Adaptive Action Execution for World Action Models*. arXiv:2605.06222v1，2026-05-07。[FFDC 方法](https://arxiv.org/html/2605.06222v1)。
- **P9** Xuyao Huang et al. *Streaming-WAM: Action-Conditioned World–Action Model for Asynchronous Robot Manipulation*. arXiv:2609.28927v1，2026-09-24。[方法](https://arxiv.org/html/2609.28927v1)。
- **P10** Tony Z. Zhao, Vikash Kumar, Sergey Levine, Chelsea Finn. *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*. arXiv:2304.13705v1，2023-04-23。[ACT 与 Temporal Ensembling](https://arxiv.org/html/2304.13705v1)。
