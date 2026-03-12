import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import SettingsModal, { getApiKey, getModel, clearApiKey } from './components/SettingsModal';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResumeUpload from './components/ResumeUpload';
import LoadingState from './components/LoadingState';
import ResultsDisplay from './components/ResultsDisplay';
import { processResume } from './utils/api';
import axios from 'axios';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [selectedModel, setSelectedModel] = useState(() => getModel());
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastProcessedRef = useRef({ jd: '', file: null });

  // Load API key and model from LocalStorage on mount
  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsSettingsOpen(true);
    }
    setSelectedModel(getModel());
  }, []);

  const handleProcess = useCallback(async () => {
    if (!apiKey) {
      setError('Please set your API key in settings');
      setIsSettingsOpen(true);
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!resumeFile) {
      setError('Please upload a resume');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    lastProcessedRef.current = { jd: jobDescription.trim(), file: resumeFile };

    try {
      const result = await processResume(jobDescription, resumeFile, apiKey, selectedModel);
      setResults(result);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.detail || err.message;

        if (status === 401) {
          // Invalid API key - clear it and prompt user
          clearApiKey();
          setApiKey(null);
          setError('Invalid API key. Please update it in settings.');
          setIsSettingsOpen(true);
        } else if (status === 429) {
          setError('Rate limit exceeded. Please try again later.');
        } else if (status === 413) {
          setError('File size exceeds the 10MB limit.');
        } else if (status === 400) {
          setError(message || 'Invalid request. Please check your inputs.');
        } else {
          setError(message || 'An error occurred while processing your resume.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [jobDescription, resumeFile, apiKey, selectedModel]);

  // Auto-trigger processing when both JD and resume are present
  useEffect(() => {
    const hasBoth = jobDescription.trim().length > 0 && resumeFile && apiKey;
    const alreadyProcessed = 
      lastProcessedRef.current.jd === jobDescription.trim() &&
      lastProcessedRef.current.file === resumeFile;
    
    if (hasBoth && !isProcessing && !alreadyProcessed) {
      handleProcess();
    }
  }, [jobDescription, resumeFile, apiKey, selectedModel, isProcessing, handleProcess]);


  const handleApiKeySet = (key) => {
    setApiKey(key);
  };

  const handleModelSet = (modelId) => {
    setSelectedModel(modelId);
  };

  const handleReset = () => {
    setJobDescription('');
    setResumeFile(null);
    setResults(null);
    setError(null);
    lastProcessedRef.current = { jd: '', file: null };
  };

  // Keep current JD, clear resume and results so user can upload a different resume
  const handleSameJdNewResume = () => {
    setResumeFile(null);
    setResults(null);
    setError(null);
    lastProcessedRef.current = { jd: jobDescription.trim(), file: null };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Resume Optimizer</h1>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-800">{error}</p>
          </motion.div>
        )}

        {!results && !isProcessing && (
          <div className="space-y-6">
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />
            <ResumeUpload
              onFileSelect={setResumeFile}
              selectedFile={resumeFile}
            />
            {(jobDescription || resumeFile) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {isProcessing && <LoadingState />}

        {results && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSameJdNewResume}
                  title="Re-evaluate with different resume"
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Analyze Another Resume
                </button>
              </div>
            </div>
            <ResultsDisplay results={results} />
          </motion.div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeySet={handleApiKeySet}
        onModelSet={handleModelSet}
      />
    </div>
  );
}

export default App;

