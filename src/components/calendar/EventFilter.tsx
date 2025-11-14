"use client";
import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { DemoStatus } from '@/types/demo/demo';
import { OrderStatus } from '@/types/(order)/order';

interface EventFilterProps {
  selectedDemoStatuses: string[];
  selectedOrderStatuses: string[];
  onDemoStatusChange: (statuses: string[]) => void;
  onOrderStatusChange: (statuses: string[]) => void;
}

const EventFilter: React.FC<EventFilterProps> = ({
  selectedDemoStatuses,
  selectedOrderStatuses,
  onDemoStatusChange,
  onOrderStatusChange,
}) => {
  // 시연 상태 레이블 매핑
  const demoStatusLabels: Record<DemoStatus, string> = {
    [DemoStatus.requested]: '요청',
    [DemoStatus.approved]: '승인',
    [DemoStatus.rejected]: '반려',
    [DemoStatus.confirmedByShipper]: '출고자 확인',
    [DemoStatus.shipmentCompleted]: '출고 완료',
    [DemoStatus.rejectedByShipper]: '출고자 반려',
    [DemoStatus.demoCompleted]: '시연 종료',
  };

  // 발주 상태 레이블 매핑
  const orderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.requested]: '요청',
    [OrderStatus.approved]: '승인',
    [OrderStatus.rejected]: '반려',
    [OrderStatus.confirmedByShipper]: '출고자 확인',
    [OrderStatus.shipmentCompleted]: '출고 완료',
    [OrderStatus.rejectedByShipper]: '출고자 반려',
  };

  // 시연 상태 토글
  const toggleDemoStatus = (status: string) => {
    if (selectedDemoStatuses.includes(status)) {
      onDemoStatusChange(selectedDemoStatuses.filter(s => s !== status));
    } else {
      onDemoStatusChange([...selectedDemoStatuses, status]);
    }
  };

  // 발주 상태 토글
  const toggleOrderStatus = (status: string) => {
    if (selectedOrderStatuses.includes(status)) {
      onOrderStatusChange(selectedOrderStatuses.filter(s => s !== status));
    } else {
      onOrderStatusChange([...selectedOrderStatuses, status]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
      {/* 시연 & 발주 필터를 한 줄에 */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        {/* 시연 이벤트 필터 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-purple-700 whitespace-nowrap">시연:</span>
          {Object.entries(demoStatusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => toggleDemoStatus(status)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedDemoStatuses.includes(status)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 구분선 */}
        <div className="hidden md:block w-px h-6 bg-gray-300"></div>

        {/* 발주 이벤트 필터 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-blue-700 whitespace-nowrap">발주:</span>
          {Object.entries(orderStatusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => toggleOrderStatus(status)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedOrderStatuses.includes(status)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventFilter;
