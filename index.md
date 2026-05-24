---
layout: home

hero:
  name: "Paper Notes"
  text: "Personal research paper library"
  tagline: "用 Markdown 维护自己的论文精读、摘要和思考。"
  actions:
    - theme: brand
      text: "Browse Papers"
      link: "/papers/"
    - theme: alt
      text: "Tags"
      link: "/tags/"

features:
  - icon: "🏗️"
    title: "Foundation Models"
    details: "Architecture, pre-training, scaling laws, MoE, tokenizer, and long context. 已收录 1 篇。"
    link: "/papers/#foundation-models"
  - icon: "🛡️"
    title: "Alignment & Safety"
    details: "RLHF, DPO, RLAIF, constitutional AI, red teaming, and safety evaluation. 已收录 0 篇。"
    link: "/papers/#alignment-safety"
  - icon: "💡"
    title: "Reasoning"
    details: "Chain-of-thought, math reasoning, code generation, planning, and test-time compute. 已收录 0 篇。"
    link: "/papers/#reasoning"
  - icon: "🖼️"
    title: "Multimodal"
    details: "VLMs, image/video understanding, speech, and multimodal generation. 已收录 0 篇。"
    link: "/papers/#multimodal"
  - icon: "🤖"
    title: "Agents"
    details: "Tool use, web agents, coding agents, planning, memory, and multi-agent systems. 已收录 0 篇。"
    link: "/papers/#agents"
  - icon: "🔍"
    title: "RAG & Knowledge"
    details: "Retrieval, vector search, knowledge graphs, grounding, and hallucination mitigation. 已收录 0 篇。"
    link: "/papers/#rag-knowledge"
  - icon: "⚡"
    title: "Efficiency"
    details: "Quantization, pruning, distillation, KV cache, LoRA, and speculative decoding. 已收录 0 篇。"
    link: "/papers/#efficiency"
  - icon: "📊"
    title: "Evaluation"
    details: "Benchmarks, evaluation methodology, LLM-as-judge, and leaderboard analysis. 已收录 0 篇。"
    link: "/papers/#evaluation"
---

## Recent Notes

| Paper | Category | Year | Summary |
| --- | --- | ---: | --- |
| [Transformer](/papers/foundation-models/attention-is-all-you-need) | Foundation Models | 2017 | Introduces the Transformer architecture, replacing recurrence with self-attention for efficient sequence modeling. |

## Update Workflow

- Use GitHub web editor to copy `templates/paper.md` into `papers/<category>/`.
- Use local workflow with `npm run new-paper`, then write and push the generated Markdown file.
- Run `npm run generate` before previewing or building so indexes stay current.
