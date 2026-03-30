import { useEffect, useState } from 'react';
import SettingsModal, { getApiKey, getModel, clearApiKey } from './components/SettingsModal';
import ResumeAiApp from './components/ResumeAiApp';

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
    <>
      <ResumeAiApp
        apiKey={apiKey}
        selectedModel={selectedModel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onApiKeyCleared={() => {
          clearApiKey();
          setApiKey(null);
        }}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeySet={handleApiKeySet}
        onModelSet={handleModelSet}
      />
    </>
  );
}

export default App;

