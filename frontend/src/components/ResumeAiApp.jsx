import React, { useMemo, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  Download,
  FileCode,
  FileDown,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  Zap,
  Trophy,
  Search,
  ExternalLink,
  Copy,
  Layout,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import Confetti from 'react-confetti';
import axios from 'axios';
import { clearApiKey } from './SettingsModal';
import { optimizeResumeAi, parseResumeAiJD } from '../utils/resumeAiApi';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const LATEX_TEMPLATE = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
    \\item\\small{
        {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
    {\\Huge \\scshape [FULL NAME]} \\\\  \\vspace{1pt}
    \\small \\raisebox{-0.1\\height}\\faPhone\\ [PHONE] ~ \\href{mailto:[EMAIL]}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{[EMAIL]}} ~
    \\href{https://[LINKEDIN]}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{[LINKEDIN]}}  ~
    \\href{https://[GITHUB]}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{[GITHUB]}}
    \\vspace{-8pt}
\\end{center}

\\section{Education}
\\resumeSubHeadingListStart
    \\resumeSubheading
      {[UNIVERSITY]}{[DATES]}
      {[DEGREE]}{[LOCATION]}
      \\resumeSubheading
      {Relevant Courses:}{}
      {[COURSES]}{}
\\resumeSubHeadingListEnd

\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {[COMPANY]}{[DATES]}
      {[TITLE]}{[LOCATION]}
      \\resumeItemListStart
        \\resumeItem{[BULLET_1]}
        \\resumeItem{[BULLET_2]}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

\\section{Projects}
    \\resumeSubHeadingListStart
    \\resumeProjectHeading
    {\\textbf{[PROJECT_NAME]} $|$ \\emph{[TECH_STACK]}}{[DATES]}
    \\resumeItemListStart
        \\resumeItem{[BULLET_1]}
        \\resumeItem{[BULLET_2]}
    \\resumeItemListEnd
    \\resumeSubHeadingListEnd

\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Programming Languages}{: [LANGUAGES]} \\\\
     \\textbf{Developer Tools/Frameworks}{: [TOOLS]} \\\\
    }}
 \\end{itemize}

\\section{Achievements}
\\resumeSubHeadingListStart
\\resumeItemListStart
    \\resumeItem{[ACHIEVEMENT_1]}
    \\resumeItem{[ACHIEVEMENT_2]}
\\resumeItemListEnd
\\resumeSubHeadingListEnd

\\end{document}`;

const StepIndicator = ({ currentStep }) => {
  const steps = ['Input', 'Optimize', 'Export'];
  return (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              currentStep > idx + 1 ? 'bg-green-500 text-white' :
              currentStep === idx + 1 ? 'bg-indigo-600 text-white' :
              'bg-slate-800 text-slate-500'
            }`}>
              {currentStep > idx + 1 ? <Check size={16} /> : idx + 1}
            </div>
            <span className={`text-sm font-medium ${currentStep === idx + 1 ? 'text-white' : 'text-slate-500'}`}>{step}</span>
          </div>
          {idx < steps.length - 1 && <div className="w-12 h-px bg-slate-800" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const ATSMeter = ({ score, label, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default function ResumeAiApp({ apiKey, selectedModel, onOpenSettings, onApiKeyCleared }) {
  const [step, setStep] = useState(1);
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [jdSummary, setJdSummary] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [currentLatex, setCurrentLatex] = useState('');
  const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const effectiveApiKey = useMemo(() => apiKey || null, [apiKey]);

  const withAxiosError = (err, fallback) => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = err.response?.data?.detail || fallback;
      if (status === 401) {
        clearApiKey();
        onApiKeyCleared?.();
        setError('Invalid API key. Please update it in settings.');
        onOpenSettings?.();
      } else {
        setError(message);
      }
      return;
    }
    setError(fallback);
  };

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `${pageText}\n`;
    }
    return fullText;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setResumeFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      setResumeText(text);
      setError(null);
    } catch (err) {
      setError('Failed to parse PDF. Please try another file.');
    }
  };

  const parseJD = async () => {
    if (!jdUrl && !jdText) return;
    if (!effectiveApiKey) {
      setError('Please set your API key in settings.');
      onOpenSettings?.();
      return;
    }
    setIsParsingJD(true);
    setError(null);
    try {
      const data = await parseResumeAiJD({
        jdUrl,
        jdText,
        apiKey: effectiveApiKey,
        modelId: selectedModel,
      });
      setJdSummary(data);
    } catch (err) {
      withAxiosError(err, 'Failed to parse Job Description. Please try pasting the text manually.');
    } finally {
      setIsParsingJD(false);
    }
  };

  const optimizeResume = async () => {
    if (!resumeText || !jdSummary) return;
    if (!effectiveApiKey) {
      setError('Please set your API key in settings.');
      onOpenSettings?.();
      return;
    }
    setIsOptimizing(true);
    setStep(2);
    setError(null);
    try {
      const data = await optimizeResumeAi({
        resumeText,
        jdSummary,
        latexTemplate: LATEX_TEMPLATE,
        apiKey: effectiveApiKey,
        modelId: selectedModel,
      });
      setOptimizationResult(data);
      setCurrentLatex(data.latex_original);
    } catch (err) {
      withAxiosError(err, 'Optimization failed. Please try again.');
      setStep(1);
    } finally {
      setIsOptimizing(false);
    }
  };

  const applySuggestion = (suggestion) => {
    if (acceptedSuggestions.has(suggestion.id)) return;
    let newLatex = currentLatex;
    if (suggestion.type === 'replace') newLatex = newLatex.replace(suggestion.original_text, suggestion.suggested_text);
    else if (suggestion.type === 'delete') newLatex = newLatex.replace(suggestion.original_text, '');
    else if (suggestion.type === 'insert') newLatex = newLatex.replace(suggestion.original_text, `${suggestion.original_text}\n${suggestion.suggested_text}`);
    setCurrentLatex(newLatex);
    setAcceptedSuggestions((prev) => new Set(prev).add(suggestion.id));
  };

  const rejectSuggestion = (id) => {
    setOptimizationResult((prev) => (prev ? { ...prev, suggestions: prev.suggestions.filter((s) => s.id !== id) } : null));
  };

  const acceptAllHighImpact = () => {
    if (!optimizationResult) return;
    optimizationResult.suggestions.filter((s) => s.ats_impact === 'high' && !acceptedSuggestions.has(s.id)).forEach(applySuggestion);
  };

  const compilePdf = async () => {
    setIsCompiling(true);
    setStep(3);
    const encodedTex = encodeURIComponent(currentLatex);
    setPdfUrl(`https://latexonline.cc/compile?text=${encodedTex}`);
    setIsCompiling(false);
  };

  const downloadTex = () => {
    const blob = new Blob([currentLatex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized_resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => navigator.clipboard.writeText(currentLatex);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Zap size={18} className="text-white" /></div>
            <h1 className="text-xl font-black tracking-tighter text-white">ResumeAI</h1>
          </div>
          <button onClick={() => { onOpenSettings?.(); }} className="p-2 rounded-lg text-slate-300 hover:bg-slate-800">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <StepIndicator currentStep={step} />
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6"><Search size={20} className="text-indigo-400" /><h2 className="text-xl font-bold text-white">Job Description</h2></div>
                  <div className="space-y-4">
                    <input type="text" placeholder="https://linkedin.com/jobs/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white" value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} />
                    <textarea placeholder="Paste the job description here..." className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white resize-none" value={jdText} onChange={(e) => setJdText(e.target.value)} />
                    <button onClick={parseJD} disabled={isParsingJD || (!jdUrl && !jdText)} className="w-full bg-indigo-600 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2">
                      {isParsingJD ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                      <span>{isParsingJD ? 'Parsing...' : 'Parse JD'}</span>
                    </button>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6"><Upload size={20} className="text-emerald-400" /><h2 className="text-xl font-bold text-white">Resume Upload</h2></div>
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-12 cursor-pointer ${resumeText ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    {resumeText ? <div className="text-center"><CheckCircle2 className="mx-auto text-emerald-400 mb-3" /><p className="text-white font-bold">{resumeFileName}</p></div> : <div className="text-center"><FileText className="mx-auto text-slate-500 mb-3" /><p className="text-white font-bold">Drop your resume here</p></div>}
                  </div>
                  <button onClick={optimizeResume} disabled={!resumeText || !jdSummary || isOptimizing} className="w-full mt-8 bg-white disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center space-x-2">
                    {isOptimizing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="text-indigo-600" />}
                    <span>{isOptimizing ? 'Optimizing...' : 'Optimize Resume →'}</span>
                  </button>
                </motion.div>
              </div>
            )}

            {step === 2 && (
              isOptimizing ? (
                <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center gap-10">
                    <ATSMeter score={optimizationResult?.ats_score_before || 0} label="Before" color="#ef4444" />
                    <ArrowRight className="text-slate-700" />
                    <ATSMeter score={optimizationResult?.ats_score_after || 0} label="After" color="#10b981" />
                    <button onClick={acceptAllHighImpact} className="ml-auto text-indigo-400 text-xs font-bold">ACCEPT ALL HIGH IMPACT</button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 h-[600px] overflow-y-auto font-mono text-sm">
                      {currentLatex.split('\n').map((line, i) => <div key={i} className="text-slate-300"><span className="inline-block w-8 text-slate-700">{i + 1}</span>{line}</div>)}
                    </div>
                    <div className="space-y-3 h-[600px] overflow-y-auto">
                      {optimizationResult?.suggestions?.map((s) => {
                        const isAccepted = acceptedSuggestions.has(s.id);
                        return (
                          <div key={s.id} className={`p-3 rounded-xl border ${isAccepted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800'}`}>
                            <p className="text-xs font-bold text-white mb-1">{s.section}</p>
                            {!isAccepted && (
                              <div className="space-y-2 mb-2">
                                <div className="text-[10px] text-rose-400 line-through">{s.original_text}</div>
                                <div className="text-[10px] text-emerald-400">{s.suggested_text}</div>
                              </div>
                            )}
                            {!isAccepted && (
                              <div className="flex gap-2">
                                <button onClick={() => applySuggestion(s)} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-2 rounded-lg"><Check size={12} className="inline mr-1" />ACCEPT</button>
                                <button onClick={() => rejectSuggestion(s.id)} className="px-3 bg-slate-800 text-slate-400 text-[10px] font-bold py-2 rounded-lg"><X size={12} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-center"><button onClick={compilePdf} className="bg-indigo-600 text-white font-bold px-12 py-4 rounded-xl flex items-center space-x-3"><span>Finalize & Export</span><ChevronRight size={20} /></button></div>
                </div>
              )
            )}

            {step === 3 && (
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center"><Trophy size={48} className="mx-auto text-emerald-400 mb-3" /><h2 className="text-3xl font-bold text-white">Resume Optimized!</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <button onClick={downloadTex} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-left text-white"><FileCode className="inline mr-2 text-indigo-400" />Download Source (.tex)</button>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-bold">PDF Preview</span>
                        <div className="flex gap-2">
                          <button onClick={copyToClipboard} className="p-2 bg-slate-800 rounded-lg text-slate-400"><Copy size={16} /></button>
                          <a href={pdfUrl} target="_blank" rel="noreferrer" className="p-2 bg-indigo-600 rounded-lg text-white"><ExternalLink size={16} /></a>
                        </div>
                      </div>
                      <div className="aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden">{isCompiling ? <Loader2 className="animate-spin text-indigo-500 m-6" /> : <iframe src={pdfUrl} className="w-full h-full border-none" title="PDF Preview" />}</div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Final ATS Score</p>
                    <p className="text-4xl font-black text-white">{optimizationResult?.ats_score_after}<span className="text-slate-600 text-xl">/100</span></p>
                    <button onClick={() => setStep(1)} className="w-full mt-8 border border-slate-800 text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center space-x-2"><RefreshCw size={18} /><span>Optimize Another Resume</span></button>
                  </div>
                </div>
                {step === 3 && <Confetti recycle={false} numberOfPieces={200} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-800 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-slate-500 text-sm">ResumeAI integrated with your existing backend.</div>
      </footer>
    </div>
  );
}
