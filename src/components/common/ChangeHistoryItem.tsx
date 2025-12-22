/**
 * 변경 이력 아이템 컴포넌트 (Order/Demo 공통)
 */

import React from 'react';
import { Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ChangeHistoryItem as ChangeHistoryItemType } from '@/types/change-history';
import {
  getActionColor,
  getActionLabel,
  getAccessLevelColor,
  getAccessLevelLabel,
  formatDateTime,
  formatValue,
} from '@/utils/changeHistory';

interface ChangeHistoryItemProps {
  item: ChangeHistoryItemType;
}

const ChangeHistoryItem: React.FC<ChangeHistoryItemProps> = ({ item }) => {
  const {
    action,
    field,
    fieldLabel,
    oldValue,
    newValue,
    userName,
    userEmail,
    accessLevel,
    createdAt,
    remarks,
  } = item;

  return (
    <div className="mb-4">
      {/* 액션 타입 + 시간 */}
      <div className="flex items-center gap-2 mb-2">
        <Tag color={getActionColor(action)}>{getActionLabel(action)}</Tag>
        <span className="text-gray-500 text-sm">{formatDateTime(createdAt)}</span>
      </div>

      {/* 작업자 정보 */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <span className="font-medium">수정자:</span>
        <span>{userName}</span>
        <span className="text-gray-400">({userEmail})</span>
        <Tag color={getAccessLevelColor(accessLevel)}>
          {getAccessLevelLabel(accessLevel)}
        </Tag>
      </div>

      {/* 변경 내용 */}
      {fieldLabel && field && (
        <div className="text-sm mb-2">
          <span className="font-semibold">{fieldLabel}</span> 변경:
          <div className="ml-4 mt-1">
            {oldValue && (
              <div className="text-gray-500">
                <span className="font-medium">이전:</span>{' '}
                {formatValue(oldValue, field)}
              </div>
            )}
            {newValue && (
              <div className="text-blue-600">
                <span className="font-medium">변경:</span>{' '}
                {formatValue(newValue, field)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* create/delete 액션 처리 */}
      {!fieldLabel && action === 'create' && (
        <div className="text-sm text-gray-600">새로 생성됨</div>
      )}
      {!fieldLabel && action === 'delete' && (
        <div className="text-sm text-gray-600">삭제됨</div>
      )}

      {/* 비고 */}
      {remarks && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          💬 {remarks}
        </div>
      )}
    </div>
  );
};

export default ChangeHistoryItem;
