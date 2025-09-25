"use client";
import React, { useState } from 'react';
import { useWeekNavigation } from '@/hooks/calendar/useWeekNavigation';
import { useCalendarData } from '@/hooks/calendar/useCalendarData';
import { CalendarEvent, OrderEventDetails, DemoEventDetails } from '@/types/calendar/calendar';
import { formatDateTimeToKorean } from '@/utils/calendar/calendarUtils';
import CalendarNavigation from './CalendarNavigation';
import WeekView from './WeekView';
import MobileWeekView from './MobileWeekView';
import WeeklyMemo from './WeeklyMemo';
import EventItem from './EventItem';
import { FaSpinner, FaExclamationCircle } from 'react-icons/fa';

interface CalendarProps {
  className?: string;
}

// 이벤트 상세 모달 컴포넌트
const EventDetailModal: React.FC<{
  event: CalendarEvent | null;
  onClose: () => void;
}> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {event.type === 'order' ? '발주' : '시연'} 상세정보
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          <EventItem
            event={event}
            isCompact={false}
            className="mb-4"
          />

          {/* 추가 상세 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-3">상세 정보</h3>

            {event.type === 'order' ? (
              <div className="space-y-2 text-sm">
                <div><strong>발주 ID:</strong> #{event.id}</div>
                <div><strong>신청자:</strong> {(event.details as OrderEventDetails).requester}</div>
                <div><strong>수신자:</strong> {(event.details as OrderEventDetails).receiver}</div>
                <div><strong>연락처:</strong> {(event.details as OrderEventDetails).receiverPhone}</div>
                <div><strong>배송지:</strong> {(event.details as OrderEventDetails).receiverAddress}</div>
                <div><strong>설치일:</strong> {(event.details as OrderEventDetails).installationDate}</div>
                <div><strong>업체:</strong> {(event.details as OrderEventDetails).supplierName}</div>
                <div><strong>패키지:</strong> {(event.details as OrderEventDetails).packageName}</div>
                <div><strong>창고:</strong> {(event.details as OrderEventDetails).warehouseName}</div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div><strong>시연 ID:</strong> #{event.id}</div>
                <div><strong>신청자:</strong> {(event.details as DemoEventDetails).requester}</div>
                <div><strong>현지 담당자:</strong> {(event.details as DemoEventDetails).demoManager}</div>
                <div><strong>담당자 연락처:</strong> {(event.details as DemoEventDetails).demoManagerPhone}</div>
                <div><strong>시연 장소:</strong> {(event.details as DemoEventDetails).demoAddress}</div>
                <div><strong>물품 상차 일시:</strong> {formatDateTimeToKorean((event.details as DemoEventDetails).demoStartDate, (event.details as DemoEventDetails).demoStartTime, (event.details as DemoEventDetails).demoStartDeliveryMethod)}</div>
                <div><strong>물품 하차 일시:</strong> {formatDateTimeToKorean((event.details as DemoEventDetails).demoEndDate, (event.details as DemoEventDetails).demoEndTime, (event.details as DemoEventDetails).demoEndDeliveryMethod)}</div>
                <div><strong>창고:</strong> {(event.details as DemoEventDetails).warehouseName}</div>
              </div>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ className = '' }) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 주 네비게이션 훅
  const {
    currentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    isCurrentWeek,
  } = useWeekNavigation();

  // 캘린더 데이터 조회
  const { data, isLoading, error } = useCalendarData(currentWeek);

  // 이벤트 클릭 핸들러
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <FaSpinner className="text-4xl text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">캘린더 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-2">캘린더 데이터를 불러오는데 실패했습니다</p>
          <p className="text-gray-500 text-sm">잠시 후 다시 시도해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 네비게이션 */}
      <CalendarNavigation
        weekInfo={currentWeek}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onToday={goToToday}
        isCurrentWeek={isCurrentWeek}
      />

      {/* 색상 범례 - 반응형 */}
      <div className="flex justify-center gap-4 md:gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
          <span className="text-xs md:text-sm font-medium text-gray-700">발주 일정</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded"></div>
          <span className="text-xs md:text-sm font-medium text-gray-700">시연 일정</span>
        </div>
      </div>

      {/* 주별 캘린더 뷰 - 반응형 */}
      {/* 데스크톱 뷰 (md 이상) */}
      <div className="hidden md:block">
        <WeekView
          weekInfo={currentWeek}
          events={data?.events || []}
          onEventClick={handleEventClick}
        />
      </div>

      {/* 모바일 뷰 (md 미만) */}
      <div className="block md:hidden">
        <MobileWeekView
          weekInfo={currentWeek}
          events={data?.events || []}
          onEventClick={handleEventClick}
        />
      </div>

      {/* 주별 메모 */}
      <WeeklyMemo
        weekInfo={currentWeek}
      />

      {/* 이벤트 상세 모달 */}
      <EventDetailModal
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Calendar;