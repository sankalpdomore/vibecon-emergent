import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell = ({ children }) => {
  return (
    <div className="app-page-container">
      <Header />
      <div className="app-page-main-wrapper with-feature-nav">
        <Sidebar />
        <div className="app-page-feature-content">
          <div className="feature-content-container map-container map-container-with-header">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
