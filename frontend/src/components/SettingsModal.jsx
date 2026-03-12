import { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY_STORAGE = 'gemini_api_key';
const MODEL_STORAGE = 'gemini_model';

// Default = best model
export const DEFAULT_MODEL_ID = 'gemini-3-flash-preview';

export const GEMINI_MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite (Fastest)' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Default)' },
];

export const getApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE);
};

export const setApiKey = (key) => {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
};

export const clearApiKey = () => {
  localStorage.removeItem(API_KEY_STORAGE);
};

export const getModel = () => {
  const stored = localStorage.getItem(MODEL_STORAGE);
  if (stored && GEMINI_MODEL_OPTIONS.some((o) => o.id === stored)) return stored;
  return DEFAULT_MODEL_ID;
};

export const setModel = (modelId) => {
  if (modelId) {
    localStorage.setItem(MODEL_STORAGE, modelId);
  } else {
    localStorage.removeItem(MODEL_STORAGE);
  }
};

const SettingsModal = ({ isOpen, onClose, onApiKeySet, onModelSet }) => {
  const [apiKey, setApiKeyLocal] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = getApiKey();
      setApiKeyLocal(storedKey || '');
      setSelectedModel(getModel());
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setApiKey(apiKey.trim());
    setModel(selectedModel);
    onApiKeySet(apiKey.trim());
    onModelSet?.(selectedModel);
    onClose();
  };

  const handleClear = () => {
    setApiKeyLocal('');
    setSelectedModel(DEFAULT_MODEL_ID);
    clearApiKey();
    setModel(DEFAULT_MODEL_ID);
    onApiKeySet(null);
    onModelSet?.(DEFAULT_MODEL_ID);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">API Key Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKeyLocal(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your Gemini API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Your API key is stored locally in your browser and never stored to our servers.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    {GEMINI_MODEL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Default is the best quality model.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

