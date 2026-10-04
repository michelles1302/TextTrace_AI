import React from 'react';
import { Download, Sparkles, Layers, RefreshCw } from 'lucide-react';
import type { AnalysisResults } from '../types';
import { getReportDownloadUrl } from '../api';

interface ResultsDashboardProps {
  results: AnalysisResults;
  onReset: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, onReset }) => {
  const { metrics, document_a_name, document_b_name, analysis_summary, id } = results;

  const handleDownloadPDF = () => {
    if (id) {
      window.open(getReportDownloadUrl(id), '_blank');
    }
  };

  // Helper SVG Circular Progress Gauge
  const renderCircularGauge = (value: number, colorClass: string, trackColor: string = 'stroke-slate-800') => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${trackColor} stroke-[8] fill-none`}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${colorClass} stroke-[8] fill-none transition-all duration-1000 ease-out`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-bold text-xl text-white font-mono">{Math.round(value)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Document Comparison Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" /> Document Similarity Analysis
          </div>
          <h2 className="text-xl font-bold text-white flex flex-wrap items-center gap-2">
            <span>{document_a_name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">VS</span>
            <span>{document_b_name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzed {metrics.total_sentences_a} sentences in Doc A against {metrics.total_sentences_b} sentences in Doc B.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onReset}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Overall Similarity */}
        <div className="col-span-2 md:col-span-1 glass-card rounded-2xl p-5 border border-indigo-500/30 flex flex-col items-center justify-center text-center shadow-lg bg-gradient-to-b from-indigo-950/30 to-slate-900/40">
          {renderCircularGauge(metrics.overall_similarity, 'stroke-indigo-500')}
          <span className="text-xs font-semibold text-slate-300 mt-2 uppercase tracking-wide">Overall Similarity</span>
          <span className="text-[10px] text-slate-400">Weighted sentence coverage</span>
        </div>

        {/* Exact Match % */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center shadow-md">
          {renderCircularGauge(metrics.exact_match_pct, 'stroke-red-500')}
          <span className="text-xs font-semibold text-red-400 mt-2 uppercase tracking-wide">Exact Match</span>
          <span className="text-[10px] text-slate-400">Verbatim overlap</span>
        </div>

        {/* Paraphrased % */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center shadow-md">
          {renderCircularGauge(metrics.paraphrase_pct, 'stroke-amber-500')}
          <span className="text-xs font-semibold text-amber-400 mt-2 uppercase tracking-wide">Paraphrased</span>
          <span className="text-[10px] text-slate-400">Same meaning, different words</span>
        </div>

        {/* High Similarity % */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center shadow-md">
          {renderCircularGauge(metrics.high_similarity_pct, 'stroke-orange-500')}
          <span className="text-xs font-semibold text-orange-400 mt-2 uppercase tracking-wide">High Similarity</span>
          <span className="text-[10px] text-slate-400">Strong conceptual alignment</span>
        </div>

        {/* Original Content % */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center shadow-md">
          {renderCircularGauge(metrics.original_pct, 'stroke-emerald-500')}
          <span className="text-xs font-semibold text-emerald-400 mt-2 uppercase tracking-wide">Original</span>
          <span className="text-[10px] text-slate-400">Unique content</span>
        </div>

      </div>

      {/* AI Analysis Summary Box */}
      {analysis_summary && (
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 bg-indigo-950/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4" /> AI Analysis Summary
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-sans whitespace-pre-line">
            {analysis_summary}
          </p>
        </div>
      )}

    </div>
  );
};
