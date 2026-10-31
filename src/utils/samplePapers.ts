export interface SamplePaper {
  title: string;
  url: string;
  field: string;
  description: string;
}

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    title: 'Attention Is All You Need',
    url: 'https://arxiv.org/abs/1706.03762',
    field: 'Foundational Transformers',
    description: 'The pioneering architecture replacing recurrence with multi-head self-attention mechanisms.',
  },
  {
    title: 'DeepSeek-R1: Reasoning via Reinforcement Learning',
    url: 'https://arxiv.org/abs/2501.12948',
    field: 'LLM Reasoning & RL',
    description: 'Large-scale pure reinforcement learning without supervised warm-up to incentivize thinking chains.',
  },
  {
    title: 'LoRA: Low-Rank Adaptation of LLMs',
    url: 'https://arxiv.org/abs/2106.09685',
    field: 'Parameter-Efficient Fine-Tuning',
    description: 'Decomposing weight update matrices into low-rank representations to freeze base models.',
  },
  {
    title: 'FlashAttention: IO-Aware Exact Attention',
    url: 'https://arxiv.org/abs/2205.14135',
    field: 'GPU Hardware Acceleration',
    description: 'Tiling and SRAM memory hierarchy optimizations minimizing HBM read/write overheads.',
  },
  {
    title: 'Deep Residual Learning (ResNet)',
    url: 'https://arxiv.org/abs/1512.03385',
    field: 'Computer Vision',
    description: 'Residual skip connections solving degradation and vanishing gradients in deep networks.',
  },
];
