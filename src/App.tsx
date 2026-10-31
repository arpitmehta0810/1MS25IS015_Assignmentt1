import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ArrowRight,
  GitBranch,
  Layers,
  GraduationCap,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  FileCode,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Bookmark,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { ParsedAnalysis, GroundingSource } from './types';
import { parseAnalysisOutput } from './utils/parser';
import { SAMPLE_PAPERS } from './utils/samplePapers';
import { MermaidChart } from './components/MermaidChart';
import { StudentOpportunities } from './components/StudentOpportunities';
import { CoreConceptView } from './components/CoreConceptView';
import { PaperMetadataCard } from './components/PaperMetadataCard';

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ParsedAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'concept' | 'flowchart' | 'projects' | 'metadata' | 'raw'>('all');
  const [history, setHistory] = useState<ParsedAnalysis[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rpa_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setAnalysis(parsed[0]);
          setUrlInput(parsed[0].url);
        }
      }
    } catch (e) {
      console.warn('Could not read history:', e);
    }
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Loading step simulation ticker for user feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < 3 ? prev + 1 : prev));
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = async (targetUrl?: string) => {
    const urlToAnalyze = (targetUrl || urlInput).trim();
    if (!urlToAnalyze) {
      setError('Please provide a research paper URL or select a sample paper below.');
      return;
    }

    try {
      // Validate URL pattern
      new URL(urlToAnalyze);
    } catch {
      setError('Please enter a valid URL including http:// or https://');
      return;
    }

    setError(null);
    setIsLoading(true);
    setUrlInput(urlToAnalyze);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToAnalyze }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server error while analyzing research paper.');
      }

      const parsed = parseAnalysisOutput(
        data.rawText,
        data.url,
        data.sources || [],
        data.searchQueries || []
      );

      setAnalysis(parsed);
      setActiveTab('all');

      // Update history in state and storage
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.url !== parsed.url);
        const updated = [parsed, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('rpa_history', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed saving to localStorage', e);
        }
        return updated;
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'An unexpected error occurred while analyzing the paper.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyFullMarkdown = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis.rawText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!analysis) return;
    const blob = new Blob([analysis.rawText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-analysis-${analysis.metadata.year || 'paper'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadingSteps = [
    'Connecting to Google Search Grounding for academic papers...',
    'Step 1: Extracting problem statement & mathematical breakthroughs...',
    'Step 2: Synthesizing architectural components into Mermaid.js graph TD...',
    'Step 3: Brainstorming 3 resume-worthy student extensions & metrics...',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. TOP BAR CONTRACT: Brand title - 4-5 Nav links - 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Brand title wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <a href="/" className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Research Paper Agent
            </a>
          </div>

          {/* Zone 2: Nav links, 1-2 word labels, single-line */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setActiveTab('concept')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Core Concepts
            </button>
            <button
              onClick={() => setActiveTab('flowchart')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Architectures
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Student Projects
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Academic Metadata
            </button>
          </nav>

          {/* Zone 3: 1 primary action & theme switch */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleAnalyze(SAMPLE_PAPERS[0].url)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Sample: Transformers
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero & URL Input Box */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              <span>Google Search Grounded Agent</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash</span>
              <span aria-hidden="true">·</span>
              <span>&lt; 25,000 Token Optimization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
              Computer Science Research Paper Agent
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Paste any academic paper URL (arXiv, ACM, IEEE, OpenReview) to synthesize core methodology, generate syntactically verified Mermaid.js architecture diagrams, and uncover high-impact resume project extensions for CS students.
            </p>
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="mt-6"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Paste research paper URL, e.g. https://arxiv.org/abs/1706.03762"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-700 dark:text-rose-300">
                <span className="font-semibold">Analysis Failed: </span>
                {error}
              </div>
            </div>
          )}

          {/* Preset Sample Papers */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">
              <span>Curated Landmark Papers (Click to Test):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_PAPERS.map((paper, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnalyze(paper.url)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors whitespace-nowrap"
                  title={`${paper.description} (${paper.url})`}
                >
                  {paper.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Research Agent In Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                {loadingSteps[currentStepIndex]}
              </p>
            </div>
            <div className="max-w-md mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 dark:bg-white h-full transition-all duration-700 ease-out"
                style={{ width: `${((currentStepIndex + 1) / 4) * 100}%` }}
              />
            </div>
          </section>
        )}

        {/* Active Analysis View */}
        {!isLoading && analysis && (
          <div className="space-y-6">
            {/* Header & Sub-Bar for Current Paper */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Target Paper</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{analysis.metadata.year || '2026'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{analysis.metadata.publication || 'Academic Source'}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {analysis.title || 'Research Paper Analysis'}
                </h2>
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 mt-1 font-mono truncate max-w-xl"
                >
                  <span className="truncate">{analysis.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleCopyFullMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Analysis Copied' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .md</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs / Segmented Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Comprehensive View
              </button>
              <button
                onClick={() => setActiveTab('concept')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'concept'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                01. Core Concept
              </button>
              <button
                onClick={() => setActiveTab('flowchart')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'flowchart'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                02. Architecture Flowchart
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'projects'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                03. Student Projects
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'metadata'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                04. Metadata & Sources
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'raw'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Raw Output
              </button>
            </div>

            {/* TAB CONTENTS */}
            {(activeTab === 'all' || activeTab === 'concept') && (
              <section id="core-concept">
                <CoreConceptView coreConceptText={analysis.coreConcept} />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'flowchart') && (
              <section id="architecture-flowchart" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Step 2: Structural Pipeline
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Architectural Flowchart
                    </h3>
                  </div>
                </div>
                {analysis.flowchartCode ? (
                  <MermaidChart chartCode={analysis.flowchartCode} />
                ) : (
                  <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-center text-xs text-slate-500">
                    No explicit flowchart segment identified in model output.
                  </div>
                )}
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'projects') && (
              <section id="student-opportunities">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Step 3: Engineering Extensions
                </div>
                <StudentOpportunities
                  opportunities={analysis.opportunities}
                  fallbackText={analysis.futureWorkText}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'metadata') && (
              <section id="paper-metadata">
                <PaperMetadataCard
                  metadata={analysis.metadata}
                  sources={analysis.sources}
                  searchQueries={analysis.searchQueries}
                  paperUrl={analysis.url}
                />
              </section>
            )}

            {activeTab === 'raw' && (
              <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    Raw LLM Response Stream
                  </h3>
                  <button
                    onClick={handleCopyFullMarkdown}
                    className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-lg">
                  {analysis.rawText}
                </pre>
              </section>
            )}
          </div>
        )}

        {/* History drawer if any */}
        {history.length > 1 && (
          <section className="border-t border-slate-200 dark:border-slate-800 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recently Analyzed Papers
                </h3>
              </div>
              <span className="text-xs text-slate-400">{history.length} in session memory</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAnalysis(item);
                    setUrlInput(item.url);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    analysis?.id === item.id
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-100/50 dark:bg-slate-800/50'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{item.metadata.year || 'Paper'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.metadata.citations} Citations</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-1 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                    {item.url}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Research Paper Agent</span>
            <span aria-hidden="true">·</span>
            <span>Google Search Grounding Active</span>
          </div>
          <div>
            <span>Token Budget &lt; 25,000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
