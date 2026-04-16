import React, { useState } from 'react';
import axios from 'axios';
import { AppShell } from './AppShell';
import { UploadState } from './UploadState';
import { LoadingState } from './LoadingState';
import { ParsedResumeView } from './ParsedResumeView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Model options for LLM selection
const MODEL_OPTIONS = [
  { value: 'openai:gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', model: 'gpt-4o-mini', icon: '🤖' },
  { value: 'openai:gpt-4o', label: 'GPT-4o', provider: 'openai', model: 'gpt-4o', icon: '🤖' },
  { value: 'anthropic:claude-sonnet', label: 'Claude Sonnet', provider: 'anthropic', model: 'claude-sonnet-4-20250514', icon: '✦' },
  { value: 'google:gemini', label: 'Gemini', provider: 'google', model: 'gemini-2.0-flash', icon: '✧' },
];

export const RecommendedJobs = () => {
  const [state, setState] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai:gpt-4o-mini');

  const API = process.env.REACT_APP_BACKEND_URL;

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setError(null);
    // Immediately start parsing when file is selected
    handleStartMatching(file);
  };

  const handleStartMatching = async (file = uploadedFile) => {
    if (!file) {
      setError('Please upload a resume first');
      return;
    }

    setState('loading');
    setError(null);

    // Log selected model
    const modelOption = MODEL_OPTIONS.find(m => m.value === selectedModel);
    addLog(`Using model: ${modelOption?.label || selectedModel}`);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Add model parameters
      formData.append('model_provider', selectedModel.split(':')[0]);
      formData.append('model_name', modelOption?.model || selectedModel.split(':')[1]);

      // Call backend API to parse resume
      const response = await axios.post(`${API}/parse-resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setParsedData(response.data.data);
        setState('parsed');
      } else {
        throw new Error('Failed to parse resume');
      }
    } catch (err) {
      console.error('Error parsing resume:', err);
      setError(err.response?.data?.detail || 'Failed to parse resume. Please try again.');
      setState('upload');
      // Don't clear uploaded file on error - let user retry
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
        />
      )}

      {/* Model Selector - top right, next to logs button */}
      <div style={{
        position: 'fixed', top: '80px', right: '200px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ fontSize: '11px', color: '#888', fontFamily: 'var(--font-inter)' }}>Model:</span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            padding: '5px 8px', borderRadius: '8px', fontSize: '11px',
            background: '#fff', border: '1px solid #ddd', color: '#333',
            cursor: 'pointer', fontFamily: 'var(--font-inter)',
            outline: 'none'
          }}
        >
          {MODEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Floating log button - top right */}
      <button 
        onClick={() => setShowLogs(!showLogs)}
        style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 100,
          padding: '6px 12px', borderRadius: '8px', fontSize: '11px',
          background: '#fff', border: '1px solid #ddd', color: '#666',
          cursor: 'pointer', fontFamily: 'var(--font-inter)',
          display: 'flex', alignItems: 'center', gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <i className="ph-bold ph-terminal"></i>
        Processing Logs ({logs.length})
      </button>

      {/* Log panel */}
      {showLogs && (
        <div style={{
          position: 'fixed', top: '116px', right: '24px', zIndex: 100,
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
