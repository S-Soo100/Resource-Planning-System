"use client";
import React from 'react';
import { CalendarEvent, DemoEventDetails, DemoSpanInfo } from '@/types/calendar/calendar';
import { FaTheaterMasks } from 'react-icons/fa';

interface DemoDayBarInlineProps {
  demo: CalendarEvent & { type: 'demo' };
  columnIndex: number;
  layerIndex: number;
  showTitle: boolean;
  onDemoClick?: (demo: CalendarEvent) => void;
}

/**
 * 둥근 모서리 스타일 결정
 */
function getRoundedClass(spanInfo: DemoSpanInfo | undefined, columnIndex: number): string {
  if (!spanInfo || spanInfo.totalDays === 1) {
    return 'rounded-lg'; // 1일짜리는 완전히 둥글게
  }

  const isWeekStart = columnIndex === 0; // 월요일
  const isWeekEnd = columnIndex === 6; // 일요일

  if (spanInfo.isStart) {
    return 'rounded-l-lg'; // 시작일: 왼쪽만 둥글게
  }

  if (spanInfo.isEnd) {
    return 'rounded-r-lg'; // 종료일: 오른쪽만 둥글게
  }

  if (spanInfo.isMiddle) {
    // 중간일인데 주의 첫날이면 왼쪽 둥글게
    if (isWeekStart) return 'rounded-l-lg';
    // 중간일인데 주의 마지막날이면 오른쪽 둥글게
    if (isWeekEnd) return 'rounded-r-lg';
    // 그 외: 둥글기 없음
    return '';
  }

  return '';
}

/**
 * 각 날짜 셀 내부에 렌더링되는 시연 막대
 */
const DemoDayBarInline: React.FC<DemoDayBarInlineProps> = ({
  demo,
  columnIndex,
  layerIndex,
  showTitle,
  onDemoClick
}) => {
  const spanInfo = (demo.details as DemoEventDetails).spanInfo;

  return (
    <div
      className={`
        absolute left-0 right-0 h-8
        bg-purple-100 border-2 border-purple-500 text-purple-800
        cursor-pointer hover:shadow-md hover:bg-purple-200
        transition-all duration-200 flex items-center
        ${getRoundedClass(spanInfo, columnIndex)}
      `}
      style={{
        top: `${40 + layerIndex * 36}px`,
        zIndex: 5 + layerIndex
      }}
      onClick={() => onDemoClick?.(demo)}
      title={`${demo.title} (${spanInfo?.totalDays || 1}일간)`}
    >
      {showTitle && (
        <div className="flex items-center gap-1 px-2 w-full">
          <FaTheaterMasks className="text-sm flex-shrink-0" />
          <span className="font-medium truncate text-sm">
            {demo.title}
          </span>
        </div>
      )}
    </div>
  );
};

export default DemoDayBarInline;
