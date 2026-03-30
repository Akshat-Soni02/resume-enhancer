import React from 'react';
import { ArrowRight, Check, ChevronRight, FileCode, Layout, Loader2, X, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import ATSMeter from './ATSMeter';
import type { OptimizationResult, Suggestion } from '../types';

interface StepTwoProps {
  isOptimizing: boolean;
  optimizationResult: OptimizationResult | null;
  currentLatex: string;
  acceptedSuggestions: Set<string>;
  acceptAllHighImpact: () => void;
  applySuggestion: (suggestion: Suggestion) => void;
  rejectSuggestion: (id: string) => void;
  compilePdf: () => void;
}

export default function StepTwo(props: StepTwoProps) {
  const {
    isOptimizing,
    optimizationResult,
    currentLatex,
    acceptedSuggestions,
    acceptAllHighImpact,
    applySuggestion,
    rejectSuggestion,
    compilePdf,
  } = props;

  if (isOptimizing) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <Zap className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mt-8">Optimizing Your Resume</h2>
        <p className="text-slate-400 mt-2 text-center max-w-md">
          Gemini is analyzing the job description and tailoring your experience for maximum ATS impact...
        </p>
        <div className="mt-12 space-y-4 w-full max-w-sm">
          {['Parsing keywords...', 'Rewriting bullet points...', 'Formatting LaTeX...', 'Calculating ATS scores...'].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5 }}
              className="flex items-center space-x-3 text-slate-500"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-sm">{t}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (!optimizationResult) return null;

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-12">
          <ATSMeter score={optimizationResult.ats_score_before} label="Before" color="#ef4444" />
          <div className="flex flex-col items-center">
            <ArrowRight className="text-slate-700" size={24} />
            <span className="text-[10px] font-bold text-indigo-500 mt-2">IMPROVED</span>
          </div>
          <ATSMeter score={optimizationResult.ats_score_after} label="After" color="#10b981" />
        </div>

        <div className="flex-1 max-w-md">
          <h3 className="text-white font-bold mb-2">Optimization Summary</h3>
          <p className="text-slate-400 text-sm">
            We've identified <span className="text-indigo-400 font-bold">{optimizationResult.suggestions.length}</span> key improvements to make your resume stand out to recruiters and ATS systems.
          </p>
          <button onClick={acceptAllHighImpact} className="mt-4 flex items-center space-x-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            <Zap size={14} />
            <span>ACCEPT ALL HIGH IMPACT CHANGES</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-bottom border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode size={14} className="text-slate-500" />
                <span className="text-xs font-mono text-slate-400">resume_optimized.tex</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
            </div>
            <div className="p-6 h-[600px] overflow-y-auto font-mono text-sm leading-relaxed">
              {currentLatex.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre-wrap text-slate-300 hover:bg-slate-900/50 transition-colors">
                  <span className="inline-block w-8 text-slate-700 select-none">{i + 1}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold flex items-center space-x-2">
              <Layout size={18} className="text-indigo-400" />
              <span>Suggestions</span>
            </h3>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-full">
              {optimizationResult.suggestions.length - acceptedSuggestions.size} PENDING
            </span>
          </div>

          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {optimizationResult.suggestions.map((s) => {
              const isAccepted = acceptedSuggestions.has(s.id);
              const impactColor = s.ats_impact === 'high' ? 'text-rose-500' : s.ats_impact === 'medium' ? 'text-amber-500' : 'text-blue-500';
              return (
                <motion.div key={s.id} layout className={`p-4 rounded-xl border transition-all ${isAccepted ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${impactColor}`}>{s.ats_impact} IMPACT</span>
                    {isAccepted && <Check size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{s.section}</p>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{s.reason}</p>
                  {!isAccepted && (
                    <div className="space-y-2 mb-4">
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-mono text-rose-400 line-through">{s.original_text}</div>
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono text-emerald-400">{s.suggested_text}</div>
                    </div>
                  )}
                  {!isAccepted && (
                    <div className="flex space-x-2">
                      <button onClick={() => applySuggestion(s)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-1">
                        <Check size={12} />
                        <span>ACCEPT</span>
                      </button>
                      <button onClick={() => rejectSuggestion(s.id)} className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold py-2 rounded-lg transition-all">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={compilePdf} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-12 py-4 rounded-xl transition-all flex items-center space-x-3 shadow-xl shadow-indigo-500/20">
          <span>Finalize & Export</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
