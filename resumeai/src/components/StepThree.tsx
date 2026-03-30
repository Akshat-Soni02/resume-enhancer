import React from 'react';
import { Check, Copy, Download, ExternalLink, FileCode, FileDown, FileText, Loader2, RefreshCw, Trophy, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Confetti from 'react-confetti';
import type { JDSummary, OptimizationResult } from '../types';

interface StepThreeProps {
  optimizationResult: OptimizationResult | null;
  jdSummary: JDSummary | null;
  isCompiling: boolean;
  pdfUrl: string;
  downloadTex: () => void;
  copyToClipboard: () => void;
  onOptimizeAnother: () => void;
}

export default function StepThree(props: StepThreeProps) {
  const { optimizationResult, jdSummary, isCompiling, pdfUrl, downloadTex, copyToClipboard, onOptimizeAnother } = props;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block p-4 bg-emerald-500/20 rounded-full text-emerald-400 mb-4">
          <Trophy size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-white">Resume Optimized!</h2>
        <p className="text-slate-400 mt-2">Your resume is now ATS-ready and formatted in professional LaTeX.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Download size={20} className="text-indigo-400" />
            <span>Export Options</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <button onClick={downloadTex} className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all text-left flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <FileCode className="text-indigo-400" size={20} />
                  <span className="text-white font-bold">Download Source (.tex)</span>
                </div>
                <p className="text-slate-500 text-xs">Full LaTeX source code for Overleaf or local compilation.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center transition-all">
                <FileDown size={18} className="text-white" />
              </div>
            </button>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="text-emerald-400" size={20} />
                  <span className="text-white font-bold">PDF Preview</span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={copyToClipboard} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-all">
                    <Copy size={16} />
                  </button>
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
                {isCompiling ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Compiling LaTeX...</p>
                  </div>
                ) : (
                  <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Preview" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Zap size={20} className="text-amber-400" />
            <span>ATS Analysis</span>
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Final ATS Score</p>
                <p className="text-4xl font-black text-white">{optimizationResult?.ats_score_after}<span className="text-slate-600 text-xl">/100</span></p>
              </div>
              <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">EXCELLENT MATCH</div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase">Keyword Match Table</p>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">JD Keyword</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {jdSummary?.atsKeywords.map((kw) => (
                      <tr key={kw} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-slate-300">{kw}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center space-x-1 text-emerald-500 font-bold">
                            <Check size={12} />
                            <span>MATCHED</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <button onClick={onOptimizeAnother} className="w-full border border-slate-800 hover:bg-slate-900 text-slate-400 font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2">
            <RefreshCw size={18} />
            <span>Optimize Another Resume</span>
          </button>
        </div>
      </div>
      <Confetti recycle={false} numberOfPieces={200} />
    </div>
  );
}
