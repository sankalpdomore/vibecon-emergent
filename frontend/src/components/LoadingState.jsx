import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const JOBS = [
  'Senior Backend Engineer at Emergent',
  'Full Stack Developer at TechCorp',
  'Frontend Engineer at StartupXYZ',
  'DevOps Engineer at CloudScale',
  'Machine Learning Engineer at DataScience Inc',
  'Product Engineer at InnovateLabs',
  'Software Engineer at BuildFast',
  'Backend Developer at APIFirst',
  'React Developer at WebSolutions',
  'Platform Engineer at InfraTeam'
];

export const LoadingState = ({ message = "Analyzing your resume" }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 2;
        }
        return prev;
      });
    }, 60);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md">
        <Loader2 className="mx-auto text-blue-500 mb-6 animate-spin" size={64} />
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{message}</h2>
        <p className="text-gray-600 mb-8">Using AI to extract and structure your information</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">Processing...</p>
        </div>
        
        <p className="text-xs text-gray-500">This may take a few moments...</p>
      </div>
    </div>
  );
};