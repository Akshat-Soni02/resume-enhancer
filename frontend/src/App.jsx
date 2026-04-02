import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SettingsModal, { getApiKey, getModel, clearApiKey } from './components/SettingsModal';
import SiteLayout from './components/SiteLayout';
import ResumeAiApp from './components/ResumeAiApp';
import Account from './pages/Account';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Templates from './pages/Templates';
import Blog from './pages/Blog';
import ATSGuide from './pages/ATSGuide';
import Support from './pages/Support';
import JobSpaces from './pages/JobSpaces';
import { Privacy, Terms } from './pages/Legal';

function App() {
  const [apiKey, setApiKey] = useState(null);
  const [selectedModel, setSelectedModel] = useState(() => getModel());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsSettingsOpen(true);
    }
    setSelectedModel(getModel());
  }, []);

  const handleApiKeySet = (key) => {
    setApiKey(key);
  };

  const handleModelSet = (modelId) => {
    setSelectedModel(modelId);
  };

  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout onOpenSettings={() => setIsSettingsOpen(true)} />}>
          <Route
            path="/"
            element={
              <ResumeAiApp
                apiKey={apiKey}
                selectedModel={selectedModel}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onApiKeyCleared={() => {
                  clearApiKey();
                  setApiKey(null);
                }}
              />
            }
          />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/ats-guide" element={<ATSGuide />} />
          <Route path="/support" element={<Support />} />
          <Route path="/job-spaces" element={<JobSpaces />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeySet={handleApiKeySet}
        onModelSet={handleModelSet}
      />
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

