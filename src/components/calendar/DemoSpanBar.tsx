"use client";
import React from 'react';
import { DemoEventDetails, CalendarEvent } from '@/types/calendar/calendar';
import { FaTheaterMasks } from 'react-icons/fa';

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 */
const dateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 두 날짜가 같은지 비교 (문자열 기반)
 */
const isSameDate = (date: Date, dateStr: string): boolean => {
  return dateToString(date) === dateStr.split('T')[0];
};

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
  const dateHeaderHeight = 28; // 날짜 영역 높이 (text-sm + mb-1 + padding)
  const layerOffset = dateHeaderHeight + (layerIndex * (barHeight + 4)); // 날짜 아래 + 레이어별 간격

  const gridColumnStyle = {
    gridColumn: `${startColumn} / ${endColumn + 1}`,
    gridRow: `${rowIndex + 1}`, // content 영역에 위치
    top: `${layerOffset}px`,
    zIndex: 5 + layerIndex, // 날짜(z-20)보다 낮게 설정
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

// 시연 바 정보 타입
interface DemoBarInfo {
  demoId: number;
  demo: CalendarEvent & { type: 'demo' };
  weekSpans: Array<{
    week: number;
    startCol: number;
    endCol: number;
  }>;
}

// 두 시연 바가 겹치는지 확인
const doBarsOverlap = (bar1: DemoBarInfo, bar2: DemoBarInfo): boolean => {
  for (const span1 of bar1.weekSpans) {
    for (const span2 of bar2.weekSpans) {
      if (span1.week === span2.week) {
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

    while (layerIndex < layers.length) {
      const hasOverlap = layers[layerIndex].some(existingBar =>
        doBarsOverlap(barInfo, existingBar)
      );

      if (!hasOverlap) {
        break;
      }
      layerIndex++;
    }

    if (layerIndex >= layers.length) {
      layers.push([]);
    }

    layers[layerIndex].push(barInfo);
    layerMap.set(barInfo.demoId, layerIndex);
  });

  return layerMap;
};

// 월간 뷰용 시연 연결 바 컨테이너
interface MonthDemoSpanBarsProps {
  demos: (CalendarEvent & { type: 'demo' })[];
  monthWeeks: Date[][]; // 6주 x 7일 배열
  onDemoClick?: (demo: CalendarEvent) => void;
}

// 월간 뷰용 정확한 레이어 개수 계산
export const calculateMonthMaxLayers = (
  demos: (CalendarEvent & { type: 'demo' })[],
  monthWeeks: Date[][]
): number => {
  if (demos.length === 0) return 0;

  // 날짜 → 인덱스 맵 생성 (YYYY-MM-DD → 인덱스)
  const dateMap = new Map<string, number>();
  monthWeeks.flat().forEach((date, index) => {
    dateMap.set(dateToString(date), index);
  });

  // 시연들을 ID별로 그룹화
  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();
  demos.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (!demoGroups.has(demoDetails.id)) {
      demoGroups.set(demoDetails.id, []);
    }
    demoGroups.get(demoDetails.id)!.push(demo);
  });

  const barInfos: DemoBarInfo[] = [];

  demoGroups.forEach((demoEvents, demoId) => {
    // 각 시연의 날짜들을 인덱스로 변환
    const dateIndices: number[] = [];
    demoEvents.forEach(event => {
      const eventDateStr = event.date.split('T')[0];
      const index = dateMap.get(eventDateStr);
      if (index !== undefined) {
        dateIndices.push(index);
      }
    });

    if (dateIndices.length === 0) return;

    dateIndices.sort((a, b) => a - b);
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
      weekSpans.push({
        week: startWeek,
        startCol: startDay + 1,
        endCol: endDay + 1
      });
    } else {
      weekSpans.push({
        week: startWeek,
        startCol: startDay + 1,
        endCol: 7
      });
      for (let week = startWeek + 1; week < endWeek; week++) {
        weekSpans.push({
          week: week,
          startCol: 1,
          endCol: 7
        });
      }
      weekSpans.push({
        week: endWeek,
        startCol: 1,
        endCol: endDay + 1
      });
    }

    barInfos.push({
      demoId,
      demo: demoEvents[0],
      weekSpans
    });
  });

  const layerMap = assignLayers(barInfos);
  return layerMap.size > 0 ? Math.max(...layerMap.values()) + 1 : 0;
};

export const MonthDemoSpanBars: React.FC<MonthDemoSpanBarsProps> = ({
  demos,
  monthWeeks,
  onDemoClick,
}) => {
  // 날짜 → 인덱스 맵 생성
  const dateMap = new Map<string, number>();
  monthWeeks.flat().forEach((date, index) => {
    dateMap.set(dateToString(date), index);
  });

  // 시연들을 ID별로 그룹화
  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();
  demos.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (!demoGroups.has(demoDetails.id)) {
      demoGroups.set(demoDetails.id, []);
    }
    demoGroups.get(demoDetails.id)!.push(demo);
  });

  const barInfos: DemoBarInfo[] = [];

  demoGroups.forEach((demoEvents, demoId) => {
    // 각 시연의 날짜들을 인덱스로 변환
    const dateIndices: number[] = [];
    demoEvents.forEach(event => {
      const eventDateStr = event.date.split('T')[0];
      const index = dateMap.get(eventDateStr);
      if (index !== undefined) {
        dateIndices.push(index);
      }
    });

    if (dateIndices.length === 0) return;

    dateIndices.sort((a, b) => a - b);
    const startIndex = dateIndices[0];
    const endIndex = dateIndices[dateIndices.length - 1];

    const startWeek = Math.floor(startIndex / 7);
    const startDay = startIndex % 7;
    const endWeek = Math.floor(endIndex / 7);
    const endDay = endIndex % 7;

    const weekSpans = [];
    if (startWeek === endWeek) {
      weekSpans.push({
        week: startWeek,
        startCol: startDay + 1,
        endCol: endDay + 1
      });
    } else {
      weekSpans.push({
        week: startWeek,
        startCol: startDay + 1,
        endCol: 7
      });
      for (let week = startWeek + 1; week < endWeek; week++) {
        weekSpans.push({
          week: week,
          startCol: 1,
          endCol: 7
        });
      }
      weekSpans.push({
        week: endWeek,
        startCol: 1,
        endCol: endDay + 1
      });
    }

    barInfos.push({
      demoId,
      demo: demoEvents[0],
      weekSpans
    });
  });

  // 레이어 할당
  const layerMap = assignLayers(barInfos);

  // 실제 바 컴포넌트들 생성
  const spanBars = barInfos.flatMap(barInfo => {
    const layerIndex = layerMap.get(barInfo.demoId) || 0;

    return barInfo.weekSpans.map(span => (
      <DemoSpanBar
        key={`${barInfo.demoId}-week-${span.week}`}
        demo={barInfo.demo}
        startColumn={span.startCol}
        endColumn={span.endCol}
        rowIndex={span.week}
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

// 주간 뷰용 시연 연결 바 컨테이너
interface WeekDemoSpanBarsProps {
  demos: (CalendarEvent & { type: 'demo' })[];
  weekDays: Date[];
  onDemoClick?: (demo: CalendarEvent) => void;
}

interface WeekBarInfo {
  demoId: number;
  demo: CalendarEvent & { type: 'demo' };
  startCol: number;
  endCol: number;
}

const doWeekBarsOverlap = (bar1: WeekBarInfo, bar2: WeekBarInfo): boolean => {
  return !(bar1.endCol < bar2.startCol || bar2.endCol < bar1.startCol);
};

const assignWeekLayers = (barInfos: WeekBarInfo[]): Map<number, number> => {
  const layerMap = new Map<number, number>();
  const layers: WeekBarInfo[][] = [];

  barInfos.forEach(barInfo => {
    let layerIndex = 0;

    while (layerIndex < layers.length) {
      const hasOverlap = layers[layerIndex].some(existingBar =>
        doWeekBarsOverlap(barInfo, existingBar)
      );

      if (!hasOverlap) {
        break;
      }
      layerIndex++;
    }

    if (layerIndex >= layers.length) {
      layers.push([]);
    }

    layers[layerIndex].push(barInfo);
    layerMap.set(barInfo.demoId, layerIndex);
  });

  return layerMap;
};

export const calculateWeekMaxLayers = (
  demos: (CalendarEvent & { type: 'demo' })[],
  weekDays: Date[]
): number => {
  if (demos.length === 0) return 0;

  // 날짜 → 인덱스 맵 생성
  const dateMap = new Map<string, number>();
  weekDays.forEach((date, index) => {
    dateMap.set(dateToString(date), index);
  });

  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();
  demos.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (!demoGroups.has(demoDetails.id)) {
      demoGroups.set(demoDetails.id, []);
    }
    demoGroups.get(demoDetails.id)!.push(demo);
  });

  const barInfos: WeekBarInfo[] = [];

  demoGroups.forEach((demoEvents, demoId) => {
    const dateIndices: number[] = [];
    demoEvents.forEach(event => {
      const eventDateStr = event.date.split('T')[0];
      const index = dateMap.get(eventDateStr);
      if (index !== undefined) {
        dateIndices.push(index);
      }
    });

    if (dateIndices.length === 0) return;

    dateIndices.sort((a, b) => a - b);
    const startCol = dateIndices[0] + 1;
    const endCol = dateIndices[dateIndices.length - 1] + 1;

    barInfos.push({
      demoId,
      demo: demoEvents[0],
      startCol,
      endCol
    });
  });

  const layerMap = assignWeekLayers(barInfos);
  return layerMap.size > 0 ? Math.max(...layerMap.values()) + 1 : 0;
};

export const WeekDemoSpanBars: React.FC<WeekDemoSpanBarsProps> = ({
  demos,
  weekDays,
  onDemoClick,
}) => {
  // 날짜 → 인덱스 맵 생성
  const dateMap = new Map<string, number>();
  weekDays.forEach((date, index) => {
    dateMap.set(dateToString(date), index);
  });

  const demoGroups = new Map<number, (CalendarEvent & { type: 'demo' })[]>();
  demos.forEach(demo => {
    const demoDetails = demo.details as DemoEventDetails;
    if (!demoGroups.has(demoDetails.id)) {
      demoGroups.set(demoDetails.id, []);
    }
    demoGroups.get(demoDetails.id)!.push(demo);
  });

  const barInfos: WeekBarInfo[] = [];

  demoGroups.forEach((demoEvents, demoId) => {
    const dateIndices: number[] = [];
    demoEvents.forEach(event => {
      const eventDateStr = event.date.split('T')[0];
      const index = dateMap.get(eventDateStr);
      if (index !== undefined) {
        dateIndices.push(index);
      }
    });

    if (dateIndices.length === 0) return;

    dateIndices.sort((a, b) => a - b);
    const startCol = dateIndices[0] + 1;
    const endCol = dateIndices[dateIndices.length - 1] + 1;

    barInfos.push({
      demoId,
      demo: demoEvents[0],
      startCol,
      endCol
    });
  });

  const layerMap = assignWeekLayers(barInfos);

  const spanBars = barInfos.map(barInfo => {
    const layerIndex = layerMap.get(barInfo.demoId) || 0;

    return (
      <DemoSpanBar
        key={barInfo.demoId}
        demo={barInfo.demo}
        startColumn={barInfo.startCol}
        endColumn={barInfo.endCol}
        rowIndex={1}
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
