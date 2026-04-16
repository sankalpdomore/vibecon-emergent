import React from 'react';

export const ParsedResumeView = ({ parsedData, onBack }) => {
  const { name, email, phone, summary, skills, experience, education } = parsedData;

  return (
    <div className="resume-builder-wrapper">
      <div className="resume-builder-card">
        <div className="modal-card">
          <div className="modal-card-content-container">
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

              {/* Experience */}
              {experience && experience.length > 0 && (
                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                    Experience
                  </h3>
                  {experience.map((exp, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f9fafb',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e5e5e5',
                        marginBottom: '12px'
                      }}
                    >
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>
                        {exp.role || 'Role'}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                        {exp.company || 'Company'} • {exp.duration || 'Duration'}
                      </p>
                      {exp.description && (
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '8px', lineHeight: '1.5' }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {education && education.length > 0 && (
                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                    Education
                  </h3>
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f9fafb',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e5e5e5',
                        marginBottom: '12px'
                      }}
                    >
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>
                        {edu.degree || 'Degree'}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                        {edu.institution || 'Institution'}
                      </p>
                      <p style={{ fontSize: '13px', color: '#888' }}>
                        {edu.field && `${edu.field} • `}{edu.year || 'Year'}
                      </p>
                    </div>
                  ))}
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
    </div>
  );
};
