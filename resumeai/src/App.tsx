/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  X, 
  AlertCircle, 
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import StepIndicator from './components/StepIndicator';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import type { JDSummary, OptimizationResult, Suggestion } from './types';

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// --- CONSTANTS ---
const API_KEY = process.env.GEMINI_API_KEY || "";
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
\\setlength{\multicolsep}{-3.0pt}
\\setlength{\columnsep}{-1pt}
\\input{glyphtounicode}


%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}


\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
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

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------
\\begin{center}
    {\\Huge \\scshape [FULL NAME]} \\\\  \\vspace{1pt}
    \\small \\raisebox{-0.1\\height}\\faPhone\\ [PHONE] ~ \\href{mailto:[EMAIL]}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{[EMAIL]}} ~ 
    \\href{https://[LINKEDIN]}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{[LINKEDIN]}}  ~
    \\href{https://[GITHUB]}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{[GITHUB]}}
    \\vspace{-8pt}
\\end{center}


%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
    \\resumeSubheading
      {[UNIVERSITY]}{[DATES]}
      {[DEGREE]}{[LOCATION]}
      \\resumeSubheading
      {Relevant Courses:}{}
      {[COURSES]}{}
\\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
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

%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
    \\resumeProjectHeading
    {\\textbf{[PROJECT_NAME]} $|$ \\emph{[TECH_STACK]}}{[DATES]}
    \\resumeItemListStart
        \\resumeItem{[BULLET_1]}
        \\resumeItem{[BULLET_2]}
    \\resumeItemListEnd
    \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Programming Languages}{: [LANGUAGES]} \\\\
     \\textbf{Developer Tools/Frameworks}{: [TOOLS]} \\\\
    }}
 \\end{itemize}

%-----------ACHIEVEMENTS---------------
\\section{Achievements}
\\resumeSubHeadingListStart
\\resumeItemListStart
    \\resumeItem{[ACHIEVEMENT_1]}
    \\resumeItem{[ACHIEVEMENT_2]}
\\resumeItemListEnd
\\resumeSubHeadingListEnd

\\end{document}`;

export default function App() {
  const [step, setStep] = useState(1);
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdSummary, setJdSummary] = useState<JDSummary | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [currentLatex, setCurrentLatex] = useState("");
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPERS ---

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError("Please upload a PDF file.");
      return;
    }
    setResumeFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      setResumeText(text);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to parse PDF. Please try another file.");
    }
  };

  const parseJD = async () => {
    if (!jdUrl && !jdText) return;
    setIsParsingJD(true);
    setError(null);
    try {
      const prompt = `Extract the following information from this job description:
      ${jdUrl ? `URL: ${jdUrl}` : `Text: ${jdText}`}
      
      Return a JSON object with these keys:
      jobTitle, company, requiredSkills (array), preferredSkills (array), responsibilities (array), atsKeywords (array).
      Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text);
      setJdSummary(data);
    } catch (err) {
      console.error(err);
      setError("Failed to parse Job Description. Please try pasting the text manually.");
    } finally {
      setIsParsingJD(false);
    }
  };

  const optimizeResume = async () => {
    if (!resumeText || !jdSummary) return;
    setIsOptimizing(true);
    setStep(2);
    setError(null);
    try {
      const prompt = `You are an expert ATS resume optimizer and technical recruiter. 

      Given:
      1. RESUME (raw text): ${resumeText}
      2. JOB DESCRIPTION (parsed): ${JSON.stringify(jdSummary)}
      3. TARGET LATEX TEMPLATE: ${LATEX_TEMPLATE}

      Do the following:
      A. Reformat the entire resume into the provided LaTeX template exactly.
      B. Simultaneously optimize EVERY bullet point and section for:
         - ATS keyword matching with the JD
         - Strong action verbs (Led, Engineered, Architected, Delivered, Optimized)
         - Quantified impact (add realistic metrics if missing — do NOT fabricate, but suggest placeholders like "[X]% improvement")
         - Removing filler words and weak language
         - Reordering skills to front-load JD-relevant ones
      C. Return a JSON object with this exact structure:
      {
        "ats_score_before": <integer 0-100>,
        "ats_score_after": <integer 0-100>,
        "latex_original": "<full latex string of reformatted resume, no changes yet>",
        "suggestions": [
          {
            "id": "s1",
            "section": "Experience | Projects | Skills | ...",
            "type": "replace | insert | delete",
            "original_text": "<exact text to find in latex>",
            "suggested_text": "<replacement text>",
            "reason": "<one-line professional reason>",
            "ats_impact": "high | medium | low"
          }
        ]
      }
      Return ONLY valid JSON. No markdown, no explanation outside JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data: OptimizationResult = JSON.parse(response.text);
      setOptimizationResult(data);
      setCurrentLatex(data.latex_original);
    } catch (err) {
      console.error(err);
      setError("Optimization failed. Please try again.");
      setStep(1);
    } finally {
      setIsOptimizing(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    if (acceptedSuggestions.has(suggestion.id)) return;
    
    let newLatex = currentLatex;
    if (suggestion.type === 'replace') {
      newLatex = newLatex.replace(suggestion.original_text, suggestion.suggested_text);
    } else if (suggestion.type === 'delete') {
      newLatex = newLatex.replace(suggestion.original_text, "");
    } else if (suggestion.type === 'insert') {
      // Simple insertion logic: find original and append
      newLatex = newLatex.replace(suggestion.original_text, suggestion.original_text + "\n" + suggestion.suggested_text);
    }
    
    setCurrentLatex(newLatex);
    setAcceptedSuggestions(prev => new Set(prev).add(suggestion.id));
  };

  const rejectSuggestion = (id: string) => {
    // Just remove from pending UI if we had a list of pending
    // For this simple implementation, we'll just filter it out from the display
    setOptimizationResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        suggestions: prev.suggestions.filter(s => s.id !== id)
      };
    });
  };

  const acceptAllHighImpact = () => {
    if (!optimizationResult) return;
    optimizationResult.suggestions
      .filter(s => s.ats_impact === 'high' && !acceptedSuggestions.has(s.id))
      .forEach(applySuggestion);
  };

  const compilePdf = async () => {
    setIsCompiling(true);
    setStep(3);
    try {
      // Using latexonline.cc API
      const encodedTex = encodeURIComponent(currentLatex);
      const url = `https://latexonline.cc/compile?text=${encodedTex}`;
      setPdfUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to compile PDF. You can still download the .tex file.");
    } finally {
      setIsCompiling(false);
    }
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentLatex);
    // Show toast or something
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-['Inter'] selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white">ResumeAI</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Templates</a>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">ATS Guide</a>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <StepIndicator currentStep={step} />

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-400"
          >
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={16} />
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <StepOne
                jdUrl={jdUrl}
                setJdUrl={setJdUrl}
                jdText={jdText}
                setJdText={setJdText}
                parseJD={parseJD}
                isParsingJD={isParsingJD}
                jdSummary={jdSummary}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
                resumeText={resumeText}
                resumeFileName={resumeFileName}
                optimizeResume={optimizeResume}
                isOptimizing={isOptimizing}
              />
            )}
            {step === 2 && (
              <StepTwo
                isOptimizing={isOptimizing}
                optimizationResult={optimizationResult}
                currentLatex={currentLatex}
                acceptedSuggestions={acceptedSuggestions}
                acceptAllHighImpact={acceptAllHighImpact}
                applySuggestion={applySuggestion}
                rejectSuggestion={rejectSuggestion}
                compilePdf={compilePdf}
              />
            )}
            {step === 3 && (
              <StepThree
                optimizationResult={optimizationResult}
                jdSummary={jdSummary}
                isCompiling={isCompiling}
                pdfUrl={pdfUrl}
                downloadTex={downloadTex}
                copyToClipboard={copyToClipboard}
                onOptimizeAnother={() => setStep(1)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tighter text-white">ResumeAI</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              The ultimate AI-powered resume optimizer. Tailor your resume to any job description in seconds and get past the ATS filters.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Templates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">ATS Guide</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2026 ResumeAI. Built with Gemini 1.5 Pro.</p>
          <div className="flex space-x-6 text-slate-600 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
