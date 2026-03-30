import React from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Zap, Search } from 'lucide-react';
import { motion } from 'motion/react';
import type { JDSummary } from '../types';

interface StepOneProps {
  jdUrl: string;
  setJdUrl: (value: string) => void;
  jdText: string;
  setJdText: (value: string) => void;
  parseJD: () => void;
  isParsingJD: boolean;
  jdSummary: JDSummary | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resumeText: string;
  resumeFileName: string;
  optimizeResume: () => void;
  isOptimizing: boolean;
}

export default function StepOne(props: StepOneProps) {
  const {
    jdUrl,
    setJdUrl,
    jdText,
    setJdText,
    parseJD,
    isParsingJD,
    jdSummary,
    fileInputRef,
    handleFileUpload,
    resumeText,
    resumeFileName,
    optimizeResume,
    isOptimizing,
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Search size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Job Description</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Job Posting URL</label>
            <input
              type="text"
              placeholder="https://linkedin.com/jobs/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">Or paste text</span>
            </div>
          </div>

          <textarea
            placeholder="Paste the job description here..."
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />

          <button
            onClick={parseJD}
            disabled={isParsingJD || (!jdUrl && !jdText)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            {isParsingJD ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            <span>{isParsingJD ? 'Parsing...' : 'Parse JD'}</span>
          </button>
        </div>

        {jdSummary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <h3 className="text-indigo-400 font-bold mb-1">{jdSummary.jobTitle}</h3>
            <p className="text-slate-400 text-sm mb-3">{jdSummary.company}</p>
            <div className="flex flex-wrap gap-2">
              {jdSummary.atsKeywords.slice(0, 5).map((kw) => (
                <span key={kw} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold rounded">
                  {kw}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <Upload size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Resume Upload</h2>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
            resumeText ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5'
          }`}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
          {resumeText ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-white font-bold">{resumeFileName}</p>
              <p className="text-slate-500 text-sm mt-1">PDF Parsed Successfully</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <FileText size={32} />
              </div>
              <p className="text-white font-bold">Drop your resume here</p>
              <p className="text-slate-500 text-sm mt-1">Supports PDF format only</p>
            </div>
          )}
        </div>

        {resumeText && (
          <div className="mt-6">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Extracted Text Preview</p>
            <div className="h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-400 text-xs font-mono whitespace-pre-wrap">
              {resumeText}
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={optimizeResume}
            disabled={!resumeText || !jdSummary || isOptimizing}
            className="w-full bg-white hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
          >
            {isOptimizing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="text-indigo-600" />}
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize Resume →'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
