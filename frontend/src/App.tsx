import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DocumentUploader } from './components/DocumentUploader';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SimilarityHeatmap } from './components/SimilarityHeatmap';
import { SuspiciousMatchExplorer } from './components/SuspiciousMatchExplorer';
import { DocumentViewer } from './components/DocumentViewer';
import { VisualSummary } from './components/VisualSummary';
import { HistoryModal } from './components/HistoryModal';
import { SentenceDetailModal } from './components/SentenceDetailModal';

import type { AnalysisResults, SentenceMeta, MatchInfo } from './types';
import { analyzeDocuments, checkHealth } from './api';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [viewState, setViewState] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [cellModalData, setCellModalData] = useState<{
    sourceSentence: SentenceMeta;
    targetSentence: SentenceMeta;
    semanticScore: number;
    lexicalScore: number;
    match?: MatchInfo;
  } | null>(null);

  // Poll backend health status on mount
  useEffect(() => {
    const verifyHealth = async () => {
      const healthy = await checkHealth();
      setIsBackendHealthy(healthy);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartAnalysis = async (
    fileA: File | null,
    textA: string,
    nameA: string,
    fileB: File | null,
    textB: string,
    nameB: string
  ) => {
    setErrorMessage(null);
    setViewState('analyzing');

    try {
      const res = await analyzeDocuments(fileA, textA, nameA, fileB, textB, nameB);
      setResults(res);
      setViewState('results');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during analysis.');
      setViewState('upload');
    }
  };

  const handleSelectHistoryAnalysis = (selectedResults: AnalysisResults) => {
    setResults(selectedResults);
    setViewState('results');
    setErrorMessage(null);
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setViewState('upload');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewAnalysis={handleNewAnalysis}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Content Body */}
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm max-w-4xl mx-auto shadow-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Analysis Failed: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* View State Router */}
        {viewState === 'upload' && (
          <DocumentUploader onStartAnalysis={handleStartAnalysis} />
        )}

        {viewState === 'analyzing' && (
          <AnalysisProgress />
        )}

        {viewState === 'results' && results && (
          <div className="space-y-8 animate-fadeIn">
            {/* Executive Metric Cards & AI Summary */}
            <ResultsDashboard results={results} onReset={handleNewAnalysis} />

            {/* Visual Chart Summaries */}
            <VisualSummary results={results} />

            {/* Sentence Similarity Heatmap */}
            <SimilarityHeatmap
              results={results}
              onSelectCell={(data) => setCellModalData(data)}
            />

            {/* Flagged Suspicious Match Explorer */}
            <SuspiciousMatchExplorer
              matches={results.suspicious_matches}
              docAName={results.document_a_name}
              docBName={results.document_b_name}
            />

            {/* Interactive Document Passage Inspector */}
            <DocumentViewer results={results} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <p>
          TEXTTRACE AI © 2026 • Powered by SentenceTransformers (<code className="text-indigo-400">all-MiniLM-L6-v2</code>) & PyTorch
        </p>
      </footer>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectAnalysis={handleSelectHistoryAnalysis}
      />

      {/* Heatmap Cell Detail Modal */}
      <SentenceDetailModal
        data={cellModalData}
        onClose={() => setCellModalData(null)}
      />

    </div>
  );
}
export default App;
