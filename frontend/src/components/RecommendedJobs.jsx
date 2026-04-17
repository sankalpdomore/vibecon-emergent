import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { AppShell } from './AppShell';
import { UploadState } from './UploadState';
import { LoadingState } from './LoadingState';
import { ParsedResumeView } from './ParsedResumeView';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Model options - OpenAI only (backend uses AsyncOpenAI client)
const MODEL_OPTIONS = [
  { value: 'openai:gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', model: 'gpt-4o-mini', icon: '🤖' },
  { value: 'openai:gpt-4o', label: 'GPT-4o', provider: 'openai', model: 'gpt-4o', icon: '🤖' },
];

// Play page transition sound effect
const playTransitionSound = () => {
  try {
    const audio = new Audio('/sounds/page-transition.wav');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  } catch (e) {
    // Sound playback is non-critical
  }
};

export const RecommendedJobs = () => {
  const [state, setState] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedModel, setSelectedModel] = useState('openai:gpt-4o-mini');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  // Slide direction: 'upload' shows first panel, 'parsed' slides to second panel
  const [slideView, setSlideView] = useState('upload');

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setError(null);
    handleStartMatching(file);
  };

  const handleStartMatching = async (file = uploadedFile) => {
    if (!file) {
      setError('Please upload a resume first');
      return;
    }

    const currentKey = apiKey || localStorage.getItem('openai_api_key');
    if (!currentKey) {
      setError('Please add your OpenAI API key first. Click your profile icon in the top right.');
      return;
    }

    setState('loading');
    setError(null);

    const modelOption = MODEL_OPTIONS.find(m => m.value === selectedModel);
    addLog(`Using model: ${modelOption?.label || selectedModel}`);
    addLog(`Uploading resume: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

    const parseStartTime = Date.now();
    addLog('Sending to /api/parse-resume...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model_provider', selectedModel.split(':')[0]);
      formData.append('model_name', modelOption?.model || selectedModel.split(':')[1]);

      const response = await axios.post(`${API}/parse-resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-OpenAI-Key': currentKey,
        },
      });

      if (response.data.success) {
        const parseSeconds = ((Date.now() - parseStartTime) / 1000).toFixed(1);
        addLog(`Resume parsed in ${parseSeconds}s`);
        const data = response.data.data;
        addLog(`Parse result: ${(data.skills || []).length} skills, ${(data.experience || []).length} positions`);
        setParsedData({ ...data, _parseTime: parseSeconds });
        setState('parsed');
        // Slide right to results view + play sound
        setSlideView('parsed');
        playTransitionSound();
      } else {
        throw new Error('Failed to parse resume');
      }
    } catch (err) {
      const parseSeconds = ((Date.now() - parseStartTime) / 1000).toFixed(1);
      addLog(`ERROR after ${parseSeconds}s: ${err.response?.data?.detail || err.message}`);
      console.error('Error parsing resume:', err);
      setError(err.response?.data?.detail || 'Failed to parse resume. Please try again.');
      setState('upload');
    }
  };

  const handleReset = () => {
    // Slide left back to upload view + play sound
    setSlideView('upload');
    playTransitionSound();
    // Wait for slide animation to finish before resetting state
    setTimeout(() => {
      setState('upload');
      setUploadedFile(null);
      setParsedData(null);
      setError(null);
      addLog('Reset - ready for new resume');
    }, 350);
  };

  return (
    <AppShell apiKey={apiKey} onApiKeyChange={saveApiKey}>
      <div
        className={`recommended-jobs-views-stack ${
          slideView === 'parsed'
            ? 'recommended-jobs-views-stack--parsed'
            : 'recommended-jobs-views-stack--upload'
        }`}
      >
        {/* Panel 1: Upload / Loading state */}
        <div className="recommended-jobs-view-panel">
          {(state === 'upload' || state === 'loading') && (
            <UploadState
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
              onStartMatching={handleStartMatching}
              onCancel={() => {
                setUploadedFile(null);
                if (state === 'loading') setState('upload');
              }}
              error={error}
              isLoading={state === 'loading'}
            />
          )}
        </div>

        {/* Panel 2: Parsed results view */}
        <div className="recommended-jobs-view-panel">
          {state === 'parsed' && parsedData && (
            <ParsedResumeView
              parsedData={parsedData}
              onBack={handleReset}
              addLog={addLog}
              selectedModel={selectedModel}
              apiKey={apiKey}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
};
