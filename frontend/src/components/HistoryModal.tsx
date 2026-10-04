import React, { useEffect, useState } from 'react';
import { X, History, Clock, FileText, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type { HistoryItem, AnalysisResults } from '../types';
import { fetchHistory, fetchAnalysisById } from '../api';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAnalysis: (results: AnalysisResults) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSelectAnalysis }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadHistoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchHistory();
      setHistoryItems(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistoryData();
    }
  }, [isOpen]);

  const handleItemClick = async (item: HistoryItem) => {
    setLoadingId(item.id);
    try {
      const fullResults = await fetchAnalysisById(item.id);
      onSelectAnalysis(fullResults);
      onClose();
    } catch (err: any) {
      alert(`Error loading analysis: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-3xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Local Analysis History</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-semibold border border-indigo-500/20">
              SQLite Storage
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadHistoryData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh History"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading saved analyses...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm text-center">
              {error}
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-sm">
              No previous analysis history found in local database. Run your first document analysis!
            </div>
          ) : (
            historyItems.map((item) => {
              const formattedDate = new Date(item.created_at).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isItemLoading = loadingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{item.doc_a_name}</span>
                      <span className="text-xs text-slate-500 font-mono">vs</span>
                      <span>{item.doc_b_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    {/* Metrics Badges */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/30">
                        {Math.round(item.overall_similarity)}% Overall
                      </span>
                      {item.exact_match_pct > 0 && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                          {Math.round(item.exact_match_pct)}% Exact
                        </span>
                      )}
                      {item.paraphrase_pct > 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                          {Math.round(item.paraphrase_pct)}% Paraphrase
                        </span>
                      )}
                    </div>

                    {/* Action Arrow / Loading */}
                    <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                      {isItemLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
