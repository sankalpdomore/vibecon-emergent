import React, { useState } from 'react';
import { AppShell } from './AppShell';
import { UploadState } from './UploadState';
import { LoadingState } from './LoadingState';
import { ResultsState } from './ResultsState';

export const RecommendedJobs = () => {
  const [state, setState] = useState('upload'); // 'upload', 'loading', 'results'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [matchResults, setMatchResults] = useState(null);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleStartMatching = async () => {
    setState('loading');
    
    // Simulate API call to backend for matching
    setTimeout(() => {
      // Mock results - will be replaced with real API call
      const mockResults = {
        strongMatches: [
          {
            id: '1',
            company: 'Emergent',
            logo: 'https://avatars.githubusercontent.com/in/1201222?s=120',
            title: 'Senior Backend Engineer',
            score: 92,
            matchedSkills: ['Python', 'FastAPI', 'MongoDB', 'Docker'],
            matchedExperience: ['5+ years backend development', 'Microservices architecture'],
            summary: "Your experience with Python and FastAPI aligns perfectly with this role. Your MongoDB expertise is a strong match for their tech stack."
          }
        ],
        improvableMatches: [
          {
            id: '2',
            company: 'TechCorp',
            logo: 'https://ui-avatars.com/api/?name=TC&background=4F46E5&color=fff',
            title: 'Full Stack Developer',
            score: 67,
            suggestions: [
              { type: 'skill', text: 'Add "React" to your skills section', impact: 'high' },
              { type: 'keyword', text: 'Mention "CI/CD" or "DevOps" experience', impact: 'medium' },
              { type: 'experience', text: 'Highlight any cloud platform experience (AWS, GCP, Azure)', impact: 'high' }
            ]
          }
        ],
        notAFitMatches: [
          {
            id: '3',
            company: 'DataScience Inc',
            logo: 'https://ui-avatars.com/api/?name=DS&background=DC2626&color=fff',
            title: 'Machine Learning Engineer',
            score: 35,
            reasons: [
              { category: 'tech_stack', text: 'Requires 3+ years of ML/AI experience, resume shows backend focus' },
              { category: 'tech_stack', text: 'Missing required skills: TensorFlow, PyTorch, scikit-learn' },
              { category: 'domain', text: 'Position requires deep learning expertise in computer vision' }
            ]
          }
        ]
      };
      
      setMatchResults(mockResults);
      setState('results');
    }, 3000);
  };

  const handleReset = () => {
    setState('upload');
    setUploadedFile(null);
    setMatchResults(null);
  };

  return (
    <AppShell>
      {state === 'upload' && (
        <UploadState 
          uploadedFile={uploadedFile}
          onFileUpload={handleFileUpload}
          onStartMatching={handleStartMatching}
          onCancel={() => setUploadedFile(null)}
        />
      )}
      {state === 'loading' && <LoadingState />}
      {state === 'results' && (
        <ResultsState 
          results={matchResults}
          onReset={handleReset}
        />
      )}
    </AppShell>
  );
};