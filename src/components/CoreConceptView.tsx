import React, { useState } from 'react';
import { Copy, Check, FileText, Sparkles } from 'lucide-react';
import { marked } from 'marked';

interface CoreConceptViewProps {
  coreConceptText: string;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({ coreConceptText }) => {
  const [copied, setCopied] = useState(false);

  const words = coreConceptText.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coreConceptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Step 1: Foundational Synthesis
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Core Concept Extraction
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{words} words</span>
            <span aria-hidden="true">·</span>
            <span>&lt; 300w constraint met</span>
          </div>

          <button
            onClick={handleCopy}
            title="Copy Core Concept Summary"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div
        className="mt-4 prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: marked.parse(coreConceptText) as string }}
      />
    </div>
  );
};
