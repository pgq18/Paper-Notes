export const categories = [
  {
    "id": "rl-post-training",
    "title": "RL Post-Training",
    "icon": "🎯",
    "description": "围绕强化学习后训练的论文精读与方法分析。"
  },
  {
    "id": "test-time-policy-steering",
    "title": "Test-Time Policy Steering",
    "description": "围绕部署时通过价值引导、候选动作重排与策略选择改善机器人行为的论文精读。"
  },
  {
    "id": "real-time-vla",
    "title": "Real-Time VLA",
    "description": "围绕视觉语言动作策略的异步推理、动作分块、延迟补偿与执行调度的论文精读。"
  }
]
export const papers = [
  {
    "type": "paper",
    "title": "Learning to Act While Waiting: RL Finetuning of Generalist Robot Policies Under Inference Latency",
    "shortTitle": "ARLI",
    "year": 2026,
    "date": "2026-10-07",
    "category": "rl-post-training",
    "tags": [
      "VLA",
      "动作分块",
      "噪声空间引导",
      "延迟补偿",
      "异步推理",
      "强化学习"
    ],
    "authors": [
      "Brian Zhu",
      "Momen Khalil",
      "E Harrison",
      "Emanuele Poggi",
      "Philipp Schmitt",
      "Bernd Kast",
      "Philine Meister",
      "Pranav Atreya",
      "Qiyang Li",
      "Finn Ferchau",
      "Cesar Colmenero",
      "Yash Shahapurkar",
      "Gokul Narayanan",
      "Melih Erdogan",
      "Kai Wurm",
      "Georg von Wichert",
      "Oier Mees",
      "Eugen Solowjow",
      "Andrew Wagenmaker",
      "Sergey Levine"
    ],
    "paper": "https://arxiv.org/abs/2608.23831v2",
    "code": "",
    "project": "https://async-rl-intermediate-information.github.io/",
    "summary": "ARLI 将推理期间已承诺的动作和中途新观测交给轻量噪声策略，使冻结的生成式机器人策略能够在异步推理延迟下通过强化学习改善行为。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/arli-2026",
    "file": "papers/rl-post-training/arli-2026.md"
  },
  {
    "type": "paper",
    "title": "SmoothRL: Online Reinforcement Learning During Asynchronous Execution",
    "shortTitle": "SmoothRL",
    "year": 2026,
    "date": "2026-10-07",
    "category": "rl-post-training",
    "tags": [
      "VLA",
      "人在回路",
      "动作分块",
      "异步推理",
      "机器人强化学习",
      "残差策略"
    ],
    "authors": [
      "Guang Gao",
      "Yuxuan Nong",
      "Baifu Huang",
      "Jianan Wang"
    ],
    "paper": "https://arxiv.org/abs/2608.29768v1",
    "code": "",
    "project": "https://www.astribot.com/en/AI/SmoothRL/",
    "summary": "将异步动作块划分为已承诺、实际执行和丢弃区域，使价值梯度只更新实际执行的动作，并结合前缀条件化和平滑约束完成真机在线强化学习。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/smoothrl-2026",
    "file": "papers/rl-post-training/smoothrl-2026.md"
  },
  {
    "type": "paper",
    "title": "Uncertainty-driven Exploration Strategies for Online Grasp Learning",
    "shortTitle": "Uncertainty-driven Grasp Learning",
    "year": 2024,
    "date": "2026-10-07",
    "category": "rl-post-training",
    "tags": [
      "不确定性估计",
      "主动探索",
      "吸附抓取",
      "机器人抓取",
      "离线到在线强化学习"
    ],
    "authors": [
      "Yitian Shi",
      "Philipp Schillinger",
      "Miroslav Gabriel",
      "Alexander Qualmann",
      "Zohar Feldman",
      "Hanna Ziesche",
      "Ngo Anh Vien"
    ],
    "paper": "https://arxiv.org/abs/2309.12038v2",
    "code": "",
    "project": "",
    "summary": "在离线初始化的像素抓取网络上分解模型与数据不确定性，用模型知识缺口引导真机试抓和在线更新，改善陌生困难物体的箱内吸取。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/uncertainty-driven-grasp-learning-2024",
    "file": "papers/rl-post-training/uncertainty-driven-grasp-learning-2024.md"
  },
  {
    "type": "paper",
    "title": "FutureRTC: Real-Time Robot Execution with Anticipatory-Conditioned Action Chunking",
    "shortTitle": "FutureRTC",
    "year": 2026,
    "date": "2026-09-29",
    "category": "real-time-vla",
    "tags": [
      "VLA",
      "动作分块",
      "延迟补偿",
      "异步推理",
      "未来视觉预测"
    ],
    "authors": [
      "Hai Jiang",
      "Yixian Zou",
      "Binbin Liang",
      "Boqian Liu",
      "Fanman Meng",
      "Shuaicheng Liu"
    ],
    "paper": "https://arxiv.org/abs/2607.24008v1",
    "code": "https://github.com/JianghaiSCU/FutureRTC",
    "project": "https://jianghaiscu.github.io/FutureRTC_proj/",
    "summary": "利用已承诺动作预测交接时刻的视觉特征与机器人状态，让冻结的VLA从未来执行上下文生成动作，缓解异步推理的时间错位。",
    "status": "read",
    "rating": null,
    "route": "/papers/real-time-vla/futurertc-2026",
    "file": "papers/real-time-vla/futurertc-2026.md"
  },
  {
    "type": "paper",
    "title": "Reinforcement Learning for Real-Time Vision-Language-Action Policies",
    "shortTitle": "Real-Time EXPO-FT",
    "year": 2026,
    "date": "2026-09-29",
    "category": "rl-post-training",
    "tags": [
      "action-chunking",
      "real-time-control",
      "reinforcement-learning",
      "residual-policy",
      "vision-language-action"
    ],
    "authors": [
      "Perry Dong",
      "Kuo-Han Hung",
      "Dorsa Sadigh",
      "Chelsea Finn"
    ],
    "paper": "https://arxiv.org/abs/2609.18207",
    "code": "https://github.com/pd-perry/expo-ft",
    "project": "https://pd-perry.github.io/real-time-expo-ft/",
    "summary": "用延迟感知的 VLA 提前生成动作候选，再在执行边界依据最新观测进行强化学习驱动的快速修正与价值筛选，提高动态任务中的成功率。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/real-time-expo-ft-2026",
    "file": "papers/rl-post-training/real-time-expo-ft-2026.md"
  },
  {
    "type": "paper",
    "title": "Adapting Generalist Robot Policies with Semantic Reinforcement Learning",
    "shortTitle": "SARL：通过强化学习选择机器人的语言指令",
    "year": 2026,
    "date": "2026-09-28",
    "category": "rl-post-training",
    "tags": [
      "分层控制",
      "在线强化学习",
      "机器人基础模型",
      "语言动作",
      "长程任务"
    ],
    "authors": [
      "Jagdeep Singh Bhatia",
      "Andrew Wagenmaker",
      "William Chen",
      "Sergey Levine"
    ],
    "paper": "https://arxiv.org/abs/2606.31958",
    "code": "",
    "project": "https://semantic-action-rl.github.io/",
    "summary": "SARL 固定通用机器人策略，通过在线强化学习选择状态相关的语言指令，调用和组合已有技能以适应新的多步骤任务。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/sarl-2026",
    "file": "papers/rl-post-training/sarl-2026.md"
  },
  {
    "type": "paper",
    "title": "Performant robotic manipulation with real-world reinforcement learning",
    "shortTitle": "RL-100",
    "year": 2026,
    "date": "2026-09-28",
    "category": "rl-post-training",
    "tags": [
      "一致性蒸馏",
      "扩散策略",
      "机器人操作",
      "真实世界强化学习",
      "离线到在线强化学习"
    ],
    "authors": [
      "Kun Lei",
      "Huanyu Li",
      "Dongjie Yu",
      "Zhenyu Wei",
      "Lingxiao Guo",
      "Zhennan Jiang",
      "Ziyu Wang",
      "Shiyu Liang",
      "Huazhe Xu"
    ],
    "paper": "https://arxiv.org/abs/2510.14830v4",
    "code": "https://github.com/Lei-Kun/RL-100",
    "project": "https://lei-kun.github.io/RL-100/",
    "summary": "RL-100 从扩散模仿策略出发，通过带离线评估门控的迭代强化学习、真机数据扩充和在线微调提升操作可靠性，再用一致性蒸馏降低部署延迟。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/rl-100-2026",
    "file": "papers/rl-post-training/rl-100-2026.md"
  },
  {
    "type": "paper",
    "title": "Steerable Vision-Language-Action Policies for Embodied Reasoning and Hierarchical Control",
    "shortTitle": "Steerable Policies",
    "year": 2026,
    "date": "2026-09-28",
    "category": "test-time-policy-steering",
    "tags": [
      "embodied-reasoning",
      "hierarchical-control",
      "instruction-following",
      "synthetic-data",
      "vision-language-action"
    ],
    "authors": [
      "William Chen",
      "Jagdeep Singh Bhatia",
      "Catherine Glossop",
      "Nikhil Mathihalli",
      "Ria Doshi",
      "Andy Tang",
      "Danny Driess",
      "Karl Pertsch",
      "Sergey Levine"
    ],
    "paper": "https://arxiv.org/abs/2602.13193",
    "code": "https://github.com/steerable-policies/steerable-policies-bridge",
    "project": "https://steerable-policies.github.io/",
    "summary": "用多粒度语言与像素坐标重标注机器人演示，训练可接受多种指令的 VLA，使高层模型能根据观察与执行反馈选择控制接口，改善真实机器人分层控制。",
    "status": "read",
    "rating": null,
    "route": "/papers/test-time-policy-steering/steerable-policies-2026",
    "file": "papers/test-time-policy-steering/steerable-policies-2026.md"
  },
  {
    "type": "paper",
    "title": "Active Reinforcement Learning Strategies for Offline Policy Improvement",
    "shortTitle": "ActiveRL：主动补齐离线数据",
    "year": 2025,
    "date": "2026-09-28",
    "category": "rl-post-training",
    "tags": [
      "Active Learning",
      "Exploration",
      "Offline RL",
      "Offline-to-Online RL",
      "Uncertainty"
    ],
    "authors": [
      "Ambedkar Dukkipati",
      "Ranga Shaarad Ayyagari",
      "Bodhisattwa Dasgupta",
      "Parag Dutta",
      "Prabhas Reddy Onteru"
    ],
    "paper": "https://arxiv.org/html/2412.13106v2",
    "code": "https://github.com/sml-iisc/ActiveRL",
    "project": "https://sml.csa.iisc.ac.in/Blog/Active_RL/index.html",
    "summary": "在离线数据覆盖不足且新增交互有限的条件下，以模型集成分歧选择采集起点和探索动作，并截断低不确定性轨迹，再用增广数据改善离线策略。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/active-rl-2025",
    "file": "papers/rl-post-training/active-rl-2025.md"
  },
  {
    "type": "paper",
    "title": "Steering Your Generalists: Improving Robotic Foundation Models via Value Guidance",
    "shortTitle": "V-GPS：用价值函数挑选机器人动作",
    "year": 2025,
    "date": "2026-09-27",
    "category": "test-time-policy-steering",
    "tags": [
      "价值函数",
      "机器人基础模型",
      "测试时动作选择",
      "离线强化学习"
    ],
    "authors": [
      "Mitsuhiko Nakamoto",
      "Oier Mees",
      "Aviral Kumar",
      "Sergey Levine"
    ],
    "paper": "https://arxiv.org/abs/2410.13816",
    "code": "https://github.com/nakamotoo/V-GPS",
    "project": "https://nakamotoo.github.io/V-GPS/",
    "summary": "V-GPS 用离线强化学习预训练的语言条件价值函数，在部署时重排冻结通用策略的候选动作，改善所测机器人操作任务的平均成功率。",
    "status": "read",
    "rating": null,
    "route": "/papers/test-time-policy-steering/v-gps-2025",
    "file": "papers/test-time-policy-steering/v-gps-2025.md"
  },
  {
    "type": "paper",
    "title": "VLA-RL: Towards Masterful and General Robotic Manipulation with Scalable Reinforcement Learning",
    "shortTitle": "VLA-RL",
    "year": 2025,
    "date": "2026-09-27",
    "category": "rl-post-training",
    "tags": [
      "PPO",
      "VLA",
      "在线强化学习",
      "机器人操作",
      "过程奖励"
    ],
    "authors": [
      "Guanxing Lu",
      "Wenkai Guo",
      "Chubin Zhang",
      "Yuheng Zhou",
      "Haonan Jiang",
      "Zifeng Gao",
      "Yansong Tang",
      "Ziwei Wang"
    ],
    "paper": "https://arxiv.org/abs/2505.18719",
    "code": "https://github.com/GuanxingLu/vlarl",
    "project": "",
    "summary": "从已完成模仿微调的 OpenVLA 出发，以在线 PPO、伪过程奖励和并行训练改善 LIBERO 操作成功率，同时辨明泛化、推理扩展与实现完整性的证据边界。",
    "status": "read",
    "rating": null,
    "route": "/papers/rl-post-training/vla-rl-2025",
    "file": "papers/rl-post-training/vla-rl-2025.md"
  }
]
export const researchCategories = [
  {
    "id": "long-horizon-robotics",
    "title": "机器人长程任务",
    "description": "围绕机器人长程任务的分层执行、子任务完成检测、技能切换与失败恢复的主题调研。"
  },
  {
    "id": "real-time-control",
    "title": "机器人实时控制",
    "description": "围绕生成式机器人策略的推理延迟、观测时效、异步执行与闭环反馈的主题调研。"
  },
  {
    "id": "robot-online-rl",
    "title": "机器人在线强化学习",
    "description": "围绕真实机器人在线与离线到在线强化学习的主动探索、练习调度、反馈与自主复位的主题调研。"
  }
]
export const research = [
  {
    "type": "research",
    "title": "机械臂真机在线强化学习中的缺口识别与定向补充探索",
    "shortTitle": "真机在线 RL 的缺口识别与定向探索",
    "year": 2026,
    "date": "2026-10-06",
    "category": "robot-online-rl",
    "tags": [
      "主动探索",
      "机器人强化学习",
      "离线到在线强化学习",
      "练习调度",
      "自主复位"
    ],
    "authors": [],
    "paper": "",
    "code": "",
    "project": "",
    "summary": "比较机械臂真机在线学习中基于不确定性、成功率、访问覆盖与学习收益的主动采集机制，梳理缺口诊断、到达复位、策略更新和实机证据，并深入解释 TwinRL 的孪生诊断与 DBAP 的任务图规划。",
    "status": "",
    "rating": null,
    "route": "/research/robot-online-rl/active-gap-real-robot-rl-2026",
    "file": "research/robot-online-rl/active-gap-real-robot-rl-2026.md"
  },
  {
    "type": "research",
    "title": "Chunked Policy 的块间物理纠正与在线适配：残差、恢复和控制权切换调研",
    "shortTitle": "Chunked Policy 的块间纠正与在线适配",
    "year": 2026,
    "date": "2026-09-29",
    "category": "long-horizon-robotics",
    "tags": [
      "action-chunking",
      "adaptation",
      "online-rl",
      "policy-switching",
      "recovery",
      "residual-rl",
      "robotics"
    ],
    "authors": [],
    "paper": "",
    "code": "",
    "project": "",
    "summary": "比较块间物理纠正、动作残差、恢复与持续控制权切换，梳理 RecoveryChaining 等近邻、训练价值差异及在线适配的证据边界。",
    "status": "",
    "rating": null,
    "route": "/research/long-horizon-robotics/chunk-boundary-physical-correction-and-online-adaptation-2026",
    "file": "research/long-horizon-robotics/chunk-boundary-physical-correction-and-online-adaptation-2026.md"
  },
  {
    "type": "research",
    "title": "两阶段读取不同时刻新观测：从接口组合到可检验的研究问题",
    "shortTitle": "两阶段读取不同时刻新观测：从接口组合到可检验的研究问题",
    "year": 2026,
    "date": "2026-09-29",
    "category": "real-time-control",
    "tags": [
      "动作反馈",
      "噪声引导",
      "实时控制",
      "异步推理",
      "视觉语言动作模型"
    ],
    "authors": [],
    "paper": "",
    "code": "",
    "project": "",
    "summary": "围绕生成式机器人策略在去噪前与生成后读取不同时刻新观测的问题，综合噪声引导、动作残差、滚动去噪和快慢反馈文献，厘清已有方法的覆盖范围，提出以信息到达时机、执行期限和晚期可修正性为核心的研究假设与验证方案。",
    "status": "",
    "rating": null,
    "route": "/research/real-time-control/two-observation-steering-2026",
    "file": "research/real-time-control/two-observation-steering-2026.md"
  },
  {
    "type": "research",
    "title": "机器人长程任务中的子任务完成检测、技能终止与切换：文献调研",
    "shortTitle": "机器人子任务完成检测与技能切换",
    "year": 2026,
    "date": "2026-09-24",
    "category": "long-horizon-robotics",
    "tags": [
      "成功检测",
      "技能终止",
      "机器人长程任务",
      "视觉语言模型",
      "进度与奖励模型"
    ],
    "authors": [],
    "paper": "",
    "code": "",
    "project": "",
    "summary": "梳理学习式成功检测、策略内生终止、视觉语言验证及进度奖励模型，比较其监督来源、在线技能切换证据与跨任务泛化边界。",
    "status": "",
    "rating": null,
    "route": "/research/long-horizon-robotics/robot-subtask-completion-and-skill-switching-2026",
    "file": "research/long-horizon-robotics/robot-subtask-completion-and-skill-switching-2026.md"
  }
]
