import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, X } from 'lucide-react';

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
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100" style={{
      backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
      backgroundSize: '30px 30px'
    }}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Resume Card Preview */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-64 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SK</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sankalp Sinha</h3>
                <p className="text-sm text-gray-600">Professional Title</p>
              </div>
            </div>
            
            {uploadedFile && (
              <>
                <div className="border-t pt-3 mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Experience</h4>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Skills</h4>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {uploadedFile ? "Ready to find your matches" : "Recommended Jobs"}
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
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
              className={`border-2 border-dashed rounded-2xl p-12 mb-8 transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-700 font-medium mb-2">Drag and drop your resume here</p>
              <p className="text-gray-500 text-sm">PDF files only, max 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="text-green-600" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleUploadClick}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Upload another</span>
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check size={16} className="text-green-600" />
              <span>Precise extraction</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check size={16} className="text-green-600" />
              <span>Smart matching</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check size={16} className="text-green-600" />
              <span>Actionable insights</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check size={16} className="text-green-600" />
              <span>Private & secure</span>
            </div>
          </div>

          {/* CTA Button */}
          {!uploadedFile ? (
            <button
              onClick={handleUploadClick}
              className="w-full max-w-md mx-auto px-8 py-4 bg-gray-800 hover:bg-black text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get started</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={onStartMatching}
              className="w-full max-w-md mx-auto px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get started</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};