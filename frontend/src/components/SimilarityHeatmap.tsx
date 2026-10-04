import React, { useState } from 'react';
import { Grid, Info } from 'lucide-react';
import type { AnalysisResults, SentenceMeta, MatchInfo } from '../types';

interface SimilarityHeatmapProps {
  results: AnalysisResults;
  onSelectCell: (info: {
    sourceSentence: SentenceMeta;
    targetSentence: SentenceMeta;
    semanticScore: number;
    lexicalScore: number;
    match?: MatchInfo;
  }) => void;
}

export const SimilarityHeatmap: React.FC<SimilarityHeatmapProps> = ({ results, onSelectCell }) => {
  const { sentences_a, sentences_b, similarity_matrix, matches_a } = results;
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; score: number } | null>(null);

  if (!similarity_matrix || similarity_matrix.length === 0 || sentences_a.length === 0 || sentences_b.length === 0) {
    return null;
  }

  // Get color intensity based on similarity score
  const getCellColor = (score: number) => {
    if (score >= 0.95) return 'bg-red-500 text-white shadow-sm shadow-red-500/50';
    if (score >= 0.82) return 'bg-orange-500 text-white';
    if (score >= 0.65) return 'bg-amber-500 text-slate-950 font-bold';
    if (score >= 0.48) return 'bg-blue-600/80 text-white';
    if (score >= 0.30) return 'bg-slate-800 text-slate-400';
    return 'bg-slate-900/60 text-slate-600';
  };

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    const semScore = similarity_matrix[rowIdx][colIdx];
    const match = matches_a.find(m => m.source_index === rowIdx && m.target_index === colIdx);
    
    onSelectCell({
      sourceSentence: sentences_a[rowIdx],
      targetSentence: sentences_b[colIdx],
      semanticScore: semScore,
      lexicalScore: match ? match.lexical_similarity : 0.0,
      match: match
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Sentence Similarity Heatmap Matrix</h3>
        </div>
        
        {/* Heatmap Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Similarity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700" /> <span className="text-slate-400">&lt;30%</span>
            <span className="w-3 h-3 rounded bg-blue-600" /> <span className="text-slate-400">48%+</span>
            <span className="w-3 h-3 rounded bg-amber-500" /> <span className="text-slate-400">65%+</span>
            <span className="w-3 h-3 rounded bg-orange-500" /> <span className="text-slate-400">82%+</span>
            <span className="w-3 h-3 rounded bg-red-500" /> <span className="text-slate-400">95%+</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Rows represent Document A sentences; Columns represent Document B sentences. Click any matrix cell to inspect exact sentence comparisons.
      </p>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 border border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[10px]">A \ B</th>
                {sentences_b.map((_, colIdx) => (
                  <th key={colIdx} className="p-2 border border-slate-800 bg-slate-900/90 text-slate-300 font-mono font-semibold text-center min-w-[40px]">
                    B{colIdx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sentences_a.map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="p-2 border border-slate-800 bg-slate-900/90 text-slate-300 font-mono font-semibold text-center">
                    A{rowIdx + 1}
                  </td>
                  {sentences_b.map((_, colIdx) => {
                    const score = similarity_matrix[rowIdx][colIdx];
                    const pct = Math.round(score * 100);
                    return (
                      <td key={colIdx} className="p-0 border border-slate-800/80">
                        <button
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                          onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx, score })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-full h-10 px-2 flex items-center justify-center font-mono text-[11px] font-medium transition-all hover:scale-105 hover:z-10 relative ${getCellColor(score)}`}
                          title={`Doc A [Sent ${rowIdx+1}] vs Doc B [Sent ${colIdx+1}]: ${pct}% similarity`}
                        >
                          {pct}%
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hover Information Footer Bar */}
      {hoveredCell && (
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex-1 truncate text-slate-300">
            <span className="font-bold text-white">A{hoveredCell.row + 1}:</span> "{sentences_a[hoveredCell.row].text.substring(0, 60)}..." vs{' '}
            <span className="font-bold text-white">B{hoveredCell.col + 1}:</span> "{sentences_b[hoveredCell.col].text.substring(0, 60)}..."
          </div>
          <span className="font-mono font-bold text-indigo-400">{Math.round(hoveredCell.score * 100)}%</span>
        </div>
      )}

    </div>
  );
};
