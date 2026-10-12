---
type: "paper"
title: "TwinRL: Digital Twin-Driven Reinforcement Learning for Real-World Robotic Manipulation"
shortTitle: "TwinRL"
year: 2026
date: "2026-10-12"
category: "rl-post-training"
tags: ["VLA", "Real-World RL", "Digital Twin", "Sim-to-Real", "Human-in-the-Loop", "Exploration"]
authors: ["Qinwen Xu", "Jiaming Liu", "Rui Zhou", "Shaojun Shi", "Nuowei Han", "Zhuoyang Liu", "Chenyang Gu", "Shuo Gu", "Yang Yue", "Gao Huang", "Wenzhao Zheng", "Sirui Han", "Peng Jia", "Shanghang Zhang"]
paper: "https://arxiv.org/abs/2602.09023"
code: "https://github.com/zhourui9813/TwinRL"
project: "https://twinrl.github.io/"
venue: "ACM Multimedia 2026（具体 track 未独立核实）"
venueType: "conference"
publicationStatus: "accepted"
firstPublished: "2026-02-09"
publicationSources: ["https://arxiv.org/abs/2602.09023", "https://github.com/zhourui9813/TwinRL"]
summary: "利用数字孪生扩展示范覆盖、提供交互回放并选择真机练习配置，提高四项桌面操作任务中的VLA在线强化学习效率。"
status: "read"
---

# TwinRL：让数字孪生决定真机应该怎样练习

真机强化学习需要机器人先碰到值得学习的行为，每次尝试却很昂贵。TwinRL用真实场景的数字孪生扩大监督微调的空间覆盖，再用策略在孪生中产生的交互轨迹帮助价值学习起步，并找出容易失败的物体配置，让真机练习和人工纠正集中在那里。它把虚拟经验接入策略初始化、回放数据和练习位置三个环节，提高有限真实交互的利用效率。

## 论文来源

| 项目 | 信息与来源 |
| --- | --- |
| 发表场所与状态 | ACM International Conference on Multimedia 2026（ACM MM 2026），已录用；[官方仓库](https://github.com/zhourui9813/TwinRL)记载2026年7月录用。具体 track 未从可读取的正式记录独立核实。 |
| 最早可核实公开时间 | 2026-02-09，arXiv v1，按平台UTC日期记录。[版本历史](https://arxiv.org/abs/2602.09023) |
| 正式发表时间 | 尚未核实；录用月份不作为正式出版日期。 |
| 所读版本 | arXiv v4，2026-05-19，19页，含附录A–E。[PDF](https://arxiv.org/pdf/2602.09023v4) · [HTML](https://arxiv.org/html/2602.09023v4)。早期标题及仓库仍使用 TwinRL-VLA。 |
| 官方代码 | [zhourui9813/TwinRL](https://github.com/zhourui9813/TwinRL)，已公开资产、生成数据和离线训练代码；真机RL训练代码仍标注 coming soon。 |
| 项目主页 | [twinrl.github.io](https://twinrl.github.io/)，提供方法说明和执行视频。 |

历史思路重建以2026-02-09为界；后续研究检索截至2026-10-06，覆盖arXiv、作者项目、官方代码及会议出版记录。实现与近邻方法机制于2026-10-12复核。本文依据完整正文、附录及关键图表；尚缺的实现细节和实验控制在相应位置说明。

## 1. 研究问题、背景与价值

设想机器人学过把六角块插进桌面中央的孔，换到旁边却连有效接近都做不好。直接加上RL，可能长时间只得到失败；人工接管能完成任务，也未必让策略迅速学会新区域。瓶颈发生在有效反馈产生之前：策略很少访问通向成功的状态，价值估计也缺少相关经验。

TwinRL研究少量真实示范下的VLA真机在线RL。实验中的OOD主要指**原始真实示范未覆盖的工作空间区域**，这些区域会进入合成SFT和后续RL。目标是扩大覆盖后的快速适应。论文按任务完成时被操纵物体中心的位置划分ID/OOD网格，因此热图也不能解读为机械臂初始位姿网格。[P0，§III-B、§IV-A](https://arxiv.org/html/2602.09023v4)

## 2. 从前人工作，怎样走到这个 idea

**示范让RL能够启动，但少量示范留下了覆盖缺口。** ConRFT把行为克隆与Q学习结合，先从真实示范学习策略和价值函数，再用真机交互及人工纠正优化。模仿项将动作约束在可行行为附近，Q函数引导高回报动作；它也指出有限状态覆盖会影响价值估计。新位置上若持续失败，现有经验不足以告诉策略怎样接近成功路径。[P1，§III–IV](https://arxiv.org/html/2502.05450v1)

因此，上真机前需要补充相关状态与动作。只改图像亮度不能教机械臂走向另一个孔；观察和动作必须一起改变。Real2Render2Real展示了一条便宜的路径：重建场景和物体，变化示范的起终点，插值物体轨迹，通过逆运动学和渲染得到新图像—动作数据，供模仿学习或策略微调。它的运动学合成路线为覆盖扩展提供了工具。[P2，§4](https://arxiv.org/html/2505.09601v1)

**将仿真用于RL和真实探索，也已有直接先例。** 三项近邻工作有助于看清TwinRL的具体位置：

| 前人工作 | 仿真知识怎样进入学习 | 与TwinRL的主要差别 |
| --- | --- | --- |
| RialTo（2024） | 在孪生中用特权状态做RL，再通过DAgger蒸馏视觉策略，并混入真实示范 | 已有孪生RL与真实数据约束；原始流程没有TwinRL的真机在线RL和困难初态驱动HiL |
| SimLauncher（2025） | 特权状态RL产生仿真示范，BC得到视觉策略；仿真示范、该策略在真机取得的成功轨迹和在线经验混合训练critic；BC策略还提供动作候选 | 主要在每一步动作选择和价值目标上引导探索；TwinRL突出VLA的回放初始化，以及episode初态/重置配置选择 |
| SGFT（2025） | 继承仿真策略，用冻结的仿真价值函数塑形真实奖励并缩短优化时域 | 指导信号进入奖励与价值；TwinRL转移交互数据，并用孪生成功率分配真机练习 |

来源：[P7，RialTo方法](https://arxiv.org/html/2403.03949v1)、[P3，SimLauncher §III及算法1](https://arxiv.org/html/2507.04452v1)、[P8，SGFT §4.1及附录C](https://arxiv.org/html/2502.02705v1)。SimLauncher明确同时使用仿真和真实数据，不能概括为只在真机采样；其actor/critic随机初始化，所谓critic bootstrapping也不意味着迁移仿真critic权重。执行时它按Q值的softmax概率在BC/RL候选间采样，TD目标则取两个候选Q的最大值。

由此，合理的候选思路是：先补足空间行为覆盖，再提供策略交互经验，最后用虚拟试跑决定真机优先练习哪些配置。TwinRL的贡献集中在**覆盖扩展→交互回放→困难初态引导HiL的VLA后训练流程**，并实证分析探索受限现象。3D重建、运动学合成、模仿加RL和HiL都有成熟来源；不能将整套方法概括为首次孪生RL或首次仿真指导真机探索。[P0，§III](https://arxiv.org/html/2602.09023v4)

## 3. 核心 intuition

RL能多快进步，取决于策略能走到哪里、回放池里有什么经验，以及下一次练习从哪里开始。数字孪生允许低成本地调整这三件事。它可以保留部分物理误差，但转移的经验和难度判断必须对真机有用。

## 4. 方法与一个简单例子

实验以Octo-Small为基础，输入第三视角、腕部RGB图像及任务信息，输出末端平移、旋转和夹爪动作。流程如下。

### 第一步：重建并对齐可重新安排的场景

手持手机环绕工作区拍摄约1分钟视频，覆盖完整机器人基座和周围环境；视频为30 FPS、1080×1920。抽帧后用3DGS工具KIRI Engine重建静态场景，SAM3D从RGB观察重建可操纵物体，机器人结构来自URDF。各部分统一为mesh资产并集成到Blender或仿真环境；论文未交代3DGS转mesh的具体提取、简化或纹理处理算法。

对齐以URDF机器人坐标为锚点，先用ICP等点云配准粗匹配，再优化平移、旋转和尺度。精对齐比较的是多个视角下**URDF渲染的机器人mask与重建机器人3DGS渲染的mask**，通过可微渲染降低差异。扫描得到的机器人在这里提供对齐参照；执行模型仍来自URDF。[P0，§III-C、附录C](https://arxiv.org/html/2602.09023v4)

交互采用运动学物体、逐帧位姿、简化碰撞几何、非穿透和工作空间约束，没有完整拟合摩擦、柔顺性及接触力。公开实现也尚未披露孪生轨迹生成和在线rollout的具体后端：所核查入口消费预生成数据，环境类是SERL风格Franka真机Gymnasium封装，经HTTP、Flask与ROS控制机器人；`fake_env`只在定义观测/动作空间后提前返回。不能据论文引用或依赖目录确认其使用Isaac Sim或MuJoCo。[固定提交的训练入口](https://github.com/zhourui9813/TwinRL/blob/0151852369cfe1d496d93e90c25b688fccf6110c/examples/train_offline.py)、[FrankaEnv](https://github.com/zhourui9813/TwinRL/blob/0151852369cfe1d496d93e90c25b688fccf6110c/serl_robot_infra/franka_env/envs/franka_env.py#L131-L167)

### 第二步：扩展示范，形成更好的SFT策略

SAM3D物体下采样为100k点，加上桌面平面点云，输入AnyGrasp得到候选抓取。设物体在基座坐标系中的初始、目标位姿为$T_0,T_{\mathrm{target}}$，**夹爪在物体坐标系中的相对位姿**为$T_{\mathrm{grasp}}$，则

$$
T^{\mathrm{ee}}_{\mathrm{start}}=T_0T_{\mathrm{grasp}},\qquad
T^{\mathrm{ee}}_{\mathrm{end}}=T_{\mathrm{target}}T_{\mathrm{grasp}}.
$$

按列向量记法，这就是${}^{B}T_E={}^{B}T_O\,{}^{O}T_E$；$T_{\mathrm{grasp}}$将末端坐标转换到物体坐标。展开旋转和平移，有

$$
R_{\mathrm{ee}}=R_O R_g,\qquad p_{\mathrm{ee}}=p_O+R_O p_g.
$$

所以抓取偏移会随物体朝向旋转。`start`指物体初态对应的末端边界位姿，未必是机器人home pose；这些式子只给边界条件，中间路径和关节角仍须规划或求逆运动学。同一$T_{\mathrm{grasp}}$表示复用同一种抓取关系，也不要求整项任务始终不松手。[P0，式4及附录C](https://arxiv.org/html/2602.09023v4#S3.E4)

系统改变物体初始位置/朝向、目标位姿和路径，通过关键帧规划或示范轨迹变换生成图像—动作对。主实验每任务使用**30条人类遥操作真机ID示范＋60条合成ID示范＋30条合成OOD示范**，共同微调Octo-Small。SFT的模仿目标为$\mathcal L_{\pi}^{\mathrm{IL}}=-\mathbb E_{(s,a)\sim\mathcal D}[\log\pi_\psi(a\mid s)]$。[P0，§III-C、§IV-B、附录B](https://arxiv.org/html/2602.09023v4)

### 第三步：用策略交互经验预热真机RL

上一步真实与合成示范都是供策略模仿的预定行为。Stage II以SFT策略初始化，让它在并行孪生环境中自己选择动作、交互和更新，产生成功、失败或恢复轨迹。其训练目标为

$$
\mathcal L_{\pi}^{\mathrm{twin}}
=\beta\mathcal L_{\pi}^{\mathrm{IL}}+\eta\mathcal L_{\pi}^{\mathrm{RL}},\qquad
\mathcal L_{\pi}^{\mathrm{RL}}
=-\mathbb E_{s\sim\mathcal D,\,a\sim\pi_\psi(\cdot\mid s)}[Q_\theta(s,a)].
$$

$Q_\theta$估计未来回报并通过时序差分更新；RL项偏好高价值动作，模仿项稳定行为。论文没有明确这一阶段每批真实/合成示范的采样比例，30/60/30是SFT数据集构成。

孪生交互轨迹用于初始化真机回放池：$\mathcal D_{\mathrm{real}}^{\mathrm{init}}\leftarrow\mathcal D_{\mathrm{twin}}$，旨在缓解示范分布转向策略交互分布时的早期不稳定。跨阶段模型权重和优化器状态如何继承未充分披露。后面的消融还表明，失败数据需要筛选，数量增加并不保证收益。[P0，§III-D、式6](https://arxiv.org/html/2602.09023v4#S3.SS4)

### 第四步：让真机练习困难物体配置

当前策略在孪生中试跑不同配置，估计成功率$SR(s_0)$，以熟练度阈值$\tau$构造

$$
\mathcal S_{\mathrm{target}}=\{s_0\mid SR(s_0)<\tau\}.
$$

真机优先从这些配置重置，必要时由人接管，交互和纠正轨迹进入训练。论文明确强调的是初始**物体配置及相关空间布局**，未证实独立随机化、筛选机械臂关节初态。物体位姿变化导致计算出的抓取边界变化，也不等于机械臂任务起始姿态被系统随机化。[P0，§III-E、§IV-C](https://arxiv.org/html/2602.09023v4#S3.SS5)

### 一个贯穿流程的例子

以插块任务作教学简化：物体无旋转，初始位置为$(0.40,0.20,0.10)$米，目标为$(0.60,-0.10,0.10)$米，夹爪参考点在物体上方0.05米。相应末端边界是$(0.40,0.20,0.15)$与$(0.60,-0.10,0.15)$米，规划器再补齐接近、对齐、插入路径。改变目标位置即可生成原始真机示范之外的视觉—动作序列。

混合SFT让策略学过这些路径；孪生RL随后采集它自己执行时的偏离与修正。假设试跑发现右上区域难，便优先在真机摆出对应配置。真实插入若被孔边卡住，人工退回、微调再插入产生新的纠正经验。以上数字和失败过程是教学示意；它展示了合成示范、策略rollout和真实纠正分别承担的作用。

## 5. 实验：关键数据能说明什么

实验使用FR3机械臂，覆盖抓放、六角块插入、三柱块插入和擦白板。重点看四个问题。

### 5.1 与基线相比，真机训练是否更快？

| 图1概览值 | 所标成功率（%，↑） | 所标真机训练时间（分钟，↓） | 评测范围 |
| --- | ---: | ---: | --- |
| TwinRL | 100 | 20 | ID与OOD |
| ConRFT | 77.2 | 31 | ID与OOD |
| HiL-SERL | 71.25 | 30 | 仅ID |

来源：[P0，PDF图1](https://arxiv.org/pdf/2602.09023v4#page=1)。这些是论文概览图的报告值，聚合和取点规则未详述；HiL-SERL覆盖范围不同，31/30分钟也不能解释为两基线达到100%所需时间。TwinRL主实验与ConRFT使用相同30条真机示范，但另增加90条合成示范。

TwinRL报告四任务平均约20分钟真机在线训练；§IV-A将计时定义为Stage III首次rollout至连续10次无人工干预成功。**训练后另做五轮重复评测，均值95%、标准差6.71个百分点**，原文没有给基线同协议统计。每轮在ID/OOD中“10次rollout”的计数与跨任务聚合不够明确，不自行推算总次数，也不把该标准差称为跨训练种子误差。[P0，§IV-A/B](https://arxiv.org/html/2602.09023v4#S4.SS2)

在线计时不含示范采集、SFT、孪生RL及建模。表III逐项列出扫描1分钟、场景重建10分钟、物体重建5秒、对齐3分钟、抓取检测15秒，合计约14分20秒，仍非完整工程成本。“一组rollout约1分钟”也不等于全部孪生训练只需1分钟。

### 5.2 合成示范是否改善RL前的初始能力？

固定六角块任务及30条真实ID示范，评测SFT后的真机成功率：

| 合成ID轨迹 | 合成OOD轨迹 | ID成功率（%，↑） | OOD成功率（%，↑） |
| ---: | ---: | ---: | ---: |
| 0 | 0 | 40 | 0 |
| 30 | 30 | 70 | 30 |
| 60 | 30 | 80 | 40 |
| 30 | 60 | 70 | 70 |

来源：[P0，表I](https://arxiv.org/html/2602.09023v4#S4.T1)。表中未单列精确分母与误差，原Avg加权方式不明，此处保留区域值。“初始能力”指SFT策略进入RL前的水平。

0/0到30/30支持增添合成示范有效，但同时改变了数量和覆盖。更有解释力的是两种**同为90条**的配置：增加OOD份额使OOD从40%升至70%，ID从80%降至70%，表明数据空间分配影响策略擅长的区域。它直接验证SFT能力变化；RL加速还需看后续实验。论文另观察到仅有A区示范的策略在B区自主RL约两小时、40k步仍难以稳定获得正奖励，支持该设置的探索瓶颈，不能推广为RL永远无法越出示范的定理。[P0，§III-B](https://arxiv.org/html/2602.09023v4)

### 5.3 孪生交互回放带来的收益，是否只是更多数据？

图5的完整TwinRL与`w/o buffer`使用相同SFT数据；明示差别是是否用孪生RL回放初始化真机池，后者仍保留孪生引导。抓放OOD在6k步时，完整方法约100%，`w/o buffer`约20%（曲线近似值）。这支持回放迁移有效，但不能把该消融称为完全删除孪生RL或固定策略采样；它也未匹配新增回放数据量。[P0，图5、附录D1](https://arxiv.org/html/2602.09023v4#S4.F5)

六角块任务进一步改变孪生回放组成：

| 成功轨迹 | 失败轨迹 | 报告的在线训练步数 | 成功率（%，↑） |
| ---: | ---: | ---: | ---: |
| 0 | 0 | 5,000 | 90 |
| 20 | 0 | 3,500 | 100 |
| 30 | 0 | 4,000 | 90 |
| 20 | 20 | 4,500 | 90 |
| 20 | 40 | 7,000 | 70 |

来源：[P0，表II](https://arxiv.org/html/2602.09023v4#S4.T2)。各行步数不同，未单列评测次数及误差，不能作为同预算成功率比较。20条成功轨迹的配置最好，继续增加成功或失败都未单调改善。作者将失败数据的负效应归因于随机、缺乏任务意义的失败，但未独立控制失败类型验证这一解释。

这些结果支持组件和数据选择有用，**尚未隔离孪生RL参数更新本身的贡献**：缺少等量规划示范与RL轨迹对比，也缺少冻结SFT策略采样与孪生RL更新后采样、同时匹配覆盖和真机起始权重的对照。

### 5.4 相同初始化和回放下，练习位置选择还有用吗？

图6保持初始化和回放池相同，只改变是否用孪生识别困难配置并指导HiL。六角块在4k步时，有引导100%，无引导约60%；前者约需14分钟。无引导值为曲线近似，图中无独立误差条。它更直接支持**初态选择与引导机制**的额外收益，不能归作孪生RL参数优化的单独消融。[P0，图6、§IV-C](https://arxiv.org/html/2602.09023v4#S4.F6)

## 6. Take-aways

- **SFT数据也在塑造后续探索。** 先形成目标区域的可行行为，可能比单纯增加真机RL时间有效。
- **回放经验需要可迁移性。** 策略生成的成功轨迹能发挥作用，失败数据应按用途判断。
- **仿真可以帮助分配真实交互。** 即使接触建模有限，找对值得练习的配置仍有价值。
- **贡献应落实到具体衔接。** TwinRL验证了三阶段组合的效果，尚未证明全面优于最接近的仿真辅助RL方法。

## 7. 比较脆弱的假设

**孪生难点能够预测真机难点。** 现有直接证据主要是六角块任务的一个SFT检查点：12个网格中，仿真和真实每格各试5次，难度分布大体一致。真实失败若主要来自摩擦、滑动或装配公差，视觉几何相近仍可能选错练习区域。[P0，附录D4、图14](https://arxiv.org/html/2602.09023v4#Ax4.SS0.SSS0.Px4)

**虚拟经验能够支撑真实价值估计。** 运动学可行不保证真实接触可行；偏差进入critic后可能高估虚拟成功。表II提示数据选择风险，但尚未分离轨迹类型、数据量和模型误差。主实验也未同协议比较SimLauncher、SGFT或RialTo，因此系统有效性与相对这些近邻的优越性应分开判断。

**前置成本值得换取真机时间。** 证据限于固定桌面任务、单一机器人和Octo-Small，总成本是否下降未报告。近同期RL-Co（首版2026-02-13）用较弱匹配的仿真，结合仿真RL与真实SFT约束，也得到部署收益；高保真重建的必要程度仍需结合任务和总成本比较。[P4，§4](https://arxiv.org/html/2602.12628v4)

## 8. Follow-up：先校准失败经验，再用于价值学习

可研究用少量匹配配置的真机试验估计孪生失败的可信度，据此决定失败轨迹是否进入回放、以多大权重进入。这样有望区分策略能力不足与接触建模误差造成的假难点。

截至2026-10-06的检索中，Twin-DAgger已用真实干预定位失败区域和偏离时刻、生成纠正示范；Recova也已在孪生中探索恢复，经真实验证后用DAgger更新。因此候选差异应聚焦于**利用仿真—真实分歧控制失败转移对critic更新的影响**。可检验的预测是：总轨迹数相同、动力学偏差增大时，校准后的失败回放比单按失败率采样更稳定。该机制仍待验证，不构成原创性保证。[P5](https://link.springer.com/chapter/10.1007/978-3-032-37314-4_7)、[P6，§3](https://arxiv.org/html/2610.01178v1)

## 参考来源

- **P0**：Qinwen Xu等，*TwinRL: Digital Twin-Driven Reinforcement Learning for Real-World Robotic Manipulation*，arXiv:2602.09023v4，2026-05-19。[全文](https://arxiv.org/html/2602.09023v4)
- **P1**：Yuhui Chen等，*ConRFT: A Reinforced Fine-tuning Method for VLA Models via Consistency Policy*，arXiv:2502.05450v1，2025。核对离线—在线训练与HiL。[全文](https://arxiv.org/html/2502.05450v1)
- **P2**：Justin Yu等，*Real2Render2Real: Scaling Robot Data Without Dynamics Simulation or Robot Hardware*，arXiv:2505.09601v1，2025。核对轨迹重定向、运动学渲染与模仿学习。[全文](https://arxiv.org/html/2505.09601v1)
- **P3**：Mingdong Wu等，*SimLauncher: Launching Sample-Efficient Real-world Robotic Reinforcement Learning via Simulation Pre-training*，arXiv:2507.04452v1，2025-07-06。核对双域数据、critic学习及动作提议。[全文](https://arxiv.org/html/2507.04452v1)
- **P4**：Liangzhi Shi等，*Beyond Imitation: Reinforcement Learning-Based Sim-Real Co-Training for VLA Models*，arXiv:2602.12628，2026，方法对照据v4；首版晚于TwinRL四天，属于近同期工作。[版本记录](https://arxiv.org/abs/2602.12628) · [全文](https://arxiv.org/html/2602.12628v4)
- **P5**：Jiahang Li等，*Twin-DAgger: Synergizing Digital Twins and Human Corrections for Efficient Robot Manipulation*，ECCV 2026，2026-09-16在线发表。方法比较依据出版方摘要。[出版页](https://link.springer.com/chapter/10.1007/978-3-032-37314-4_7)
- **P6**：Isabella Liu等，*Recova: Agent-Guided Failure Recovery for Autonomous Robotic Manipulation*，arXiv:2610.01178v1，2026-10-01。核对孪生恢复、真实验证及DAgger。[全文](https://arxiv.org/html/2610.01178v1)
- **P7**：RialTo，arXiv:2403.03949v1，2024。核对孪生状态RL、视觉蒸馏与真实示范共同训练。[全文](https://arxiv.org/html/2403.03949v1) · [项目](https://real-to-sim-to-real.github.io/RialTo/)
- **P8**：*Rapidly Adapting Policies to the Real World via Simulation-Guided Fine-Tuning*（SGFT），arXiv:2502.02705v1，2025。核对仿真价值奖励塑形、真实微调与缩短优化时域。[全文](https://arxiv.org/html/2502.02705v1) · [项目](https://weirdlabuw.github.io/sgft/)
