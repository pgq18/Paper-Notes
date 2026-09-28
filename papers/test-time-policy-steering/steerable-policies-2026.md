---
type: "paper"
title: "Steerable Vision-Language-Action Policies for Embodied Reasoning and Hierarchical Control"
shortTitle: "Steerable Policies"
year: 2026
date: "2026-09-28"
category: "test-time-policy-steering"
tags: ["vision-language-action", "hierarchical-control", "embodied-reasoning", "instruction-following", "synthetic-data"]
authors: ["William Chen", "Jagdeep Singh Bhatia", "Catherine Glossop", "Nikhil Mathihalli", "Ria Doshi", "Andy Tang", "Danny Driess", "Karl Pertsch", "Sergey Levine"]
paper: "https://arxiv.org/abs/2602.13193"
code: "https://github.com/steerable-policies/steerable-policies-bridge"
project: "https://steerable-policies.github.io/"
venue: "Robotics: Science and Systems XXII (RSS 2026), main conference"
venueType: "conference"
publicationStatus: "published"
firstPublished: "2026-02-13"
publishedAt: "2026-07"
publicationSources:
  - "https://arxiv.org/abs/2602.13193"
  - "https://www.roboticsproceedings.org/rss22/p074.html"
  - "https://roboticsconference.org/2026/program/papers/74/"
summary: "用多粒度语言与像素坐标重标注机器人演示，训练可接受多种指令的 VLA，使高层模型能根据观察与执行反馈选择控制接口，改善真实机器人分层控制。"
status: "read"
---

# Steerable Policies：让高层推理找到低层策略听得懂的指令

高层视觉语言模型可能已经知道机器人该抓哪个物体、该往哪里移动，但低层动作策略未必能把这份理解变成正确动作。本文把已有机器人演示重新标注成任务、子任务、运动方向、目标像素位置和夹爪轨迹等多种指令，训练一个能接受这些不同表达的策略。这样，高层模型既能决定下一步做什么，也能根据现场情况和执行反馈，选择更有效的表达方式，把语义判断转化为可执行的控制。

| 论文来源 | 核实信息 |
| --- | --- |
| 会议与状态 | **RSS 2026 主会正式发表**，Robotics: Science and Systems XXII，Paper 74；[官方论文集](https://www.roboticsproceedings.org/rss22/p074.html)，DOI：10.15607/RSS.2026.XXII.074 |
| 最早公开 | **2026-02-13**，目前可核实的 arXiv v1；[版本记录](https://arxiv.org/abs/2602.13193) |
| 正式发表时间 | **2026-07**；官方 BibTeX 只提供月份，未核实具体出版日 |
| 所读版本 | [arXiv v3 PDF](https://arxiv.org/pdf/2602.13193v3)，2026-04-06，29 页，含附录 A–F；下文页码和图号按此 PDF |
| 官方代码 | [steerable-policies-bridge](https://github.com/steerable-policies/steerable-policies-bridge)，由项目页链接确认；已公开 OpenVLA/Bridge 训练与控制代码，并链接模型权重及标注。π₀.₅ 的完整实现与权重公开范围未核实 |
| 项目主页 | [steerable-policies.github.io](https://steerable-policies.github.io/)，与论文及作者对应 |

历史思路以 2026-02-13 为界；后续工作定向检索截至 2026-09-28。已阅读全文、附录与关键图表。作者顺序采用所读 arXiv 版本；RSS 记录将其中 Ria Doshi 与 Andy Tang 的顺序对调。

## 1. 研究问题、背景与价值

让机器人“把螺丝放到盘子上”，困难可能发生在两个不同环节：高层模型没有认出螺丝，或者高层已经认对，低层却把“螺丝”理解成另一件物体。第二种情况下，反复生成更完整的任务计划，仍可能让机器人反复抓错对象。需要解决的是：高层的正确判断，怎样具体改变低层接下来执行的动作？

本文把这种响应能力称为 **steerability，可引导性**。研究对象是用演示训练的视觉语言动作模型（VLA），目标是让它能接受多种粒度的指令，从而支持新物体、新空间关系和较长任务中的纠错。实验范围主要是 Bridge 数据上的 WidowX 桌面操作。[P0，§I、附录 E-C](https://arxiv.org/pdf/2602.13193v3)

## 2. 从前人工作，怎样走到这个 idea

**分层结构首先解决了任务知识与动作执行的分工。** Hi Robot 已让高层视觉语言模型理解复杂请求，再向低层策略发送原子指令。这样，预训练模型的语义能力可以参与机器人决策。但上下层分别训练，高层并不天然知道低层在哪些状态下能够执行什么。Hi Robot 自己也把了解低层能力列为限制。这意味着，继续增强任务推理之前，需要检查中间指令能否准确唤起目标行为。[P1，§4、§6](https://arxiv.org/html/2502.19417v1)

**训练数据提供的语言监督，恰好限制了这个接口。** 一条“把杯子放到盘子上”的演示，包含接近、抓取、抬起、平移和松开等动作，但整段轨迹常共用一句任务标签。模型见过这些动作，却缺少“在当前状态下，这种指令对应这种动作”的细粒度配对；STEER 已针对这种粗粒度标注补充动作方式监督。[P2，§III-A](https://arxiv.org/html/2411.03409v1) 早于本文的数据审计也发现，多个 VLA 数据集的独特指令占比很低；这支持语言覆盖不足的判断，但单靠数据统计还不能证明具体控制失败的因果。[P3，§5–7](https://arxiv.org/html/2601.03136v1)

**重标注已有动作是一个已有的可行办法。** STEER 已给演示补充抓取方向、抬起方式、旋转和放置细节，再由人或 VLM 编排低层行为。因此，“细粒度语言重标注＋上层指挥”已有明确先行工作。它还观察到对象名称变化会降低可靠性：训练标签中的“黑白物体”换成“黑白水壶”，就可能影响执行。这说明，指令更详细以后，语义表达仍可能与低层学到的关联错位。[P2，§III、§IV-D](https://arxiv.org/html/2411.03409v1)

若对象名称是错位来源，一种可尝试的办法是直接传递空间位置。HAMSTER 已验证二维路径可以充当上下层接口：高层给出粗略夹爪路径，低层结合视觉完成动作，支持从域外数据迁移知识。不过，固定的二维路径也难以完整表达力、旋转等要求。因此，一个合理候选是同时保留语义和空间接口：熟悉行为交给语义指令，目标不清时提供位置，需要局部纠偏时提供运动方向，再让高层按情境选用。本文沿这条路径扩展了低层可接受的指令范围，并检验高层能否利用这种选择自由。这是基于已有证据重建的动机链。[P4，§4、§6](https://arxiv.org/html/2502.05485v1)

## 3. 核心 intuition

同一个低层策略可能“具备某种动作能力，却无法被现有指令稳定调用”。给同一行为建立多个入口，就有机会在一个入口失效时换另一个入口：不认识物体名字时指位置，目标附近动作不合适时说移动方向。前提是演示中已经包含可组合的行为，重标注才有能力可供调用。[P0，§IV、附录 E](https://arxiv.org/pdf/2602.13193v3)

## 4. 方法与一个简单例子

整体流程是：从演示生成多种指令，训练低层执行这些指令，再接入高层模型产生和更新指令。

**第一步：给同一段行为建立不同表达。** 作者从约 3.8 万条 Bridge 任务标签生成约 20.6 万个子任务、接近 200 万条 steering commands。先从动作数据提取运动描述，用 Molmo 定位相关物体、SAM 2 跟踪物体、专门训练的 DETR 定位夹爪；再让 Gemini 2.0 切分子任务，并依据这些信息生成指令。

这些指令包括六类：完整任务、子任务、原子运动、夹爪轨迹、目标点及其组合。“抓起胡萝卜”提供语义目标；“向右下移动并闭合夹爪”提供运动要求；“抓取 `[x,y]` 处的物体”给出目标位置；“沿几个像素点移动”给出夹爪路径。点指令标识任务相关位置，轨迹指令描述夹爪应经过的位置。所有接口最终都表达为文本 token，便于生成式 VLM 输出。[P0，§IV、附录 A](https://arxiv.org/pdf/2602.13193v3)

**第二步：保持动作监督，改变条件输入。** 训练每一帧时，找出它所属的子任务，从“原任务标签＋子任务标签＋合成指令”的列表中均匀随机抽一条，要求策略预测该帧的演示动作。均匀抽取的对象是指令列表，各类风格不保证等概率。这样，同一个动作获得多个可调用的语言入口。

OpenVLA 版本沿用动作离散化和下一 token 预测损失；π₀.₅ 版本沿用相应微调流程。本文的主要改动是监督接口与上下层衔接，行为克隆、视觉编码器和动作模型都借用了成熟技术。[P0，附录 F](https://arxiv.org/pdf/2602.13193v3)

**第三步：接入两种高层控制器。** 为便于理解，可把执行关系概括为：

$$
g_t \sim q_\phi(\cdot\mid o_t,l,h_t),\qquad
a_{t+i}\sim\pi_\theta(\cdot\mid o_{t+i},g_t),\quad i=0,\ldots,N-1.
$$

这里 $l$ 是总任务，$o_t$ 是当前观察，$g_t$ 是本轮指令，$h_t$ 是高层可用的执行历史。这个式子概括分层执行关系；低层在每一步接收新图像，同一高层指令持续 $N$ 步。

一种控制器是**训练出来的具身推理模型**。Gemini 为每个子任务生成事后解释，说明当前画面为何需要下一行为。独立的高层 VLM 学习从当前图像和总任务输出“解释＋指令”，不输入执行历史；低层只接收指令和图像，不接收整段解释。部署时每 **5 个环境步**重新查询高层。

另一种使用**现成 Gemini 3.0**，不为该高层做专门微调。提示包含各种指令的例子、适用条件以及过去的图像和命令；高层据此选择下一指令，每 **20 个低层步**更新一次。提示也明确要求在反复无进展时更换抽象层级，所以接口选择由模型能力、历史反馈和提示规则共同支撑。最终实现允许指点位置，但排除了效果不佳的夹爪轨迹生成；物体描述占位符经额外 Gemini 调用转换成坐标。[P0，§V、附录 B、F](https://arxiv.org/pdf/2602.13193v3)

**用“把锤子放到毛巾上”走一遍。** 下面按论文图 9(c) 的纠错情境简化演示；最后的搬运步骤用于串起流程，不是逐帧实验记录。

1. 总任务输入高层。观察和历史显示：低层听到“去抓锤子”后靠近了蔬菜，夹爪位置也偏低。
2. 高层仍保留搬运锤子的目标，但本轮改用“向右上方移动到锤柄附近”，先改变接近方向和高度。
3. 低层结合每一步的新图像执行短程运动；高层随后查看结果，确认是否到达正确物体附近。
4. 接近正确位置后，再用抓取、移到毛巾上方和松开等指令完成后续步骤；若仍抓错，可改用目标点继续纠正。

这里有价值的变化发生在目标与动作之间：高层利用自己看懂的错误，选择低层更能执行的表达。[P0，图 9(c)、图 17](https://arxiv.org/pdf/2602.13193v3)

## 5. 实验：问题、关键数据与结论

三组实验分别检验接口潜力、学习型高层和现成 VLM 高层。原文称三组评测合计超过 650 次真实机器人 rollout，但未逐组列明样本分母。下列精确表值保留原文的 **±1 标准误**；未报告显著性检验。

**人工选指令时，多种接口是否互补？** 同一个 Steerable Policy 接受人工指挥，每两次干预至少隔 2 秒。按原图估读，允许任意风格时平均成功率约 **98%**，仅任务语言约 **44%**，仅原子运动约 **75%**。这是人工选择合适指令时的可达表现。空间泛化中，点／轨迹指令约 **17%**，原子运动约 **92%**；语义泛化中，点／轨迹又更强。因此结果支持按情境选择接口，无法选出一个始终最好的风格。[P0，PDF 第 6 页，图 6；以上均为柱图近似值](https://arxiv.org/pdf/2602.13193v3)

**这种潜力能否由训练出的高层模型兑现？** 下表采用 ECoT-Lite 的 Bridge 任务套件，覆盖分布内及运动、空间、语义泛化，衡量完整任务成功率。理解这些基线，需要分清推理数据在训练和执行时的用途：

- **完整 ECoT（Embodied Chain-of-Thought，具身思维链）**：同一个 VLA 学习先输出计划、子任务、物体及夹爪位置、运动方向等中间描述，再输出动作；部署时保留这段推理生成。例如，“目标在夹爪左下方，因此先向左下靠近”，随后生成动作数值，是它的简化教学形式。[P5](https://embodied-cot.github.io/)
- **ECoT-Lite：Reasoning Dropout**：一般训练配方会随机省略部分或全部推理步骤，让模型同时学会有推理和无推理时的动作预测；部署时跳过推理，直接生成动作。本组 Bridge 对照直接采用已发布 ECoT 策略关闭推理生成，因为它的训练标注本来就有不少不含推理的样本。[P6，§5、附录 E.3](https://arxiv.org/html/2505.08243v2)
- **ECoT-Lite：Reasoning Pre-training**：先只训练“图像与任务→推理”，再继承这套参数训练“图像与任务→动作”；部署时直接生成动作。两种 Lite 的轻量主要体现在省去推理文本生成，降低执行延迟。[P6，附录 E.1](https://arxiv.org/html/2505.08243v2)

完整 ECoT 在同一个模型内部连接推理与动作；本文则让独立高层输出一条可执行的 steering command，再由低层落实为动作。因此，对照还在检验不同的推理与控制衔接方式。

| 方法 | 平均成功率（%，↑） |
| --- | ---: |
| 标准 OpenVLA | 50.5 ± 4.7 |
| 标准 π₀.₅ | 61.3 ± 4.6 |
| ECoT-Lite：Reasoning Dropout | 60.4 ± 4.6 |
| ECoT-Lite：Reasoning Pre-training | 69.4 ± 4.4 |
| 完整 ECoT | 77.5 ± 4.0 |
| Steerable Policy＋高层训练不含解释监督 | 66.7 ± 4.5 |
| Steerable Policy＋具身推理高层，OpenVLA | **84.6 ± 3.4** |
| Steerable Policy＋具身推理高层，π₀.₅ | **83.7 ± 3.4** |

来源：[P0，PDF 第 16 页，表 I](https://arxiv.org/pdf/2602.13193v3)。本文控制演示数据及对应底座架构；分层系统增加了独立高层模型，不能据此认定总参数量或算力相等。

OpenVLA 路线较标准策略提高 **34.1 个百分点**，较完整 ECoT 提高 **7.1 个百分点**。即使高层只学习直接输出指令，这套分层控制与多风格监督的组合仍达到 66.7%；完整模型也没有在每个任务上领先。例如全绿物体识别任务，ECoT 为 83.3%，本文 OpenVLA 路线为 66.7%。

**现成 VLM 能否利用历史来纠错？** 另一套多步任务按抓起、放到指定位置等评分项计算任务进度，每个任务有 2、4 或 6 项。已放好的物体被移走会撤销相应得分。以下数值衡量完成步骤的比例。

| 方法 | 平均任务进度（%，↑） |
| --- | ---: |
| 标准 OpenVLA | 48 ± 5.1 |
| SayCan-like，仅子任务接口 | 64 ± 5.5 |
| Steerable Policy＋无显式推理的 VLM | 78 ± 4.0 |
| Steerable Policy＋完整 VLM | **84 ± 3.7** |

来源：[P0，PDF 第 16–17 页，表 II–III](https://arxiv.org/pdf/2602.13193v3)。各层级方法均用 Gemini 3.0 和执行历史，SayCan-like 是限制接口的受控基线。通常最多 20 次高层决策，第二类长程任务为 25 次。

84 对 64 支持更丰富接口的作用。完整设置比无推理设置高 6 个百分点，但同时改变了显式推理、推理预算（0 到 1024 token）及部分提示规则：完整提示要求失败后更换抽象层级，无推理提示没有同样的规则。因此这项消融尚不能隔离推理本身的贡献。**84% 是任务进度，不能解读为 84% 的完整任务都成功。**[P0，附录 B、图 22–23](https://arxiv.org/pdf/2602.13193v3)

## 6. Take-aways

- 高层推理能否产生价值，取决于低层是否接受足够精确的干预；规划质量和接口质量应一起判断。
- 重新标注可以把已有演示中未被语言明确指示的行为变成可调用能力，值得先于新增昂贵演示考虑。
- 不同抽象层级各有适用状态。好的高层除了决定动作目标，还要依据执行结果调整传达目标的方式。

## 7. 比较脆弱的假设

**已有数据必须覆盖可调用的行为。** 增加标签不会自动教会全新的接触、旋转或用力技能。动作分布过窄时，高层即使换遍指令，也可能找不到可行行为。作者因此强调训练轨迹的行为多样性。[P0，附录 E-D](https://arxiv.org/pdf/2602.13193v3)

**高层必须理解低层实际会怎样响应。** “向左移动”可能触发向左下方抓取某个物体，或向左上方搬运手中物体，因为策略会结合训练中的常见行为补全指令。这能提高效率，也会造成偏差：机器人可能重新抓起刚放好的物体，撤销任务进展。像素指点同样依赖正确定位和视觉对应，遮挡或相似物体仍会造成误导。[P0，附录 B、E-B、E-D](https://arxiv.org/pdf/2602.13193v3)

**会完成某项任务，不保证任意中间状态都能切换过去。** 后来的 ReSteer 专门研究这种状态依赖，发现轨迹分布的交叠与改令能力相关，并通过补充连接轨迹改善响应。这提示本文的多接口能力还应与“从当前状态能否执行该指令”区分开。[P7，§3–5](https://arxiv.org/html/2603.17300v1)

## 8. Follow-up：让高层预测指令会产生什么效果

一个值得继续研究的候选，是学习**随状态变化的跨接口效果预测**：高层在发送语义、方向或点位指令之前，预测低层会到达什么状态、是否会破坏已完成步骤，并估计不确定性。失败后再区分目标指错、动作执行失败与能力缺失，从而决定换接口、调整位置还是请求新技能。

截至本次检索，FineVLA 已研究更细的执行属性标注及其与原任务标签的混合；ReSteer 已研究指令敏感性与低可控状态的数据补充；InSight 已用 VLM 发现缺失原语，执行验证后回填训练。因此，这个候选的区别应落在**同一意图的不同接口会产生什么效果，以及怎样利用失败归因选择接口**，不能只靠增加标签、评分或回训来主张新颖性。[P8](https://arxiv.org/html/2605.27284v3)、[P7](https://arxiv.org/html/2603.17300v1)、[P9](https://arxiv.org/pdf/2606.24884v2)

一个可检验的预期是：在总调用预算相同、指令候选相同的条件下，效果预测应比“失败后换一种说法”的规则更少撤销已完成进展。该差异尚待验证；上述定向检索也不足以保证它是未被研究过的空白。

## 参考来源

- **P0**：William Chen、Jagdeep Singh Bhatia、Catherine Glossop 等，*Steerable Vision-Language-Action Policies for Embodied Reasoning and Hierarchical Control*，2026，arXiv v3（04-06）。[全文](https://arxiv.org/pdf/2602.13193v3)；[RSS 正式记录](https://www.roboticsproceedings.org/rss22/p074.html)。
- **P1**：Lucy Xiaoyang Shi 等，*Hi Robot: Open-Ended Instruction Following with Hierarchical Vision-Language-Action Models*，2025，v1（02-26）。[全文](https://arxiv.org/html/2502.19417v1)。用于分层机制与上下层能力衔接。
- **P2**：Laura Smith、Alex Irpan、Montserrat Gonzalez Arenas 等，*STEER: Flexible Robotic Manipulation via Dense Language Grounding*，2024，v1（11-05）。[全文](https://arxiv.org/html/2411.03409v1)。用于细粒度重标注先例与对象命名失败。
- **P3**：Selma Wanna 等，*Limited Linguistic Diversity in Embodied AI Datasets*，2026，v1（01-06）。[全文](https://arxiv.org/html/2601.03136v1)。用于历史数据覆盖审计。
- **P4**：Yi Li、Yuquan Deng、Jesse Zhang 等，*HAMSTER: Hierarchical Action Models For Open-World Robot Manipulation*，2025，v1（02-08）。[全文](https://arxiv.org/html/2502.05485v1)。用于二维路径接口及其限制。
- **P5**：Michał Zawalski、William Chen、Karl Pertsch 等，*Robotic Control via Embodied Chain-of-Thought Reasoning*，2024 年首次公开。[官方项目与方法说明](https://embodied-cot.github.io/)；[论文](https://arxiv.org/abs/2407.08693)。用于完整 ECoT 的推理与动作生成机制。
- **P6**：William Chen、Suneel Belkhale、Suvir Mirchandani 等，*Training Strategies for Efficient Embodied Reasoning*，2025，arXiv v2。[全文](https://arxiv.org/html/2505.08243v2)。用于 ECoT-Lite 的预训练、推理丢弃及 Bridge 对照实现。
- **P7**：Zhenyang Chen、Alan Tian、Liquan Wang 等，*ReSteer: Quantifying and Refining the Steerability of Multitask Robot Policies*，2026，v1（03-18）。[全文](https://arxiv.org/html/2603.17300v1)。用于状态依赖与后续机制比较。
- **P8**：Xintong Hu、Xuhong Huang、Jinyu Zhang 等，*FineVLA: Fine-Grained Instruction Alignment for Steerable Vision-Language-Action Policies*，2026，v3（09-02），首次公开 05-26。[全文](https://arxiv.org/html/2605.27284v3)。用于细粒度监督与数据混合的后续比较。
- **P9**：Maggie Wang、Lars Osterberg、Stephen Tian 等，*InSight: Self-Guided Skill Acquisition via Steerable VLAs*，2026，v2（09-21），首次公开 06-23。[全文](https://arxiv.org/pdf/2606.24884v2)。用于新原语获取与策略更新的后续比较。
