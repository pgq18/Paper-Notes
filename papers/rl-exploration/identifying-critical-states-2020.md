---
type: "paper"
title: "Identifying Critical States by the Action-Based Variance of Expected Return"
shortTitle: "Critical States：把探索放在合适的位置"
year: 2020
date: "2026-10-09"
category: "rl-exploration"
tags: ["强化学习", "探索与利用", "关键状态", "动作价值", "策略解释"]
authors: ["Izumi Karino", "Yoshiyuki Ohmura", "Yasuo Kuniyoshi"]
paper: "https://arxiv.org/abs/2008.11332v2"
code: ""
project: ""
venue: "International Conference on Artificial Neural Networks (ICANN 2020), Proceedings Part I, LNCS 12396, pp. 366–378"
venueType: "conference"
publicationStatus: "published"
firstPublished: "2020-08-26"
publishedAt: "2020-10-14"
publicationSources:
  - "https://arxiv.org/abs/2008.11332"
  - "https://link.springer.com/chapter/10.1007/978-3-030-61609-0_29"
  - "https://link.springer.com/book/10.1007/978-3-030-61609-0"
summary: "用同一状态下不同动作的 Q 值方差识别决策关键点，并在这些位置偏向利用，以减少关键失误、改善后续状态的探索。"
status: "read"
---

# Critical States：把探索放在合适的位置

强化学习中的随机探索，在宽阔地带可能只是多绕一步，在悬崖边却可能让整条轨迹提前结束。这篇论文用同一状态下不同动作的预期回报差异，判断当前决策有多关键：差异越大，动作选错的影响越大。随后在识别出的关键状态更多地采用当前最优动作，让智能体更容易通过危险环节，继续探索后方区域。关键状态也可以作为解释策略时值得展示的片段。

## 论文来源

| 项目 | 信息与来源 |
| --- | --- |
| 发表场所与状态 | 已正式发表于 ICANN 2020 主会议论文集 Part I，LNCS 12396，366–378 页；更细分 track 未核实。[出版方](https://link.springer.com/chapter/10.1007/978-3-030-61609-0_29) |
| 最早可核实公开时间 | 2020-08-26，arXiv v1。[版本记录](https://arxiv.org/abs/2008.11332) |
| 正式发表时间 | 2020-10-14，出版方标注的 First Online；与会议举办日期分开。[出版记录](https://link.springer.com/chapter/10.1007/978-3-030-61609-0_29) |
| 所读版本 | arXiv v2，2020-11-08；[HTML 全文](https://arxiv.org/html/2008.11332v2)、[PDF](https://arxiv.org/pdf/2008.11332v2) |
| 官方代码、项目主页 | 查阅论文、arXiv、出版方及按标题/作者检索后，均未找到可核实的官方链接。 |

已阅读 v2 正文、统计附录及六张图；历史背景以 2020-08-26 为界，后续工作核查至 2026-10-08，覆盖关键状态识别与状态相关探索。一个影响实现的缺口是：连续动作实验没有明确说明如何从混合高斯策略中提取 exploitation 动作，且未找到代码补足。

## 1. 研究问题、背景与价值

设想机器人必须穿过一段窄桥才能继续学习桥后的任务。探索虽然能发现新动作，但如果在桥上频繁随意试探，机器人可能反复跌落，始终采不到桥后的经验。问题因此同时包含两个位置：局部需要可靠通过，后续区域仍需要充分探索。

常见的 $\epsilon$-greedy 在各状态使用相同的随机分支概率。即使这个概率随训练下降，它也没有直接区分一次随机动作的后果。本文研究怎样利用正在学习的价值函数识别关键决策位置，再改变这些位置的动作选择。它同时探索能否用少量关键画面帮助人理解任务，但没有自动生成完整解释。[P0，§1](https://arxiv.org/html/2008.11332v2#S1)

## 2. 从前人工作，怎样走到这个 idea

Q-learning 已经提供了所需的一类信息：$Q(s,a)$ 估计在状态 $s$ 采取动作 $a$ 后能够获得的长期回报。因此，选哪个动作会影响多少回报，本来就可以从同一状态的一组 Q 值中比较出来。统一探索率没有使用这层差别；在失误会结束回合的场景中，这会反复截断轨迹，减少对后续状态的访问。[P1](https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf)

要解决这个问题，检测器需要辨认“动作选择在哪些位置特别重要”。已有 bottleneck 方法从成功轨迹共同经过的区域识别子目标，再学习到达这些位置的技能，已经能帮助跨区域探索。不过，必经门口与危险窄桥可以同样经常被经过：在门口走错还能折返，在桥上走错却可能直接失败。访问频率或空间连通作用，尚不足以表达这一区别。[P2，§3](https://mcgovern-fagg.org/idea_html/pubs/mcgovern_barto_icml2001.pdf)

更直接的依据来自早期的动作价值比较。Torrey 与 Taylor 在 2013 年使用教师已训练完成的 Q 函数，以 $\max_a Q(s,a)-\min_a Q(s,a)$ 衡量状态重要性，把有限的教师建议留给动作后果差异大的位置。Spielberg 与 Azaria 的 2018 年预印本也已把 criticality 联系到跨动作的 $Q^*$ 方差，其具体算法主要使用人或规则提供的重要性，决定多步价值更新在何处结束。[P3，§3.2](https://myslu.stlawu.edu/~ltorrey/papers/aamas13.pdf)；[P4，§1、§4](https://arxiv.org/html/1810.07254v1)

由此可以走到本文的候选思路：用智能体自身不断更新的 Q 值估计动作后果差异，在线寻找需要谨慎决策的位置，并把识别结果接入探索策略。这是基于既有知识重建的一条动机链；本文并未引用上述两项直接前作，不能据此断言作者受其启发。本文值得学习的具体组合是**全方差分解下的指标解释、在线分位数识别，以及在关键状态提高利用概率**；动作差异与关键性的联系已有历史基础。

## 3. 核心 intuition

一次随机动作的价值，取决于它既可能带来的新信息，也可能截断的后续经验。若某个位置已有一个较可靠的通过动作，频繁偏离它会妨碍对后方区域的探索。本文用动作价值的分散程度近似定位这些位置，而其成立的关键前提是：当前 Q 值已经能大致分辨动作的好坏。

## 4. 方法与一个简单例子

整体流程是：照常学习 Q 值，计算当前状态的动作价值方差，将其与近期状态的分位数阈值比较，再决定采用利用分支还是原有探索策略。Q-learning、DQN 和连续控制学习器负责价值学习，本文主要改变行为策略中的探索分配。

### 4.1 从回报方差得到状态重要性

固定当前状态 $s$，让第一步动作 $A$ 按参考分布 $p(a\mid s)$ 选择，之后的动作遵循策略 $\pi$，最终得到累计回报 $G$。可以想象从同一个状态反复开始：第一步可能选不同动作，同一动作之后也可能因环境的随机转移、随机奖励或后续策略的随机选择，得到不同回报。

“固定动作”指指定当前这一步执行某个动作 $a$，例如每次第一步都向右；后续仍照常遵循 $\pi$。把这些轨迹按第一步动作分组，就能分清三个量：

| 方差项 | 数学表达 | 在统计什么 |
| --- | --- | --- |
| 总方差 | $\operatorname{Var}(G\mid s)$ | 所有动作及后续过程产生的回报混在一起，整体有多分散 |
| 平均组内方差 | $\mathbb E_A[\operatorname{Var}(G\mid s,A)]$ | 每组固定第一步动作后，回报仍有多少波动，再按动作概率加权平均 |
| 各组均值的方差 | $\operatorname{Var}_A[Q^\pi(s,A)]$ | 不同第一步动作对应的平均回报有多大差异 |

最后一项用到 $Q^\pi(s,a)=\mathbb E[G\mid s,a]$：动作 $a$ 这一组的平均累计回报，就是它的 Q 值。作者把状态重要性 SI 定义为总方差减去平均组内方差：

$$
\mathrm{SI}(s)=\operatorname{Var}(G\mid s)
-\mathbb{E}_{A\sim p}[\operatorname{Var}(G\mid s,A)].
$$

为什么相减后留下的是各组均值的方差？下面用分组解释补上这一步。令 $\mu=\mathbb E[G\mid s]$ 为总体均值，$\mu_a=Q^\pi(s,a)$ 为动作组的均值。每次回报的偏差都可以拆为：

$$
G-\mu=(G-\mu_a)+(\mu_a-\mu).
$$

平方后出现交叉项 $2(G-\mu_a)(\mu_a-\mu)$。在同一个动作组内，$\mu_a-\mu$ 是固定值，而 $\mathbb E[G-\mu_a\mid s,A=a]=0$，所以交叉项的平均值为零。于是得到全方差公式：

$$
\underbrace{\operatorname{Var}(G\mid s)}_{\text{总方差}}
=\underbrace{\mathbb E_A[\operatorname{Var}(G\mid s,A)]}_{\text{平均组内方差}}
+\underbrace{\operatorname{Var}_A[Q^\pi(s,A)]}_{\text{各组均值的方差}}.
$$

把平均组内方差移到左边，就对应 SI 的定义：

$$
\boxed{\mathrm{SI}(s)=\operatorname{Var}_{A\sim p}[Q^\pi(s,A)]}.
$$

这样只需比较各动作的预期回报，无须分别估计总方差和组内方差再相减。这里扣除的是**平均条件方差**，并不保证选任意一个特定动作都会降低波动。[P0，§2.2，PDF 第 3 页](https://arxiv.org/pdf/2008.11332v2#page=3)

一个教学例子可以把三项对应起来。假设向左、向右等概率选择，向左的回报等概率为 1 或 3，向右为 7 或 9。两组均值分别为 2、8，组内方差均为 1；混合后的四个回报均值为 5，总方差为 10。全方差公式就是 $10=1+9$，SI 就是 $10-1=9$。

总波动大也可能伴随 SI 为零：若两组回报改为 4、6 和 0、10，两组均值都是 5，各组均值的方差为零；但组内方差分别为 1、25，总方差仍有 $(1+25)/2=13$。这时当前动作影响回报的稳定程度，却没有改变预期回报，SI 不会将这种差别计入关键性。以上数值均用于解释统计定义，不是论文实验结果。

作者令评分用的 $p$ 为动作空间上的均匀分布，以比较所有动作的后果；实际执行动作的分布由下一节的规则决定。离散动作有 $m$ 个时，直接将学习到的 $\hat Q$ 代入：

$$
\bar Q(s)=\frac1m\sum_{i=1}^{m}\hat Q(s,a_i),\qquad
\widehat{\mathrm{SI}}(s)=\frac1m\sum_{i=1}^{m}(\hat Q(s,a_i)-\bar Q(s))^2.
$$

Walker2d 的连续动作实验则均匀采样 1,000 个动作来近似计算方差。结合作者用均匀分布考察所有动作后果的定义，应理解为在**环境允许的整个有界动作空间**内采样；论文未提出围绕当前策略输出的动作另外截取一个局部区间。[P0，§2.2](https://arxiv.org/html/2008.11332v2#S2.SS2)、[§3.2](https://arxiv.org/html/2008.11332v2#S3.SS2)

以同期标准 OpenAI Gym Walker2d 为例，一个动作包含六个关节控制分量，每个分量范围为 $[-1,1]$，所以动作空间为 $\mathcal A=[-1,1]^6$。采样可写成：

$$
a^{(i)}\sim\operatorname{Uniform}([-1,1]^6),\qquad i=1,\ldots,1000.
$$

每次采到的是一个完整的六维动作向量，例如 $a^{(1)}=(0.2,-0.8,0.5,0.1,-0.3,0.9)$，六个分量共同构成当前一步的控制指令。动作边界可由同期 Gym 0.17.2 的环境定义核对；原文未注明具体 Gym 版本，这里用标准环境说明采样含义。[P8，环境定义](https://github.com/openai/gym/blob/0.17.2/gym/envs/mujoco/assets/walker2d.xml)

这里的“整个空间”描述采样分布的覆盖范围；1,000 个样本只用于蒙特卡洛近似，无法穷尽连续空间。固定当前状态 $s$，分别计算这批动作的 $\hat Q(s,a^{(i)})$，再将它们代入上面的均值和方差公式，把 $m$ 换成 1,000。这些动作用于评估 Q，并非真的在环境中各执行一次，但会增加计算量。

### 4.2 排名后改变动作选择

先从一批参考状态的 SI 排名中确定阈值 $\tau$，使分数最高的约 $q$ 比例被判为关键状态，实验取 $q=0.1$。小状态空间可以计算所有状态；深度强化学习实验每 1,000 步，根据最近访问的 1,000 个状态样本更新阈值，相当于取它们 SI 的第 90 百分位附近作为分界。[P0，§2.2](https://arxiv.org/html/2008.11332v2#S2.SS2)、[§3.2](https://arxiv.org/html/2008.11332v2#S3.SS2)

训练交互中，“到达关键状态”通过当前观测在线判断：

1. 读入当前状态 $s_t$，例如游戏画面或机器人的位置、速度。
2. 用当前 Q 函数估计各动作价值，并计算 $\widehat{\mathrm{SI}}(s_t)$。
3. 比较分数与阈值：$\widehat{\mathrm{SI}}(s_t)>\tau$ 时，判为关键状态；否则按普通状态处理。
4. 根据判定选择动作，收集新的转移经验，继续学习 Q 值。

因此，一个此前没有出现过的具体状态，也能通过 Q 网络的预测得到分数；判断会随价值估计和参考状态集合变化。阈值的更新间隔与当前状态的判定是两件事：阈值定期更新，遇到状态时则使用当时的 Q 值和已有阈值评分。

到达关键状态时，以 $k=0.95$ 的概率进入利用分支；保留随机性是因为当前价值估计可能有误。离散动作的利用分支选择 $a^*(s)=\arg\max_a\hat Q(s,a)$。[P0，§2.3、§3.1](https://arxiv.org/html/2008.11332v2#S2.SS3)

离散动作实验在关键状态以 $1-k$ 的概率随机选动作，在其他状态使用探索率 $\epsilon'$。其中，$q$ 描述参考状态中关键状态的比例，$k$ 描述关键状态的利用分支概率，$\epsilon$ 是基线的随机分支概率，$\epsilon'$ 则是本文在普通状态的随机分支概率。为了尽量匹配基线的总体随机分支概率，按两类状态加权：

$$
q(1-k)+(1-q)\epsilon'=\epsilon,
\qquad
\epsilon'=\frac{\epsilon-(1-k)q}{1-q}.
$$

这是探索机会在状态间的重新分配。实验中基线 $\epsilon$ 从 0.905 降至 0.005，对应 $\epsilon'$ 从 1 降至 0；关键状态则一直保留 0.05 的随机分支，所以到训练末期，它的探索率会高于基线。连续动作实验在普通状态使用随机策略，在关键状态额外加入利用分支；评估时各方法均采用利用策略。[P0，§3.1–3.2](https://arxiv.org/html/2008.11332v2#S3)

### 4.3 走一遍悬崖格子

下面是教学构造，数值不来自实验。设四个动作依次为向右、向左、向上、向下：

| 状态 | 四个动作的 Q 值 | 动作均值 | SI |
| --- | --- | --- | --- |
| 宽阔区域 | 0.8，0.8，0.8，0.8 | 0.8 | 0 |
| 窄桥中央 | 0.9，0.7，−1，−1 | −0.1 | 0.815 |

窄桥的方差为 $(1^2+0.8^2+(-0.9)^2+(-0.9)^2)/4=0.815$。假设更大状态集合产生的阈值为 0.1，窄桥就进入关键集合。

若当前基线 $\epsilon=0.2$，且窄桥向上、向下都会跌落，则基线当步跌落概率为 $0.2\times2/4=10\%$。本文在该状态以 95% 的概率直接向右，剩余 5% 随机，跌落概率降到 $0.05\times2/4=2.5\%$。随机分支也可能选中向右，所以最终向右的概率是 $0.95+0.05/4=96.25\%$，其余动作各为 1.25%；进入随机分支与实际执行非贪心动作的概率应分开理解。

与此同时，其他状态的随机分支概率升到 $(0.2-0.005)/0.9\approx21.67\%$，在关键状态访问占比等于 $q$ 的条件下，整体仍为 $0.1\times0.05+0.9\times0.2167\approx0.2$。可靠通过窄桥后，轨迹才有机会覆盖桥后的新状态；这就是局部增加利用可能改善整体探索的机制。

## 5. 实验：问题、关键数据与结论

实验同时覆盖离散与连续动作空间：

| 任务 | 动作空间 | SI 的计算方式 |
| --- | --- | --- |
| Cliff Maze | 离散：上、下、左、右四个动作 | 枚举四个动作的 Q 值并计算方差 |
| Atari Breakout | 离散：有限个游戏控制动作 | 枚举各动作的 Q 值并计算方差 |
| Walker2d | 连续：多个关节的控制量组成动作向量 | 均匀采样 1,000 个动作向量，近似计算 Q 值方差 |

来源：[P0，§3.1–3.2](https://arxiv.org/html/2008.11332v2#S3)。动作空间的区别主要改变 SI 的计算方式：有限动作可以枚举，连续动作使用采样近似。

### 能否更快学会通过危险通道？

Cliff Maze 为 $11\times11$ 网格、四个动作；中央一列除中间格外均为悬崖，起点在左上、终点在右下。到终点奖励 +1，落崖 −1，二者均结束回合。两组采用相同的表格 Q-learning，每组 100 个随机种子；指标为学会最优最短路所需的环境交互步数，越少越好。

| 方法 | 中位数／步 ↓ | 均值／步 ↓ | 标准差／步 |
| --- | ---: | ---: | ---: |
| $\epsilon$-greedy | 22,815 | 26,789 | 19,907 |
| 本文方法 | 6,450 | 8,468 | 6,443 |

来源：[P0，Table 1，PDF 第 5 页](https://arxiv.org/pdf/2008.11332v2#page=5)。按表中数值复算，中位数减少约 71.7%，均值减少约 68.4%；原文 Wilcoxon 秩和检验 $p=5\times10^{-13}$。这个明确包含危险通道的任务支持了论文的主要机制。

### 收益是否扩展到图像输入和连续控制？

Breakout 使用 DQN；Walker2d 使用**熵奖励系数设为零的 SAC 变体**，不能把它视作与标准 SAC 的直接比较。各方法训练 200 万步，每组 25 次运行，每 1,000 步评估一次。下表列出原文明示的优势区间，不从曲线估造最终回报值。

| 任务 | 对照方法 | 回报差的 95% 可信区间高于零的训练区间 |
| --- | --- | --- |
| Breakout | $\epsilon$-greedy | 5 万至 200 万步，占总训练步区间 97.5% |
| Walker2d | Default：始终从随机策略采样 | 72 万至 200 万步 |
| Walker2d | EExploitation：各状态以 $e=qk=0.095$ 进入利用分支 | 74 万至 200 万步，占总训练步区间 63% |

来源：[P0，§3.2、Fig. 2、Fig. 4 及附录](https://arxiv.org/html/2008.11332v2#S3.SS2)。可信区间来自将学习曲线及方法间差异建模为随机游走的贝叶斯回归；97.5% 和 63% 表示时间区间占比，不能解读成回报提高比例。

EExploitation 是有用的对照：它检验把利用集中在特定状态的价值。不过，$q$ 是用于阈值的状态比例，未必等于实际轨迹中关键状态的访问比例，因此这些设置只近似控制总体利用概率。结果支持在这两项任务中的学习收益，尚未提供等计算时间的优势比较。

### 找到的状态是否可解释，是否导致了学习跃升？

Breakout 的高 SI 画面集中在球即将落下、挡板必须及时移动的时刻；Walker2d 的高 SI 画面对应单腿支撑、另一腿前摆的环节。这些画面有直观解释，但论文未进行人类理解效果的定量评估。[P0，Fig. 3、Fig. 5](https://arxiv.org/pdf/2008.11332v2#page=7)

作者还回看训练中 SI 最高的十个状态，比较它们与最终模型选出的十个状态的最小距离，并展示两个“先接近最终关键状态、后回报上升”的案例。这个相似度只需其中一对状态接近就会变高，且现象并非出现在所有运行中。因此，它提示值得研究的关联，尚不足以认定关键状态识别造成了学习跃升。[P0，§3.3](https://arxiv.org/html/2008.11332v2#S3.SS3)

## 6. Take-aways

- 探索强度可以按位置分配。判断局部随机动作的价值时，要计入它对后续经验可达性的影响。
- 跨动作 Q 方差回答“换一个动作影响多大”；回报随机性、模型估计是否可信，仍是另外的问题。
- 本文最可迁移的部分，是把学习器已有的价值信息转化为行为策略的控制信号。收益依赖价值估计的质量，也依赖任务是否具有少数特别关键的环节。

## 7. 比较脆弱的假设

**Q 值的差异要能反映真实动作后果。** 未充分采样的动作可能被错误估高或估低；一旦据此减少探索，纠正错误的数据还可能更难获得。2025 年的后续研究在连续状态悬崖迷宫与 Highway-env 中观察到：策略表现改善时，估计的跨动作 Q 方差仍可能下降。它提醒我们，关键性估计会随数据覆盖和训练变化，不能把回报变好当作关键状态识别始终可靠的证据。[P5，§5–6](https://www.scitepress.org/publishedPapers/2025/131142/pdf/index.html)

**均匀动作分布要符合所关心的决策差异。** 连续控制器实际只在很小的动作区域活动时，均匀采样可能把许多几乎不会执行的极端动作纳入 SI，并受到这些动作上的 Q 外推误差影响。SI 也只衡量相对差异：所有动作都会失败时，它仍可能很低。因此，这个指标不能直接当作绝对危险程度。早期 criticality 工作已提出给更可能执行的动作更高权重，这条限制并非今天才出现。[P4，§8](https://arxiv.org/html/1810.07254v1#S8)

**相对排名要能对应有用的干预位置。** 固定取前 10% 并不能证明环境天然有 10% 关键状态；近期样本变化也会改变阈值和下一阶段的访问分布。缺乏明显关键环节时，强行排名可能收益很小。本文三个任务展示了可行性，但不足以确定固定 $q$、$k$ 对其他任务同样合适。[P0，§4](https://arxiv.org/html/2008.11332v2#S4)

## 8. Follow-up：什么时候有充分理由减少探索？

一个具体方向是把控制依据改成**实际探索分布下、有置信依据的探索损失**。设 $\rho(a\mid s)$ 为当前探索时实际使用的动作分布，先估计

$$
L(s)=\max_a Q(s,a)-\mathbb{E}_{a\sim\rho}[Q(s,a)].
$$

它直接比较采用当前最佳动作与继续按探索分布采样的预期回报。随后要求多个价值估计对动作排序及损失下界形成足够一致的判断，才减少该状态的探索；若高差异主要伴随估计分歧，则继续收集能区分候选动作的数据。这里值得验证的是：在 SI 相近、价值估计可信度不同的状态上，能否做出不同的探索决策并减少过早锁定。

已有研究限制了这个方向的新颖性空间：2018 年工作讨论了按动作可能性加权，本文结尾已建议用贝叶斯不确定性调整 $q,k$。2025 年的 *The Evolution of Criticality in Deep Reinforcement Learning* 在结论末段将关键性与模型不确定性的关系列为未来研究，尚未提出并验证将二者分离的方法。P3O 则把状态重要性用于学习更新，DSI 从视频和回报中学习用于回报预测的稀疏关键帧。因而，后续工作的贡献需要落在具体的探索损失估计、置信条件及其效果上；仅加入不确定性或优先处理关键状态还不够。[P4，§8](https://arxiv.org/html/1810.07254v1#S8)；[P5，§6，印刷页 223](https://www.scitepress.org/publishedPapers/2025/131142/pdf/index.html)；[P6](https://imaginglab.ca/data/Preferential_Proximal_Policy_Optimization.pdf)；[P7，§3](https://arxiv.org/html/2308.07795v1#S3)

## 参考来源

- **P0**：Izumi Karino、Yoshiyuki Ohmura、Yasuo Kuniyoshi. *Identifying Critical States by the Action-Based Variance of Expected Return*. ICANN 2020；本次读 arXiv v2。[全文](https://arxiv.org/html/2008.11332v2)；[正式出版](https://doi.org/10.1007/978-3-030-61609-0_29)。
- **P1**：Christopher J. C. H. Watkins、Peter Dayan. *Q-learning*. Machine Learning，1992。[作者 PDF](https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf)。用于价值学习的历史背景。
- **P2**：Amy McGovern、Andrew G. Barto. *Automatic Discovery of Subgoals in Reinforcement Learning using Diverse Density*. ICML 2001。[作者 PDF](https://mcgovern-fagg.org/idea_html/pubs/mcgovern_barto_icml2001.pdf)。用于成功轨迹与子目标发现的背景。
- **P3**：Lisa Torrey、Matthew E. Taylor. *Teaching on a Budget: Agents Advising Agents in Reinforcement Learning*. AAMAS 2013。[作者 PDF](https://myslu.stlawu.edu/~ltorrey/papers/aamas13.pdf)。用于 Q 极差与状态重要性的先行关系。
- **P4**：Yitzhak Spielberg、Amos Azaria. *The Concept of Criticality in Reinforcement Learning*. 本次核对 2018-10-16 公开的 arXiv v1。[全文](https://arxiv.org/html/1810.07254v1)。
- **P5**：Chidvilas Karpenahalli Ramakrishna、Adithya Mohan、Zahra Zeinaly、Lenz Belzner. *The Evolution of Criticality in Deep Reinforcement Learning*. ICAART 2025，Vol. 3，217–224。[出版方全文](https://www.scitepress.org/publishedPapers/2025/131142/pdf/index.html)。
- **P6**：Tamilselvan Balasuntharam、Heidar Davoudi、Mehran Ebrahimi. *Preferential Proximal Policy Optimization*. ICMLA 2023。[作者实验室 PDF](https://imaginglab.ca/data/Preferential_Proximal_Policy_Optimization.pdf)。用于重要性驱动更新的后续比较。
- **P7**：Hao Liu、Mingchen Zhuge、Bing Li、Yuhui Wang、Francesco Faccio、Bernard Ghanem、Jürgen Schmidhuber. *Learning to Identify Critical States for Reinforcement Learning from Videos*. ICCV 2023。[全文](https://arxiv.org/html/2308.07795v1)。
- **P8**：OpenAI Gym 0.17.2 官方源码。[Walker2d 环境定义](https://github.com/openai/gym/blob/0.17.2/gym/envs/mujoco/assets/walker2d.xml)给出六个控制分量及各自的上下界；[MuJoCo 环境基类](https://github.com/openai/gym/blob/0.17.2/gym/envs/mujoco/mujoco_env.py)据此构造动作空间。用于说明同期标准环境的动作范围。
