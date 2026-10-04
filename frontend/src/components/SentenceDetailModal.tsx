import React from 'react';
import { X, Layers, FileText, HelpCircle } from 'lucide-react';
import type { SentenceMeta, MatchInfo } from '../types';

interface SentenceDetailModalProps {
  data: {
    sourceSentence: SentenceMeta;
    targetSentence: SentenceMeta;
    semanticScore: number;
    lexicalScore: number;
    match?: MatchInfo;
  } | null;
  onClose: () => void;
}

export const SentenceDetailModal: React.FC<SentenceDetailModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const { sourceSentence, targetSentence, semanticScore, lexicalScore, match } = data;
  const semPct = Math.round(semanticScore * 100);
  const lexPct = Math.round(lexicalScore * 100);
  const classification = match?.classification || (semPct >= 82 ? 'HIGH SIMILARITY' : semPct >= 65 ? 'POSSIBLE PARAPHRASE' : semPct >= 48 ? 'RELATED' : 'ORIGINAL');
  const explanation = match?.explanation || `Semantic similarity: ${semPct}%, Lexical similarity: ${lexPct}%.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Heatmap Sentence Cell Detail</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores & Classification Banner */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800 gap-4">
          <div>
            <span className="text-xs text-slate-400">Classification:</span>
            <div className="text-base font-extrabold text-indigo-300 font-mono">{classification}</div>
          </div>

          <div className="flex items-center gap-6 text-sm font-mono">
            <div>
              <span className="text-xs text-slate-400 block">Semantic Sim:</span>
              <span className="text-lg font-bold text-indigo-400">{semPct}%</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Lexical Sim:</span>
              <span className="text-lg font-bold text-slate-300">{lexPct}%</span>
            </div>
          </div>
        </div>

        {/* Side by side sentence comparison */}
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <FileText className="w-3.5 h-3.5" /> Document A (Sentence #{sourceSentence.index + 1}):
            </div>
            <p className="text-slate-100 font-sans leading-relaxed">"{sourceSentence.text}"</p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold mb-1">
              <FileText className="w-3.5 h-3.5" /> Document B (Sentence #{targetSentence.index + 1}):
            </div>
            <p className="text-slate-100 font-sans leading-relaxed">"{targetSentence.text}"</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-300">Explanation: </span>
            <span>{explanation}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
