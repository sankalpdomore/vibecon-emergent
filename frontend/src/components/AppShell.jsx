import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell = ({ children }) => {
  return (
    <div className="app-page-container">
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden', gap: 0 }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Header />
          <main style={{ flex: 1, overflow: 'hidden' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};