"use client";
import React from 'react';
import { DemoEventDetails, CalendarEvent } from '@/types/calendar/calendar';
import { FaTheaterMasks } from 'react-icons/fa';

interface DemoSpanBarProps {
  demo: CalendarEvent & { type: 'demo' };
  startColumn: number; // 그리드에서 시작 열 (1-based)
  endColumn: number; // 그리드에서 종료 열 (1-based)
  rowIndex: number; // 그리드에서 행 인덱스
  layerIndex?: number; // 레이어 인덱스 (0부터 시작)
  onDemoClick?: (demo: CalendarEvent) => void;
  className?: string;
}

const DemoSpanBar: React.FC<DemoSpanBarProps> = ({
  demo,
  startColumn,
  endColumn,
  rowIndex,
  layerIndex = 0,
  onDemoClick,
  className = '',
}) => {
  const demoDetails = demo.details as DemoEventDetails;
  const spanInfo = demoDetails.spanInfo;

  const handleClick = () => {
    if (onDemoClick) {
      onDemoClick(demo);
    }
  };

  // 연결 바 스타일 - 레이어별로 top 위치 조정
  const barHeight = 32; // 바 높이 (min-h-8 = 32px)
  const layerOffset = layerIndex * (barHeight + 4); // 레이어별 간격 (4px 여백)

  const gridColumnStyle = {
    gridColumn: `${startColumn} / ${endColumn + 1}`,
    gridRow: `${rowIndex + 1}`, // content 영역에 위치
    top: `${layerOffset}px`,
    zIndex: 10 + layerIndex, // 레이어별로 z-index도 조정
  };

  // 시연 상태에 따른 텍스트 및 아이콘
  const getBarContent = () => {
    if (!spanInfo || spanInfo.totalDays === 1) {
      return (
        <div className="flex items-center gap-1 px-2">
          <FaTheaterMasks className="text-sm flex-shrink-0" />
          <span className="font-medium truncate text-sm">
            {demo.title}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3">
        {/* 시작 부분 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <FaTheaterMasks className="text-sm" />
          <span className="font-medium text-sm">
            {demo.title}
          </span>
        </div>

        {/* 중간 진행 표시 */}
        <div className="flex-grow flex items-center justify-center">
          <div className="flex gap-1">
            {Array.from({ length: spanInfo.totalDays }, (_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-purple-600' :
                  index === spanInfo.totalDays - 1 ? 'bg-purple-600' :
                  'bg-purple-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 종료 부분 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">
            {spanInfo.totalDays}일간
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      style={gridColumnStyle}
      className={`
        absolute bg-purple-100 border-2 border-purple-500 text-purple-800
        rounded-lg cursor-pointer hover:shadow-md hover:bg-purple-200
        transition-all duration-200 min-h-8 flex items-center
        mx-1 my-1 overflow-hidden
        ${className}
      `}
      onClick={handleClick}
      title={`${demo.title} (${spanInfo?.totalDays || 1}일간)`}
    >
      {getBarContent()}
    </div>
  );
};

// 월간 뷰용 시연 연결 바 컨테이너
interface MonthDemoSpanBarsProps {
  demos: (CalendarEvent & { type: 'demo' })[];
  monthWeeks: Date[][]; // 6주 x 7일 배열
  onDemoClick?: (demo: CalendarEvent) => void;
}

// 시연 바 정보 타입
interface DemoBarInfo {
  demoId: number;
  demoEvents: (CalendarEvent & { type: 'demo' })[];
  startIndex: number;
  endIndex: number;
  startWeek: number;
  startDay: number;
  endWeek: number;
  endDay: number;
  weekSpans: Array<{
    week: number;
    startCol: number;
    endCol: number;
  }>;
}

// 두 시연 바가 겹치는지 확인
const doBarsOverlap = (bar1: DemoBarInfo, bar2: DemoBarInfo): boolean => {
  // 같은 주에서 겹치는지 확인
  for (const span1 of bar1.weekSpans) {
    for (const span2 of bar2.weekSpans) {
      if (span1.week === span2.week) {
        // 같은 주에서 열이 겹치는지 확인
        if (!(span1.endCol < span2.startCol || span2.endCol < span1.startCol)) {
          return true;
        }
      }
    }
  }
  return false;
};

// 레이어별로 시연 바들을 배치
const assignLayers = (barInfos: DemoBarInfo[]): Map<number, number> => {
  const layerMap = new Map<number, number>();
  const layers: DemoBarInfo[][] = [];

  barInfos.forEach(barInfo => {
    let layerIndex = 0;

    // 기존 레이어들과 겹치지 않는 레이어 찾기
    while (layerIndex < layers.length) {
      const hasOverlap = layers[layerIndex].some(existingBar =>
        doBarsOverlap(barInfo, existingBar)
      );

      if (!hasOverlap) {
        break;
      }
      layerIndex++;
    }

    // 새 레이어가 필요한 경우
    if (layerIndex >= layers.length) {
      layers.push([]);
    }

    layers[layerIndex].push(barInfo);
    layerMap.set(barInfo.demoId, layerIndex);
  });

  return layerMap;
};

export const MonthDemoSpanBars: React.FC<MonthDemoSpanBarsProps> = ({
  demos,
  monthWeeks,
  onDemoClick,
}) => {
  // 모든 날짜를 1차원 배열로 변환 (주 순서대로)
  const allDates = monthWeeks.flat();

  // 시연들을 ID별로 그룹화
  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();

  demos.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (!demoGroups.has(demoDetails.id)) {
      demoGroups.set(demoDetails.id, []);
    }
    demoGroups.get(demoDetails.id)!.push(demo);
  });

  // 각 시연의 바 정보 계산
  const barInfos: DemoBarInfo[] = Array.from(demoGroups.entries()).map(([demoId, demoEvents]) => {
    // 시연의 모든 날짜 인덱스 찾기
    const dateIndices = demoEvents.map(event => {
      const eventDateStr = event.date.split('T')[0];
      const eventDate = new Date(eventDateStr);
      return allDates.findIndex(date =>
        date.getFullYear() === eventDate.getFullYear() &&
        date.getMonth() === eventDate.getMonth() &&
        date.getDate() === eventDate.getDate()
      );
    }).filter(index => index !== -1).sort((a, b) => a - b);

    if (dateIndices.length === 0) return null;

    const startIndex = dateIndices[0];
    const endIndex = dateIndices[dateIndices.length - 1];

    // 시작과 종료 위치를 그리드 좌표로 변환
    const startWeek = Math.floor(startIndex / 7);
    const startDay = startIndex % 7;
    const endWeek = Math.floor(endIndex / 7);
    const endDay = endIndex % 7;

    // 각 주별 스팬 정보 계산
    const weekSpans = [];
    if (startWeek === endWeek) {
      // 같은 주
      weekSpans.push({
        week: startWeek,
        startCol: startDay + 1,
        endCol: endDay + 1
      });
    } else {
      // 첫 번째 주
      weekSpans.push({
        week: startWeek,
        startCol: startDay + 1,
        endCol: 7
      });
      // 중간 주들
      for (let week = startWeek + 1; week < endWeek; week++) {
        weekSpans.push({
          week: week,
          startCol: 1,
          endCol: 7
        });
      }
      // 마지막 주
      weekSpans.push({
        week: endWeek,
        startCol: 1,
        endCol: endDay + 1
      });
    }

    return {
      demoId,
      demoEvents,
      startIndex,
      endIndex,
      startWeek,
      startDay,
      endWeek,
      endDay,
      weekSpans
    };
  }).filter(Boolean) as DemoBarInfo[];

  // 레이어 할당
  const layerMap = assignLayers(barInfos);

  // 실제 바 컴포넌트들 생성
  const spanBars = barInfos.flatMap(barInfo => {
    const layerIndex = layerMap.get(barInfo.demoId) || 0;

    // 각 주별 스팬에 대해 바 생성
    return barInfo.weekSpans.map(span => (
      <DemoSpanBar
        key={`${barInfo.demoId}-week-${span.week}`}
        demo={barInfo.demoEvents[0]}
        startColumn={span.startCol}
        endColumn={span.endCol}
        rowIndex={span.week + 1} // 헤더 다음 행부터
        layerIndex={layerIndex}
        onDemoClick={onDemoClick}
      />
    ));
  });

  return (
    <>
      {spanBars}
    </>
  );
};

// 주간 뷰용 시연 연결 바 컨테이너 (기존 유지)
interface WeekDemoSpanBarsProps {
  demos: (CalendarEvent & { type: 'demo' })[];
  weekDays: Date[];
  onDemoClick?: (demo: CalendarEvent) => void;
}

// 주간 뷰용 바 정보 타입
interface WeekBarInfo {
  demoId: number;
  demoEvents: (CalendarEvent & { type: 'demo' })[];
  startCol: number;
  endCol: number;
}

// 주간 뷰에서 바 겹침 확인
const doWeekBarsOverlap = (bar1: WeekBarInfo, bar2: WeekBarInfo): boolean => {
  return !(bar1.endCol < bar2.startCol || bar2.endCol < bar1.startCol);
};

// 주간 뷰용 레이어 할당
const assignWeekLayers = (barInfos: WeekBarInfo[]): Map<number, number> => {
  const layerMap = new Map<number, number>();
  const layers: WeekBarInfo[][] = [];

  barInfos.forEach(barInfo => {
    let layerIndex = 0;

    // 기존 레이어들과 겹치지 않는 레이어 찾기
    while (layerIndex < layers.length) {
      const hasOverlap = layers[layerIndex].some(existingBar =>
        doWeekBarsOverlap(barInfo, existingBar)
      );

      if (!hasOverlap) {
        break;
      }
      layerIndex++;
    }

    // 새 레이어가 필요한 경우
    if (layerIndex >= layers.length) {
      layers.push([]);
    }

    layers[layerIndex].push(barInfo);
    layerMap.set(barInfo.demoId, layerIndex);
  });

  return layerMap;
};

export const WeekDemoSpanBars: React.FC<WeekDemoSpanBarsProps> = ({
  demos,
  weekDays,
  onDemoClick,
}) => {
  // 시연들을 기간별로 그룹화
  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();

  demos.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (!demoGroups.has(demoDetails.id)) {
      demoGroups.set(demoDetails.id, []);
    }
    demoGroups.get(demoDetails.id)!.push(demo);
  });

  // 각 시연의 바 정보 계산
  const barInfos: WeekBarInfo[] = Array.from(demoGroups.entries()).map(([demoId, demoEvents]) => {
    // 이 주에서 시연의 시작/종료 열 찾기
    const dates = demoEvents.map(event => event.date.split('T')[0]);
    const startDate = Math.min(...dates.map(dateStr => {
      const targetDate = new Date(dateStr);
      return weekDays.findIndex(day =>
        day.getFullYear() === targetDate.getFullYear() &&
        day.getMonth() === targetDate.getMonth() &&
        day.getDate() === targetDate.getDate()
      );
    }).filter(index => index !== -1));

    const endDate = Math.max(...dates.map(dateStr => {
      const targetDate = new Date(dateStr);
      return weekDays.findIndex(day =>
        day.getFullYear() === targetDate.getFullYear() &&
        day.getMonth() === targetDate.getMonth() &&
        day.getDate() === targetDate.getDate()
      );
    }).filter(index => index !== -1));

    // 이 주에 해당 시연이 없으면 스킵
    if (startDate === -1 || endDate === -1) {
      return null;
    }

    return {
      demoId,
      demoEvents,
      startCol: startDate + 1, // CSS Grid는 1-based
      endCol: endDate + 1
    };
  }).filter(Boolean) as WeekBarInfo[];

  // 레이어 할당
  const layerMap = assignWeekLayers(barInfos);

  // 실제 바 컴포넌트들 생성
  const spanBars = barInfos.map(barInfo => {
    const layerIndex = layerMap.get(barInfo.demoId) || 0;

    return (
      <DemoSpanBar
        key={barInfo.demoId}
        demo={barInfo.demoEvents[0]} // 첫 번째 이벤트를 대표로 사용
        startColumn={barInfo.startCol}
        endColumn={barInfo.endCol}
        rowIndex={1} // 주간 뷰는 단일 행
        layerIndex={layerIndex}
        onDemoClick={onDemoClick}
      />
    );
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full">
        {spanBars.map(bar => (
          <div key={bar?.key} className="pointer-events-auto">
            {bar}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoSpanBar;