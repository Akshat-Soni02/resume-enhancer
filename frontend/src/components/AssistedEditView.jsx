import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Copy, ArrowLeft, AlertCircle } from 'lucide-react';
import { processSource } from '../utils/api';
import axios from 'axios';

/**
 * Resolve positions of each edit in source (in order). Returns array of
 * { start, end, editIndex } for edits whose original was found.
 */
function resolveEditPositions(source, suggestedEdits) {
  const positions = [];
  let pos = 0;
  for (let i = 0; i < suggestedEdits.length; i++) {
    const edit = suggestedEdits[i];
    const idx = source.indexOf(edit.original, pos);
    if (idx === -1) continue;
    positions.push({
      start: idx,
      end: idx + edit.original.length,
      editIndex: i,
    });
    pos = idx + edit.original.length;
  }
  return positions;
}

/**
 * Build segments: alternating [plain text] and [edit block]. Sorted by start index.
 */
function buildSegments(source, positions, suggestedEdits) {
  if (positions.length === 0) {
    return [{ type: 'plain', start: 0, end: source.length, text: source }];
  }
  const segments = [];
  let lastEnd = 0;
  for (const p of positions) {
    if (p.start > lastEnd) {
      segments.push({
        type: 'plain',
        start: lastEnd,
        end: p.start,
        text: source.slice(lastEnd, p.start),
      });
    }
    segments.push({
      type: 'edit',
      start: p.start,
      end: p.end,
      editIndex: p.editIndex,
      original: suggestedEdits[p.editIndex].original,
      suggested: suggestedEdits[p.editIndex].suggested,
      location: suggestedEdits[p.editIndex].location,
    });
    lastEnd = p.end;
  }
  if (lastEnd < source.length) {
    segments.push({
      type: 'plain',
      start: lastEnd,
      end: source.length,
      text: source.slice(lastEnd),
    });
  }
  return segments;
}

/**
 * Apply only accepted edits to source (in order, first occurrence each).
 */
function buildFinalSource(source, suggestedEdits, acceptedEdits) {
  let current = source;
  for (let i = 0; i < suggestedEdits.length; i++) {
    if (!acceptedEdits[i]) continue;
    const edit = suggestedEdits[i];
    const idx = current.indexOf(edit.original);
    if (idx === -1) continue;
    current = current.slice(0, idx) + edit.suggested + current.slice(idx + edit.original.length);
  }
  return current;
}

export default function AssistedEditView({
  apiKey,
  selectedModel,
  onOpenSettings,
  onClearApiKey,
}) {
  const [jd, setJd] = useState('');
  const [source, setSource] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [acceptedEdits, setAcceptedEdits] = useState([]);
  const [copyMessage, setCopyMessage] = useState('');

  const suggestedEdits = results?.suggested_edits ?? [];
  const positions = resolveEditPositions(source, suggestedEdits);
  const segments = buildSegments(source, positions, suggestedEdits);

  const handleAnalyze = useCallback(async () => {
    if (!apiKey) {
      setError('Please set your API key in settings');
      onOpenSettings?.();
      return;
    }
    if (!jd.trim()) {
      setError('Please enter the job description');
      return;
    }
    if (!source.trim() || source.trim().length < 50) {
      setError('Please paste your resume source (at least 50 characters). Works with LaTeX, Google Doc text, or any format.');
      return;
    }
    setError(null);
    setResults(null);
    setIsProcessing(true);
    try {
      const data = await processSource(jd.trim(), source, apiKey, selectedModel);
      setResults(data);
      setAcceptedEdits((data.suggested_edits || []).map(() => true));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.detail || err.message;
        if (status === 401) {
          onClearApiKey?.();
          setError('Invalid API key. Please update it in settings.');
          onOpenSettings?.();
        } else if (status === 429) {
          setError('Rate limit exceeded. Please try again later.');
        } else {
          setError(msg || 'Something went wrong.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [jd, source, apiKey, selectedModel, onOpenSettings, onClearApiKey]);

  const setAccept = useCallback((editIndex, accepted) => {
    setAcceptedEdits((prev) => {
      const next = [...prev];
      if (editIndex >= 0 && editIndex < next.length) next[editIndex] = accepted;
      return next;
    });
  }, []);

  const handleCopy = useCallback(() => {
    const final = buildFinalSource(source, suggestedEdits, acceptedEdits);
    navigator.clipboard.writeText(final).then(() => {
      setCopyMessage('Copied to clipboard');
      setTimeout(() => setCopyMessage(''), 2000);
    }).catch(() => {
      setCopyMessage('Failed to copy');
      setTimeout(() => setCopyMessage(''), 2000);
    });
  }, [source, suggestedEdits, acceptedEdits]);

  const handleBack = useCallback(() => {
    setResults(null);
    setError(null);
    setAcceptedEdits([]);
  }, []);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mb-4" />
        <p>Analyzing your source…</p>
      </div>
    );
  }

  if (results) {
    const analysis = results.analysis || {};
    const gaps = analysis.critical_gaps_and_irrelevance || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Assisted Edit — Review changes</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              New analysis
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Copy className="w-4 h-4" />
              Copy updated source
            </button>
          </div>
        </div>
        {copyMessage && (
          <p className="text-sm text-green-600">{copyMessage}</p>
        )}

        {gaps.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Critical gaps & irrelevance</h3>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {gaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-3">
            Your source with suggested edits. Accept (✓) or reject (✗) each — then copy the updated source and paste it back into Overleaf or your doc.
          </p>
          <div className="font-mono text-sm whitespace-pre-wrap break-words border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">
            {segments.map((seg, idx) => {
              if (seg.type === 'plain') {
                return <span key={idx}>{seg.text}</span>;
              }
              const isAccepted = acceptedEdits[seg.editIndex];
              return (
                <span key={idx} className="inline">
                  <span
                    className={`inline-block px-1 rounded border ${
                      isAccepted ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    {isAccepted ? seg.suggested : seg.original}
                    <span className="inline-flex align-middle ml-1 gap-0.5">
                      <button
                        type="button"
                        onClick={() => setAccept(seg.editIndex, true)}
                        title="Accept this edit"
                        className={`p-0.5 rounded ${isAccepted ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-200'}`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccept(seg.editIndex, false)}
                        title="Reject this edit"
                        className={`p-0.5 rounded ${!isAccepted ? 'text-red-600 hover:bg-red-100' : 'text-gray-400 hover:bg-gray-200'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Paste your full resume source (LaTeX code, Google Doc text, or any format). The AI will suggest exact edits so you can copy the updated source back.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job description</label>
        <textarea
          value={jd}
          onChange={(e) => { setJd(e.target.value); setError(null); }}
          placeholder="Paste the job description here..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resume source (LaTeX, Google Doc text, or anything else)
        </label>
        <textarea
          value={source}
          onChange={(e) => { setSource(e.target.value); setError(null); }}
          placeholder="Paste your full resume source here — e.g. LaTeX or plain text from your editor..."
          rows={14}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Works with LaTeX (Overleaf), Google Docs text, or any plain text. Edits will match this exactly so you can paste the result back.
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isProcessing}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Analyzing…' : 'Analyze source'}
      </button>
    </div>
  );
}
