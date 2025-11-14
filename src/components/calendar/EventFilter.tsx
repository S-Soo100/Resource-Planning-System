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
  const [isExpanded, setIsExpanded] = React.useState(false);

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

  // 모두 선택/해제
  const selectAllDemo = () => {
    onDemoStatusChange(Object.values(DemoStatus));
  };

  const deselectAllDemo = () => {
    onDemoStatusChange([]);
  };

  const selectAllOrder = () => {
    onOrderStatusChange(Object.values(OrderStatus));
  };

  const deselectAllOrder = () => {
    onOrderStatusChange([]);
  };

  const totalSelected = selectedDemoStatuses.length + selectedOrderStatuses.length;
  const allDemoSelected = selectedDemoStatuses.length === Object.values(DemoStatus).length;
  const allOrderSelected = selectedOrderStatuses.length === Object.values(OrderStatus).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaFilter className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">이벤트 필터</h3>
          {totalSelected > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
              {totalSelected}개 선택됨
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* 시연 이벤트 필터 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">시연 이벤트</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAllDemo}
                  disabled={allDemoSelected}
                  className="text-xs text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  전체 선택
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAllDemo}
                  disabled={selectedDemoStatuses.length === 0}
                  className="text-xs text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  전체 해제
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(demoStatusLabels).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => toggleDemoStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedDemoStatuses.includes(status)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 발주 이벤트 필터 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">발주 이벤트</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAllOrder}
                  disabled={allOrderSelected}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  전체 선택
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAllOrder}
                  disabled={selectedOrderStatuses.length === 0}
                  className="text-xs text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  전체 해제
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(orderStatusLabels).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => toggleOrderStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
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

          {/* 필터 초기화 버튼 */}
          {totalSelected > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  selectAllDemo();
                  selectAllOrder();
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimes />
                모든 필터 초기화
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventFilter;
