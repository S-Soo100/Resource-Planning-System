"use client";
import React from 'react';
import { CalendarEvent, DemoEventDetails, DemoSpanInfo } from '@/types/calendar/calendar';

interface DemoDayBarInlineProps {
  demo: CalendarEvent & { type: 'demo' };
  columnIndex: number;
  layerIndex: number;
  showTitle: boolean;
  onDemoClick?: (demo: CalendarEvent) => void;
}

/**
 * 시연 ID별 색상 팔레트
 */
interface ColorSet {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

const COLOR_PALETTE: ColorSet[] = [
  { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', badge: 'bg-purple-500' },
  { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800', badge: 'bg-purple-600' },
  { bg: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-700', badge: 'bg-violet-500' },
  { bg: 'bg-violet-100', border: 'border-violet-500', text: 'text-violet-800', badge: 'bg-violet-600' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-400', text: 'text-fuchsia-700', badge: 'bg-fuchsia-500' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-500', text: 'text-fuchsia-800', badge: 'bg-fuchsia-600' },
  { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-700', badge: 'bg-indigo-500' },
  { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-800', badge: 'bg-indigo-600' },
];

/**
 * 시연 ID에 따라 색상 선택
 */
function getColorByDemoId(demoId: number): ColorSet {
  const index = demoId % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

/**
 * 시연 상태를 짧은 텍스트로 변환
 */
function getDemoStatusShortText(status: string): string {
  const statusMap: Record<string, string> = {
    'requested': '요청',
    'approved': '승인',
    'rejected': '반려',
    'confirmedByShipper': '출준',
    'shipmentCompleted': '출완',
    'rejectedByShipper': '반려',
    'demoCompleted': '종료',
  };
  return statusMap[status] || '요청';
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
 * 테두리 스타일 결정 (중간 블럭은 좌우 테두리 제거)
 */
function getBorderClass(spanInfo: DemoSpanInfo | undefined, columnIndex: number): string {
  if (!spanInfo || spanInfo.totalDays === 1) {
    return 'border-2'; // 1일짜리는 전체 테두리
  }

  const isWeekStart = columnIndex === 0; // 월요일
  const isWeekEnd = columnIndex === 6; // 일요일

  // 시작일: 왼쪽, 위, 아래만
  if (spanInfo.isStart) {
    return 'border-l-2 border-t-2 border-b-2';
  }

  // 종료일: 오른쪽, 위, 아래만
  if (spanInfo.isEnd) {
    return 'border-r-2 border-t-2 border-b-2';
  }

  // 중간일
  if (spanInfo.isMiddle) {
    // 주의 첫날이면 왼쪽 테두리 추가
    if (isWeekStart) return 'border-l-2 border-t-2 border-b-2';
    // 주의 마지막날이면 오른쪽 테두리 추가
    if (isWeekEnd) return 'border-r-2 border-t-2 border-b-2';
    // 그 외: 위아래만
    return 'border-t-2 border-b-2';
  }

  return 'border-2';
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
  const demoId = (demo.details as DemoEventDetails).id;
  const colors = getColorByDemoId(demoId);

  return (
    <div
      className={`
        absolute left-0 right-0 h-8
        ${colors.bg} ${getBorderClass(spanInfo, columnIndex)} ${colors.border} ${colors.text}
        cursor-pointer hover:shadow-md
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
          <span className={`text-xs font-bold ${colors.badge} text-white px-1.5 py-0.5 rounded flex-shrink-0`}>
            {getDemoStatusShortText(demo.status)}
          </span>
          <span className="font-medium truncate text-sm">
            {demo.title}
          </span>
        </div>
      )}
    </div>
  );
};

export default DemoDayBarInline;
