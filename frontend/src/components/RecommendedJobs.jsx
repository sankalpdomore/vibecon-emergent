import React, { useState } from 'react';
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

export const RecommendedJobs = () => {
  const [state, setState] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai:gpt-4o-mini');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');

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
      setError('Please add your OpenAI API key in Settings first.');
      setShowSettings(true);
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
    setState('upload');
    setUploadedFile(null);
    setParsedData(null);
    setError(null);
    addLog('Reset - ready for new resume');
  };

  return (
    <AppShell>
      {state === 'upload' && (
        <UploadState
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          onStartMatching={handleStartMatching}
          onCancel={() => setUploadedFile(null)}
          error={error}
          isLoading={false}
        />
      )}
      {state === 'loading' && (
        <UploadState
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          onStartMatching={handleStartMatching}
          onCancel={() => {
            setUploadedFile(null);
            setState('upload');
          }}
          error={error}
          isLoading={true}
        />
      )}
      {state === 'parsed' && parsedData && (
        <ParsedResumeView
          parsedData={parsedData}
          onBack={handleReset}
          addLog={addLog}
          selectedModel={selectedModel}
          apiKey={apiKey}
        />
      )}

      {/* Top-right controls row */}
      <div style={{
        position: 'fixed', top: '80px', right: '24px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        {/* Model Selector */}
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            padding: '5px 8px', borderRadius: '8px', fontSize: '11px',
            background: '#fff', border: '1px solid #ddd', color: '#333',
            cursor: 'pointer', fontFamily: 'var(--font-inter)', outline: 'none'
          }}
        >
          {MODEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
          ))}
        </select>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '5px 10px', borderRadius: '8px', fontSize: '11px',
            background: apiKey ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${apiKey ? '#a7f3d0' : '#fecaca'}`,
            color: apiKey ? '#059669' : '#dc2626',
            cursor: 'pointer', fontFamily: 'var(--font-inter)',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <i className="ph-bold ph-key"></i>
          {apiKey ? 'Key Set' : 'Add Key'}
        </button>

        {/* Logs button */}
        <button
          onClick={() => setShowLogs(!showLogs)}
          style={{
            padding: '5px 10px', borderRadius: '8px', fontSize: '11px',
            background: '#fff', border: '1px solid #ddd', color: '#666',
            cursor: 'pointer', fontFamily: 'var(--font-inter)',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <i className="ph-bold ph-terminal"></i>
          Logs ({logs.length})
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: '116px', right: '24px', zIndex: 100,
          width: '360px', background: '#fff', borderRadius: '12px',
          padding: '20px', border: '1px solid #ddd',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          fontFamily: 'var(--font-inter)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>
            Settings
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            OpenAI API Key
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="sk-proj-..."
            style={{
              width: '100%', padding: '8px 12px', borderRadius: '8px',
              border: '1px solid #ddd', fontSize: '12px', outline: 'none',
              fontFamily: 'monospace', boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
            Get your key from platform.openai.com/api-keys. Stored in browser localStorage only.
          </div>
          {apiKey && (
            <div style={{ fontSize: '11px', color: '#059669', marginTop: '6px' }}>
              Key saved ({apiKey.slice(0, 8)}...{apiKey.slice(-4)})
            </div>
          )}
        </div>
      )}

      {/* Log panel */}
      {showLogs && (
        <div style={{
          position: 'fixed', top: '116px', right: '24px', zIndex: 99,
          width: '400px', maxHeight: '300px', overflowY: 'auto',
          background: '#1a1a1a', color: '#0f0', borderRadius: '12px',
          padding: '16px', fontSize: '11px', fontFamily: 'monospace',
          lineHeight: '1.6', border: '1px solid #333',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          {logs.length === 0 ? (
            <span style={{ color: '#666' }}>No logs yet. Upload a resume to start.</span>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ color: log.includes('ERROR') ? '#ff4444' : '#0f0' }}>
                {log}
              </div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
};
