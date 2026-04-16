import React, { useState } from 'react';
import axios from 'axios';
import { AppShell } from './AppShell';
import { UploadState } from './UploadState';
import { LoadingState } from './LoadingState';
import { ParsedResumeView } from './ParsedResumeView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const RecommendedJobs = () => {
  const [state, setState] = useState('upload'); // 'upload', 'loading', 'parsed'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

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

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

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
      setUploadedFile(null);
    }
  };

  const handleReset = () => {
    setState('upload');
    setUploadedFile(null);
    setParsedData(null);
    setError(null);
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
          onCancel={() => setUploadedFile(null)}
          error={error}
          isLoading={true}
        />
      )}
      {state === 'parsed' && parsedData && (
        <ParsedResumeView 
          parsedData={parsedData}
          onBack={handleReset}
        />
      )}
    </AppShell>
  );
};
