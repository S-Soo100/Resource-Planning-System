/**
 * 팀 활동 대시보드 컴포넌트 (v3.2 - SSE 실시간 방식)
 */
'use client';

import React, { useState } from 'react';
import { Card, Tag, Timeline, Checkbox, Empty } from 'antd';
import { LoadingCentered } from '@/components/ui/Loading';
import { TeamOutlined } from '@ant-design/icons';
import { useTeamChangeHistorySSE } from '@/hooks/useTeamChangeHistorySSE';
import SSEConnectionStatus from '@/components/common/SSEConnectionStatus';
import type { TeamHistoryEvent, EntityType } from '@/types/change-history';
import {
  getEntityTypeLabel,
  getEntityTypeColor,
  getEntityTypeIcon,
  getActionLabel,
  getActionColor,
  formatDateTime,
} from '@/utils/changeHistory';

interface TeamActivityDashboardProps {
  teamId: number;
  teamName: string;
}

const TeamActivityDashboard: React.FC<TeamActivityDashboardProps> = ({
  teamId,
  teamName,
}) => {
  const [events, setEvents] = useState<TeamHistoryEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<EntityType[]>(['demo', 'order', 'item']);
  const [isConnecting, setIsConnecting] = useState(true);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | undefined>(undefined);

  // 팀별 SSE 연결
  const { isConnected } = useTeamChangeHistorySSE(teamId, {
    enabled: true,
    types: selectedTypes,
    onEvent: (event) => {
      // 새 이벤트를 리스트 맨 앞에 추가 (최신순)
      setEvents((prev) => [event, ...prev].slice(0, 50)); // 최대 50개까지만 유지
      setIsConnecting(false);
    },
    onHeartbeat: (timestamp) => {
      setLastHeartbeat(new Date(timestamp));
      setIsConnecting(false);
    },
    onError: () => {
      setIsConnecting(false);
    },
  });

  // 타입 필터 변경
  const handleTypeChange = (checkedValues: EntityType[]) => {
    setSelectedTypes(checkedValues);
    setEvents([]); // 필터 변경 시 기존 이벤트 초기화
  };

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TeamOutlined />
            {teamName} 실시간 활동
          </span>
          <div className="flex items-center gap-2">
            <SSEConnectionStatus
              isConnected={isConnected}
              lastHeartbeat={lastHeartbeat}
            />
          </div>
        </div>
      }
      className="mb-6"
    >
      {/* 타입 필터 */}
      <div className="mb-4">
        <Checkbox.Group
          value={selectedTypes}
          onChange={handleTypeChange as any}
        >
          <Checkbox value="demo">시연</Checkbox>
          <Checkbox value="order">주문</Checkbox>
          <Checkbox value="item">재고</Checkbox>
        </Checkbox.Group>
      </div>

      {/* 로딩 상태 */}
      {isConnecting && (
        <div className="text-center py-8">
          <LoadingCentered />
          <p className="mt-2 text-gray-500">실시간 연결 중...</p>
        </div>
      )}

      {/* 이벤트 리스트 */}
      {!isConnecting && events.length === 0 && (
        <Empty
          description="아직 활동이 없습니다"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {!isConnecting && events.length > 0 && (
        <Timeline
          items={events.map((event) => ({
            color: getActionColor(event.action),
            dot: getEntityTypeIcon(event.entityType),
            children: (
              <div key={event.id} className="mb-2">
                {/* 엔티티 타입 + 액션 */}
                <div className="flex items-center gap-2 mb-1">
                  <Tag color={getEntityTypeColor(event.entityType)}>
                    {getEntityTypeLabel(event.entityType)}
                  </Tag>
                  <Tag color={getActionColor(event.action)}>
                    {getActionLabel(event.action)}
                  </Tag>
                  <span className="text-gray-500 text-sm">
                    {formatDateTime(event.createdAt)}
                  </span>
                </div>

                {/* 엔티티 ID */}
                <div className="text-sm text-gray-600 mb-2">
                  ID: {event.entityId}
                </div>

                {/* 변경 내용 */}
                {event.fieldLabel && (
                  <div className="text-sm mb-2">
                    <span className="font-semibold text-gray-700">{event.fieldLabel}</span> 변경
                  </div>
                )}

                {/* oldValue → newValue 비교 (update 액션일 때만) */}
                {event.action === 'update' && (event.oldValue || event.newValue) && (
                  <div className="text-sm mb-2 bg-blue-50 p-2 rounded">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-mono flex-1">
                        {typeof event.oldValue === 'object'
                          ? JSON.stringify(event.oldValue, null, 2)
                          : event.oldValue || '(없음)'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-mono flex-1">
                        {typeof event.newValue === 'object'
                          ? JSON.stringify(event.newValue, null, 2)
                          : event.newValue || '(없음)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* create/delete 액션일 때 값 표시 */}
                {event.action === 'create' && event.newValue && (
                  <div className="text-sm mb-2 bg-green-50 p-2 rounded">
                    <span className="text-gray-600">생성 값:</span>{' '}
                    <span className="font-mono text-green-600">
                      {typeof event.newValue === 'object'
                        ? JSON.stringify(event.newValue, null, 2)
                        : event.newValue}
                    </span>
                  </div>
                )}

                {event.action === 'delete' && event.oldValue && (
                  <div className="text-sm mb-2 bg-red-50 p-2 rounded">
                    <span className="text-gray-600">삭제 값:</span>{' '}
                    <span className="font-mono text-red-600">
                      {typeof event.oldValue === 'object'
                        ? JSON.stringify(event.oldValue, null, 2)
                        : event.oldValue}
                    </span>
                  </div>
                )}

                {/* 작업자 정보 (이름 + 이메일) */}
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{event.userName}</span>
                  {event.userEmail && (
                    <span className="text-gray-500"> ({event.userEmail})</span>
                  )}
                  님이 변경했습니다
                </div>

                {/* 비고 */}
                {event.remarks && (
                  <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    💬 {event.remarks}
                  </div>
                )}
              </div>
            ),
          }))}
        />
      )}
    </Card>
  );
};

export default TeamActivityDashboard;
