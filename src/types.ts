export interface PaperMetadata {
  citations: string | number;
  authors: string;
  publication: string;
  year: string | number;
}

export interface StudentProjectOpportunity {
  id: string;
  title: string;
  extension: string;
  metric: string;
  techStack: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ParsedAnalysis {
  id: string;
  url: string;
  title: string;
  rawText: string;
  coreConcept: string;
  flowchartCode: string;
  futureWorkText: string;
  opportunities: StudentProjectOpportunity[];
  metadata: PaperMetadata;
  sources: GroundingSource[];
  searchQueries: string[];
  timestamp: number;
}
