import React from 'react';
import { Compass, FileText, List } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-8">
      {/* Discover */}
      <div className="flex flex-col items-center space-y-2 opacity-40 cursor-not-allowed">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <Compass size={24} className="text-gray-600" />
        </div>
        <span className="text-xs text-gray-600">Discover</span>
      </div>

      {/* Recommended Jobs - Active */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
          <FileText size={24} className="text-white" />
        </div>
        <span className="text-xs text-gray-900 font-medium">Resume</span>
      </div>

      {/* Track */}
      <div className="flex flex-col items-center space-y-2 opacity-40 cursor-not-allowed">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <List size={24} className="text-gray-600" />
        </div>
        <span className="text-xs text-gray-600">Track</span>
      </div>
    </aside>
  );
};