# Paper Notes

用 Markdown 维护自己的论文笔记。这里保留精读摘要、方法拆解、实验结论和个人思考，方便之后快速查阅。

- [论文索引](/papers/)
- [标签索引](/tags/)
- [笔记模板](/templates/paper)

## Recent Notes

| Paper | Category | Year | Summary |
| --- | --- | ---: | --- |
| [Transformer](/papers/foundation-models/attention-is-all-you-need) | Foundation Models | 2017 | Introduces the Transformer architecture, replacing recurrence with self-attention for efficient sequence modeling. |

## Categories

| Category | Notes | Scope |
| --- | ---: | --- |
| [Foundation Models](/papers/#foundation-models) | 1 | Architecture, pre-training, scaling laws, MoE, tokenizer, and long context. |
| [Alignment & Safety](/papers/#alignment-safety) | 0 | RLHF, DPO, RLAIF, constitutional AI, red teaming, and safety evaluation. |
| [Reasoning](/papers/#reasoning) | 0 | Chain-of-thought, math reasoning, code generation, planning, and test-time compute. |
| [Multimodal](/papers/#multimodal) | 0 | VLMs, image/video understanding, speech, and multimodal generation. |
| [Agents](/papers/#agents) | 0 | Tool use, web agents, coding agents, planning, memory, and multi-agent systems. |
| [RAG & Knowledge](/papers/#rag-knowledge) | 0 | Retrieval, vector search, knowledge graphs, grounding, and hallucination mitigation. |
| [Efficiency](/papers/#efficiency) | 0 | Quantization, pruning, distillation, KV cache, LoRA, and speculative decoding. |
| [Evaluation](/papers/#evaluation) | 0 | Benchmarks, evaluation methodology, LLM-as-judge, and leaderboard analysis. |

## Update Workflow

本地新增：

```bash
npm run new-paper
npm run generate
```

GitHub 网页新增：复制 `templates/paper.md` 到 `papers/<category>/`，填好 frontmatter 和正文后提交。
