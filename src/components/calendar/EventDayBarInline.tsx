"use client";
import React from 'react';
import { CalendarEvent, DemoEventDetails, EventSpanInfo } from '@/types/calendar/calendar';

interface EventDayBarInlineProps {
  demo: CalendarEvent & { type: 'demo' };
  columnIndex: number;
  layerIndex: number;
  showTitle: boolean;
  onDemoClick?: (demo: CalendarEvent) => void;
}

/**
 * 행사 ID별 색상 팔레트 (보라색 계열 - 더 진한 톤)
 */
interface EventColorSet {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

const EVENT_COLOR_PALETTE: EventColorSet[] = [
  { bg: 'bg-purple-200/40', border: '', text: 'text-purple-900', badge: 'bg-purple-600' },
  { bg: 'bg-purple-300/40', border: '', text: 'text-purple-950', badge: 'bg-purple-700' },
  { bg: 'bg-violet-200/40', border: '', text: 'text-violet-900', badge: 'bg-violet-600' },
  { bg: 'bg-violet-300/40', border: '', text: 'text-violet-950', badge: 'bg-violet-700' },
  { bg: 'bg-fuchsia-200/40', border: '', text: 'text-fuchsia-900', badge: 'bg-fuchsia-600' },
  { bg: 'bg-fuchsia-300/40', border: '', text: 'text-fuchsia-950', badge: 'bg-fuchsia-700' },
  { bg: 'bg-indigo-200/40', border: '', text: 'text-indigo-900', badge: 'bg-indigo-600' },
  { bg: 'bg-indigo-300/40', border: '', text: 'text-indigo-950', badge: 'bg-indigo-700' },
];

/**
 * 시연 ID에 따라 색상 선택
 */
function getEventColorByDemoId(demoId: number): EventColorSet {
  const index = demoId % EVENT_COLOR_PALETTE.length;
  return EVENT_COLOR_PALETTE[index];
}

/**
 * 둥근 모서리 스타일 결정
 */
function getRoundedClass(spanInfo: EventSpanInfo | undefined, columnIndex: number): string {
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
 * 테두리 스타일 결정 - 행사 막대는 테두리 없음
 */
function getBorderClass(spanInfo: EventSpanInfo | undefined, columnIndex: number): string {
  return ''; // 테두리 없음
}


/**
 * 각 날짜 셀 내부에 렌더링되는 행사 막대
 */
const EventDayBarInline: React.FC<EventDayBarInlineProps> = ({
  demo,
  columnIndex,
  layerIndex,
  showTitle,
  onDemoClick
}) => {
  const demoDetails = demo.details as DemoEventDetails;
  const eventSpanInfo = demoDetails.eventSpanInfo;

  // 행사 정보가 없거나, 행사 기간에 포함되지 않으면 렌더링하지 않음
  if (!eventSpanInfo || (!eventSpanInfo.isStart && !eventSpanInfo.isMiddle && !eventSpanInfo.isEnd)) {
    return null;
  }

  const demoId = demoDetails.id;
  const colors = getEventColorByDemoId(demoId);

  // 시간 포맷 함수
  const formatTime = (time?: string | null) => {
    if (!time) return '';
    // HH:MM:SS 형식에서 HH:MM만 추출
    return time.substring(0, 5);
  };

  return (
    <div
      className={`
        absolute left-2 right-2 h-6
        ${colors.bg}
        cursor-pointer hover:opacity-60
        transition-opacity duration-200
        ${getRoundedClass(eventSpanInfo, columnIndex)}
        flex items-center justify-end
      `}
      style={{
        top: `${40 + layerIndex * 52 + 8}px`, // 물품 막대 위에 겹쳐서 표시 (8px 아래로)
        zIndex: 6 + layerIndex, // 물품 막대보다 위에 표시
        backdropFilter: 'blur(1px)'
      }}
      onClick={() => onDemoClick?.(demo)}
      title={`행사: ${demoDetails.demoTitle} (${eventSpanInfo?.totalDays || 1}일간)`}
    >
      {/* 시작일에 시작 시간 표시 */}
      {eventSpanInfo.isStart && demoDetails.eventStartTime && (
        <span className="text-[10px] text-purple-700 opacity-70 ml-1 mr-auto font-medium">
          {formatTime(demoDetails.eventStartTime)}
        </span>
      )}
      {/* 종료일에 종료 시간 표시 */}
      {eventSpanInfo.isEnd && demoDetails.eventEndTime && (
        <span className="text-[10px] text-purple-700 opacity-70 mr-1 font-medium">
          {formatTime(demoDetails.eventEndTime)}
        </span>
      )}
    </div>
  );
};

export default EventDayBarInline;