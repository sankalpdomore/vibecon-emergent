import React from 'react';
import { CheckCircle, TrendingUp, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

const MatchBadge = ({ score, category }) => {
  const colors = {
    strong: 'bg-green-100 text-green-800 border-green-200',
    improvable: 'bg-amber-100 text-amber-800 border-amber-200',
    not_a_fit: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${colors[category]}`}>
      {score}% Match
    </div>
  );
};

const StrongMatchCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={job.logo} 
            alt={job.company}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
          </div>
        </div>
        <MatchBadge score={job.score} category="strong" />
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle size={18} className="text-green-600" />
          <h4 className="font-semibold text-gray-900">Why you're a great fit</h4>
        </div>
        <p className="text-gray-600 text-sm mb-3">{job.summary}</p>
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Matched Skills</h5>
        <div className="flex flex-wrap gap-2">
          {job.matchedSkills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Matched Experience</h5>
        <ul className="space-y-1">
          {job.matchedExperience.map((exp, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
              <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>{exp}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center justify-center space-x-2">
        <span>View Job & Apply</span>
        <ExternalLink size={16} />
      </button>
    </div>
  );
};

const ImprovableMatchCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={job.logo} 
            alt={job.company}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
          </div>
        </div>
        <MatchBadge score={job.score} category="improvable" />
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp size={18} className="text-amber-600" />
          <h4 className="font-semibold text-gray-900">How to improve your match</h4>
        </div>
        <p className="text-gray-600 text-sm mb-3">You're close to being a great fit. Here's what could strengthen your application:</p>
      </div>

      <div className="space-y-3 mb-4">
        {job.suggestions.map((suggestion, idx) => (
          <div key={idx} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className={`px-2 py-1 rounded text-[10px] font-bold ${
              suggestion.impact === 'high' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-200 text-amber-800'
            }`}>
              {suggestion.impact.toUpperCase()}
            </div>
            <p className="text-sm text-gray-700 flex-1">{suggestion.text}</p>
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
        <span>View Job Details</span>
        <ExternalLink size={16} />
      </button>
    </div>
  );
};

const NotAFitCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow opacity-75">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={job.logo} 
            alt={job.company}
            className="w-12 h-12 rounded-lg object-cover grayscale"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
          </div>
        </div>
        <MatchBadge score={job.score} category="not_a_fit" />
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <XCircle size={18} className="text-red-600" />
          <h4 className="font-semibold text-gray-900">Why this isn't a match</h4>
        </div>
      </div>

      <div className="space-y-2">
        {job.reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
            <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <span>{reason.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResultsState = ({ results, onReset }) => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Job Matches</h1>
            <p className="text-gray-600">Based on your resume analysis</p>
          </div>
          <button 
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Upload New Resume</span>
          </button>
        </div>

        {/* Strong Matches */}
        {results.strongMatches && results.strongMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle size={24} className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Strong Matches</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {results.strongMatches.length}
              </span>
            </div>
            <p className="text-gray-600 mb-6">These roles are an excellent fit for your profile. We recommend applying soon!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.strongMatches.map(job => (
                <StrongMatchCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Improvable Matches */}
        {results.improvableMatches && results.improvableMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp size={24} className="text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900">Improve Your Resume</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                {results.improvableMatches.length}
              </span>
            </div>
            <p className="text-gray-600 mb-6">You're close! Update your resume with these suggestions to increase your match score.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.improvableMatches.map(job => (
                <ImprovableMatchCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Not a Fit */}
        {results.notAFitMatches && results.notAFitMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle size={24} className="text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Not a Fit</h2>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                {results.notAFitMatches.length}
              </span>
            </div>
            <p className="text-gray-600 mb-6">These roles don't align well with your current profile. Consider building skills in these areas if interested.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.notAFitMatches.map(job => (
                <NotAFitCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
