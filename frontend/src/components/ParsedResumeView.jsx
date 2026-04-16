import React, { useState, useEffect } from 'react';

export const ParsedResumeView = ({ parsedData, onBack }) => {
  const { name, email, phone, summary, skills, experience, education } = parsedData;
  const [matchingState, setMatchingState] = useState('loading'); // 'loading' or 'complete'
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    // Simulate job matching process
    const timer = setTimeout(() => {
      // Mock matched jobs
      setMatchedJobs([
        {
          id: 1,
          company: 'Emergent Labs',
          logo: 'https://avatars.githubusercontent.com/in/1201222?s=120',
          title: 'Senior Backend Engineer',
          score: 92,
          location: 'Remote, India'
        },
        {
          id: 2,
          company: 'Apollo.io',
          logo: 'https://ui-avatars.com/api/?name=AP&background=4F46E5&color=fff',
          title: 'Backend Engineer',
          score: 88,
          location: 'Remote, India'
        },
        {
          id: 3,
          company: 'Bloomreach',
          logo: 'https://ui-avatars.com/api/?name=BR&background=10B981&color=fff',
          title: 'Senior Data Engineer',
          score: 85,
          location: 'Bengaluru, India'
        },
        {
          id: 4,
          company: 'Atomicwork',
          logo: 'https://ui-avatars.com/api/?name=AW&background=F59E0B&color=fff',
          title: 'Backend Engineer - Search',
          score: 82,
          location: 'Bengaluru, India'
        },
        {
          id: 5,
          company: 'Celonis',
          logo: 'https://ui-avatars.com/api/?name=CE&background=8B5CF6&color=fff',
          title: 'Software Engineer',
          score: 80,
          location: 'Remote'
        }
      ]);
      setMatchingState('complete');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="resume-builder-wrapper parsed">
      <div style={{ display: 'flex', gap: '24px', maxWidth: '1400px', width: '100%', alignItems: 'flex-start' }}>
        {/* Left Column - Parsed Resume */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div className="modal-card">
            <div className="modal-card-content-container" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="modal-card-content">
                <h1 className="modal-card-title">Resume Parsed Successfully</h1>
                <p className="resume-builder-subtext">
                  Here's what we extracted from your resume
                </p>

                {/* Personal Information */}
                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                    Personal Information
                  </h3>
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                    {name && <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {name}</p>}
                    {email && <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {email}</p>}
                    {phone && <p><strong>Phone:</strong> {phone}</p>}
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                      Professional Summary
                    </h3>
                    <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <p style={{ lineHeight: '1.6', color: '#666' }}>{summary}</p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                  <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                      Skills
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#f0f0f0',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#333',
                            border: '1px solid #ddd'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="modal-card-button-container">
              <button onClick={onBack} className="modal-card-cta">
                <i className="ph-bold ph-arrow-left"></i>
                <span>Upload Another Resume</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Job Matching */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <div className="modal-card">
            <div className="modal-card-content-container" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="modal-card-content">
                <h2 className="modal-card-title" style={{ fontSize: '24px' }}>
                  {matchingState === 'loading' ? 'Finding Your Matches' : 'Your Top Matches'}
                </h2>
                <p className="resume-builder-subtext" style={{ fontSize: '16px' }}>
                  {matchingState === 'loading' 
                    ? 'Our agents are analyzing 50+ engineering roles...' 
                    : `Found ${matchedJobs.length} strong matches for your profile`
                  }
                </p>

                <div style={{ marginTop: '24px' }}>
                  {matchingState === 'loading' ? (
                    // Skeleton Loading
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            background: '#f9fafb',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e5e5e5',
                            marginBottom: '12px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#e5e5e5' }}></div>
                            <div style={{ flex: 1 }}>
                              <div style={{ height: '16px', background: '#e5e5e5', borderRadius: '4px', width: '70%', marginBottom: '8px' }}></div>
                              <div style={{ height: '14px', background: '#e5e5e5', borderRadius: '4px', width: '50%' }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Matched Jobs
                    <>
                      {matchedJobs.map((job) => (
                        <div
                          key={job.id}
                          style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e5e5e5',
                            marginBottom: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = '#333';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#e5e5e5';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <img 
                              src={job.logo} 
                              alt={job.company}
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                                {job.title}
                              </h3>
                              <p style={{ fontSize: '14px', color: '#666' }}>{job.company}</p>
                            </div>
                            <div style={{ 
                              background: '#10b981', 
                              color: 'white', 
                              padding: '4px 12px', 
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              {job.score}%
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', color: '#888' }}>
                            <i className="ph-bold ph-map-pin" style={{ marginRight: '6px' }}></i>
                            {job.location}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
