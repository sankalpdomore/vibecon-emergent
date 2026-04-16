import React, { useState, useRef } from 'react';
import { ResumeCardStack } from './ResumeCardStack';

export const UploadState = ({ uploadedFile, onFileUpload, onStartMatching, onCancel, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
              {!uploadedFile ? (
                <>
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
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                    className={`dropzone ${isDragging ? 'dragging' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ph-bold ph-cloud-arrow-up dropzone-icon"></i>
                    <p className="dropzone-text">Drag and drop your resume here</p>
                    <p className="dropzone-hint">PDF files only, max 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </>
              ) : (
                <div className="dropzone has-file">
                  <div className="dropzone-file-info">
                    <i className="ph-bold ph-file-pdf dropzone-file-icon"></i>
                    <div className="dropzone-file-details">
                      <p className="dropzone-file-name">{uploadedFile.name}</p>
                      <p className="dropzone-file-size">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="dropzone-action-buttons">
                    <button onClick={handleUploadClick} className="dropzone-action-btn dropzone-upload-btn">
                      <i className="ph-bold ph-upload-simple" style={{ fontSize: '16px' }}></i>
                      <span>Upload another</span>
                    </button>
                    <button onClick={onCancel} className="dropzone-action-btn dropzone-cancel-btn">
                      <i className="ph-bold ph-x" style={{ fontSize: '16px' }}></i>
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Feature Badges - 6 items */}
              <div className="resume-features-inline">
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Precise extraction</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Smart matching</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>WYSIWYG Editing</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Download as PDF</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Private and secure</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Free to use</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="modal-card-button-container">
            {!uploadedFile ? (
              <button onClick={handleUploadClick} className="modal-card-cta">
                <span>Get started</span>
                <i className="ph-bold ph-arrow-right"></i>
              </button>
            ) : (
              <button onClick={onStartMatching} className="modal-card-cta">
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
