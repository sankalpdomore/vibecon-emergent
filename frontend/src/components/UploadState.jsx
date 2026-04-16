import React, { useState, useRef } from 'react';

export const UploadState = ({ uploadedFile, onFileUpload, onStartMatching, onCancel }) => {
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
        {/* Resume Card Preview */}
        <div className="resume-builder-icon-section">
          <div className="resume-card-stack">
            {/* Card 3 - Background */}
            <div className="resume-stack-card resume-stack-card-2"></div>
            
            {/* Card 2 - Middle */}
            <div className="resume-stack-card resume-stack-card-1"></div>
            
            {/* Card 1 - Front */}
            <div className="resume-stack-card resume-stack-card-0">
              <div className="resume-mini-header">
                <div className="resume-mini-avatar">SK</div>
                <div>
                  <div className="resume-mini-name">Sankalp Sinha</div>
                  <div className="resume-mini-title">Professional Title</div>
                </div>
              </div>
              
              {uploadedFile && (
                <>
                  <div className="resume-mini-section">
                    <div className="resume-mini-section-title">Experience</div>
                    <div className="resume-mini-line" style={{ width: '100%' }}></div>
                    <div className="resume-mini-line" style={{ width: '80%' }}></div>
                    <div className="resume-mini-line" style={{ width: '75%' }}></div>
                  </div>
                  <div className="resume-mini-section">
                    <div className="resume-mini-section-title">Skills</div>
                    <div className="resume-mini-line" style={{ width: '100%' }}></div>
                    <div className="resume-mini-line" style={{ width: '85%' }}></div>
                  </div>
                </>
              )}
            </div>
          </div>
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
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`dropzone ${isDragging ? 'dragging' : ''}`}
                >
                  <i className="ph-bold ph-upload-simple dropzone-icon"></i>
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

              {/* Feature Badges */}
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
                  <span>Actionable insights</span>
                </div>
                <div className="resume-feature-item">
                  <i className="ph-bold ph-check"></i>
                  <span>Private & secure</span>
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
