import React, { useState } from 'react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_reading-first/artifacts/1k26p6dr_favicon.png';
const PROFILE_IMAGE_URL = 'https://customer-assets.emergentagent.com/job_reading-first/artifacts/99wnph8u_sankalp.jpg';

export const Header = ({ apiKey, onApiKeyChange }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="app-header">
      {/* Left Side - Logo and Search */}
      <div className="app-header-left">
        {/* Logo */}
        <div className="app-logo-wrapper">
          <div className="app-logo">
            <img
              src={LOGO_URL}
              alt="NextDoor.Company"
              className="app-logo-img"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="app-header-search">
          <div className="search-bar-container search-bar-header-mode">
            <div className="search-bar-input-wrapper">
              <div className="search-bar-input-container">
                <div className="search-bar-icon-left">
                  <i className="ph-bold ph-magnifying-glass" style={{ fontSize: '18px', color: '#999' }}></i>
                </div>
                <input
                  className="search-bar-input"
                  placeholder="Search filters, jobs, startups, or locations..."
                  disabled
                />
                <div className="search-bar-icon-right">
                  <span className="search-bar-shortcut-hint">⌘K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - CTAs and Profile */}
      <div className="app-header-right">
        <div className="app-header-right-ctas">
          {/* Saved Jobs */}
          <button className="cta-button">
            <i className="ph-bold ph-bookmark-simple cta-icon"></i>
            <span>Saved jobs</span>
            <span className="app-header-saved-jobs-count">0</span>
          </button>

          {/* Applied Jobs */}
          <button className="cta-button">
            <i className="ph-bold ph-checks cta-icon"></i>
            <span>Applied jobs</span>
            <span className="app-header-applied-jobs-count">0</span>
          </button>
        </div>

        {/* Profile with dropdown */}
        <div className="user-avatar-container" style={{ position: 'relative' }}>
          <div
            className="user-avatar-with-badge"
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar-circle">
              <img
                src={PROFILE_IMAGE_URL}
                alt="Sankalp Sinha"
                className="user-profile-image"
              />
            </div>
            <span className="user-lifetime-badge">PRO</span>
          </div>

          {/* Profile dropdown menu */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute', top: '48px', right: '0', zIndex: 200,
              width: '280px', background: '#fff', borderRadius: '12px',
              padding: '16px', border: '1px solid #ddd',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontFamily: 'var(--font-inter)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>
                Settings
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
                OpenAI API Key
              </div>
              <input
                type="password"
                value={apiKey || ''}
                onChange={(e) => onApiKeyChange && onApiKeyChange(e.target.value)}
                placeholder="sk-proj-..."
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  border: '1px solid #ddd', fontSize: '11px', outline: 'none',
                  fontFamily: 'monospace', boxSizing: 'border-box'
                }}
              />
              {apiKey ? (
                <div style={{ fontSize: '10px', color: '#059669', marginTop: '6px' }}>
                  <i className="ph-bold ph-check-circle" style={{ marginRight: '4px' }}></i>
                  Key saved ({apiKey.slice(0, 8)}...{apiKey.slice(-4)})
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: '#999', marginTop: '6px' }}>
                  Get your key from platform.openai.com/api-keys
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
