export interface FallbackData {
  rawText: string;
  sources: Array<{ title: string; uri: string }>;
  searchQueries: string[];
}

export const FALLBACK_DATABASE: Record<string, FallbackData> = {
  '1706.03762': {
    searchQueries: [
      'Attention Is All You Need Vaswani NeurIPS 2017 paper',
      'Transformer architecture citations Google Brain',
    ],
    sources: [
      {
        title: 'Attention Is All You Need - arXiv:1706.03762',
        uri: 'https://arxiv.org/abs/1706.03762',
      },
      {
        title: 'NeurIPS 2017 Proceedings - Attention Is All You Need',
        uri: 'https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html',
      },
      {
        title: 'The Annotated Transformer - Harvard NLP',
        uri: 'https://nlp.seas.harvard.edu/annotated-transformer/',
      },
    ],
    rawText: `1. CORE CONCEPT EXTRACTION:
The dominant sequence transduction models relied heavily on complex recurrent or convolutional neural networks operating in sequential steps, severely limiting parallelization during training across long sequence lengths. 

The paper introduces the Transformer, the first sequence transduction architecture based entirely on attention mechanisms, discarding recurrence and convolutions completely. By replacing sequential step-by-step state propagation with Multi-Head Self-Attention, the model connects all positions directly in constant O(1) sequential operations. 

The primary mathematical breakthrough is Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) V, scaled by the square root of key dimension d_k to counteract small gradients in large dimensions. Multi-Head Attention projects queries, keys, and values h times into d_k, d_k, and d_v dimensions, allowing the network to simultaneously attend to information from different representation subspaces. Sinusoidal positional encodings are injected to preserve sequence order without recurrence. This achieved state-of-the-art BLEU scores of 28.4 on WMT 2014 English-to-German while training in a fraction of the time required by recurrent predecessors.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
[FLOWCHART]
graph TD
    InputTokens[Input Tokens] --> InputEmbed[Input Embedding + Positional Encoding]
    InputEmbed --> EncBlock[Encoder Stack x6]
    
    subgraph EncoderLayer [Encoder Block]
        EncAttn[Multi-Head Self-Attention] --> EncNorm1[Add & LayerNorm]
        EncNorm1 --> EncFFN[Feed-Forward Network]
        EncFFN --> EncNorm2[Add & LayerNorm]
    end
    
    EncBlock --> EncOutput[Encoder Memory Keys & Values]
    
    TargetTokens[Target Tokens Shifted Right] --> OutputEmbed[Output Embedding + Positional Encoding]
    OutputEmbed --> DecBlock[Decoder Stack x6]
    
    subgraph DecoderLayer [Decoder Block]
        DecSelfAttn[Masked Multi-Head Attention] --> DecNorm1[Add & LayerNorm]
        DecNorm1 --> CrossAttn[Multi-Head Cross-Attention]
        EncOutput -.-> CrossAttn
        CrossAttn --> DecNorm2[Add & LayerNorm]
        DecNorm2 --> DecFFN[Feed-Forward Network]
        DecFFN --> DecNorm3[Add & LayerNorm]
    end
    
    DecBlock --> LinearProj[Linear Layer]
    LinearProj --> SoftmaxOutput[Softmax Probabilities]
    SoftmaxOutput --> FinalTokens[Predicted Output Tokens]

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
1. Exact Extension: Replace dense O(N^2) multi-head self-attention with a FlashAttention-style tiled exact attention kernel or linear attention approximation to benchmark throughput on consumer GPUs.
Targeted Performance Metric: 2.5x to 4x reduction in peak VRAM consumption on 4096-token context with zero perplexity regression.
Recommended Tech Stack: PyTorch, Triton / CUDA C++, Hugging Face Transformers, Weights & Biases.

2. Exact Extension: Implement 4-bit and 8-bit Quantization-Aware Training (QAT) coupled with structured head pruning to deploy the Transformer decoder on low-power edge devices.
Targeted Performance Metric: 3.2x inference latency speedup on Apple Silicon / Raspberry Pi with under 1.0 BLEU degradation.
Recommended Tech Stack: PyTorch Quantization, ONNX Runtime, GGML/llama.cpp, TensorRT.

3. Exact Extension: Conduct an empirical comparative study replacing absolute sinusoidal positional encodings with Rotary Position Embeddings (RoPE) and ALiBi for length extrapolation beyond the training window.
Targeted Performance Metric: Stable validation loss and perplexity on context windows 3x longer than the training sequence length.
Recommended Tech Stack: PyTorch, FlashAttention-2, vLLM, DeepSpeed.

4. METADATA OF PAPER:
Metadata: Citations: 145000, Authors: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin, Publication: Advances in Neural Information Processing Systems (NeurIPS), Year: 2017`,
  },

  '2501.12948': {
    searchQueries: [
      'DeepSeek-R1 paper arXiv 2501.12948',
      'Incentivizing Reasoning Capability in LLMs via Reinforcement Learning DeepSeek',
    ],
    sources: [
      {
        title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs - arXiv:2501.12948',
        uri: 'https://arxiv.org/abs/2501.12948',
      },
      {
        title: 'DeepSeek AI GitHub Repository',
        uri: 'https://github.com/deepseek-ai/DeepSeek-R1',
      },
    ],
    rawText: `1. CORE CONCEPT EXTRACTION:
Current frontier reasoning models traditionally rely on massive supervised fine-tuning (SFT) datasets of human demonstrations before applying reinforcement learning, making training cost-prohibitive and human-data bound.

DeepSeek-R1 demonstrates that reasoning capabilities can emerge purely through large-scale Reinforcement Learning (RL) directly on base models without preliminary supervised fine-tuning (DeepSeek-R1-Zero). The methodology implements Group Relative Policy Optimization (GRPO), eliminating the memory-heavy critic network of PPO by estimating baselines directly from grouped sample rollouts.

The algorithmic breakthrough is reward modeling without generative reward models: rule-based rewards verify mathematical accuracy and code execution correctness, while format rewards penalize tag misplacement. The model autonomously discovers test-time compute scaling, dynamic thinking chains, reflection, and backtracking behaviors, achieving 79.8% Pass@1 on AIME 2024. Knowledge distillation then transfers reasoning traces into efficient small dense architectures (1.5B to 70B parameters).

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
[FLOWCHART]
graph TD
    BaseModel[DeepSeek-V3-Base 671B MoE] --> RLZero[Pure RL via GRPO Exploration]
    RLZero --> EmergingThinking[Emergence of Self-Correction & Reasoning Traces]
    
    subgraph MultiStagePipeline [Cold-Start & Multistage Training]
        ColdStartData[Curated Long-CoT Cold Start Data] --> ColdStartSFT[Stage 1: Fine-Tune Base Model]
        ColdStartSFT --> ReasoningRL[Stage 2: Reasoning-Oriented RL with Rule Rewards]
        ReasoningRL --> RejectionSample[Stage 3: Rejection Sampling & CoT Synthesis]
        RejectionSample --> FullRL[Stage 4: General Alignment & Human Preference RL]
    end
    
    EmergingThinking --> ColdStartData
    FullRL --> DeepSeekR1[DeepSeek-R1 Model]
    DeepSeekR1 --> DistillationEngine[800K Curated CoT Reasoning Distillation]
    DistillationEngine --> DenseSmallModels[Distilled Qwen & Llama 1.5B/7B/8B/14B/32B/70B]

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
1. Exact Extension: Reproduce and evaluate GRPO rule-based reasoning on small 3B open-weight models (e.g. Llama-3.2-3B or SmolLM2) using Python AST and unit-test execution environments for reward verification.
Targeted Performance Metric: +15% improvement on GSM8K and HumanEval pass rates using purely self-generated test-time compute.
Recommended Tech Stack: PyTorch, TRL (Transformer Reinforcement Learning), vLLM, Hugging Face Datasets.

2. Exact Extension: Implement dynamic token-budget stopping criteria to eliminate repetitive or redundant reasoning chains in distilled R1 models during live inference.
Targeted Performance Metric: 40% reduction in generated output tokens on simple queries with under 1.5% drop on MATH benchmarks.
Recommended Tech Stack: vLLM, SGLang, Python, PyTorch, Ray.

3. Exact Extension: Build a multimodal verification harness using GRPO to train visual reasoning models on geometry and scientific diagram QA without human annotations.
Targeted Performance Metric: +12% accuracy gain on MathVista geometric proofs using programmatic SVG/Matplotlib verification.
Recommended Tech Stack: PyTorch, Qwen2-VL, TRL, Ray, Weights & Biases.

4. METADATA OF PAPER:
Metadata: Citations: 4200, Authors: DeepSeek-AI, Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Publication: arXiv Preprint, Year: 2025`,
  },

  '2106.09685': {
    searchQueries: [
      'LoRA Low-Rank Adaptation of Large Language Models Hu NeurIPS 2022',
      'LoRA parameter efficient fine tuning paper arXiv:2106.09685',
    ],
    sources: [
      {
        title: 'LoRA: Low-Rank Adaptation of Large Language Models - arXiv:2106.09685',
        uri: 'https://arxiv.org/abs/2106.09685',
      },
      {
        title: 'Microsoft LoRA GitHub Repository',
        uri: 'https://github.com/microsoft/LoRA',
      },
    ],
    rawText: `1. CORE CONCEPT EXTRACTION:
Fine-tuning colossal foundational language models by updating all parameters is computationally prohibitive, requiring immense GPU memory and generating individual multi-gigabyte checkpoints for every downstream task.

The authors propose LoRA (Low-Rank Adaptation), freezing pre-trained model weights and injecting trainable rank decomposition matrices into each layer of the Transformer architecture.

The mathematical foundation rests on the hypothesis that weight updates during adaptation possess a low 'intrinsic dimension'. For a frozen weight matrix W_0 in R^{d x k}, LoRA constrains its update delta W with low-rank decomposition: W = W_0 + (alpha / r) * B * A, where B in R^{d x r} and A in R^{r x k}, with rank r << min(d, k). Matrix A is initialized with Gaussian noise and B with zero, ensuring delta W = 0 at training initialization. LoRA reduces trainable parameters by 10,000x and GPU memory consumption by 3x on GPT-3 175B, with zero additional inference latency since B * A can be fused directly into W_0 at runtime.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
[FLOWCHART]
graph TD
    InputX[Input Vector x of dimension d] --> FrozenWeight[Frozen Pretrained Matrix W_0 in R d x k]
    InputX --> LoRA_A[Trainable Matrix A in R r x k Gaussian Init]
    
    LoRA_A --> LoRA_B[Trainable Matrix B in R d x r Zero Init]
    LoRA_B --> Scaling[Scaling Factor alpha / r]
    
    FrozenWeight --> Summation((Element-wise Addition +))
    Scaling --> Summation
    
    Summation --> OutputH[Output Vector h = W_0 x + delta W x]
    
    subgraph DeployPhase [Inference Deployment]
        FusedWeight[Fused Weight W = W_0 + B*A * alpha/r] --> ZeroLatency[Zero Extra Inference Latency]
    end

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
1. Exact Extension: Implement dynamic rank allocation (AdaLoRA) where singular value decomposition ranks are pruned adaptively based on layer-wise gradient importance during training.
Targeted Performance Metric: 25% reduction in LoRA parameter budget while matching or exceeding static rank r=16 GLUE scores.
Recommended Tech Stack: PyTorch, PEFT (Hugging Face), Triton, Weights & Biases.

2. Exact Extension: Develop a Multi-LoRA concurrent serving router on vLLM that swaps adapter weights per-request on a single frozen base model instance in GPU memory.
Targeted Performance Metric: Support 100+ concurrent tenant adapters on 1 GPU with under 5% throughput degradation compared to base model serving.
Recommended Tech Stack: vLLM, C++ / CUDA, Python, FastAPI, Docker.

3. Exact Extension: Investigate QLoRA 4-bit NormalFloat (NF4) quantization with double dequantization on vision-language models for edge device continuous learning.
Targeted Performance Metric: Fine-tune 7B multimodal model on a single 12GB consumer GPU without OOM errors.
Recommended Tech Stack: BitsAndBytes, PyTorch, PEFT, Hugging Face Transformers.

4. METADATA OF PAPER:
Metadata: Citations: 18500, Authors: Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen, Publication: International Conference on Learning Representations (ICLR), Year: 2022`,
  },
};

export function findFallbackData(url: string): FallbackData | null {
  for (const [key, data] of Object.entries(FALLBACK_DATABASE)) {
    if (url.includes(key)) {
      return data;
    }
  }
  // Keyword checks
  if (/attention|transformer|vaswani/i.test(url)) return FALLBACK_DATABASE['1706.03762'];
  if (/deepseek|r1|reasoning/i.test(url)) return FALLBACK_DATABASE['2501.12948'];
  if (/lora|low-rank/i.test(url)) return FALLBACK_DATABASE['2106.09685'];

  return null;
}
