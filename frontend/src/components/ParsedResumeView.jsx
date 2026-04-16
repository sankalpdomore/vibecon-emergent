import React, { useState, useEffect } from 'react';
import './ParsedResumeView.css';

export const ParsedResumeView = ({ parsedData, onBack }) => {
  const { name, email, phone, summary, skills, experience, education } = parsedData;
  const [matchingState, setMatchingState] = useState('loading'); // 'loading' or 'complete'
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    // Simulate job matching process
    const timer = setTimeout(() => {
      // Mock matched jobs matching the screenshot design
      setMatchedJobs([
        {
          id: 1,
          company: 'Emergent Labs',
          logo: 'https://avatars.githubusercontent.com/in/1201222?s=120',
          title: 'Senior Backend Engineer',
          score: 92,
          hiring_info: 'Hiring in 5 office locations',
          departments: 'Engineering, Backend, Systems',
          location: 'Remote, India'
        },
        {
          id: 2,
          company: 'Apollo.io',
          logo: 'https://ui-avatars.com/api/?name=AP&background=4F46E5&color=fff&rounded=true',
          title: 'Backend Engineer',
          score: 88,
          hiring_info: 'Hiring in 8 office locations',
          departments: 'Engineering, Data, Product',
          location: 'Remote, India'
        },
        {
          id: 3,
          company: 'Bloomreach',
          logo: 'https://ui-avatars.com/api/?name=BR&background=10B981&color=fff&rounded=true',
          title: 'Senior Data Engineer',
          score: 85,
          hiring_info: 'Hiring in 12 office locations',
          departments: 'Engineering, Data, Analytics',
          location: 'Bengaluru, India'
        },
        {
          id: 4,
          company: 'Atomicwork',
          logo: 'https://ui-avatars.com/api/?name=AW&background=F59E0B&color=fff&rounded=true',
          title: 'Backend Engineer - Search',
          score: 82,
          hiring_info: 'Hiring in 3 office locations',
          departments: 'Engineering, Search, Backend',
          location: 'Bengaluru, India'
        },
        {
          id: 5,
          company: 'Celonis',
          logo: 'https://ui-avatars.com/api/?name=CE&background=8B5CF6&color=fff&rounded=true',
          title: 'Software Engineer',
          score: 80,
          hiring_info: 'Hiring in 15 office locations',
          departments: 'Engineering, Product, Cloud',
          location: 'Remote'
        }
      ]);
      setMatchingState('complete');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="resume-builder-wrapper parsed">
      <div className="parsed-view-container">
        {/* Left Column - Parsed Resume */}
        <div className="parsed-resume-column">
          <div className="modal-card">
            <div className="modal-card-content-container parsed-resume-content">
              <div className="modal-card-content">
                {/* Back Button */}
                <button onClick={onBack} className="back-button">
                  <i className="ph-bold ph-arrow-left"></i>
                  <span>Back</span>
                </button>

                <h1 className="modal-card-title">Resume Parsed Successfully</h1>
                <p className="resume-builder-subtext">
                  Here's what we extracted from your resume
                </p>

                {/* Personal Information */}
                <div className="parsed-section">
                  <h3 className="parsed-section-title">Personal Information</h3>
                  <div className="parsed-section-content">
                    {name && (
                      <p className="info-row">
                        <span className="info-label">Name:</span> {name}
                      </p>
                    )}
                    {email && (
                      <p className="info-row">
                        <span className="info-label">Email:</span> {email}
                      </p>
                    )}
                    {phone && (
                      <p className="info-row">
                        <span className="info-label">Phone:</span> {phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div className="parsed-section">
                    <h3 className="parsed-section-title">Professional Summary</h3>
                    <div className="parsed-section-content">
                      <p className="parsed-section-text">{summary}</p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                  <div className="parsed-section">
                    <h3 className="parsed-section-title">Skills</h3>
                    <div className="skills-grid">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Another Resume Button */}
            <div className="modal-card-button-container">
              <button onClick={onBack} className="modal-card-cta">
                <i className="ph-bold ph-upload-simple"></i>
                <span>Upload Another Resume</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Job Matching */}
        <div className="job-matches-column">
          <div className="modal-card">
            <div className="modal-card-content-container job-matches-content">
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

                <div className="job-cards-container">
                  {matchingState === 'loading' ? (
                    // Skeleton Loading
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-job-card">
                          <div className="skeleton-header">
                            <div className="skeleton-logo"></div>
                            <div className="skeleton-text">
                              <div className="skeleton-line title"></div>
                              <div className="skeleton-line subtitle"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Matched Jobs
                    <>
                      {matchedJobs.map((job) => (
                        <div key={job.id} className="job-card">
                          <div className="job-card-header">
                            <img 
                              src={job.logo} 
                              alt={job.company}
                              className="job-card-logo"
                            />
                            <div className="job-card-info">
                              <h3 className="job-card-company">{job.company}</h3>
                              <h4 className="job-card-title">{job.title}</h4>
                              <div className="job-card-meta">
                                <i className="ph-bold ph-buildings"></i>
                                <span>{job.hiring_info}</span>
                              </div>
                              <div className="job-card-details">
                                <i className="ph-bold ph-briefcase"></i>
                                <span>{job.departments}</span>
                              </div>
                            </div>
                          </div>
                          <i className="ph-bold ph-arrow-square-out job-card-external-icon"></i>
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
