import React, { useState } from 'react';
import { AlertTriangle, HelpCircle, FileText } from 'lucide-react';
import type { MatchInfo } from '../types';

interface SuspiciousMatchExplorerProps {
  matches: MatchInfo[];
  docAName: string;
  docBName: string;
}

export const SuspiciousMatchExplorer: React.FC<SuspiciousMatchExplorerProps> = ({
  matches,
  docAName,
  docBName
}) => {
  const [filter, setFilter] = useState<'ALL' | 'EXACT' | 'PARAPHRASE' | 'HIGH'>('ALL');

  const filteredMatches = matches.filter(m => {
    if (filter === 'EXACT') return m.classification === 'EXACT MATCH';
    if (filter === 'PARAPHRASE') return m.classification === 'POSSIBLE PARAPHRASE';
    if (filter === 'HIGH') return m.classification === 'HIGH SIMILARITY';
    return true;
  });

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'EXACT MATCH':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'POSSIBLE PARAPHRASE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'HIGH SIMILARITY':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Suspicious Match Explorer</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
              {filteredMatches.length} flagged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Passages exhibiting high semantic overlap or potential paraphrasing indicators.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({matches.length})
          </button>
          <button
            onClick={() => setFilter('EXACT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'EXACT' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Exact ({matches.filter(m => m.classification === 'EXACT MATCH').length})
          </button>
          <button
            onClick={() => setFilter('PARAPHRASE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'PARAPHRASE' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paraphrase ({matches.filter(m => m.classification === 'POSSIBLE PARAPHRASE').length})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'HIGH' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            High Similarity ({matches.filter(m => m.classification === 'HIGH SIMILARITY').length})
          </button>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800 text-slate-400 text-sm">
          No matches found for the selected filter category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match, idx) => {
            const semPct = Math.round(match.semantic_similarity * 100);
            const lexPct = Math.round(match.lexical_similarity * 100);

            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-md space-y-4"
              >
                {/* Card Top Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${getBadgeStyle(match.classification)}`}>
                      {match.classification}
                    </span>
                    <span className="text-xs text-slate-400">
                      Sent A#{match.source_index + 1} ↔ Sent B#{match.target_index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Semantic:</span>
                      <span className="font-bold text-indigo-400 text-sm">{semPct}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Lexical:</span>
                      <span className="font-bold text-slate-300 text-sm">{lexPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Sentence Comparison Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Doc A */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{docAName} (Sentence #{match.source_index + 1}):</span>
                    </div>
                    <p className="text-slate-100 font-sans leading-relaxed">"{match.source_text}"</p>
                  </div>

                  {/* Doc B */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      <span>{docBName} (Sentence #{match.target_index + 1}):</span>
                    </div>
                    <p className="text-slate-100 font-sans leading-relaxed">"{match.target_text}"</p>
                  </div>
                </div>

                {/* Explanation Banner */}
                <div className="flex items-start gap-2.5 px-4 py-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs text-indigo-200">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-300">Why flagged? </span>
                    <span>{match.explanation}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
