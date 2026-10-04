import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface DocumentInputState {
  file: File | null;
  text: string;
  name: string;
  mode: 'file' | 'text';
}

interface DocumentUploaderProps {
  onStartAnalysis: (
    fileA: File | null,
    textA: string,
    nameA: string,
    fileB: File | null,
    textB: string,
    nameB: string
  ) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onStartAnalysis }) => {
  const [docA, setDocA] = useState<DocumentInputState>({ file: null, text: '', name: '', mode: 'file' });
  const [docB, setDocB] = useState<DocumentInputState>({ file: null, text: '', name: '', mode: 'file' });
  const [dragOverA, setDragOverA] = useState(false);
  const [dragOverB, setDragOverB] = useState(false);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  // Helper formatting for file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileDrop = (e: React.DragEvent, target: 'A' | 'B') => {
    e.preventDefault();
    if (target === 'A') setDragOverA(false);
    else setDragOverB(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (target === 'A') {
        setDocA({ ...docA, file: droppedFile, name: droppedFile.name });
      } else {
        setDocB({ ...docB, file: droppedFile, name: droppedFile.name });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (target === 'A') {
        setDocA({ ...docA, file: selectedFile, name: selectedFile.name });
      } else {
        setDocB({ ...docB, file: selectedFile, name: selectedFile.name });
      }
    }
  };

  // Demo Data Presets
  const loadDemoData = (preset: 'exact' | 'paraphrase' | 'original') => {
    if (preset === 'exact') {
      setDocA({
        file: null,
        mode: 'text',
        name: 'exact_match_a.txt',
        text: `Artificial intelligence has transformed modern education across universities globally.\nMachine learning algorithms provide customized learning pathways for students of all abilities.\nAutomated grading tools allow instructors to allocate more time to direct student mentorship.\nHowever, academic integrity must be carefully preserved when implementing AI technologies.\nInstitutional guidelines should establish transparent protocols for generative AI usage.`
      });
      setDocB({
        file: null,
        mode: 'text',
        name: 'exact_match_b.txt',
        text: `Artificial intelligence has transformed modern education across universities globally.\nMachine learning algorithms provide customized learning pathways for students of all abilities.\nAutomated grading tools allow instructors to allocate more time to direct student mentorship.\nFurthermore, student engagement improves when adaptive platforms deliver real-time feedback.\nInstitutional guidelines should establish transparent protocols for generative AI usage.`
      });
    } else if (preset === 'paraphrase') {
      setDocA({
        file: null,
        mode: 'text',
        name: 'paraphrase_a.txt',
        text: `The rapid expansion of renewable energy infrastructure is vital to mitigating global climate change.\nSolar panels and wind turbines have experienced drastic cost reductions over the past decade.\nBattery storage technologies are essential for managing intermittent power generation from solar farms.\nGovernments must incentivize private investment through strategic subsidies and tax credits.\nTransitioning away from fossil fuels will ultimately foster long-term economic stability and energy security.`
      });
      setDocB({
        file: null,
        mode: 'text',
        name: 'paraphrase_b.txt',
        text: `Accelerating the deployment of green energy systems is crucial for slowing environmental warming worldwide.\nOver the last ten years, the financial expense of wind turbines and photovoltaic panels has fallen sharply.\nGrid-scale battery solutions play a key role in balancing fluctuating electricity output from solar installations.\nPublic policymakers should encourage private sector capital through targeted financial incentives.\nPhasing out coal and petroleum will eventually strengthen national security and economic resilience.`
      });
    } else {
      setDocA({
        file: null,
        mode: 'text',
        name: 'research_paper.txt',
        text: `Artificial intelligence has transformed modern education across universities globally.\nMachine learning algorithms provide customized learning pathways for students of all abilities.`
      });
      setDocB({
        file: null,
        mode: 'text',
        name: 'marine_biology.txt',
        text: `Marine biology research highlights the incredible diversity of deep-sea hydrothermal vent ecosystems.\nChemosynthetic bacteria form the foundational tier of the food web in lightless abyssal depths.\nGiant tube worms and blind shrimp thrive near superheated mineral-rich fluid vents.`
      });
    }
  };

  const isDocAReady = docA.mode === 'file' ? docA.file !== null : docA.text.trim().length > 0;
  const isDocBReady = docB.mode === 'file' ? docB.file !== null : docB.text.trim().length > 0;
  const isReady = isDocAReady && isDocBReady;

  const handleSubmit = () => {
    if (!isReady) return;
    onStartAnalysis(
      docA.mode === 'file' ? docA.file : null,
      docA.mode === 'text' ? docA.text : '',
      docA.name || 'Document A',
      docB.mode === 'file' ? docB.file : null,
      docB.mode === 'text' ? docB.text : '',
      docB.name || 'Document B'
    );
  };

  const renderDocPanel = (
    title: string,
    state: DocumentInputState,
    setState: React.Dispatch<React.SetStateAction<DocumentInputState>>,
    target: 'A' | 'B',
    dragOver: boolean,
    setDragOver: (val: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col h-full border border-slate-800/80 shadow-xl relative overflow-hidden">
        {/* Panel Header & Mode Switcher */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold font-mono text-sm">
              {target}
            </div>
            <h3 className="font-semibold text-slate-100 text-lg">{title}</h3>
          </div>

          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setState({ ...state, mode: 'file' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                state.mode === 'file'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setState({ ...state, mode: 'text' })}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                state.mode === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* Panel Content Body */}
        {state.mode === 'file' ? (
          state.file ? (
            /* Selected File View */
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-900/60 rounded-xl border border-indigo-500/30">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="font-semibold text-slate-100 text-center text-sm mb-1 line-clamp-1">{state.file.name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                <span>{state.file.name.split('.').pop()?.toUpperCase()}</span>
                <span>•</span>
                <span>{formatFileSize(state.file.size)}</span>
              </div>
              <button
                onClick={() => setState({ ...state, file: null, name: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Remove File
              </button>
            </div>
          ) : (
            /* Drag and Drop Dropzone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => handleFileDrop(e, target)}
              onClick={() => inputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                  : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFileSelect(e, target)}
              />
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-indigo-400 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-200 mb-1">
                Drag & drop document here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-500">Supports PDF, DOCX, or TXT (Max 25MB)</p>
            </div>
          )
        ) : (
          /* Direct Text Input View */
          <div className="flex-1 flex flex-col">
            <div className="mb-2 flex justify-between items-center text-xs text-slate-400">
              <label>Document Name (Optional):</label>
              <input
                type="text"
                placeholder={`${title}.txt`}
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <textarea
              placeholder="Paste or type text to analyze..."
              value={state.text}
              onChange={(e) => setState({ ...state, text: e.target.value })}
              className="flex-1 w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
              rows={8}
            />
            <div className="mt-2 text-right text-xs text-slate-500">
              {state.text.length} characters • {state.text.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Title & Tagline Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          AI-Powered Plagiarism & <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Paraphrase Analysis</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Understand similarity beyond matching words. Powered by sentence transformers & deep semantic embeddings.
        </p>

        {/* Quick Demo Data Presets */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Test Samples:
          </span>
          <button
            onClick={() => loadDemoData('paraphrase')}
            className="px-3 py-1 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors"
          >
            Load Paraphrase Sample
          </button>
          <button
            onClick={() => loadDemoData('exact')}
            className="px-3 py-1 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg transition-colors"
          >
            Load Exact Match Sample
          </button>
          <button
            onClick={() => loadDemoData('original')}
            className="px-3 py-1 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
          >
            Load Original Sample
          </button>
        </div>
      </div>

      {/* Two Document Input Panels Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[380px]">
        {renderDocPanel('Document A', docA, setDocA, 'A', dragOverA, setDragOverA, fileInputRefA)}
        {renderDocPanel('Document B', docB, setDocB, 'B', dragOverB, setDragOverB, fileInputRefB)}
      </div>

      {/* Submit Action Area */}
      <div className="mt-8 flex flex-col items-center">
        <button
          onClick={handleSubmit}
          disabled={!isReady}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-xl ${
            isReady
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <span>ANALYZE DOCUMENTS</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {!isReady && (
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            Please provide both Document A and Document B to enable analysis.
          </p>
        )}
      </div>
    </div>
  );
};
