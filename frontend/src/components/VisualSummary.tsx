import React from 'react';
import { PieChart, BarChart2 } from 'lucide-react';
import type { AnalysisResults } from '../types';

interface VisualSummaryProps {
  results: AnalysisResults;
}

export const VisualSummary: React.FC<VisualSummaryProps> = ({ results }) => {
  const { metrics, matches_a } = results;

  // Compute sentence score distribution histogram bins
  const bins = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
  matches_a.forEach(m => {
    const score = m.semantic_similarity;
    if (score < 0.2) bins[0]++;
    else if (score < 0.4) bins[1]++;
    else if (score < 0.6) bins[2]++;
    else if (score < 0.8) bins[3]++;
    else bins[4]++;
  });

  const maxBinCount = Math.max(...bins, 1);

  const categories = [
    { label: 'Exact Match', pct: metrics.exact_match_pct, color: 'bg-red-500', text: 'text-red-400' },
    { label: 'Paraphrased', pct: metrics.paraphrase_pct, color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'High Similarity', pct: metrics.high_similarity_pct, color: 'bg-orange-500', text: 'text-orange-400' },
    { label: 'Related', pct: metrics.related_pct, color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Original', pct: metrics.original_pct, color: 'bg-emerald-500', text: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Category Breakdown Bar Chart */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Similarity Classification Breakdown</h3>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden flex shadow-inner">
          <div style={{ width: `${metrics.exact_match_pct}%` }} className="bg-red-500 h-full transition-all" title={`Exact Match: ${metrics.exact_match_pct}%`} />
          <div style={{ width: `${metrics.paraphrase_pct}%` }} className="bg-amber-500 h-full transition-all" title={`Paraphrased: ${metrics.paraphrase_pct}%`} />
          <div style={{ width: `${metrics.high_similarity_pct}%` }} className="bg-orange-500 h-full transition-all" title={`High Similarity: ${metrics.high_similarity_pct}%`} />
          <div style={{ width: `${metrics.related_pct}%` }} className="bg-blue-500 h-full transition-all" title={`Related: ${metrics.related_pct}%`} />
          <div style={{ width: `${metrics.original_pct}%` }} className="bg-emerald-500 h-full transition-all" title={`Original: ${metrics.original_pct}%`} />
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-slate-300 font-medium">{cat.label}</span>
              </div>
              <span className={`font-mono font-bold ${cat.text}`}>{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Distribution Histogram */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Sentence Similarity Score Bins</h3>
        </div>

        {/* Histogram Columns */}
        <div className="h-40 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-800">
          {['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'].map((range, idx) => {
            const count = bins[idx];
            const heightPct = Math.max((count / maxBinCount) * 100, 8);
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {count} sents
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-purple-400 transition-all shadow-md"
                />
                <span className="text-[10px] font-mono text-slate-400 mt-1">{range}</span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 text-center">
          Distribution of individual sentence similarity scores across Document A.
        </p>
      </div>

    </div>
  );
};
