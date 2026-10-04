import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Cpu, FileSearch, Layers, Sparkles, FileText } from 'lucide-react';

export const AnalysisProgress: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Extracting & Normalizing Text', icon: FileSearch, desc: 'Parsing PDF/DOCX structures and removing whitespace noise' },
    { label: 'Segmenting Sentence Boundaries', icon: FileText, desc: 'Indexing sentences and preserving paragraph metadata' },
    { label: 'Generating Sentence Embeddings', icon: Cpu, desc: 'Encoding text into 384-dimensional dense vectors via all-MiniLM-L6-v2' },
    { label: 'Computing Semantic & Lexical Similarity', icon: Layers, desc: 'Calculating N x M cosine matrix & TF-IDF n-gram matches' },
    { label: 'Finalizing Report & Metric Summaries', icon: Sparkles, desc: 'Classifying matches and building explainability details' },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 500);
    const timer2 = setTimeout(() => setCurrentStep(2), 1200);
    const timer3 = setTimeout(() => setCurrentStep(3), 2000);
    const timer4 = setTimeout(() => setCurrentStep(4), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl text-center">
        
        {/* Animated Model Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-6 relative">
          <Loader2 className="w-8 h-8 animate-spin" />
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30 animate-ping opacity-25" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Documents</h2>
        <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
          Running sentence transformer embedding calculations and cosine similarity matrix evaluation...
        </p>

        {/* Progress Pipeline Vertical Timeline */}
        <div className="space-y-4 text-left max-w-lg mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 p-3.5 rounded-xl transition-all border ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-900/20'
                    : isDone
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
                    : 'bg-slate-900/10 border-slate-900 opacity-40'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isCurrent ? 'text-indigo-200' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
