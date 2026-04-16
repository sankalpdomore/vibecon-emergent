import React from 'react';
import { Search, Bookmark, CheckCircle, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Logo and Search */}
      <div className="flex items-center space-x-4 flex-1">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <circle cx="7" cy="12" r="4" />
            <circle cx="17" cy="12" r="4" />
          </svg>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search filters, jobs, startups, or locations..."
            className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            disabled
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-medium">⌘K</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Saved Jobs */}
        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-not-allowed opacity-50">
          <Bookmark size={18} className="text-gray-600" />
          <span className="text-sm text-gray-700">Saved jobs</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">0</span>
        </button>

        {/* Applied Jobs */}
        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-not-allowed opacity-50">
          <CheckCircle size={18} className="text-gray-600" />
          <span className="text-sm text-gray-700">Applied jobs</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">0</span>
        </button>

        {/* Profile */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer">
            <User size={20} className="text-white" />
          </div>
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">LIFETIME</span>
        </div>
      </div>
    </header>
  );
};