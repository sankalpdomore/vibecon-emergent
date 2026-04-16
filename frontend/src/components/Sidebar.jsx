import React from 'react';

export const Sidebar = () => {
  return (
    <aside className="feature-nav-sidebar">
      <div className="feature-nav-icons">
        {/* Discover - Inactive */}
        <div className="feature-nav-icon-btn-container">
          <button className="feature-nav-icon-btn">
            <i className="ph-bold ph-compass"></i>
          </button>
          <span className="feature-nav-icon-btn-label">Discover</span>
        </div>

        {/* Resume - Active */}
        <div className="feature-nav-icon-btn-container active">
          <button className="feature-nav-icon-btn active">
            <i className="ph-bold ph-file-pdf"></i>
          </button>
          <span className="feature-nav-icon-btn-label">Resume</span>
        </div>

        {/* Track - Inactive */}
        <div className="feature-nav-icon-btn-container">
          <button className="feature-nav-icon-btn">
            <i className="ph-bold ph-list-checks"></i>
          </button>
          <span className="feature-nav-icon-btn-label">Track</span>
        </div>
      </div>
    </aside>
  );
};