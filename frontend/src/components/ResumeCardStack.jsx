import React, { useState, useEffect } from 'react';

const CARD_LAYOUTS = [
  {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'single-column'
  },
  {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'two-column'
  },
  {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    type: 'sidebar'
  }
];

const SingleColumnLayout = ({ hasFile }) => (
  <>
    {hasFile && (
      <div className="resume-mini-sections">
        <div className="resume-mini-section">
          <div className="resume-mini-section-title">Experience</div>
          <div className="resume-mini-section-lines">
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '80%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className="resume-mini-section">
          <div className="resume-mini-section-title">Skills</div>
          <div className="resume-mini-section-lines">
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '60%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    )}
  </>
);

const TwoColumnLayout = ({ hasFile }) => (
  <>
    {hasFile && (
      <div className="resume-mini-two-column">
        <div className="resume-mini-column">
          <div className="resume-mini-section-title">Work</div>
          <div className="resume-mini-section-lines">
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '70%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '70%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '70%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '70%' }}></div>
          </div>
        </div>
        <div className="resume-mini-column">
          <div className="resume-mini-section-title">Education</div>
          <div className="resume-mini-section-lines">
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '60%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '60%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '60%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )}
  </>
);

const SidebarLayout = ({ hasFile }) => (
  <>
    {hasFile && (
      <div className="resume-mini-sidebar-layout">
        <div className="resume-mini-sidebar">
          <div className="resume-mini-block"></div>
          <div className="resume-mini-section-lines">
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '80%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className="resume-mini-main-content">
          <div className="resume-mini-section-lines">
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '90%' }}></div>
            <div className="resume-mini-line" style={{ width: '100%' }}></div>
            <div className="resume-mini-line" style={{ width: '85%' }}></div>
          </div>
          <div className="resume-mini-block right-aligned"></div>
        </div>
      </div>
    )}
  </>
);

export const ResumeCardStack = ({ hasFile }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCardPosition = (cardIndex) => {
    return (cardIndex - activeIndex + 3) % 3;
  };

  const getPositionClass = (position) => {
    return `resume-stack-card-${position}`;
  };

  const renderCardContent = (layoutType) => {
    switch (layoutType) {
      case 'single-column':
        return <SingleColumnLayout hasFile={hasFile} />;
      case 'two-column':
        return <TwoColumnLayout hasFile={hasFile} />;
      case 'sidebar':
        return <SidebarLayout hasFile={hasFile} />;
      default:
        return null;
    }
  };

  return (
    <div className="resume-card-stack">
      {CARD_LAYOUTS.map((layout, index) => {
        const position = getCardPosition(index);
        return (
          <div
            key={index}
            className={`resume-stack-card ${getPositionClass(position)}`}
          >
            <div className="resume-mini-header">
              <div 
                className="resume-mini-avatar" 
                style={{ background: layout.gradient }}
              >
                SK
              </div>
              <div className="resume-mini-info">
                <div className="resume-mini-name">Sankalp Sinha</div>
                <div className="resume-mini-title">Professional Title</div>
              </div>
            </div>
            {renderCardContent(layout.type)}
          </div>
        );
      })}
    </div>
  );
};
