import React, { useState, useEffect } from 'react';
import './ParsedResumeView.css';

export const ParsedResumeView = ({ parsedData, onBack, addLog, selectedModel, apiKey }) => {
  const { name, email, phone, summary, skills, experience, education, raw_text } = parsedData;
  const [matchingState, setMatchingState] = useState('loading');
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Call backend matching API
    const matchJobs = async () => {
      const matchStartTime = Date.now();
      if (addLog) addLog('Starting job matching against 50 JDs...');
      if (addLog) addLog('Sending to /api/match-jobs...');
      
      try {
        setMatchingState('loading');
        
        const API_URL = process.env.REACT_APP_BACKEND_URL;
        
        // Parse model from selectedModel (format: 'provider:model-key')
        const modelProvider = selectedModel ? selectedModel.split(':')[0] : 'openai';
        const modelKey = selectedModel ? selectedModel.split(':')[1] : 'gpt-4o-mini';
        
        // Map model key to actual model name
        const MODEL_MAP = {
          'gpt-4o-mini': 'gpt-4o-mini',
          'gpt-4o': 'gpt-4o',
          'claude-sonnet': 'claude-sonnet-4-20250514',
          'gemini': 'gemini-2.0-flash'
        };
        const modelName = MODEL_MAP[modelKey] || modelKey;
        
        const response = await fetch(`${API_URL}/api/match-jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume_text: raw_text || '',
            openai_key: apiKey || localStorage.getItem('openai_api_key') || '',
            parsed_data: {
              name,
              email,
              phone,
              summary,
              skills,
              experience,
              education
            },
            model_provider: modelProvider,
            model_name: modelName
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to match jobs: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.matches) {
          const matchSeconds = ((Date.now() - matchStartTime) / 1000).toFixed(1);
          if (addLog) addLog(`Matching complete in ${matchSeconds}s — ${data.matches.length} matches found`);
          
          // Format matches for frontend
          const formattedMatches = data.matches.map((match, idx) => ({
            id: idx + 1,
            company: match.company_name,
            companyInitials: match.companyInitials || match.company_name.substring(0, 2).toUpperCase(),
            logo: match.company_logo_url,
            title: match.title,
            location: match.location,
            departments: match.departments,
            applyUrl: match.apply_url,
            ranking: match.ranking,
            matchInsights: match.match_insights || []
          }));
          
          // Log each match
          formattedMatches.forEach(m => {
            if (addLog) addLog(`  ${m.ranking.toUpperCase()}: ${m.title} @ ${m.company}`);
          });
          
          setMatchedJobs(formattedMatches);
          setMatchingState('complete');
        } else {
          throw new Error('No matches found');
        }
      } catch (err) {
        const matchSeconds = ((Date.now() - matchStartTime) / 1000).toFixed(1);
        if (addLog) addLog(`ERROR after ${matchSeconds}s: ${err.message}`);
        console.error('Error matching jobs:', err);
        setError(err.message);
        setMatchingState('error');
      }
    };

    matchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

              {/* Contact Info - Name, Email, Phone */}
              <div className="resume-parsed-contact-info">
                {name && (
                  <div className="resume-parsed-detail-row">
                    <i className="ph-bold ph-user"></i>
                    <span className="resume-parsed-detail-label">Name:</span>
                    <span className="resume-parsed-detail-value">{name}</span>
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
                      <div className="skeleton-row-1">
                        <div className="skeleton-logo"></div>
                        <div className="skeleton-info">
                          <div className="skeleton-line" style={{ width: '70%', height: '16px' }}></div>
                          <div className="skeleton-line" style={{ width: '40%', height: '12px' }}></div>
                          <div className="skeleton-line" style={{ width: '50%', height: '12px', marginTop: '8px' }}></div>
                          <div className="skeleton-line" style={{ width: '60%', height: '12px' }}></div>
                        </div>
                        <div className="skeleton-insights">
                          <div className="skeleton-line" style={{ width: '90%', height: '10px' }}></div>
                          <div className="skeleton-line" style={{ width: '80%', height: '10px' }}></div>
                          <div className="skeleton-line" style={{ width: '85%', height: '10px' }}></div>
                        </div>
                      </div>
                      <div className="skeleton-row-2">
                        <div className="skeleton-btn"></div>
                        <div className="skeleton-btn"></div>
                        <div className="skeleton-btn"></div>
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
                      className="job-leads-company-link"
                    >
                      {/* Row 1: Logo + Info + Insights */}
                      <div className="job-leads-company-link-row">
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
                            {job.ranking === 'strong_match' && 'Strong Match'}
                            {job.ranking === 'good_match' && 'Good Match'}
                            {job.ranking === 'worth_a_shot' && 'Worth a Shot'}
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
                      </div>

                      {/* Row 2: CTA Buttons */}
                      <div className="job-card-cta-row">
                        <a 
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="job-card-cta-btn"
                        >
                          <i className="ph-bold ph-arrow-square-out"></i>
                          <span>View job</span>
                        </a>
                        <button className="job-card-cta-btn">
                          <i className="ph-bold ph-bookmark-simple"></i>
                          <span>Save</span>
                        </button>
                        <button className="job-card-cta-btn">
                          <i className="ph-bold ph-checks"></i>
                          <span>Mark Applied</span>
                        </button>
                      </div>
                      <i className="ph-bold ph-arrow-square-out job-leads-company-link-arrow"></i>
                    </div>
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
