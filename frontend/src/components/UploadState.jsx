import React, { useState, useRef } from 'react';
import { ResumeCardStack } from './ResumeCardStack';

const DEMO_RESUMES = [
  { name: 'Bejoy Mathew', file: 'Engineer_Bejoy_Mathew.pdf' },
  { name: 'Dhinesh Kumar', file: 'Architect_Dhinesh_Kumar.pdf' },
  { name: 'Priyesh Potdar', file: 'Architect_Priyesh_Potdar.pdf' },
];

export const UploadState = ({ uploadedFile, onFileUpload, onStartMatching, onCancel, error, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(null);
  const fileInputRef = useRef(null);

  const handleDemoResume = async (demo) => {
    setLoadingDemo(demo.name);
    try {
      const response = await fetch(`/demo-resumes/${demo.file}`);
      const blob = await response.blob();
      const file = new File([blob], demo.file, { type: 'application/pdf' });
      onFileUpload(file);
    } catch (e) {
      console.error('Failed to load demo resume:', e);
    }
    setLoadingDemo(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="resume-builder-wrapper">
      <div className="resume-builder-card">
        {/* Resume Card Preview - Floats above the card */}
        <div className="resume-builder-icon-section">
          <ResumeCardStack hasFile={uploadedFile !== null} />
        </div>

        {/* Main Content */}
        <div className="modal-card">
          <div className="modal-card-content-container">
            <div className="modal-card-content">
              <h1 className="modal-card-title">
                {uploadedFile ? "Ready to find your matches" : "Recommended Jobs"}
              </h1>
              <p className="resume-builder-subtext">
                {uploadedFile 
                  ? "We'll analyze your resume against 10 curated engineering roles and show you the best matches"
                  : "Upload your resume and discover job opportunities tailored to your skills and experience"
                }
              </p>

              {/* Upload Area */}
              {error && (
                <div style={{
                  background: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  color: '#c33',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              
              <div
                onDragOver={isLoading ? undefined : handleDragOver}
                onDragLeave={isLoading ? undefined : handleDragLeave}
                onDrop={isLoading ? undefined : handleDrop}
                onClick={isLoading ? undefined : handleUploadClick}
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                style={{ cursor: isLoading ? 'default' : 'pointer' }}
              >
                {isLoading ? (
                  <>
                    <div className="gradient-spinner"></div>
                    <p className="dropzone-text">Parsing your resume...</p>
                  </>
                ) : (
                  <>
                    <i className="ph-bold ph-cloud-arrow-up dropzone-icon"></i>
                    <p className="dropzone-text">Drag and drop your resume here</p>
                    <p className="dropzone-hint">PDF files only, max 10MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
              </div>

              {/* Demo Resume Quick Select */}
              {!isLoading && !uploadedFile && (
                <div className="demo-resume-section">
                  <span className="demo-resume-label">Or try a sample resume:</span>
                  <div className="demo-resume-buttons">
                    {DEMO_RESUMES.map((demo) => (
                      <button
                        key={demo.name}
                        className="demo-resume-btn"
                        onClick={() => handleDemoResume(demo)}
                        disabled={loadingDemo !== null}
                      >
                        <i className="ph-bold ph-user"></i>
                        <span>{loadingDemo === demo.name ? 'Loading...' : demo.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Badges - 6 items */}
              <div className="resume-features-inline">
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Skill-gap analysis</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Personalized insights</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>1,000+ roles</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Results in 60 seconds</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Private and secure</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Zero setup required</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button - Show Cancel during loading, Get started otherwise */}
          <div className="modal-card-button-container">
            {isLoading ? (
              <button onClick={onCancel} className="modal-card-cta" style={{ background: 'linear-gradient(0deg, #dc2626 0%, #ef4444 100%)', color: '#fff', border: '1px solid #dc2626' }}>
                <i className="ph-bold ph-x"></i>
                <span>Cancel</span>
              </button>
            ) : (
              <button onClick={handleUploadClick} className="modal-card-cta">
                <span>Get started</span>
                <i className="ph-bold ph-arrow-right"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
