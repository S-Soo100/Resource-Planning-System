"use client";
import React from 'react';
import { CalendarEvent, DemoEventDetails } from '@/types/calendar/calendar';

interface DemoTitleOverlayProps {
  demo: CalendarEvent & { type: 'demo' };
  columnIndex: number; // 시작 열 인덱스 (0~6)
  layerIndex: number; // 레이어 인덱스
  rowIndex?: number; // 주 인덱스 (월간 뷰용, 0~5)
  onDemoClick?: (demo: CalendarEvent) => void;
}

/**
 * 시연 ID별 텍스트 색상 팔레트
 */
const TEXT_COLORS = [
  '#7c3aed', // purple-600
  '#6d28d9', // violet-700
  '#a21caf', // fuchsia-700
  '#5b21b6', // violet-800
  '#86198f', // fuchsia-800
  '#4c1d95', // violet-900
  '#701a75', // fuchsia-900
  '#581c87', // purple-900
];

/**
 * 시연 ID에 따라 색상 선택
 */
function getTextColorByDemoId(demoId: number): string {
  const index = demoId % TEXT_COLORS.length;
  return TEXT_COLORS[index];
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
 * 날짜를 MM/DD 포맷으로 변환
 */
function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

/**
 * 시연 제목을 그리드 위에 오버레이로 표시하는 컴포넌트
 */
const DemoTitleOverlay: React.FC<DemoTitleOverlayProps> = ({
  demo,
  columnIndex,
  layerIndex,
  rowIndex = 0,
  onDemoClick
}) => {
  const spanInfo = (demo.details as DemoEventDetails).spanInfo;
  const demoDetails = demo.details as DemoEventDetails;
  const demoId = demoDetails.id;
  const textColor = getTextColorByDemoId(demoId);

  // 날짜 범위 표시 여부 (여러 날짜에 걸친 시연만)
  const showDateRange = spanInfo && spanInfo.totalDays > 1;

  // 제목이 표시될 셀 개수 계산
  const calculateDisplayDays = (): number => {
    if (!spanInfo) return 1;

    const weekEnd = 6; // 일요일
    const daysUntilWeekEnd = weekEnd - columnIndex + 1;

    if (spanInfo.isStart) {
      // 시작일: 전체 시연 기간 또는 이번 주 끝까지
      return Math.min(spanInfo.totalDays, daysUntilWeekEnd);
    } else if (columnIndex === 0) {
      // 월요일이지만 시작일이 아닌 경우 (주가 바뀐 경우)
      const remainingDays = spanInfo.totalDays - spanInfo.dayIndex;
      return Math.min(remainingDays, daysUntilWeekEnd);
    }

    return 1;
  };

  const displayDays = calculateDisplayDays();
  const cellWidth = 100 / 7; // 각 셀의 너비 (%)

  return (
    <div
      className="absolute pointer-events-none flex flex-col justify-center"
      style={{
        left: `${columnIndex * cellWidth}%`,
        top: `calc(${rowIndex} * (100% / 6) + 40px + ${layerIndex * 52}px)`,
        width: `${displayDays * cellWidth}%`,
        height: '48px',
        zIndex: 20,
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        overflow: 'hidden'
      }}
    >
      <div
        className="font-medium text-sm leading-tight pointer-events-auto cursor-pointer"
        style={{
          whiteSpace: 'nowrap',
          color: textColor,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDemoClick?.(demo);
        }}
      >
        {demo.title}
      </div>
      {showDateRange && (
        <div
          className="text-[10px] opacity-75 leading-tight mt-0.5"
          style={{
            whiteSpace: 'nowrap',
            color: textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {getDemoStatusShortText(demo.status)} · {formatShortDate(demoDetails.demoStartDate)} ~ {formatShortDate(demoDetails.demoEndDate)}
        </div>
      )}
    </div>
  );
};

export default DemoTitleOverlay;
