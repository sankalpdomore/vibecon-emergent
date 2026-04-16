import React from 'react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_reading-first/artifacts/1k26p6dr_favicon.png';
const PROFILE_IMAGE_URL = 'https://customer-assets.emergentagent.com/job_reading-first/artifacts/99wnph8u_sankalp.jpg';

export const Header = () => {
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

        {/* Profile */}
        <div className="user-avatar-container">
          <div className="user-avatar-with-badge">
            <div className="user-avatar-circle">
              <img 
                src={PROFILE_IMAGE_URL} 
                alt="Sankalp Sinha" 
                className="user-profile-image"
              />
            </div>
            <span className="user-lifetime-badge">PRO</span>
          </div>
        </div>
      </div>
    </header>
  );
};
