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
  }
]
export const papers = [
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
  }
]
export const research = [
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
