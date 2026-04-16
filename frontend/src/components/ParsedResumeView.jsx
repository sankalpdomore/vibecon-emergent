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
          logo: 'https://nextdoor.company/company-logos/emergent.png',
          title: 'Senior Backend Engineer',
          location: 'Bengaluru, India',
          departments: 'Engineering, Backend, Systems',
          applyUrl: 'https://job-boards.greenhouse.io/emergentlabsinc/jobs/4111446009',
          ranking: 'highly_recommended',
          matchInsights: [
            'Built distributed systems at scale — directly relevant to their microservices architecture',
            'Prior experience at a B2B SaaS company aligns with their enterprise GTM motion',
            'Strong Java and Spring Boot background matches their primary tech stack',
          ]
        },
        {
          id: 2,
          company: 'Apollo.io',
          companyInitials: 'AP',
          logo: 'https://nextdoor.company/company-logos/apolloio.png',
          title: 'Backend Engineer',
          location: 'Remote, India',
          departments: 'Engineering, Data, Product',
          applyUrl: 'https://job-boards.greenhouse.io/apollo-io/jobs/5541744004',
          ranking: 'good_fit',
          matchInsights: [
            'Experience building RESTful APIs at scale matches their high-throughput data platform needs',
            'Python and Django expertise fits their backend stack',
          ]
        },
        {
          id: 3,
          company: 'Bloomreach',
          companyInitials: 'BR',
          logo: 'https://nextdoor.company/company-logos/bloomreach.png',
          title: 'Senior Data Engineer',
          location: 'Prague, Czech Republic',
          departments: 'Engineering, Data, Analytics',
          applyUrl: 'https://job-boards.greenhouse.io/bloomreach/jobs/6378473003',
          ranking: 'good_fit',
          matchInsights: [
            'Hands-on experience with Kafka and data pipelines relevant to their real-time personalization engine',
            'Worked with large-scale data processing — fits their data infrastructure team',
          ]
        },
        {
          id: 4,
          company: 'Atomicwork',
          companyInitials: 'AW',
          logo: 'https://nextdoor.company/company-logos/atomicwork.png',
          title: 'Backend Engineer - Search',
          location: 'Bengaluru, India',
          departments: 'Engineering, Search, Backend',
          applyUrl: 'https://job-boards.greenhouse.io/atomicwork/jobs/4342088008',
          ranking: 'needs_discussion',
          matchInsights: [
            'Strong backend fundamentals but limited search-specific experience',
            'Microservices architecture experience is transferable to their service-oriented platform',
          ]
        }
      ]);
      setMatchingState('complete');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Create candidate summary from parsed data
  const candidateSummary = [
    experience && experience.length > 0 ? `${experience.length}+ years experience in software engineering` : 'Experience in software development',
    skills && skills.length > 0 ? `Proficient in ${skills.slice(0, 3).join(', ')}` : 'Technical skills in modern technologies',
    skills && skills.length > 3 ? `Additional skills: ${skills.slice(3, 6).join(', ')}` : null,
    'Strong background in building scalable applications',
    'Experience with distributed systems and microservices',
    education && education.length > 0 ? `Education: ${education[0].degree || education[0].institution || 'Degree in Computer Science'}` : 'Strong academic foundation',
    'Proven ability to work in cross-functional teams',
    'Track record of delivering production-ready code',
    skills && skills.some(s => s.toLowerCase().includes('docker') || s.toLowerCase().includes('kubernetes') || s.toLowerCase().includes('aws')) ? 'Experience with cloud infrastructure and DevOps' : 'Familiarity with modern development workflows',
    'Strong problem-solving and analytical skills',
  ].filter(Boolean).slice(0, 10);

  return (
    <div className="resume-builder-wrapper parsed">
      <div className="results-view-container">
        {/* Left Panel - Resume Parsed Details */}
        <div className="results-view-left">
          <div className="resume-parsed-panel">
            {/* Resume Card */}
            <div className="resume-parsed-card">
              {/* Back Button inside card */}
              <div className="resume-parsed-card-nav">
                <button onClick={onBack} className="results-back-button">
                  <i className="ph-bold ph-arrow-left"></i>
                  <span>Back</span>
                </button>
              </div>

              {/* Card Header */}
              <div className="resume-parsed-card-header">Your resume</div>

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
                <ul className="resume-parsed-summary-list">
                  {candidateSummary.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Job Matches */}
        <div className="results-view-right">
          <div className="matches-card">
            <div>
              <h2 className="matches-heading">
                {matchingState === 'loading' ? 'Finding Your Matches' : `Your Top ${matchedJobs.length} Matches`}
              </h2>
              <p className="matches-subtext">
                {matchingState === 'loading' 
                  ? 'Our agents are analyzing 50+ engineering roles...' 
                  : `Found ${matchedJobs.length} strong matches for your profile`
                }
              </p>
            </div>

            <div className="matches-job-list">
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
                        <div className="job-leads-company-link-name">
                          {job.title} <span className="job-leads-company-at">@ </span>{job.company}
                        </div>
                        <span className={`job-leads-ranking-badge ranking-${job.ranking}`}>
                          {job.ranking === 'highly_recommended' && 'Highly recommended'}
                          {job.ranking === 'good_fit' && 'Good fit'}
                          {job.ranking === 'needs_discussion' && 'Needs discussion'}
                          {job.ranking === 'reject' && 'Reject'}
                        </span>
                        <div className="job-leads-company-link-offices">
                          <i className="ph-bold ph-map-pin"></i>
                          {job.location}
                        </div>
                        <div className="job-leads-company-link-departments">
                          <i className="ph-bold ph-stack"></i>
                          {job.departments}
                        </div>
                      </div>
                      {job.matchInsights && job.matchInsights.length > 0 && (
                        <div className="job-leads-match-insights">
                          {job.matchInsights.map((insight, idx) => (
                            <div key={idx} className="job-leads-match-insight-item">
                              <i className="ph-bold ph-checks"></i>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <i className="ph-bold ph-arrow-square-out job-leads-company-link-arrow"></i>
                    </a>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
