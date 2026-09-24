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
    "title": "VLA-RL: Towards Masterful and General Robotic Manipulation with Scalable Reinforcement Learning",
    "shortTitle": "VLA-RL",
    "year": 2025,
    "date": "2026-09-25",
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
  },
  {
    "type": "paper",
    "title": "Steering Your Generalists: Improving Robotic Foundation Models via Value Guidance",
    "shortTitle": "V-GPS：用价值函数挑选机器人动作",
    "year": 2025,
    "date": "2026-09-24",
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
