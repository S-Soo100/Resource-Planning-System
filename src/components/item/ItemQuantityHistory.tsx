/**
 * Item 재고 변동 이력 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Button, Timeline, Pagination, Empty, Alert, Spin, Tag } from 'antd';
import { StockOutlined, UpOutlined, DownOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import { useItemQuantityHistory } from '@/hooks/useChangeHistory';
import { useChangeHistorySSE } from '@/hooks/useChangeHistorySSE';
import {
  formatDateTime,
  formatQuantityChange,
  getQuantityChangeColor,
  getQuantityChangeTextColor,
  getQuantityChangeIcon,
  getAccessLevelColor,
  getAccessLevelLabel,
} from '@/utils/changeHistory';
import { exportChangeHistory } from '@/utils/exportChangeHistory';

interface ItemQuantityHistoryProps {
  itemId: number;
}

const ItemQuantityHistory: React.FC<ItemQuantityHistoryProps> = ({ itemId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useItemQuantityHistory(
    itemId,
    {
      page,
      limit: 10,
    },
    isExpanded // 펼쳤을 때만 API 호출
  );

  // SSE 실시간 알림
  useChangeHistorySSE('item', itemId, isExpanded);

  // 에러 처리
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <StockOutlined />
          재고 변동 이력
        </h3>
        <Alert
          type="error"
          message="재고 변동 이력을 불러올 수 없습니다"
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
          <StockOutlined />
          재고 변동 이력
          {data && (
            <span className="text-sm text-gray-500">(총 {data.meta.total}건)</span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {/* 엑셀 내보내기 버튼 */}
          {isExpanded && data && data.data.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportChangeHistory(data.data, 'item', itemId)}
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
          {/* 로딩 중 */}
          {isLoading && (
            <div className="text-center py-8">
              <Spin />
              <p className="mt-2 text-gray-500">재고 변동 이력을 불러오는 중...</p>
            </div>
          )}

          {/* 데이터 없음 */}
          {!isLoading && data?.data.length === 0 && (
            <Empty
              description="재고 변동 이력이 없습니다"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {/* 타임라인 */}
          {!isLoading && data && data.data.length > 0 && (
            <>
              <Timeline
                items={data.data.map((item) => ({
                  color: getQuantityChangeColor(item),
                  children: (
                    <div key={item.id}>
                      {/* 증감 표시 */}
                      <div className="flex items-center gap-2 mb-2">
                        {getQuantityChangeIcon(item)}
                        <span className={`font-semibold ${getQuantityChangeTextColor(item)}`}>
                          {formatQuantityChange(item)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>

                      {/* 작업자 정보 */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserOutlined />
                        <span>{item.userName}</span>
                        <Tag color={getAccessLevelColor(item.accessLevel)}>
                          {getAccessLevelLabel(item.accessLevel)}
                        </Tag>
                      </div>

                      {/* 비고 */}
                      {item.remarks && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          💬 {item.remarks}
                        </div>
                      )}
                    </div>
                  ),
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

export default ItemQuantityHistory;
