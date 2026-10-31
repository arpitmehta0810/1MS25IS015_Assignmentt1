import React, { useState } from 'react';
import { PaperMetadata, GroundingSource } from '../types';
import { ExternalLink, BookOpen, Calendar, Users, Award, Search, Copy, Check } from 'lucide-react';

interface PaperMetadataCardProps {
  metadata: PaperMetadata;
  sources: GroundingSource[];
  searchQueries?: string[];
  paperUrl: string;
}

export const PaperMetadataCard: React.FC<PaperMetadataCardProps> = ({
  metadata,
  sources,
  searchQueries = [],
  paperUrl,
}) => {
  const [copiedCitation, setCopiedCitation] = useState(false);

  const formattedBibtex = `@article{research_paper_${metadata.year || '2026'},
  author = {${metadata.authors || 'Unknown'}},
  title = {Extracted via Research Paper Agent},
  journal = {${metadata.publication || 'Academic Source'}},
  year = {${metadata.year || '2026'}},
  url = {${paperUrl}}
}`;

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(formattedBibtex);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* 4. METADATA OF PAPER - exact layout as mandated */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step 4: Academic Verification
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Metadata of Paper
            </h4>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCitation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCitation ? 'Citation Copied' : 'Copy BibTeX'}</span>
            </button>
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Original Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Mandatory exact format display */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800">
          <span className="font-semibold text-slate-900 dark:text-white">Metadata: </span>
          <span>Citations: </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{metadata.citations || 'N/A'}</span>
          <span>, Authors: </span>
          <span className="text-sky-700 dark:text-sky-400">{metadata.authors || 'Unknown'}</span>
          <span>, Publication: </span>
          <span className="text-violet-700 dark:text-violet-400">{metadata.publication || 'Academic Source'}</span>
          <span>, Year: </span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">{metadata.year || 'N/A'}</span>
        </div>

        {/* Structured 4-column breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Award className="w-3.5 h-3.5" />
              <span>Citations</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
              {metadata.citations}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span>Authors</span>
            </div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-2" title={metadata.authors}>
              {metadata.authors}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Publication</span>
            </div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-2" title={metadata.publication}>
              {metadata.publication}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Year</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1">
              {metadata.year}
            </p>
          </div>
        </div>
      </div>

      {/* Google Search Grounding Verification & Sources */}
      {(sources.length > 0 || searchQueries.length > 0) && (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Google Search Grounding Context
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {sources.length} sources linked
            </span>
          </div>

          {searchQueries.length > 0 && (
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Grounding Queries
              </span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {searchQueries.map((q, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Referenced Academic Repositories & Sites
              </span>
              <ul className="mt-2 space-y-1.5">
                {sources.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <a
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 truncate max-w-xl"
                    >
                      <span className="truncate">{s.title || s.uri}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
