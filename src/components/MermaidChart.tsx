import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Code, Eye, Maximize2, Minimize2 } from 'lucide-react';

interface MermaidChartProps {
  chartCode: string;
}

export const MermaidChart: React.FC<MermaidChartProps> = ({ chartCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'JetBrains Mono, monospace',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: false,
      },
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!chartCode) {
        setSvgContent('');
        return;
      }

      setError(null);
      const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      try {
        // Test parsing before rendering
        await mermaid.parse(chartCode);
        const { svg } = await mermaid.render(uniqueId, chartCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.warn('Mermaid rendering error:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to render Mermaid diagram.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chartCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chartCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy chart code:', err);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-flowchart-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.4), 2.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div
      className={`relative flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl p-6 bg-white dark:bg-slate-900' : 'p-5'
      }`}
    >
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            System Architecture Flowchart
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-xs font-mono text-slate-400">Mermaid.js graph TD</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Visual / Code Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'code'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Syntax</span>
            </button>
          </div>

          {/* Zoom controls for visual mode */}
          {viewMode === 'visual' && !error && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-1">
              <button
                onClick={() => handleZoom(-0.15)}
                title="Zoom Out"
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="px-1.5 py-0.5 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={() => handleZoom(0.15)}
                title="Zoom In"
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset View"
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            title="Copy Mermaid Code"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download SVG */}
          {svgContent && viewMode === 'visual' && (
            <button
              onClick={handleDownloadSvg}
              title="Download SVG"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div
        ref={containerRef}
        className={`w-full overflow-auto rounded-lg transition-colors min-h-[300px] flex items-center justify-center ${
          isFullscreen ? 'flex-1 max-h-[calc(100vh-140px)]' : 'max-h-[560px]'
        } ${viewMode === 'visual' ? 'bg-slate-50/60 dark:bg-slate-950/60 p-6' : 'bg-slate-900 p-4'}`}
      >
        {viewMode === 'code' ? (
          <pre className="w-full text-xs font-mono text-emerald-400 whitespace-pre overflow-x-auto leading-relaxed">
            {chartCode}
          </pre>
        ) : error ? (
          <div className="max-w-md text-center py-8 px-4">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
              Diagram preview unavailable due to dynamic syntax variability
            </p>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => setViewMode('code')}
              className="px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 rounded-md hover:bg-slate-300 transition-colors"
            >
              Inspect Raw Mermaid Code
            </button>
          </div>
        ) : svgContent ? (
          <div
            className="transition-transform duration-150 ease-out origin-center flex justify-center items-center select-none"
            style={{ transform: `scale(${zoomLevel})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-xs text-slate-400 font-mono animate-pulse">Rendering architectural flowchart...</div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Use zoom controls or scroll to inspect inputs, layers & outputs</span>
        <span className="font-mono">{viewMode === 'visual' ? 'SVG Vector Graph' : 'Source Syntax'}</span>
      </div>
    </div>
  );
};
