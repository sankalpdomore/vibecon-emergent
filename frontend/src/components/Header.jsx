import React from 'react';

export const Header = () => {
  return (
    <header className="app-header">
      {/* Left Side - Logo and Search */}
      <div className="app-header-left">
        {/* Logo */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <circle cx="7" cy="12" r="4" />
            <circle cx="17" cy="12" r="4" />
          </svg>
        </div>

        {/* Search Bar */}
        <div className="app-header-search">
          <div style={{ position: 'relative', width: '100%' }}>
            <i className="ph-bold ph-magnifying-glass" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#aaa',
              fontSize: '18px'
            }}></i>
            <input
              type="text"
              placeholder="Search filters, jobs, startups, or locations..."
              disabled
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '48px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#fafafa'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              color: '#aaa',
              fontWeight: '500'
            }}>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Side - CTAs and Profile */}
      <div className="app-header-right">
        <div className="app-header-right-ctas">
          {/* Saved Jobs */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            background: '#fff',
            cursor: 'not-allowed',
            opacity: 0.6
          }}>
            <i className="ph-bold ph-bookmark" style={{ fontSize: '18px', color: '#666' }}></i>
            <span style={{ fontSize: '14px', color: '#666' }}>Saved jobs</span>
            <span className="app-header-saved-jobs-count">0</span>
          </button>

          {/* Applied Jobs */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            background: '#fff',
            cursor: 'not-allowed',
            opacity: 0.6
          }}>
            <i className="ph-bold ph-check-circle" style={{ fontSize: '18px', color: '#666' }}></i>
            <span style={{ fontSize: '14px', color: '#666' }}>Applied jobs</span>
            <span className="app-header-applied-jobs-count">0</span>
          </button>
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <i className="ph-bold ph-user" style={{ fontSize: '20px', color: 'white' }}></i>
          </div>
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#3b82f6',
            color: 'white',
            fontSize: '8px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '9999px'
          }}>LIFETIME</span>
        </div>
      </div>
    </header>
  );
};