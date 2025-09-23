"use client";
import React, { useState } from 'react';
import { WeekInfo } from '@/types/calendar/calendar';
import { useWeeklyMemoWithAutoSave } from '@/hooks/calendar/useWeeklyMemo';
import { FaStickyNote, FaSave, FaTrash, FaSpinner } from 'react-icons/fa';

interface WeeklyMemoProps {
  weekInfo: WeekInfo;
  className?: string;
}

const WeeklyMemo: React.FC<WeeklyMemoProps> = ({ weekInfo, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    content,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    handleContentChange,
    handleManualSave,
    handleDelete,
  } = useWeeklyMemoWithAutoSave(weekInfo.weekKey);

  const handleSave = async () => {
    await handleManualSave();
  };

  const handleDeleteConfirm = async () => {
    if (window.confirm('이번 주 메모를 삭제하시겠습니까?')) {
      await handleDelete();
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="text-2xl text-gray-400 animate-spin mr-2" />
          <span className="text-gray-600">메모를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <FaStickyNote className="text-gray-500" />
          <span>이번 주 메모</span>
          <span className="text-sm text-gray-500">
            ({weekInfo.year}년 {weekInfo.weekNumber}주차)
          </span>
        </button>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 px-2 py-1 bg-amber-50 rounded">
              저장되지 않음
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded flex items-center gap-1">
              <FaSpinner className="animate-spin" />
              저장 중...
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* 메모 내용 */}
      {isExpanded && (
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="이번 주에 대한 메모를 작성해보세요..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
            disabled={isSaving}
          />

          {/* 버튼 영역 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              {hasUnsavedChanges
                ? '3초 후 자동 저장됩니다'
                : content
                ? '자동 저장됨'
                : '메모를 입력하세요'}
            </div>

            <div className="flex items-center gap-2">
              {content && (
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash className="text-xs" />
                  삭제
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="text-xs" />
                저장
              </button>
            </div>
          </div>

          {/* 메모 상태 정보 */}
          {content && !hasUnsavedChanges && (
            <div className="mt-2 text-xs text-gray-400">
              마지막 저장: 방금 전
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyMemo;