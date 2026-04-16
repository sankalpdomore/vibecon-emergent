import React, { useState, useEffect } from 'react';
import './ParsedResumeView.css';

export const ParsedResumeView = ({ parsedData, onBack }) => {
  const { name, email, phone, summary, skills, experience, education } = parsedData;
  const [matchingState, setMatchingState] = useState('loading');
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    // Simulate job matching process
    const timer = setTimeout(() => {
      setMatchedJobs([
        {
          id: 1,
          company: 'Emergent Labs',
          companyInitials: 'EL',
          logo: 'https://avatars.githubusercontent.com/in/1201222?s=120',
          title: 'Senior Backend Engineer',
          hiringLocations: 5,
          departments: 'Engineering, Backend, Systems',
          applyUrl: 'https://job-boards.greenhouse.io/emergentlabsinc/jobs/4111446009'
        },
        {
          id: 2,
          company: 'Apollo.io',
          companyInitials: 'AP',
          logo: null,
          title: 'Backend Engineer',
          hiringLocations: 8,
          departments: 'Engineering, Data, Product',
          applyUrl: 'https://job-boards.greenhouse.io/apollo-io/jobs/5541744004'
        },
        {
          id: 3,
          company: 'Bloomreach',
          companyInitials: 'BR',
          logo: null,
          title: 'Senior Data Engineer',
          hiringLocations: 12,
          departments: 'Engineering, Data, Analytics',
          applyUrl: 'https://job-boards.greenhouse.io/bloomreach/jobs/6378473003'
        },
        {
          id: 4,
          company: 'Atomicwork',
          companyInitials: 'AW',
          logo: null,
          title: 'Backend Engineer - Search',
          hiringLocations: 3,
          departments: 'Engineering, Search, Backend',
          applyUrl: 'https://job-boards.greenhouse.io/atomicwork/jobs/4342088008'
        },
        {
          id: 5,
          company: 'Celonis',
          companyInitials: 'CE',
          logo: null,
          title: 'Software Engineer',
          hiringLocations: 15,
          departments: 'Engineering, Product, Cloud',
          applyUrl: 'https://job-boards.greenhouse.io/celonis/jobs/7645740003'
        }
      ]);
      setMatchingState('complete');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Create candidate summary from parsed data
  const candidateSummary = [
    experience && experience.length > 0 ? `${experience.length}+ years experience in software engineering` : 'Experience in software development',
    skills && skills.length > 0 ? `Skilled in ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ` and ${skills.length - 3} more` : ''}` : 'Technical skills in modern technologies',
    'Strong background in building scalable applications'
  ];

  return (
    <div className="resume-builder-wrapper parsed">
      <div className="results-view-container">
        {/* Left Panel - Resume Parsed Details */}
        <div className="results-view-left">
          <div className="resume-parsed-panel">
            {/* Back Button */}
            <button onClick={onBack} className="results-back-button">
              <i className="ph-bold ph-arrow-left"></i>
              <span>Back</span>
            </button>

            {/* Overall Assessment */}
            <div className="resume-parsed-section">
              <div className="resume-parsed-section-heading">
                <i className="ph-bold ph-list-dashes"></i>
                <span>Overall assessment:</span>
              </div>
              <p className="resume-parsed-assessment-text">
                {summary || `${name || 'Candidate'} is a skilled professional with expertise in ${skills && skills.length > 0 ? skills.slice(0, 2).join(' and ') : 'software development'}, demonstrating strong technical capabilities and experience in building scalable solutions.`}
              </p>
            </div>

            {/* Structured Details */}
            <div className="resume-parsed-details">
              {experience && experience.length > 0 && (
                <div className="resume-parsed-detail-row">
                  <i className="ph-bold ph-briefcase"></i>
                  <span className="resume-parsed-detail-label">Experience:</span>
                  <span className="resume-parsed-detail-value">{experience.length}+ yrs.</span>
                </div>
              )}
              
              {education && education.length > 0 && (
                <div className="resume-parsed-detail-row">
                  <i className="ph-bold ph-graduation-cap"></i>
                  <span className="resume-parsed-detail-label">Education:</span>
                  <span className="resume-parsed-detail-value">{education[0].degree || education[0].institution || 'Degree information'}</span>
                </div>
              )}
              
              {skills && skills.length > 0 && (
                <div className="resume-parsed-detail-row">
                  <i className="ph-bold ph-wrench"></i>
                  <span className="resume-parsed-detail-label">Skills:</span>
                  <span className="resume-parsed-detail-value">{skills.join(', ')}</span>
                </div>
              )}
              
              {email && (
                <div className="resume-parsed-detail-row">
                  <i className="ph-bold ph-envelope-simple"></i>
                  <span className="resume-parsed-detail-label">Email:</span>
                  <span className="resume-parsed-detail-value">{email}</span>
                </div>
              )}
              
              {phone && (
                <div className="resume-parsed-detail-row">
                  <i className="ph-bold ph-phone"></i>
                  <span className="resume-parsed-detail-label">Phone:</span>
                  <span className="resume-parsed-detail-value">{phone}</span>
                </div>
              )}
            </div>

            {/* Candidate Summary */}
            <div className="resume-parsed-section">
              <div className="resume-parsed-section-heading">
                <i className="ph-bold ph-target"></i>
                <span>Candidate Summary:</span>
              </div>
              <ol className="resume-parsed-summary-list">
                {candidateSummary.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Right Panel - Job Matches */}
        <div className="results-view-right">
          <div>
            <h2 className="matches-heading">
              {matchingState === 'loading' ? 'Finding Your Matches' : 'Your Top Matches'}
            </h2>
            <p className="matches-subtext">
              {matchingState === 'loading' 
                ? 'Our agents are analyzing 50+ engineering roles...' 
                : `Found ${matchedJobs.length} strong matches for your profile`
              }
            </p>
          </div>

          <div>
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
                  <a 
                    key={job.id} 
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="job-leads-company-link"
                  >
                    <div className="job-leads-company-link-logo">
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} />
                      ) : (
                        <div className="job-leads-company-link-logo-fallback">
                          {job.companyInitials}
                        </div>
                      )}
                    </div>
                    <div className="job-leads-company-link-info">
                      <div className="job-leads-company-link-name">{job.company}</div>
                      <div className="job-leads-company-link-offices">
                        <i className="ph-bold ph-buildings"></i>
                        Hiring in {job.hiringLocations} office locations
                      </div>
                      <div className="job-leads-company-link-departments">
                        <i className="ph-bold ph-stack"></i>
                        {job.departments}
                      </div>
                    </div>
                    <i className="ph-bold ph-arrow-square-out job-leads-company-link-arrow"></i>
                  </a>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
