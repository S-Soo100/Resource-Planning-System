"use client";
import React, { useState } from 'react';
import { CalendarEvent, OrderEventDetails, DemoEventDetails } from '@/types/calendar/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { formatDateTimeToKorean } from '@/utils/calendar/calendarUtils';
import { FaTruck, FaTheaterMasks, FaInfoCircle } from 'react-icons/fa';

interface EventItemProps {
  event: CalendarEvent;
  isCompact?: boolean;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
  isMobile?: boolean;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  isCompact = false,
  onClick,
  className = '',
  isMobile = false,
}) => {
  const { getEventColor, getEventStatusText, getEventSummary } = useCalendarEvents([event]);
  const [isHovered, setIsHovered] = useState(false);

  const colors = getEventColor(event.type);
  const statusText = getEventStatusText(event.status);
  const summary = getEventSummary(event);

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const getEventIcon = () => {
    if (event.type === 'order') {
      return <FaTruck className="text-sm" />;
    } else {
      return <FaTheaterMasks className="text-sm" />;
    }
  };

  const getEventTypeText = () => {
    return event.type === 'order' ? '발주' : '시연';
  };

  if (isCompact) {
    // 컴팩트 뷰 (캘린더 셀 내부용)
    return (
      <div
        className={`
          ${colors.bg} ${colors.text} ${colors.border}
          border-l-4 px-2 py-1 mb-1 rounded-r text-xs cursor-pointer
          hover:shadow-sm transition-all duration-200
          ${className}
        `}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={summary}
      >
        <div className="flex items-center gap-1">
          {getEventIcon()}
          <span className="font-medium truncate">
            {isMobile && `[${getEventTypeText()}] `}{event.title}
          </span>
        </div>
        <div className="text-xs opacity-75 truncate">
          {statusText}
        </div>
      </div>
    );
  }

  // 일반 뷰 (리스트용)
  return (
    <div
      className={`
        ${colors.bg} ${colors.border}
        border-2 rounded-lg p-4 cursor-pointer
        hover:shadow-md transition-all duration-200
        ${isHovered ? 'scale-[1.02]' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`${colors.text}`}>
            {getEventIcon()}
          </div>
          <div>
            <h4 className={`${colors.text} font-semibold`}>
              {isMobile && `[${getEventTypeText()}] `}{event.title}
            </h4>
            <span className="text-xs text-gray-500">
              {getEventTypeText()} #{event.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${colors.text} ${colors.bg}
          `}>
            {statusText}
          </span>
          <FaInfoCircle className="text-gray-400 text-sm" />
        </div>
      </div>

      {/* 상세 정보 */}
      <div className={`${colors.text} text-sm space-y-1`}>
        {event.type === 'order' ? (
          <div>
            <p><strong>수신자:</strong> {(event.details as OrderEventDetails).receiver}</p>
            <p><strong>배송지:</strong> {(event.details as OrderEventDetails).receiverAddress}</p>
            <p><strong>업체:</strong> {(event.details as OrderEventDetails).supplierName}</p>
          </div>
        ) : (
          <div>
            <p><strong>담당자:</strong> {(event.details as DemoEventDetails).demoManager}</p>
            <p><strong>시연지:</strong> {(event.details as DemoEventDetails).demoAddress}</p>
            <p><strong>시작일:</strong> {formatDateTimeToKorean((event.details as DemoEventDetails).demoStartDate, (event.details as DemoEventDetails).demoStartTime, (event.details as DemoEventDetails).demoStartDeliveryMethod)}</p>
          </div>
        )}
      </div>

      {/* 호버 효과 */}
      {isHovered && (
        <div className="mt-2 text-xs text-gray-500">
          클릭하여 자세히 보기
        </div>
      )}
    </div>
  );
};

// 이벤트 도트 컴포넌트 (작은 인디케이터용)
export const EventDot: React.FC<{
  event: CalendarEvent;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ event, size = 'sm', className = '' }) => {
  const { getEventColor } = useCalendarEvents([event]);
  const colors = getEventColor(event.type);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  };

  return (
    <div
      className={`
        ${colors.dot} ${sizeClasses[size]}
        rounded-full inline-block
        ${className}
      `}
      title={`${event.type === 'order' ? '발주' : '시연'}: ${event.title}`}
    />
  );
};

export default EventItem;