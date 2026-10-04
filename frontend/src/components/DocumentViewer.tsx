import React, { useState, useRef } from 'react';
import { FileText, Eye, CornerDownRight } from 'lucide-react';
import type { AnalysisResults, MatchInfo } from '../types';

interface DocumentViewerProps {
  results: AnalysisResults;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ results }) => {
  const { sentences_a, sentences_b, matches_a, document_a_name, document_b_name } = results;
  
  const [selectedSentA, setSelectedSentA] = useState<number | null>(null);

  const docBRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleSentenceAClick = (sentAIdx: number, targetIdx: number) => {
    setSelectedSentA(sentAIdx);
    // Scroll corresponding sentence B into view smooth
    const targetElement = docBRefs.current[targetIdx];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getMatchForSentA = (sentAIdx: number): MatchInfo | undefined => {
    return matches_a.find(m => m.source_index === sentAIdx);
  };

  const getHighlightClass = (classification?: string) => {
    switch (classification) {
      case 'EXACT MATCH':
        return 'hl-exact';
      case 'HIGH SIMILARITY':
        return 'hl-high';
      case 'POSSIBLE PARAPHRASE':
        return 'hl-paraphrase';
      case 'RELATED':
        return 'hl-related';
      default:
        return 'hl-original';
    }
  };

  const selectedMatch = selectedSentA !== null ? getMatchForSentA(selectedSentA) : null;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      
      {/* Header & Color Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Interactive Document Passage Inspector</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click any highlighted sentence in Document A to automatically focus and navigate to its corresponding sentence match in Document B.
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-500/40">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Exact
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-950/80 text-orange-300 border border-orange-500/40">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> High Sim
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Paraphrase
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Related
          </span>
        </div>
      </div>

      {/* Side-by-Side Synchronized Viewers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[460px]">
        
        {/* Document A Viewer */}
        <div className="flex flex-col h-full bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>{document_a_name}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{sentences_a.length} sentences</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-sm">
            {sentences_a.map((sentA) => {
              const match = getMatchForSentA(sentA.index);
              const isSelected = selectedSentA === sentA.index;
              const hlClass = getHighlightClass(match?.classification);

              return (
                <div
                  key={sentA.index}
                  onClick={() => match && handleSentenceAClick(sentA.index, match.target_index)}
                  className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${hlClass} ${
                    isSelected ? 'ring-2 ring-indigo-400 shadow-lg scale-[1.01]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 opacity-75 text-[10px] font-mono">
                    <span>#A{sentA.index + 1}</span>
                    {match && (
                      <span className="font-bold">
                        {match.classification} ({Math.round(match.semantic_similarity * 100)}%)
                      </span>
                    )}
                  </div>
                  <p>{sentA.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Document B Viewer */}
        <div className="flex flex-col h-full bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>{document_b_name}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{sentences_b.length} sentences</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-sm">
            {sentences_b.map((sentB) => {
              const isTargetOfSelected = selectedMatch?.target_index === sentB.index;

              return (
                <div
                  key={sentB.index}
                  ref={(el) => { docBRefs.current[sentB.index] = el; }}
                  className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${
                    isTargetOfSelected
                      ? 'bg-indigo-900/80 text-white border-indigo-400 ring-2 ring-indigo-400 shadow-xl animate-pulse'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 opacity-75 text-[10px] font-mono">
                    <span>#B{sentB.index + 1}</span>
                    {isTargetOfSelected && <span className="font-bold text-indigo-300">★ MATCH TARGET</span>}
                  </div>
                  <p>{sentB.text}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Selected Match Quick Inspector Banner */}
      {selectedMatch && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-4 text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Active Focus Pair: </span>
              <span>A#{selectedMatch.source_index + 1} matched with B#{selectedMatch.target_index + 1}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold">
            <span className="text-amber-400">{selectedMatch.classification}</span>
            <span>Semantic: {Math.round(selectedMatch.semantic_similarity * 100)}%</span>
          </div>
        </div>
      )}

    </div>
  );
};
