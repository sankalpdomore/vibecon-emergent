import React, { useState, useEffect, useRef } from 'react';
import './ParsedResumeView.css';

// Expandable insight text — truncated to 3 lines with "Read more"
const InsightItem = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      // Check if text overflows 3 lines (line-height 1.4 * font-size 12px * 3 lines = ~50px)
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 3;
      if (textRef.current.scrollHeight > maxHeight + 2) {
        setNeedsTruncation(true);
      }
    }
  }, [text]);

  return (
    <div className="job-leads-match-insight-item">
      <i className="ph-bold ph-checks"></i>
      <div>
        <span
          ref={textRef}
          className={!expanded && needsTruncation ? 'insight-text-truncated' : ''}
        >
          {text}
        </span>
        {needsTruncation && (
          <span
            className="insight-read-more"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? ' Show less' : ' Read more'}
          </span>
        )}
      </div>
    </div>
  );
};

export const ParsedResumeView = ({ parsedData, onBack, addLog, selectedModel, apiKey }) => {
  const { name, email, phone, summary, skills, experience, education, raw_text } = parsedData;
  const [matchingState, setMatchingState] = useState('loading');
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fallback mock data for demo when API fails
  const loadFallbackData = () => {
    const mockJobs = [
      // 7 Strong Match
      { id: 1, company: 'Anthropic', companyInitials: 'AN', logo: 'https://nextdoor.company/company-logos/anthropic.png', title: 'Research Engineer, Agents', location: 'San Francisco, CA', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your experience building fault-tolerant distributed systems aligns well with Anthropic\'s infrastructure needs.', 'Your track record of scaling backend systems to handle millions of requests demonstrates the reliability Anthropic requires.', 'Your proficiency in Python and system architecture directly matches the technical requirements for this role.'], industry: 'AI Safety, AI Research, Large Language Models', about: 'Anthropic is an AI safety company building reliable, interpretable, and steerable AI systems.', foundedYear: 2021, fundingStage: 'series-e', totalFunding: '$11.5 billion', founderName: '', founderRole: '', founderImage: '' },
      { id: 2, company: 'Anthropic', companyInitials: 'AN', logo: 'https://nextdoor.company/company-logos/anthropic.png', title: 'Infrastructure Engineer, Sandboxing', location: 'San Francisco, CA', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your deep expertise in containerization and distributed systems is directly relevant to sandboxing infrastructure.', 'You have demonstrated strong ownership by driving projects from design through deployment at scale.', 'Your experience optimizing system performance aligns with the efficiency demands of AI infrastructure.'], industry: 'AI Safety, AI Research, Large Language Models', about: 'Anthropic is an AI safety company building reliable, interpretable, and steerable AI systems.', foundedYear: 2021, fundingStage: 'series-e', totalFunding: '$11.5 billion', founderName: '', founderRole: '', founderImage: '' },
      { id: 3, company: 'Emergent', companyInitials: 'EM', logo: 'https://nextdoor.company/company-logos/emergent.png', title: 'Backend Engineer', location: 'Bengaluru, India', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your backend experience in scalable systems fits well with building APIs and microservices.', 'Your contributions to revenue growth showcase your ability to deliver business impact through engineering.', 'You demonstrate strong end-to-end ownership from design to deployment.'], industry: 'AI Infra, DevTools, Autonomous Coding', about: 'Emergent builds autonomous coding agents that replace traditional software development.', foundedYear: 2024, fundingStage: 'seed', totalFunding: '$30 million', founderName: '', founderRole: '', founderImage: '' },
      { id: 4, company: 'Clickhouse', companyInitials: 'CH', logo: 'https://nextdoor.company/company-logos/clickhouse.png', title: 'Cloud Platform Engineer', location: 'Remote, USA', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your proficiency in Kubernetes, Docker, and cloud infrastructure aligns perfectly with this role.', 'You have identified and resolved infrastructure bottlenecks that significantly reduced costs.', 'Your event-driven architecture experience is relevant to ClickHouse\'s cloud requirements.'], industry: 'Enterprise Software, Data Analytics, Cloud Infrastructure', about: 'ClickHouse is the fastest and most resource efficient real-time data warehouse.', foundedYear: 2021, fundingStage: 'series-c', totalFunding: '$650 million', founderName: '', founderRole: '', founderImage: '' },
      { id: 5, company: 'Vercel', companyInitials: 'VE', logo: 'https://nextdoor.company/company-logos/vercel.png', title: 'Site Engineer', location: 'Remote, United States', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your experience scaling engineering practices aligns well with Vercel\'s Series E stage.', 'You demonstrate solid understanding of architecture and scaling through fault-tolerant system design.', 'Your track record of reducing production incidents by 90% shows strong reliability focus.'], industry: 'Cloud Infrastructure, SaaS, Web Development', about: 'Vercel provides the developer experience and infrastructure to build, scale, and secure web apps.', foundedYear: 2015, fundingStage: 'series-e', totalFunding: '$563 million', founderName: '', founderRole: '', founderImage: '' },
      { id: 6, company: 'Temporal', companyInitials: 'TE', logo: 'https://nextdoor.company/company-logos/temporal.png', title: 'Staff Developer Advocate', location: 'Remote, United States', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your skill set in Python and distributed technologies aligns with Temporal\'s stack.', 'You drove a significant revenue increase showcasing your ability to create business impact.', 'You designed fault-tolerant services demonstrating mastery of distributed systems.'], industry: 'Software Development, Developer Tools, Workflow Orchestration', about: 'Temporal provides durable execution for distributed applications.', foundedYear: 2019, fundingStage: 'series-c', totalFunding: '$426 million+', founderName: '', founderRole: '', founderImage: '' },
      { id: 7, company: 'Figma', companyInitials: 'FG', logo: 'https://nextdoor.company/company-logos/figma.png', title: 'Data Engineer', location: 'San Francisco, CA', departments: 'Engineering', applyUrl: '#', ranking: 'strong_match', matchInsights: ['Your event-driven architecture experience using Kafka is crucial for handling data pipelines.', 'You have proficiency in SQL and Python specifically required for this Data Engineer role.', 'Your achievements include significant revenue impact showcasing data-driven contributions.'], industry: 'Software Development, Design, AI', about: 'Figma is a collaborative design platform for building meaningful products.', foundedYear: 2012, fundingStage: 'ipo', totalFunding: '$332.9 million', founderName: '', founderRole: '', founderImage: '' },
      // 5 Good Match
      { id: 8, company: 'Razorpay', companyInitials: 'RZ', logo: 'https://nextdoor.company/company-logos/razorpay.png', title: 'Solutions Engineer', location: 'Bengaluru, India', departments: 'Engineering', applyUrl: '#', ranking: 'good_match', matchInsights: ['Your proficiency with Python and REST API design aligns with the technical requirements.', 'You have demonstrated mastery in system architecture by designing fault-tolerant services.', 'You drove development of internal tools from conception to deployment.'], industry: 'FinTech, SaaS, Payments, Banking', about: 'Razorpay is a full-stack financial solutions company.', foundedYear: 2014, fundingStage: 'series-e', totalFunding: '$741.5 million', founderName: '', founderRole: '', founderImage: '' },
      { id: 9, company: 'Postman', companyInitials: 'PM', logo: 'https://nextdoor.company/company-logos/postman.png', title: 'MTS, AI Platform', location: 'San Francisco, CA', departments: 'Engineering', applyUrl: '#', ranking: 'good_match', matchInsights: ['Your career growth from engineer to senior and lead roles shows increasing responsibility.', 'You provide strong metrics of achievement showcasing quantifiable impact.', 'Your technical depth in architecting large-scale systems is valuable for this role.'], industry: 'API Development, Developer Tools, SaaS', about: 'Postman is an API platform for building and using APIs.', foundedYear: 2014, fundingStage: 'series-d+', totalFunding: '$433 million', founderName: '', founderRole: '', founderImage: '' },
      { id: 10, company: 'Grafana Labs', companyInitials: 'GL', logo: 'https://nextdoor.company/company-logos/grafana-labs.png', title: 'Observability Architect', location: 'Remote, Germany', departments: 'Engineering', applyUrl: '#', ranking: 'good_match', matchInsights: ['Your achievements in revenue growth and cost reduction provide strong metrics of impact.', 'You have significant technical depth in fault-tolerant services and event-driven architecture.', 'You have taken ownership of projects from design to deployment with strong delivery capabilities.'], industry: 'Observability, Open Source, Cloud Infrastructure', about: 'Grafana Labs provides open source observability and monitoring solutions.', foundedYear: 2014, fundingStage: 'series-d+', totalFunding: '$480 million', founderName: '', founderRole: '', founderImage: '' },
      { id: 11, company: 'Phonepe', companyInitials: 'PP', logo: 'https://nextdoor.company/company-logos/phonepe.png', title: 'Software Engineer - Core', location: 'Bengaluru, India', departments: 'Engineering', applyUrl: '#', ranking: 'good_match', matchInsights: ['You have impressive metrics including significant revenue increase and cost reduction.', 'You designed fault-tolerant notification service showing strong foundation in large-scale systems.', 'You have taken end-to-end ownership of projects reflecting well on your delivery capability.'], industry: 'FinTech, Digital Payments, Financial Services', about: 'PhonePe is India\'s leading digital payments platform.', foundedYear: 2015, fundingStage: 'series-d+', totalFunding: '$2.6 billion', founderName: '', founderRole: '', founderImage: '' },
      { id: 12, company: 'Glean', companyInitials: 'GL', logo: 'https://nextdoor.company/company-logos/glean.png', title: 'Solutions Architect', location: 'Remote', departments: 'Engineering', applyUrl: '#', ranking: 'good_match', matchInsights: ['Your work contributed to significant revenue growth providing clear metrics of business impact.', 'You have demonstrated strong technical capabilities through architecture of complex systems.', 'You have shown strong problem-solving skills by leading resolution of infrastructure bottlenecks.'], industry: 'AI, Enterprise Search, SaaS', about: 'Glean is the AI-powered work assistant that connects to all your company data.', foundedYear: 2019, fundingStage: 'series-e', totalFunding: '$800 million+', founderName: '', founderRole: '', founderImage: '' },
      // 11 Worth a Shot
      ...['Tide', 'Celonis', 'Sigmoid', 'Headout', 'Atoms', 'Gomotive', 'Tubi', 'Chainguard', 'Skild Ai', 'Zenoti', 'Tamara'].map((company, i) => ({
        id: 13 + i,
        company,
        companyInitials: company.substring(0, 2).toUpperCase(),
        logo: `https://nextdoor.company/company-logos/${company.toLowerCase().replace(/\s+/g, '-')}.png`,
        title: ['Engineering Manager', 'Platform Engineer', 'Data Architect', 'Account Manager', 'Hardware Engineering', 'Senior SRE', 'SRE Manager', 'VP Engineering', 'Electrical Engineer', 'Technical Support', 'Data Engineer'][i],
        location: ['India', 'London, UK', 'Dallas, USA', 'Paris, France', 'Remote, USA', 'Remote', 'San Francisco', 'Remote, US', 'Pittsburgh, USA', 'Seattle, US', 'Riyadh, Saudi Arabia'][i],
        departments: 'Engineering',
        applyUrl: '#',
        ranking: 'worth_a_shot',
        matchInsights: ['Your technical background shows relevant experience for this role.', 'You have demonstrated project ownership and delivery capabilities.', 'Your career trajectory shows consistent growth and increasing responsibilities.'],
        industry: '', about: '', foundedYear: '', fundingStage: '', totalFunding: '', founderName: '', founderRole: '', founderImage: '',
      })),
    ];
    setMatchedJobs(mockJobs);
    setMatchingState('complete');
    if (addLog) addLog('Loaded fallback demo data: 7 Strong Match, 5 Good Match, 11 Worth a Shot');
  };

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
            matchInsights: match.match_insights || [],
            founderName: match.founder_name || '',
            founderRole: match.founder_role || '',
            founderImage: match.founder_image || '',
            industry: match.industry || '',
            about: match.about || '',
            foundedYear: match.founded_year || '',
            fundingStage: match.funding_stage || '',
            totalFunding: match.total_funding || '',
          }));
          
          // Sort by ranking tier: strong_match first, good_match next, worth_a_shot last
          const rankOrder = { strong_match: 0, good_match: 1, worth_a_shot: 2 };
          formattedMatches.sort((a, b) => (rankOrder[a.ranking] || 3) - (rankOrder[b.ranking] || 3));

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

              {/* Download Resume Button */}
              {parsedData._fileUrl && (
                <a
                  href={parsedData._fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-download-btn"
                >
                  <i className="ph-bold ph-file-pdf"></i>
                  <span>Download Resume</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Job Matches */}
        <div className="results-view-right">
          <div className="matches-card">
            <div>
              <h2 className="matches-heading">
                {matchingState === 'loading' ? 'Finding Your Matches' : matchedJobs.length > 0 ? `Your Top ${matchedJobs.length} Matches` : 'No Matches Found'}
              </h2>
              <p className="matches-subtext">
                {matchingState === 'loading'
                  ? 'Looking for matches across 1,000+ engineering roles...'
                  : matchedJobs.length > 0
                    ? `Found ${matchedJobs.length} strong matches for your profile`
                    : 'This may be due to rate limits or timeouts. Try again in a minute.'
                }
              </p>
              {matchingState === 'complete' && matchedJobs.length === 0 && (
                <button
                  onClick={loadFallbackData}
                  className="fallback-data-btn"
                >
                  <i className="ph-bold ph-database"></i>
                  <span>Load demo data</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            {matchingState === 'complete' && matchedJobs.length > 0 && (() => {
              const smCount = matchedJobs.filter(j => j.ranking === 'strong_match').length;
              const gmCount = matchedJobs.filter(j => j.ranking === 'good_match').length;
              const wsCount = matchedJobs.filter(j => j.ranking === 'worth_a_shot').length;
              return (
                <div className="tabs-container tabs-container--medium" style={{ marginBottom: '16px' }}>
                  <button
                    className={`tabs-tab ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All <span className="tabs-count">{matchedJobs.length}</span>
                  </button>
                  <button
                    className={`tabs-tab ${activeFilter === 'strong_match' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('strong_match')}
                  >
                    Strong Match <span className="tabs-count">{smCount}</span>
                  </button>
                  <button
                    className={`tabs-tab ${activeFilter === 'good_match' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('good_match')}
                  >
                    Good Match <span className="tabs-count">{gmCount}</span>
                  </button>
                  <button
                    className={`tabs-tab ${activeFilter === 'worth_a_shot' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('worth_a_shot')}
                  >
                    Worth a Shot <span className="tabs-count">{wsCount}</span>
                  </button>
                </div>
              );
            })()}

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
                  {matchedJobs.filter(job => activeFilter === 'all' || job.ranking === activeFilter).map((job) => (
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
                            <i className="ph-bold ph-code"></i>
                            {job.departments}
                          </div>
                          {/* Company Details - founder, industry, funding */}
                          {(job.founderName || job.about) && (
                            <div className="job-card-company-details">
                              {/* Founder row hidden for now */}
                              {job.industry && (
                                <div className="job-card-detail-row">
                                  <i className="ph-bold ph-briefcase"></i>
                                  <span>{job.industry}</span>
                                </div>
                              )}
                              {job.foundedYear && (
                                <div className="job-card-detail-row">
                                  <i className="ph-bold ph-calendar-blank"></i>
                                  <span>Founded: {job.foundedYear}</span>
                                </div>
                              )}
                              {job.totalFunding && (
                                <div className="job-card-detail-row">
                                  <i className="ph-bold ph-coin"></i>
                                  <span>{job.fundingStage ? job.fundingStage.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Funded'} — {job.totalFunding}</span>
                                </div>
                              )}
                              {job.about && (
                                <div className="job-card-about">
                                  <span>{job.about}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {job.matchInsights && job.matchInsights.length > 0 && (
                          <div className="job-leads-match-insights">
                            {job.matchInsights.map((insight, idx) => (
                              <InsightItem key={idx} text={insight} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Row 2: CTA Buttons */}
                      <div className="job-card-cta-row">
                        <button className="job-card-cta-btn">
                          <i className="ph-bold ph-cursor-click"></i>
                          <span>Auto apply</span>
                        </button>
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
