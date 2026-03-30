import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
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
  Layout,
  RefreshCw,
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

const SummaryPill = ({ label }) => (
  <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium">
    {label}
  </span>
);

const SummaryList = ({ title, items, max = 4 }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.slice(0, max).map((item) => (
          <li key={`${title}-${item}`} className="text-sm text-slate-300 leading-relaxed">
            - {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const AIStatusLines = ({ lines, isLoading, compact = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isLoading || !Array.isArray(lines) || lines.length === 0) return undefined;
    setActiveIndex(0);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % lines.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading, lines]);

  if (!isLoading || !Array.isArray(lines) || lines.length === 0) return null;

  return (
    <div className={compact ? 'mt-3 space-y-1.5' : 'mt-6 space-y-2.5'}>
      {lines.map((line, idx) => {
        const isActive = idx === activeIndex;
        return (
          <motion.div
            key={`${line}-${idx}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isActive ? 1 : 0.45, x: isActive ? 2 : 0 }}
            className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}
          >
            <span className={`${compact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full ${isActive ? 'bg-indigo-400' : 'bg-slate-600'}`} />
            <span className={`${compact ? 'text-xs' : 'text-sm'} ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{line}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

const ImpactBadge = ({ impact }) => {
  const normalized = (impact || '').toLowerCase();
  const styles =
    normalized === 'high'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : normalized === 'medium'
      ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
      : 'text-sky-300 bg-sky-500/10 border-sky-500/20';
  const label = normalized ? `${normalized} impact` : 'impact';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles}`}>
      {label}
    </span>
  );
};

const LatexConsole = ({ filename = 'resume_optimized.tex', content }) => (
  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <FileCode size={14} className="text-slate-500" />
        <span className="text-xs font-mono text-slate-400">{filename}</span>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-slate-800" />
        <div className="w-2 h-2 rounded-full bg-slate-800" />
        <div className="w-2 h-2 rounded-full bg-slate-800" />
      </div>
    </div>
    <div className="p-6 h-[600px] overflow-y-auto font-mono text-sm leading-relaxed">
      {(content || '').split('\n').map((line, i) => (
        <div key={i} className="whitespace-pre-wrap text-slate-300 hover:bg-slate-900/50 transition-colors">
          <span className="inline-block w-8 text-slate-700 select-none">{i + 1}</span>
          {line}
        </div>
      ))}
    </div>
  </div>
);

export default function ResumeAiApp({ apiKey, selectedModel, onOpenSettings, onApiKeyCleared }) {
  const [step, setStep] = useState(1);
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [isJdTextEnabled, setIsJdTextEnabled] = useState(false);
  const [showFullJdSummary, setShowFullJdSummary] = useState(false);
  const [jdSummary, setJdSummary] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [currentLatex, setCurrentLatex] = useState('');
  const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());
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

  const clearUploadedResume = () => {
    setResumeText('');
    setResumeFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        jdText: isJdTextEnabled ? jdText : '',
        apiKey: effectiveApiKey,
        modelId: selectedModel,
      });
      setJdSummary(data);
      setShowFullJdSummary(false);
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

  const acceptAllMediumImpact = () => {
    if (!optimizationResult) return;
    optimizationResult.suggestions.filter((s) => s.ats_impact === 'medium' && !acceptedSuggestions.has(s.id)).forEach(applySuggestion);
  };

  const acceptAllChanges = () => {
    if (!optimizationResult) return;
    optimizationResult.suggestions.filter((s) => !acceptedSuggestions.has(s.id)).forEach(applySuggestion);
  };

  const goToExport = () => {
    setStep(3);
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

  return (
    <div>
      <main>
        <StepIndicator currentStep={step} />
        {step > 1 && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to previous step</span>
            </button>
          </div>
        )}
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
                    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <span className="text-sm text-slate-300">Enable manual JD paste</span>
                      <button
                        type="button"
                        onClick={() => setIsJdTextEnabled((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isJdTextEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                        aria-pressed={isJdTextEnabled}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isJdTextEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                    {isJdTextEnabled && (
                      <textarea
                        placeholder="Paste the job description here..."
                        className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white resize-none"
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                      />
                    )}
                    <button onClick={parseJD} disabled={isParsingJD || (!jdUrl && !(isJdTextEnabled && jdText))} className="w-full bg-indigo-600 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2">
                      {isParsingJD ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                      <span>{isParsingJD ? 'Parsing...' : 'Parse JD'}</span>
                    </button>
                    <AIStatusLines
                      isLoading={isParsingJD}
                      lines={[
                        'Reading the job post and extracting role context...',
                        'Identifying must-have keywords and domain terms...',
                        'Separating required and preferred skills...',
                        'Structuring insights for ATS-focused optimization...',
                      ]}
                    />
                  </div>

                  {jdSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-900/70"
                    >
                      <div className="mb-4">
                        <p className="text-lg font-semibold text-slate-100">{jdSummary.jobTitle || 'Role'}</p>
                        <p className="text-sm text-slate-400">{jdSummary.company || 'Company not detected'}</p>
                      </div>

                      <div className="space-y-4">
                        {Array.isArray(jdSummary.atsKeywords) && jdSummary.atsKeywords.length > 0 && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">ATS Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {jdSummary.atsKeywords.slice(0, showFullJdSummary ? 12 : 5).map((kw) => (
                                <SummaryPill key={`kw-${kw}`} label={kw} />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.isArray(jdSummary.requiredSkills) && jdSummary.requiredSkills.length > 0 && (
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Required Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {jdSummary.requiredSkills.slice(0, showFullJdSummary ? 10 : 3).map((skill) => (
                                  <SummaryPill key={`req-${skill}`} label={skill} />
                                ))}
                              </div>
                            </div>
                          )}
                          {Array.isArray(jdSummary.preferredSkills) && jdSummary.preferredSkills.length > 0 && (
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Preferred Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {jdSummary.preferredSkills.slice(0, showFullJdSummary ? 10 : 2).map((skill) => (
                                  <SummaryPill key={`pref-${skill}`} label={skill} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {showFullJdSummary && <SummaryList title="Top Responsibilities" items={jdSummary.responsibilities} max={5} />}

                        <button
                          type="button"
                          onClick={() => setShowFullJdSummary((prev) => !prev)}
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          {showFullJdSummary ? 'Show less' : 'Show more details'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6"><Upload size={20} className="text-emerald-400" /><h2 className="text-xl font-bold text-white">Resume Upload</h2></div>
                  <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-12 cursor-pointer ${resumeText ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    {resumeText ? (
                      <div className="text-center">
                        <CheckCircle2 className="mx-auto text-emerald-400 mb-3" />
                        <p className="text-white font-bold">{resumeFileName}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearUploadedResume();
                          }}
                          className="mt-3 text-xs text-rose-400 hover:text-rose-300 font-medium"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="text-center"><FileText className="mx-auto text-slate-500 mb-3" /><p className="text-white font-bold">Drop your resume here</p></div>
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
                  <button onClick={optimizeResume} disabled={!resumeText || !jdSummary || isOptimizing} className="w-full mt-8 bg-white disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center space-x-2">
                    {isOptimizing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="text-indigo-600" />}
                    <span>{isOptimizing ? 'Optimizing...' : 'Optimize Resume →'}</span>
                  </button>
                </motion.div>
              </div>
            )}

            {step === 2 && (
              isOptimizing ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                  <p className="mt-4 text-lg font-semibold text-slate-200">Optimizing your resume with AI</p>
                  <AIStatusLines
                    isLoading={isOptimizing}
                    lines={[
                      'Matching your resume against parsed JD signals...',
                      'Rewriting bullets for impact and keyword alignment...',
                      'Preparing LaTeX output and suggestion candidates...',
                      'Calculating before/after ATS score estimates...',
                    ]}
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Top Bar - Scores + Summary */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center space-x-12">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 flex flex-col items-center">
                          <div className="px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10">
                            <span className="text-xs font-black text-indigo-200 uppercase tracking-[0.3em]">Match Score</span>
                          </div>
                          <div className="mt-3 h-px w-20 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                        </div>
                        <div className="flex items-center space-x-12">
                          <ATSMeter score={optimizationResult?.ats_score_before || 0} label="Before" color="#ef4444" />
                          <div className="flex flex-col items-center">
                            <ArrowRight className="text-slate-700" size={24} />
                            <span className="text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-widest">IMPROVED</span>
                          </div>
                          <ATSMeter score={optimizationResult?.ats_score_after || 0} label="After" color="#10b981" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 max-w-md">
                      <h3 className="text-white font-bold mb-2">Optimization Summary</h3>
                      <p className="text-slate-400 text-sm">
                        We found <span className="text-indigo-300 font-bold">{optimizationResult?.suggestions?.length || 0}</span> improvements to increase relevance and ATS keyword alignment.
                      </p>
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={acceptAllHighImpact}
                          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Zap size={14} />
                          <span>ACCEPT ALL HIGH IMPACT CHANGES</span>
                        </button>
                        <button
                          onClick={acceptAllMediumImpact}
                          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Zap size={14} />
                          <span>ACCEPT ALL MEDIUM IMPACT CHANGES</span>
                        </button>
                        <button
                          onClick={acceptAllChanges}
                          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Zap size={14} />
                          <span>ACCEPT ALL CHANGES</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LaTeX Console */}
                    <div className="lg:col-span-2 space-y-4">
                      <LatexConsole content={currentLatex} />
                    </div>
                    <div className="space-y-3 h-[600px] overflow-y-auto">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <Layout size={18} className="text-indigo-400" />
                          <span>Suggestions</span>
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-full">
                          {Math.max(0, (optimizationResult?.suggestions?.length || 0) - acceptedSuggestions.size)} PENDING
                        </span>
                      </div>

                      {optimizationResult?.suggestions?.map((s) => {
                        const isAccepted = acceptedSuggestions.has(s.id);
                        return (
                          <div
                            key={s.id}
                            className={`relative p-4 rounded-xl border transition-all ${
                              isAccepted
                                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                              <ImpactBadge impact={s.ats_impact} />
                              {isAccepted && <Check size={16} className="text-emerald-500" />}
                            </div>
                            <p className="text-xs font-bold text-white mb-1">{s.section}</p>
                            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">{s.reason}</p>

                            {!isAccepted && (
                              <div className="space-y-2 mb-4">
                                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-mono text-rose-300 line-through">
                                  {s.original_text}
                                </div>
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono text-emerald-200">
                                  {s.suggested_text}
                                </div>
                              </div>
                            )}

                            {!isAccepted && (
                              <div className="flex gap-2">
                                <button onClick={() => applySuggestion(s)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1">
                                  <Check size={12} />
                                  <span>ACCEPT</span>
                                </button>
                                <button onClick={() => rejectSuggestion(s.id)} className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold py-2 rounded-lg transition-all">
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button onClick={goToExport} className="bg-indigo-600 text-white font-bold px-12 py-4 rounded-xl flex items-center space-x-3">
                      <span>Finalize & Export</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )
            )}

            {step === 3 && (
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center">
                  <Trophy size={48} className="mx-auto text-emerald-400 mb-3" />
                  <h2 className="text-3xl font-bold text-white">Resume Optimized!</h2>
                  <p className="text-slate-400 mt-2">Your resume is now ATS-ready and formatted in professional LaTeX.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <Download size={20} className="text-indigo-400" />
                      <span>Export Options</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={downloadTex}
                        className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all text-left flex items-center justify-between"
                      >
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

                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <Zap size={20} className="text-amber-400" />
                      <span>ATS Analysis</span>
                    </h3>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Final ATS Score</p>
                          <p className="text-4xl font-black text-white">
                            {optimizationResult?.ats_score_after}
                            <span className="text-slate-600 text-xl">/100</span>
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                          EXCELLENT MATCH
                        </div>
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
                              {(jdSummary?.atsKeywords || []).slice(0, 12).map((kw) => (
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

                    <button onClick={() => setStep(1)} className="w-full mt-8 border border-slate-800 hover:bg-slate-900 text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center space-x-2">
                      <RefreshCw size={18} />
                      <span>Optimize Another Resume</span>
                    </button>
                  </div>
                </div>
                {step === 3 && <Confetti recycle={false} numberOfPieces={200} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
