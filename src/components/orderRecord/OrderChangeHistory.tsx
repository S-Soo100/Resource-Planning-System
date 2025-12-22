/**
 * Order 변경 이력 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Button, Timeline, Pagination, Radio, Empty, Alert, Spin } from 'antd';
import { HistoryOutlined, UpOutlined, DownOutlined, DownloadOutlined } from '@ant-design/icons';
import { useOrderChangeHistory } from '@/hooks/useChangeHistory';
import { useChangeHistorySSE } from '@/hooks/useChangeHistorySSE';
import ChangeHistoryItem from '@/components/common/ChangeHistoryItem';
import { getActionColor, getActionIcon } from '@/utils/changeHistory';
import { exportChangeHistory } from '@/utils/exportChangeHistory';
import type { ChangeAction } from '@/types/change-history';

interface OrderChangeHistoryProps {
  orderId: number;
}

const OrderChangeHistory: React.FC<OrderChangeHistoryProps> = ({ orderId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<ChangeAction | undefined>(undefined);

  const { data, isLoading, isError, error } = useOrderChangeHistory(
    orderId,
    {
      page,
      limit: 10,
      action: actionFilter,
    },
    isExpanded // 펼쳤을 때만 API 호출
  );

  // SSE 실시간 알림
  useChangeHistorySSE('order', orderId, isExpanded);

  // 에러 처리
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HistoryOutlined />
          변경 이력
        </h3>
        <Alert
          type="error"
          message="변경 이력을 불러올 수 없습니다"
          description={(error as Error)?.message || '알 수 없는 오류가 발생했습니다'}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HistoryOutlined />
          변경 이력
          {data && (
            <span className="text-sm text-gray-500">(총 {data.meta.total}건)</span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {/* 엑셀 내보내기 버튼 */}
          {isExpanded && data && data.data.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportChangeHistory(data.data, 'order', orderId)}
            >
              엑셀 내보내기
            </Button>
          )}

          {/* 접기/펼치기 버튼 */}
          <Button
            type="text"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '접기' : '펼치기'}
          </Button>
        </div>
      </div>

      {/* 펼쳤을 때만 표시 */}
      {isExpanded && (
        <>
          {/* 필터 */}
          <div className="mb-4">
            <Radio.Group
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1); // 필터 변경 시 첫 페이지로
              }}
            >
              <Radio.Button value={undefined}>전체</Radio.Button>
              <Radio.Button value="create">생성</Radio.Button>
              <Radio.Button value="update">수정</Radio.Button>
              <Radio.Button value="status_change">상태 변경</Radio.Button>
              <Radio.Button value="delete">삭제</Radio.Button>
            </Radio.Group>
          </div>

          {/* 로딩 중 */}
          {isLoading && (
            <div className="text-center py-8">
              <Spin />
              <p className="mt-2 text-gray-500">변경 이력을 불러오는 중...</p>
            </div>
          )}

          {/* 데이터 없음 */}
          {!isLoading && data?.data.length === 0 && (
            <Empty
              description="변경 이력이 없습니다"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {/* 타임라인 */}
          {!isLoading && data && data.data.length > 0 && (
            <>
              <Timeline
                items={data.data.map((item) => ({
                  color: getActionColor(item.action),
                  dot: getActionIcon(item.action),
                  children: <ChangeHistoryItem key={item.id} item={item} />,
                }))}
              />

              {/* 페이지네이션 */}
              {data.meta.totalPages > 1 && (
                <Pagination
                  current={page}
                  total={data.meta.total}
                  pageSize={data.meta.limit}
                  onChange={(newPage) => setPage(newPage)}
                  showSizeChanger={false}
                  className="mt-4 text-center"
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OrderChangeHistory;
