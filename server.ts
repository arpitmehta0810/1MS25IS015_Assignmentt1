import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const SYSTEM_PROMPT = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- Prioritize token efficiency. Keep total analysis and tool execution well under 25,000 tokens.
- If a paper is too long to ingest entirely, use Web Search to look up summaries, abstracts, and open-source implementations of the paper's title.

Think step by step. When a user provides a research paper URL, execute these steps:

1. CORE CONCEPT EXTRACTION: Summarize the problem statement, the primary methodology, and the key mathematical/algorithmic breakthroughs in under 300 words, in plain accessible language.

2. ARCHITECTURAL FLOWCHART (Mermaid.js): Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) of the components, data inputs, model layers, and outputs. Output it as a text segment labeled [FLOWCHART].

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES: Brainstorm 3 concrete, realistic ways a 3rd-year CS student could extend or optimize this paper for a resume project. For each give: the exact extension, the targeted performance metric, and the recommended tech stack.

4. METADATA OF PAPER (always the last section at the end of the page), in exactly this structure:
Metadata: Citations: INT, Authors: STRING, Publication: STRING, Year: 4 digit INT`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

import { findFallbackData } from './serverSampleFallbacks.ts';

// Main paper analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Please provide a valid research paper URL.' });
  }

  const trimmedUrl = url.trim();

  try {
    // Call Gemini 3.8 Flash with Google Search grounding and exact system prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Please analyze the research paper located at this URL: ${trimmedUrl}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    
    // Extract grounding sources and search queries if available
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const sources: Array<{ title: string; uri: string }> = [];
    for (const chunk of groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    }

    // Deduplicate sources by URI
    const uniqueSources = sources.filter(
      (source, index, self) => index === self.findIndex((s) => s.uri === source.uri)
    );

    return res.json({
      success: true,
      url: trimmedUrl,
      rawText: text,
      sources: uniqueSources,
      searchQueries: webSearchQueries,
    });
  } catch (error: any) {
    console.error('Error analyzing paper with Gemini:', error?.message || error);

    // If landmark paper has pre-cached data, use it as fallback
    const fallback = findFallbackData(trimmedUrl);
    if (fallback) {
      console.log(`Serving pre-cached grounding data for ${trimmedUrl}`);
      return res.json({
        success: true,
        url: trimmedUrl,
        rawText: fallback.rawText,
        sources: fallback.sources,
        searchQueries: fallback.searchQueries,
        isFallback: true,
      });
    }

    const isQuota = error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429') || error?.message?.includes('quota');
    const userMessage = isQuota
      ? 'Gemini API free tier rate limit was reached. You can test landmark papers (like "Attention Is All You Need", "DeepSeek-R1", or "LoRA") with curated groundings, or attach a billing-enabled key in Settings > Secrets.'
      : (error?.message || 'Failed to analyze paper. Please check the URL and try again.');

    return res.status(500).json({
      error: userMessage,
      details: error?.toString(),
    });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Research Paper Agent server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
