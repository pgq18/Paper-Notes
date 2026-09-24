---
type: "research"
title: "机器人长程任务中的子任务完成检测、技能终止与切换：文献调研"
shortTitle: "机器人子任务完成检测与技能切换"
year: 2026
date: "2026-09-24"
category: "long-horizon-robotics"
tags: ["机器人长程任务", "成功检测", "技能终止", "视觉语言模型", "进度与奖励模型"]
summary: "梳理学习式成功检测、策略内生终止、视觉语言验证及进度奖励模型，比较其监督来源、在线技能切换证据与跨任务泛化边界。"
---

# 机器人长程任务中的子任务完成检测、技能终止与切换：文献调研

检索与核验日期：2026-09-22—23。重点覆盖视觉操控、移动操控及分层控制；以原论文、正式会议页面和作者项目为依据。预印本与正式发表工作分别标注。本报告是围绕问题的文献综合，不是穷尽全部机器人子领域的系统综述。

## 核心判断

已经存在可复用的学习范式：把子任务目标和机器人观测输入一个学习模型，输出成功、进度或终止信号，再驱动技能切换。它既可以是独立的目标条件成功判别器，也可以与动作策略共享网络。早期方法已经实现这一闭环；近年的主要进展是语言条件、跨任务和跨机器人泛化，以及与 VLA 的联合学习。

但“通用范式存在”和“已有对任意任务可靠的通用完成检测器”是两件事。现有证据支持前者；对后者，跨域失败评测、精细接触任务和在线提前切换仍有明显缺口。最贴近本问题的阅读主线是 FLO → SuccessVQA → SeqVLA / CycleVLA → Robometer，再用 FailBench 检验泛化边界。各论文的具体证据见后文。

## 先区分五个预测对象

| 对象 | 它回答什么 | 能否直接作为切换依据 |
| --- | --- | --- |
| 成功判定 success detection | 当前子任务目标是否已经满足？ | 最直接，但需要处理误报、遮挡与目标保持 |
| 技能终止 option termination / STOP | 当前控制器是否应该结束或交还控制权？ | 可能因成功、失败或更优策略而终止；需核对语义 |
| 进度估计 progress estimation | 距目标还有多远、是否在前进？ | 高进度不等于已完成；通常还需要完成判据 |
| 可行性 affordance / value | 从这里执行该技能是否可能成功？ | 是对未来的估计，不能当作已经完成 |
| 失败监控 failure detection | 是否偏离、停滞或即将失败？ | 可触发重试、回退；“未发现失败”不等于成功 |

以历史观测 $h_t$、子任务目标 $g_i$ 表示，一个语义成功判别器可写成 $c_\theta(h_t,g_i)=P(g_i\text{ 已实现}\mid h_t,g_i)$。一个终止头则输出 $\beta_\theta(h_t,g_i)=P(\text{现在结束当前技能}\mid h_t,g_i)$。二者只有在训练标签和控制设计明确对齐时才等价。

这里“摆脱外部程序或设备”也需分层理解。部署时不再使用任务专属坐标阈值、模拟器真值或人工按键，已经可行；用策略之外的学习判别器也能实现这一点。若进一步要求判定来自动作网络本身，可参考 SeqVLA 的完成头和 VLAC 的联合建模。CycleVLA 的 stop/progress 也由动作网络产生，但最终推进/回退另用独立 VLM 核验。它们仍需要常规视觉/本体感觉输入，并且训练标签、阈值与调度逻辑不会因此自动消失。

## 范式比较

| 范式 | 输入与学习目标 | 优点 | 主要边界 |
| --- | --- | --- | --- |
| 目标条件视觉分类 | 图像/历史 + 技能或成功示例 → 成功概率 | 简洁；可直接接已有技能库；容易校准 | 新任务需正负例或少样本适配；正例不足以覆盖所有假成功 |
| 策略内生终止 | 与动作共享表征，输出 STOP、return 或 completion | 低额外推理开销；直接驱动交接 | 模仿边界可能不等于物理成功；策略与检测器可能共同犯错 |
| 语言条件视觉验证 | 图像/视频 + 自然语言目标 → 判断与解释 | 共用接口，支持新任务描述 | 对精细关系、遮挡、否定及重复次数敏感；置信度未必校准 |
| 通用进度/奖励模型 | 观测与目标 → 进度、成功、偏好 | 可复用大规模异构视频和失败数据 | 相对排序、绝对成功和在线停止需要分别验证 |
| 监控—验证—恢复闭环 | 当前阶段、历史、视觉证据 → 继续/交接/回退 | 同时处理执行错误和切换错误 | 仍需确定调用时机、重试预算、历史状态和退出条件 |

以上是对文献的归纳，并非某一篇论文提出的统一标准。

## 基础脉络：从终止接口到学习视觉成功概念

| 工作与来源状态 | 学到了什么、需要什么监督 | 和问题的关系 |
| --- | --- | --- |
| [Between MDPs and semi-MDPs: A framework for temporal abstraction in reinforcement learning](https://www.sciencedirect.com/science/article/pii/S0004370299000521)，Artificial Intelligence 1999，理论 | option = 起始集合 + 内部策略 + 终止函数 | 给出通用接口；终止函数可以手工给定，也可学习；本身不是视觉成功检测器 |
| [The Option-Critic Architecture](https://ojs.aaai.org/index.php/AAAI/article/view/10916)，AAAI 2017，方法/理论 | 从任务奖励联合学习技能策略及终止概率，不要求子任务成功标签 | **直接学习交接**，但以回报优化为标准，终止没有必然的子目标完成语义 |
| [Modular Multitask Reinforcement Learning with Policy Sketches](https://proceedings.mlr.press/v70/andreas17a.html)，ICML 2017，方法 | 给出符号子任务序列，子策略学习动作与 STOP；通过整任务奖励训练 | **直接**：STOP 把控制权交给下一子策略；不用中间完成标签，但仍需任务 sketch 和奖励 |
| [Neural Task Programming: Learning to Generalize Across Hierarchical Tasks](https://stanfordvl.github.io/ntp/)，ICRA 2018，方法 | 当前状态、程序与示范决定子程序及 end-of-program；用专家程序执行轨迹监督 | **直接学习返回/交接**；结构化程序监督和底层 API 仍然存在 |
| [Few-Shot Goal Inference for Visuomotor Learning and Planning (FLO)](https://proceedings.mlr.press/v87/xie18a.html)，CoRL 2018，方法 | 元训练用多个任务的成功/失败图像；新目标只给少量成功图，推断目标分类器 | **高度直接**：§4.3 串联成功分类器，判完成后换下一个目标；Sawyer 真机两阶段实验；需要阈值校准 |
| [Variational Inverse Control with Events (VICE)](https://papers.nips.cc/paper_files/paper/2018/hash/c9319967c038f9b923068dabdf60cfe3-Abstract.html)，NeurIPS 2018，方法 | 成功状态样本定义事件，利用交互数据对抗更新分类器/奖励 | 解释如何学习成功概念并减少奖励漏洞；主要证据是奖励与控制学习，不是长链切换 |
| [End-to-End Robotic Reinforcement Learning without Reward Engineering (VICE-RAQ)](https://www.roboticsproceedings.org/rss15/p73.html)，RSS 2019，方法 | 成功图像初始化视觉奖励；主动向人询问高预测成功状态的标签 | 真机学习成功判断的实用来源；不再手写奖励，但仍使用人类反馈 |
| [SkillMimicGen: Automated Demonstration Generation for Efficient Skill Learning and Deployment](https://proceedings.mlr.press/v270/garrett25a.html)，CoRL 2024 / PMLR 2025，系统/方法 | SkillGen 的混合技能策略学习 initiation、控制与 termination classifier；标签来自分段示范与生成数据 | **直接**：学习的终止检测触发连接下一技能的运动规划；序列、规划与训练边界仍由结构化系统提供 |

FLO 是容易漏掉、但与问题特别接近的先行工作。它并非只学习一个供 RL 使用的奖励：原论文专门描述分类器级联，当前分类器认为完成后才执行下一个目标。其局限也有启发：新目标少样本泛化和准确终止并不是同一件事，分类分数仍需验证集阈值来减少假阳性。[原文 §4.2–4.3、§5.1](https://proceedings.mlr.press/v87/xie18a/xie18a.pdf)

## 直接面向现代机器人完成信号的工作

| 工作与来源状态 | 机制及监督来源 | 与子任务切换的关系 | 阅读时应保留的边界 |
| --- | --- | --- | --- |
| [SeqVLA: Sequential Task Execution for Long-Horizon Manipulation with Completion-Aware Vision-Language-Action Model](https://arxiv.org/abs/2509.14138)，2025，arXiv，方法 | 在 pi_0 动作专家上增加二分类头；人工标注子任务执行/完成帧，动作与检测联合训练 | **直接**：检测后停止动作、回 home pose、切换下一条提示；实验含沙拉和糖果包装 | 是两类场景中的任务适配，不能据此声称任意未见任务零样本完成检测；仍有指定顺序与经验阈值。证据：§III-B/C、§IV-B |
| [CycleVLA: Proactive Self-Correcting Vision-Language-Action Models via Subtask Backtracking and Minimum Bayes Risk Decoding](https://arxiv.org/html/2601.02295v2)，2026，arXiv v2，方法 | 动作输出增加 stop 和 progress；LLM 分解配合夹爪状态/运动片段形成子任务标签；临近结束调用 VLM | **直接**：VLM 决定推进或回退，stop 确认终止；将失败恢复放进技能交接闭环 | progress 标签来自段内归一化时间；边界构造仍有启发式；倒放动作恢复机器人配置不保证物体恢复。证据：§IV、Appendix D |
| [Robometer: Scaling General-Purpose Robotic Reward Models via Trajectory Comparisons](https://arxiv.org/html/2603.02115v2)，RSS 2026，方法 + 数据/评测 | 结合帧级进度、成功头和轨迹偏好；混合专家、真实失败与合成失败数据；因果遮罩支持观测前缀推理 | **直接**：真机两阶段任务用成功概率触发下一阶段；附录给出 >0.6 的实验阈值和阶段超时 | 不是完全无人工先验：为部分数据源手工确定统一完成截点；场景重置仍需人工。证据：§III、Appendix B-2、E-2 |
| [A Vision-Language-Action-Critic Model for Robotic Real-World Reinforcement Learning (VLAC)](https://arxiv.org/html/2509.15937v1)，2025，arXiv，方法 | 同一模型按提示输出动作、两帧相对进度和 done；联合人类/机器人/VQA 数据 | 有显式完成信号并用于真机 RL；适合研究策略与评价能力的统一 | done 标签以演示时间产生：前 80% 为未完成、后 5% 为完成，中间不标注；不能把 RL 改进等同于通用长链切换验证。证据：§3.1–3.2 |
| [M-EMBER: Tackling Long-Horizon Mobile Manipulation via Factorized Domain Transfer](https://arxiv.org/html/2305.13567)，2023，arXiv 来源，方法 | 每个技能学习视觉成功分类器，以正负图像监督；检测器把视觉/本体状态映射成符号状态 | **直接**：检测结果更新规划状态，重规划并执行下一技能，直至目标成立 | 技能库、符号目标与每技能分类器仍是结构化设计；它证明无需运行时真值判断，不证明开放任务统一模型。证据：§IV-A/B |

这组工作已经足以否定“技能切换只能靠外部硬编码”的说法。它们的差异在于：完成知识被写进哪个模型、来自什么监督，以及验证覆盖到何种任务分布。

## VLM 验证与执行监控：从“是否完成”到“为何失败”

| 工作与来源状态 | 输入、监督和机制 | 是否实际推进/重试，以及限制 |
| --- | --- | --- |
| [Vision-Language Models as Success Detectors (SuccessVQA)](https://proceedings.mlr.press/v232/du23b.html)，CoLLAs 2023，方法 | 把成功判定统一为视觉问答，Flamingo 结合人类奖励标注；评测真实机器人、模拟交互与人类视频 | 是语言条件通用检测的重要早期代表；本次核验正式摘要/元数据，未据此主张具体在线长链切换实证 |
| [AHA: A Vision-Language-Model for Detecting and Reasoning Over Failures in Robotic Manipulation](https://aha-vlm.github.io/)，ICLR 2025，方法 + 数据 | 任务语言与视觉关键帧 → 判定与失败解释；FailGen 在成功轨迹上注入失败供训练 | **有直接证据**：替换 Manipulate-Anything 的子任务 verifier，决定推进或重复；训练依赖模拟扰动与子任务信息。证据：[§5.3](https://arxiv.org/html/2410.00371v1) |
| [Guardian](https://arxiv.org/html/2512.01946v4)，2025 初稿 / 2026 v4，arXiv，方法 + benchmark | 区分 planning verifier 与 execution verifier；任务、计划、执行前后多视角图像用于验证；合成/重配失败与 VLM 推理标签训练 | **有直接证据**：在规划和子任务执行节点验证，错误触发重规划或重执行；不是完全免监督。v4 正文标题与 abs 元数据略有不同，同为 2512.01946 |
| [SAFE: Multitask Failure Detection for Vision-Language-Action Models](https://vla-safe.github.io/)，NeurIPS 2025，方法 | 读取 VLA 内部特征，以轨迹成败标签训练时序失败分，用 conformal 方法校准报警 | 是策略内部监控的代表；预测失败可触发停止/求助，不能把未报警当成任务完成；跨不同策略需处理表征差异 |
| [I-FailSense: Towards General Robotic Failure Detection with Vision-Language Models](https://arxiv.org/html/2509.16072v1)，2025，arXiv，方法 + benchmark | 以错配对象/方向指令构造困难负例，训练 VLM 与特征分类头 | 强调“动作看起来对，但目标不对”的语义失败；主要为轨迹分类/迁移证据，未核验到在线交接 |
| [DoReMi: Grounding Language Model by Detecting and Recovering from Plan-Execution Misalignment](https://arxiv.org/html/2307.00329v2)，2023，arXiv 来源，系统 | LLM 产生计划与约束，VQA 持续监测约束，失配即重规划 | **在线监控/恢复**；主要实验为物理仿真。重点是执行约束维护，与“精确完成时刻”相邻但不同 |
| [REFLECT: Summarizing Robot Experiences for Failure Explanation and Correction](https://robot-reflect.github.io/)，CoRL 2023，系统 + benchmark | 多模态经历组织成层级摘要供 LLM 查找失败并纠正；提出 RoboFail 数据 | 重要的诊断路线；依赖感知、场景图与关系处理，部分仿真实验用真值物体状态；不能概括成纯学习在线终止器 |

AHA / Guardian 与仅在静态数据上输出 Yes/No 的论文有实质差别：其判定已经进入下游执行流程。SAFE 与 DoReMi 则说明另一项必要能力：即使当前子任务尚未结束，也要识别动作异常、停滞或前置条件被破坏。真实系统常需要两者协作。

## 进度与奖励模型：重要，但需要核对是否真的解决停止问题

| 工作与来源状态 | 可借用的核心思想 | 对本问题的证据边界 |
| --- | --- | --- |
| [Vision Language Models are In-Context Value Learners (GVL)](https://arxiv.org/html/2411.04549)，ICLR 2025，方法 | 打乱视频帧后让 VLM 估计进度，减少模型沿时间机械递增的捷径；支持跨任务上下文示例 | 原文的重要成功检测用途是整段轨迹筛选；全视频上下文与 VOC 不能直接证明在线终止可靠。证据：§3、§4.3 |
| [PROGRESSOR: A Perceptually Guided Reward Estimator with Self-Supervised Online Refinement](https://ripl.github.io/progressor/)，ICCV 2025，方法 | 初始、当前和目标图像决定进度分布；由专家视频自监督，在线用 push-back 减少分布外观测高估 | 是目标条件视觉奖励路线；仍需目标图像，不是语言通用的完成时间定位器；真实机器人证据包括离线 RL |
| [ReWiND: Language-Guided Rewards Teach Robot Policies without New Demonstrations](https://rewind-reward.github.io/)，CoRL 2025，方法 | 语言条件进度；倒放视频、错配指令构造退步与语义负例；用少量源任务演示及 Open-X 训练 | 支持未见任务变体奖励迁移与策略改进；“无需新任务演示”不表示没有源任务演示，也不是单独证明在线阶段终止 |
| [RoboReward: General-Purpose Vision-Language Reward Models for Robotics](https://arxiv.org/abs/2601.00675)，2026，arXiv 来源，方法 + benchmark | 在 OXE/RoboArena 上构建奖励数据，以反事实改写和视频截断补充负例/近成功样本 | 核心是 episode 结局评分和奖励模型；其原任务不等同于连续子任务交接。后续系统可以调用它做切换，但必须另测误报 |
| [TOPReward: Token Probabilities as Hidden Zero-Shot Rewards for Robotics](https://arxiv.org/html/2602.19313v2)，2026，arXiv v2，方法 | 从预训练视频 VLM 的回答 token 概率提取进度，避免要求模型直接生成数值 | 原始 prefix 分数是因果的；段内 min-max 非因果。v2 成功评测还组合全视频判断，因此高 AUC 不等于存在可直接使用的在线停止阈值。证据：§3.2、§4.3、§5、Appendix C |
| [General Process Reward Modeling for Robotic Reinforcement Learning / Robo-Dopamine](https://openaccess.thecvf.com/content/CVPR2026/papers/Tan_General_Process_Reward_Modeling_for_Robotic_Reinforcement_Learning_CVPR_2026_paper.pdf)，CVPR 2026，方法 | 多视角、子步骤感知进度模型与策略不变奖励塑形 | 对遮挡和精细过程评估有价值；新任务实验有单演示适配，不宜概括成全部零样本，更不能将塑形保证误写成检测正确性保证 |
| [Large Reward Models: Generalizable Online Robot Reward Generation with Vision-Language Models](https://arxiv.org/html/2603.16065v2)，2026，arXiv v2，方法 | 分别建模相对进度、绝对进度、二元完成；当前观测驱动在线奖励生成 | 监督仍利用视频归一化时间；主验证是 RL 优化，不能据此自动推断开放式技能交接可靠。证据：§III-A–D |

一个具体反例说明评测差别：TOPReward v2 在 279 条清理后的 LeRobot 轨迹上报告 8B 模型 ROC-AUC 0.939。但其成功分数结合前缀首尾变化和完整视频 Yes/No 判断，两项分数还按被评估轨迹集合进行 z-score 标准化，属于轨迹结束后的辨别协议。若要在线使用，必须重新确定只看历史时的评分、阈值和连续误报率。[原文 §4.3 与 Appendix C](https://arxiv.org/html/2602.19313v2)

Robometer 则给出了更直接的系统证据：第一阶段把玉米放入锅中，检测成功后切到盖锅盖；将“掉在锅旁”误判成完成会使第二阶段建立在错误状态上。作者项目报告该两阶段设置中基础策略与 RoboReward 为 20%，Robometer 为 70%。这是特定实验的闭环结果，不能跨不同论文、任务直接排名。[作者实验页面](https://robometer.github.io/)

## 长程执行论文中的几种易混淆情形

| 工作 | 核验到的真实机制 | 正确的归类 |
| --- | --- | --- |
| [Relay Policy Learning](https://proceedings.mlr.press/v100/gupta20a.html)，CoRL 2019 / PMLR 2020，方法 | 低层执行固定步数，无论当前目标是否达成 | 时间驱动的分层控制，不是完成事件驱动 |
| [SayCan / Do As I Can, Not As I Say](https://proceedings.mlr.press/v205/ichter23a.html)，CoRL 2022 / PMLR 2023，方法/系统 | affordance/value 预测技能将来能否成功；低层另有 terminate，高层另有 done | 三种信号须分开；不能用“有价值函数”直接证明完成检测。技能训练还使用人类视频成功标签 |
| [Inner Monologue](https://proceedings.mlr.press/v205/huang23c.html)，CoRL 2022 / PMLR 2023，系统 | 模拟域用脚本；真实桌面用检测框启发式；真实厨房用学习视觉分类器，部分场景描述由人提供 | 开创性展示成功反馈进入语言规划闭环，但反馈实现不是统一免规则检测器 |
| [Hi Robot](https://proceedings.mlr.press/v267/shi25d.html)，ICML 2025，方法/系统 | 每 1 秒或用户插话时重新推断当前子指令；论文提出可用完成事件触发，但实际使用周期更新 | 观测条件的隐式切换，不是单独学习并校准的 completion detector |
| [PARTS / From Pretraining to Proficiency](https://arxiv.org/html/2609.21788v1)，2026-09，arXiv，方法/系统 | 智能体生成 selector、verifier、reset 程序；人制定任务契约并复核，感知混合分割和 VLM | 是近期混合路线；由智能体写检测程序仍属于程序化判据，不能算全部由统一网络学出的完成条件 |

产业模型也把这个能力单列出来。例如 [Gemini Robotics ER 2 官方页面](https://deepmind.google/models/gemini-robotics/embodied-reasoning/)同时展示成功检测、进度分类和多阶段协调，[模型卡](https://deepmind.google/models/model-cards/gemini-robotics-er-2/)日期为 2026-07。它说明完成判断已成为具身基础模型的明确能力目标；但厂商内部评测与公开 benchmark 不应直接混比，也不能从产品定位推导任意任务可靠性。

## 为什么进度高、看起来成功和可以切换仍不相同

第一，时间标签有便宜但明显的近似。VLAC 的 80%/95% 规则、LRM 的归一化时间、Robometer 的数据源级完成截点都在减少标注成本，却没有直接观察每条轨迹真实的完成瞬间。对停顿、重试、回撤、录制延迟和“完成后又破坏结果”，时间与语义会分离。此处是由论文监督方式得出的分析，而不是声称所有这些方法都在每个此类情形失败。

第二，相对排序不提供绝对阈值。一个始终没有把插头插到底的轨迹，也可以被正确排序为越来越接近目标。VOC、偏好准确率高，说明排序有用；不能由此推出“分数达到某值时已经完成”。奖励适合训练与检测适合终止是两个需分别验证的性质。

第三，在线检测会反复产生决策机会。单帧误报很低，连续询问许多次仍可能过早停机；真实错误通常还存在时间相关性。应统计每条未完成轨迹是否至少误触发一次，而不仅是帧级准确率。类似地，假设各次交接独立且每次正确率为 98%，20 次交接全部正确的概率只有 $0.98^{20}\approx 66.8\%$；这只是说明误差累积的算例，不是论文实测。

第四，技能完成还不一定满足下一技能的起始条件。例如“已抓住杯子”可能尚未形成可倒水的姿态；“盒盖打开”可能没有留足插入空间。一个更完整的切换决策应同时检查当前后置条件、结果是否稳定和下一技能的可执行性。此为综合推断，不应把三项混成一个未经定义的成功分数。

第五，观测存在上限。单张外部 RGB 图像可能无法区分物体被稳定夹住还是被支撑住、插头已锁定还是仅贴合、液体质量是否达到精确要求。历史、多视角、本体感觉、触觉或主动观察可以增加证据。使用这些输入进行学习式判断，仍然不同于为每个任务写一个专用阈值程序。

## 评测应怎样理解

| 评测/数据 | 主要测量对象 | 用于本问题时的限制 |
| --- | --- | --- |
| [CALVIN 官方评测](https://github.com/mees/calvin/blob/main/calvin_models/calvin_agent/evaluation/evaluate_policy.py)，benchmark/代码 | 多条语言指令的连续执行 | rollout 中调用 task_oracle，判成功后才返回并执行下一子任务；普通长链成绩不能证明策略自己掌握交接时机 |
| [LIBERO 官方任务实现](https://github.com/Lifelong-Robot-Learning/LIBERO/blob/master/libero/libero/envs/problems/libero_tabletop_manipulation.py)，benchmark/代码 | BDDL 目标下的任务执行 | _check_success 以对象状态谓词求值；提供模拟器成功标签，常规任务成功率不单独测量模型自主完成检测 |
| [RLBench task 接口](https://github.com/stepjam/RLBench/blob/master/rlbench/backend/task.py)，benchmark/代码 | 注册的 success/fail conditions | 成功由场景条件 condition_met 计算，不是通用视觉检测 |
| [BEHAVIOR 官方任务文档](https://behavior.stanford.edu/reference/tasks/behavior_task.html)，benchmark/代码 | 家庭活动目标谓词和部分完成 | 评测器用真值计分不等于策略可见真值；不能将所有参评方法概括成 oracle 切换 |
| [OpenGVL — Benchmarking Visual Temporal Progress for Data Curation](https://arxiv.org/abs/2509.17321)，2025，arXiv，benchmark | 视觉时间进度和数据质量 | 适合比较进度建模，不能直接代替终止时刻检测 |
| [PRM-as-a-Judge / RoboPulse](https://arxiv.org/abs/2603.21669)，2026，arXiv，方法 + benchmark | 状态对的进展/退步；包含起点与终点参考 | 有助于检查局部方向判断；目标终帧和离线状态对需与在线可见信息区分 |
| [PRM-as-a-Judge 1.5 / RoboPulse++](https://arxiv.org/html/2608.14284v1)，2026，arXiv，系统 + benchmark | 700 条轨迹、2,244 个进退标注区间；[公开数据](https://huggingface.co/datasets/lyy0715/RoboPulsePlusPlus) | 测 Rising/Falling；评测去掉区间边缘，其 VLM Sequence Style 评测读取整个标注区间。因此不能把方向准确率当完成/交接准确率 |

与成功检测相邻的运行时评测还有 [Sentinel: Unpacking Failure Modes of Generative Policies](https://arxiv.org/abs/2410.04640)（CoRL 2024，方法）和 [FAIL-Detect: Can We Detect Failures Without Failure Data?](https://arxiv.org/abs/2503.08558)（RSS 2025，方法）。前者结合动作一致性与视觉进度监控，后者从成功分布和不确定性进行序贯异常检测；它们适合比较报警与失败预警，不自动提供“已成功”的语义证书。

[FailBench: How Reliable are VLMs at Judging Robot Task Success?](https://arxiv.org/html/2609.03611v1)（2026-09-03，arXiv，纯 benchmark）聚合 14 个来源、2,197 次操作尝试，并评估 13 个 VLM 检测器。最佳平均 balanced accuracy 约为 0.77；接触密集装配子域表现明显下降。结果提示跨域完成判断仍不稳定，并观察到证据含混时偏向报成功。它测试已经结束的尝试，不提供在线子任务切换的保证。

对本问题，最有说服力的证据组合应包括：真实失败/近成功负例、只有历史可见的逐步检测、未见任务与未见机器人划分、提前切换率、漏检与检测延迟，以及真正由检测器驱动的长链成功率。阈值选择数据应和最终测试分开。评估 oracle 可以保留作真值，但不能把它的答案反馈给部署控制器；两者是完全不同的使用方式。

## 研究空间：由本次文献对照提出的推断

| 已有覆盖 | 仍需更强证据的问题 | 值得检验的方向 |
| --- | --- | --- |
| 给策略增加 completion/stop 输出已被多次研究 | 在未见任务和策略失败状态中，能否可靠确定真正的交接瞬间？ | 以近成功负例、因果历史和事件边界为中心的通用终止学习 |
| VLM 对整段轨迹成功判断、解释失败已有大量工作 | 在线不断查询时，能否控制每条轨迹的提前切换风险？ | 序贯校准、拒答/补充观测、基于代价的切换决策 |
| 进度、成功和偏好模型逐渐统一 | 是否明确区分“完成”“失败停机”“暂时不确定”和“下一步可执行”？ | 多状态执行监控和后置条件/起始条件联合验证 |
| 视觉模型可跨机器人提供反馈 | 遮挡与精细接触中，哪些证据是充分的？ | 视觉—本体—触觉融合及主动验证动作 |
| 已有 outcome、progress、failure 数据集 | 是否存在覆盖真实交接边界、长链依赖和恢复的统一测试？ | completion-driven switching benchmark，而非仅最终成功分类 |

单独提出“用 VLM 判断完成”或“给 VLA 增加 stop head”已经很难构成充分差异。更明确的问题是：在缺少任务专属检测代码、面对未见目标与失败状态时，如何以可测的低误报率完成在线交接，并验证长程执行因此得到改善。这是文献定位判断，不是未经实验验证的具体方法结论。

## 复用建议

已有独立技能库、希望尽快替换手写完成条件：从目标条件分类器或语言条件视觉 verifier 入手，用少量真实正负例校准；重点收集“近似成功但关键条件未满足”的样本。若希望内部判断与动作联合建模，以 SeqVLA 为最小直接参考，以 CycleVLA 参考恢复机制。若希望跨技能共用一个模型，以 SuccessVQA、Robometer 为核心，同时比较 TOPReward 的因果前缀分数；不要直接挪用离线归一化评分。

一个可复用的系统设计是：技能策略执行 → 学习检测器读取目标和历史 → 输出继续、成功、失败或不确定 → 成功则验证交接条件，失败则重试/回退，不确定则收集补充证据。它是本报告根据多篇工作综合出的建议架构，而非已经统一的行业标准。

## 建议阅读顺序

1. **FLO**：先确认“从成功示例学习分类器并串联任务”的问题很早已有直接实现。
2. **SuccessVQA**：理解目标语言化之后如何共用检测接口。
3. **SeqVLA**：最清楚地对应“策略输出动作，同时判断何时换下一技能”。
4. **CycleVLA**：理解 stop、progress、外部视觉核验和失败恢复为什么需要分工。
5. **Robometer**：理解大规模通用奖励/成功模型如何真正控制阶段推进。
6. **AHA、Guardian**：看验证结果怎样进入重试和重规划。
7. **GVL、TOPReward、VLAC**：比较进度、概率、done 的不同监督与使用方式。
8. **FailBench、RoboPulse++**：看现有泛化和过程评测能支持什么结论、遗漏什么。

若重点是较少人工标注，补读 Policy Sketches、VICE 和 VICE-RAQ；若重点是复用独立技能库，补读 SkillGen 与 M-EMBER。

## 检索范围与证据说明

公开检索词覆盖 robot subtask completion detection、learned skill termination、success classifier、option termination、vision-language success detection、robot progress estimation、general-purpose reward model、execution monitoring 和相关 benchmark，并对命中的原论文进行标题追踪和引用扩展。方法的在线使用、训练监督和评测边界优先查正文/附录；会议状态以正式会议页面、论文记录或作者项目为依据，无法确认时保留 arXiv 标签。

本报告没有复现实验；所有性能数字均为所链接作者/benchmark 的报告，不是独立测量。不把不同数据、不同版本的 VOC、ROC-AUC、balanced accuracy、任务成功率直接横向排名。不以未找到文献证明绝对空白。
