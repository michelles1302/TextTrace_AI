import React from 'react';
import { ShieldCheck, History, Sparkles, Server } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onNewAnalysis: () => void;
  isBackendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHistory, onNewAnalysis, isBackendHealthy }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Header */}
        <div 
          onClick={onNewAnalysis} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white font-mono">
                TEXTTRACE<span className="text-indigo-400">.AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                PRO NLP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Trace similarity. Detect paraphrasing. Protect originality.
            </p>
          </div>
        </div>

        {/* Action Buttons & Status */}
        <div className="flex items-center gap-4">
          
          {/* Server Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Server className="w-3.5 h-3.5" />
            <span>Backend:</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className={isBackendHealthy ? 'text-emerald-400' : 'text-rose-400'}>
                {isBackendHealthy ? 'Ready (CPU/PyTorch)' : 'Disconnected'}
              </span>
            </span>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all hover:border-slate-600 shadow-sm"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Analysis History</span>
          </button>

          {/* New Analysis Button */}
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-md shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>

      </div>
    </header>
  );
};
