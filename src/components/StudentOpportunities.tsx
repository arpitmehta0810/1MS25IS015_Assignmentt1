import React, { useState } from 'react';
import { StudentProjectOpportunity } from '../types';
import { Sparkles, Copy, Check, Terminal, Activity, Layers } from 'lucide-react';
import { marked } from 'marked';

interface StudentOpportunitiesProps {
  opportunities: StudentProjectOpportunity[];
  fallbackText?: string;
}

export const StudentOpportunities: React.FC<StudentOpportunitiesProps> = ({
  opportunities,
  fallbackText,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (opp: StudentProjectOpportunity) => {
    const textToCopy = `PROJECT EXTENSION: ${opp.title}\n\n• Extension: ${opp.extension}\n• Targeted Performance Metric: ${opp.metric}\n• Recommended Tech Stack: ${opp.techStack}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(opp.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy opportunity:', err);
    }
  };

  if (!opportunities || opportunities.length === 0) {
    if (!fallbackText) return null;
    return (
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Future Work & Student Development Opportunities
        </h3>
        <div
          className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: marked.parse(fallbackText) as string }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Student Research & Resume Extensions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Targeted for 3rd-year CS students: concrete optimizations, metrics, and modern engineering stacks.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {opportunities.length} Projects Identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunities.map((opp, idx) => (
          <div
            key={opp.id || idx}
            className="flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {opp.title || `Extension Plan ${idx + 1}`}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(opp)}
                  title="Copy Resume Project Proposal"
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                >
                  {copiedId === opp.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Exact Extension */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Exact Extension
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {opp.extension}
                </p>
              </div>

              {/* Targeted Performance Metric */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-3 h-3" />
                  <span>Targeted Metric</span>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {opp.metric}
                </p>
              </div>
            </div>

            {/* Recommended Tech Stack */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Terminal className="w-3 h-3" />
                <span>Tech Stack</span>
              </div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-md">
                {opp.techStack}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
