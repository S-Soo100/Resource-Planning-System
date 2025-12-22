/**
 * 변경 이력 관련 유틸리티 함수
 */

import React from 'react';
import {
  PlusCircleOutlined,
  EditOutlined,
  SwapOutlined,
  DeleteOutlined,
  StockOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ChangeHistoryItem, ChangeAction, AccessLevel, EntityType } from '@/types/change-history';

/**
 * 액션 타입별 Ant Design 색상 반환
 */
export const getActionColor = (action: ChangeAction): string => {
  switch (action) {
    case 'create':
      return 'green';
    case 'update':
      return 'blue';
    case 'status_change':
      return 'purple';
    case 'delete':
      return 'red';
    case 'quantity_change':
      return 'orange';
    default:
      return 'default';
  }
};

/**
 * 액션 타입별 아이콘 반환
 */
export const getActionIcon = (action: ChangeAction): React.ReactNode => {
  switch (action) {
    case 'create':
      return React.createElement(PlusCircleOutlined);
    case 'update':
      return React.createElement(EditOutlined);
    case 'status_change':
      return React.createElement(SwapOutlined);
    case 'delete':
      return React.createElement(DeleteOutlined);
    case 'quantity_change':
      return React.createElement(StockOutlined);
    default:
      return React.createElement(InfoCircleOutlined);
  }
};

/**
 * 액션 타입별 한글 라벨 반환
 */
export const getActionLabel = (action: ChangeAction | string): string => {
  switch (action) {
    case 'create':
      return '생성';
    case 'update':
      return '수정';
    case 'status_change':
      return '상태 변경';
    case 'delete':
      return '삭제';
    case 'quantity_change':
      return '재고 변동';
    default:
      return action;
  }
};

/**
 * 권한별 Ant Design 색상 반환
 */
export const getAccessLevelColor = (level: AccessLevel): string => {
  switch (level) {
    case 'admin':
      return 'red';
    case 'moderator':
      return 'blue';
    case 'user':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * 권한별 한글 라벨 반환
 */
export const getAccessLevelLabel = (level: AccessLevel | string): string => {
  switch (level) {
    case 'admin':
      return '관리자';
    case 'moderator':
      return '운영자';
    case 'user':
      return '일반';
    default:
      return level;
  }
};

/**
 * 날짜/시간 포맷팅
 * @param isoString ISO8601 형식 문자열
 * @returns "YYYY-MM-DD HH:mm:ss" 형식
 */
export const formatDateTime = (isoString: string): string => {
  return dayjs(isoString).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 값 포맷팅 (oldValue/newValue 객체에서 값 추출 및 표시)
 * @param valueObj 값 객체 ({ fieldName: value } 형태)
 * @param field 필드명
 * @returns 포맷된 문자열
 */
export const formatValue = (
  valueObj: Record<string, any> | null,
  field: string | null
): string => {
  if (!valueObj || !field) return '-';

  const value = valueObj[field];

  if (value === null || value === undefined) return '-';

  // 배열인 경우
  if (Array.isArray(value)) {
    return `${value.length}개 항목`;
  }

  // 객체인 경우
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  // 날짜 필드인 경우
  if (field.toLowerCase().includes('date') || field.toLowerCase().includes('time')) {
    try {
      return formatDateTime(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

/**
 * 재고 변동량 포맷팅
 * @param item 변경 이력 아이템
 * @returns "+15개 (100 → 115)" 형식
 */
export const formatQuantityChange = (item: ChangeHistoryItem): string => {
  const oldQty = item.oldValue?.itemQuantity || 0;
  const newQty = item.newValue?.itemQuantity || 0;
  const diff = newQty - oldQty;

  return `${diff > 0 ? '+' : ''}${diff}개 (${oldQty} → ${newQty})`;
};

/**
 * 재고 변동에 따른 Ant Design 색상 반환
 * @param item 변경 이력 아이템
 * @returns 'green' (증가) | 'red' (감소)
 */
export const getQuantityChangeColor = (item: ChangeHistoryItem): string => {
  const oldQty = item.oldValue?.itemQuantity || 0;
  const newQty = item.newValue?.itemQuantity || 0;

  return newQty > oldQty ? 'green' : 'red';
};

/**
 * 재고 변동에 따른 Tailwind 텍스트 색상 클래스 반환
 * @param item 변경 이력 아이템
 * @returns 'text-green-600' (증가) | 'text-red-600' (감소)
 */
export const getQuantityChangeTextColor = (item: ChangeHistoryItem): string => {
  const oldQty = item.oldValue?.itemQuantity || 0;
  const newQty = item.newValue?.itemQuantity || 0;

  return newQty > oldQty ? 'text-green-600' : 'text-red-600';
};

/**
 * 재고 변동 아이콘 반환
 * @param item 변경 이력 아이템
 * @returns ▲ (증가) | ▼ (감소)
 */
export const getQuantityChangeIcon = (item: ChangeHistoryItem): React.ReactNode => {
  const oldQty = item.oldValue?.itemQuantity || 0;
  const newQty = item.newValue?.itemQuantity || 0;

  return newQty > oldQty ? (
    React.createElement('span', { className: 'text-green-600 font-bold' }, '▲')
  ) : (
    React.createElement('span', { className: 'text-red-600 font-bold' }, '▼')
  );
};

// ============================================================================
// v3.0: 엔티티 타입 관련 함수
// ============================================================================

/**
 * 엔티티 타입별 한글 라벨 반환 (v3.0)
 */
export const getEntityTypeLabel = (type: EntityType): string => {
  switch (type) {
    case 'demo':
      return '시연';
    case 'order':
      return '주문';
    case 'item':
      return '재고';
    default:
      return type;
  }
};

/**
 * 엔티티 타입별 Ant Design 색상 반환 (v3.0)
 */
export const getEntityTypeColor = (type: EntityType): string => {
  switch (type) {
    case 'demo':
      return 'purple';
    case 'order':
      return 'blue';
    case 'item':
      return 'orange';
    default:
      return 'default';
  }
};

/**
 * 엔티티 타입별 아이콘 반환 (v3.0)
 */
export const getEntityTypeIcon = (type: EntityType): React.ReactNode => {
  switch (type) {
    case 'demo':
      return React.createElement(CalendarOutlined);
    case 'order':
      return React.createElement(ShoppingCartOutlined);
    case 'item':
      return React.createElement(InboxOutlined);
    default:
      return React.createElement(InfoCircleOutlined);
  }
};
