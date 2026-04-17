import React, { useState, useEffect } from 'react';

// Three sample job cards rotating in the stack — one per ranking tier
const JOB_CARDS = [
  {
    company: 'Emergent',
    logo: 'https://nextdoor.company/company-logos/emergent.png',
    initials: 'EM',
    title: 'Backend Engineer',
    ranking: 'strong_match',
    rankingLabel: 'Strong Match',
    rankingColor: '#16a34a',
    rankingBg: '#dcfce7',
  },
  {
    company: 'Vercel',
    logo: 'https://nextdoor.company/company-logos/vercel.png',
    initials: 'VE',
    title: 'Design Engineer',
    ranking: 'good_match',
    rankingLabel: 'Good Match',
    rankingColor: '#2563eb',
    rankingBg: '#dbeafe',
  },
  {
    company: 'Apollo.io',
    logo: 'https://nextdoor.company/company-logos/apolloio.png',
    initials: 'AP',
    title: 'Senior Backend Engineer',
    ranking: 'worth_a_shot',
    rankingLabel: 'Worth a Shot',
    rankingColor: '#d97706',
    rankingBg: '#fef3c7',
  },
];

// Skeleton lines to suggest JD content below the header
const SkeletonLines = () => (
  <div className="resume-mini-sections">
    <div className="resume-mini-section">
      <div className="resume-mini-section-lines">
        <div className="resume-mini-line" style={{ width: '100%' }}></div>
        <div className="resume-mini-line" style={{ width: '75%' }}></div>
        <div className="resume-mini-line" style={{ width: '90%' }}></div>
      </div>
    </div>
    <div className="resume-mini-section">
      <div className="resume-mini-section-lines">
        <div className="resume-mini-line" style={{ width: '85%' }}></div>
        <div className="resume-mini-line" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
);

export const ResumeCardStack = ({ hasFile }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % JOB_CARDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getCardPosition = (cardIndex) => {
    return (cardIndex - activeIndex + JOB_CARDS.length) % JOB_CARDS.length;
  };

  const handleImgError = (index) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="resume-card-stack">
      {JOB_CARDS.map((card, index) => {
        const position = getCardPosition(index);
        return (
          <div
            key={index}
            className={`resume-stack-card resume-stack-card-${position}`}
          >
            {/* Company header row: logo + name + title */}
            <div className="resume-mini-header">
              <div
                className="resume-mini-avatar"
                style={{
                  background: '#f5f5f5',
                  overflow: 'hidden',
                  borderRadius: '10px',
                }}
              >
                {!imgErrors[index] ? (
                  <img
                    src={card.logo}
                    alt={card.initials}
                    onError={() => handleImgError(index)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '4px',
                    }}
                  />
                ) : (
                  <span style={{ color: '#666', fontSize: '13px', fontWeight: 700 }}>
                    {card.initials}
                  </span>
                )}
              </div>
              <div className="resume-mini-info">
                <div className="resume-mini-name">{card.company}</div>
                <div className="resume-mini-title">{card.title}</div>
              </div>
            </div>

            {/* Ranking badge */}
            <div
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                color: card.rankingColor,
                background: card.rankingBg,
                marginBottom: '16px',
                letterSpacing: '0.2px',
              }}
            >
              {card.rankingLabel}
            </div>

            {/* Skeleton lines suggesting match details */}
            <SkeletonLines />
          </div>
        );
      })}
    </div>
  );
};
