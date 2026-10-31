import { ParsedAnalysis, PaperMetadata, StudentProjectOpportunity, GroundingSource } from '../types';

export function parseAnalysisOutput(
  rawText: string,
  url: string,
  sources: GroundingSource[] = [],
  searchQueries: string[] = []
): ParsedAnalysis {
  const text = rawText || '';

  // 1. Extract Metadata
  // Structure: Metadata: Citations: INT, Authors: STRING, Publication: STRING, Year: 4 digit INT
  let metadata: PaperMetadata = {
    citations: 'N/A',
    authors: 'Unknown Authors',
    publication: 'Academic Publication',
    year: 'N/A',
  };

  const metadataMatch = text.match(
    /Metadata:\s*Citations:\s*([^,\n]+),\s*Authors:\s*([^,\n]+),\s*Publication:\s*([^,\n]+),\s*Year:\s*(\d{4}|\w+)/i
  );

  if (metadataMatch) {
    metadata = {
      citations: metadataMatch[1].trim(),
      authors: metadataMatch[2].trim(),
      publication: metadataMatch[3].trim(),
      year: metadataMatch[4].trim(),
    };
  } else {
    // Secondary fallback search if format had slightly different delimiters
    const citMatch = text.match(/Citations?:\s*([0-9,kKmM+]+)/i);
    const authMatch = text.match(/Authors?:\s*([^\n,]+(?:,\s*[^\n,]+)*)/i);
    const pubMatch = text.match(/Publication:\s*([^\n,]+)/i);
    const yrMatch = text.match(/Year:\s*(\b\d{4}\b)/i);

    if (citMatch) metadata.citations = citMatch[1].trim();
    if (authMatch) metadata.authors = authMatch[1].trim();
    if (pubMatch) metadata.publication = pubMatch[1].trim();
    if (yrMatch) metadata.year = yrMatch[1].trim();
  }

  // 2. Extract Flowchart
  let flowchartCode = '';

  // Look for [FLOWCHART] block
  const flowchartIndex = text.indexOf('[FLOWCHART]');
  if (flowchartIndex !== -1) {
    const afterLabel = text.slice(flowchartIndex + '[FLOWCHART]'.length);
    // Find where the next section begins (e.g. 3. FUTURE WORK or ### 3. or end of block)
    const nextSectionRegex = /(?:\n\s*(?:3\.|\#\#\#?\s*3\.|\#\#\#?\s*FUTURE|\n\s*FUTURE WORK|METADATA))/i;
    const matchNext = afterLabel.search(nextSectionRegex);
    const segment = matchNext !== -1 ? afterLabel.slice(0, matchNext) : afterLabel;

    // Clean out markdown code fences if present
    const cleaned = segment
      .replace(/```mermaid/gi, '')
      .replace(/```/g, '')
      .trim();

    // Verify it contains a graph or flowchart declaration
    if (/^\s*(graph|flowchart)\s+(TD|TB|LR|RL)/i.test(cleaned)) {
      flowchartCode = cleaned;
    } else {
      // Try to find the line starting with graph or flowchart
      const graphMatch = cleaned.match(/(?:graph|flowchart)\s+(?:TD|TB|LR|RL)[\s\S]*/i);
      if (graphMatch) {
        flowchartCode = graphMatch[0].trim();
      }
    }
  }

  // Fallback: search for any ```mermaid or graph TD block in text if [FLOWCHART] wasn't found or was empty
  if (!flowchartCode) {
    const mermaidBlock = text.match(/```mermaid([\s\S]*?)```/i);
    if (mermaidBlock) {
      flowchartCode = mermaidBlock[1].trim();
    } else {
      const graphBlock = text.match(/((?:graph|flowchart)\s+(?:TD|TB|LR|RL)[\s\S]*?)(?=(?:\n#{1,3}\s|\n\d+\.|\n\[|$))/i);
      if (graphBlock) {
        flowchartCode = graphBlock[1].trim();
      }
    }
  }

  // Ensure flowchart syntax doesn't have unclosed quotes or syntax breakage
  if (flowchartCode) {
    flowchartCode = sanitizeMermaid(flowchartCode);
  }

  // 3. Extract Core Concept Extraction (Section 1)
  let coreConcept = '';
  const coreConceptMatch = text.match(
    /(?:1\.\s*CORE\s*CONCEPT\s*EXTRACTION|CORE\s*CONCEPT\s*EXTRACTION)[\s:]*([\s\S]*?)(?=(?:\[FLOWCHART\]|2\.\s*ARCHITECTURAL|ARCHITECTURAL\s*FLOWCHART|```mermaid))/i
  );
  if (coreConceptMatch) {
    coreConcept = coreConceptMatch[1].trim();
  } else {
    // Take text before flowchart as fallback
    if (flowchartIndex !== -1) {
      coreConcept = text.slice(0, flowchartIndex).replace(/(?:1\.\s*CORE\s*CONCEPT\s*EXTRACTION|###\s*1\.)/gi, '').trim();
    } else {
      coreConcept = text.slice(0, Math.min(1000, text.length)).trim();
    }
  }

  // 4. Extract Future Work & Internship Opportunities (Section 3)
  let futureWorkText = '';
  const futureWorkMatch = text.match(
    /(?:3\.\s*FUTURE\s*WORK|FUTURE\s*WORK\s*&\s*INTERNSHIP\s*OPPORTUNITIES)[\s\S]*?(?=(?:4\.\s*METADATA|METADATA\s*OF\s*PAPER|Metadata:|$))/i
  );
  if (futureWorkMatch) {
    futureWorkText = futureWorkMatch[0].trim();
  }

  // 5. Parse 3 concrete student opportunities
  const opportunities = parseOpportunities(futureWorkText || text);

  // 6. Try to infer paper title
  let title = '';
  // Try to find title in core concept first line or metadata
  const titleLine = text.match(/(?:Paper(?:\s*Title)?|Title):\s*["']?([^"\n\r]+)["']?/i);
  if (titleLine) {
    title = titleLine[1].trim();
  } else {
    // Check if the URL has an arxiv or common paper slug
    const urlTitleMatch = url.match(/(?:arxiv\.org\/abs\/|doi\.org\/)([\w.\/-]+)/i);
    if (metadata.publication && metadata.publication !== 'Academic Publication') {
      title = `Research Paper (${metadata.year !== 'N/A' ? metadata.year : 'Analysis'})`;
    } else if (urlTitleMatch) {
      title = `Paper ${urlTitleMatch[1]}`;
    } else {
      title = 'Research Paper Analysis';
    }
  }

  return {
    id: `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url,
    title,
    rawText: text,
    coreConcept,
    flowchartCode,
    futureWorkText,
    opportunities,
    metadata,
    sources,
    searchQueries,
    timestamp: Date.now(),
  };
}

function parseOpportunities(text: string): StudentProjectOpportunity[] {
  const opps: StudentProjectOpportunity[] = [];

  // Look for numbered items (1., 2., 3. or Opportunity 1, Project 1)
  const items = text.split(/(?=\n\s*(?:[1-3]\.|\bOpportunity\s*[1-3]:|\bProject\s*[1-3]:|\bExtension\s*[1-3]:))/i);

  for (let i = 0; i < items.length && opps.length < 3; i++) {
    const item = items[i].trim();
    if (!item) continue;

    // Must look like an opportunity section
    if (/(?:extension|metric|tech\s*stack|optimize|resume|student)/i.test(item)) {
      // Extract title / header
      const firstLine = item.split('\n')[0].replace(/^[1-3]\.\s*/, '').replace(/^(?:Opportunity|Project|Idea)\s*[1-3]:\s*/i, '').trim();

      // Extract Extension
      const extMatch = item.match(/(?:Exact\s*)?Extension:?\s*([\s\S]*?)(?=(?:Targeted\s*)?Performance\s*Metric:|Recommended\s*Tech\s*Stack:|$)/i);
      const extension = extMatch ? extMatch[1].trim() : item;

      // Extract Metric
      const metricMatch = item.match(/(?:Targeted\s*)?Performance\s*Metric:?\s*([\s\S]*?)(?=(?:Recommended\s*)?Tech\s*Stack:|$)/i);
      const metric = metricMatch ? metricMatch[1].trim() : 'Benchmark inference speed / accuracy tradeoff';

      // Extract Tech Stack
      const stackMatch = item.match(/(?:Recommended\s*)?Tech\s*Stack:?\s*([\s\S]*?)(?=(?:\n\s*[1-3]\.|\n\s*4\.|Metadata:|$))/i);
      const techStack = stackMatch ? stackMatch[1].trim() : 'PyTorch, Hugging Face, CUDA, Weights & Biases';

      opps.push({
        id: `opp-${opps.length + 1}`,
        title: firstLine.length < 90 ? firstLine : `Resume Project 0${opps.length + 1}`,
        extension: extension.replace(/^[-*•]\s*/, '').trim(),
        metric: metric.replace(/^[-*•]\s*/, '').trim(),
        techStack: techStack.replace(/^[-*•]\s*/, '').trim(),
      });
    }
  }

  // If structured parsing didn't find 3 items, fallback to splitting paragraphs
  if (opps.length === 0 && text.trim()) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
    paragraphs.slice(0, 3).forEach((p, idx) => {
      opps.push({
        id: `opp-${idx + 1}`,
        title: `Project Opportunity 0${idx + 1}`,
        extension: p.trim(),
        metric: 'Evaluation against paper baseline',
        techStack: 'Python, PyTorch, Ray, Wandb',
      });
    });
  }

  return opps;
}

function sanitizeMermaid(code: string): string {
  let cleaned = code.trim();

  // Strip code block wrappers if any
  cleaned = cleaned.replace(/^```mermaid\s*/i, '').replace(/```$/g, '').trim();

  // Ensure diagram starts with graph TD or flowchart TD
  if (!/^(graph|flowchart)\s+/i.test(cleaned)) {
    cleaned = `graph TD\n${cleaned}`;
  }

  return cleaned;
}
