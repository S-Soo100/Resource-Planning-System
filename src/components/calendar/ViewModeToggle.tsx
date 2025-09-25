"use client";
import React from 'react';
import { ViewMode } from '@/types/calendar/calendar';
import { FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  className = '',
}) => {
  return (
    <div className={`flex rounded-lg border border-gray-300 bg-gray-50 p-1 ${className}`}>
      {/* 주간 보기 버튼 */}
      <button
        onClick={() => onViewModeChange('week')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${
            viewMode === 'week'
              ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }
        `}
      >
        <FaCalendarWeek className="text-base" />
        <span className="hidden sm:inline">주간 보기</span>
      </button>

      {/* 월간 보기 버튼 */}
      <button
        onClick={() => onViewModeChange('month')}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${
            viewMode === 'month'
              ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }
        `}
      >
        <FaCalendarAlt className="text-base" />
        <span className="hidden sm:inline">월간 보기</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;