'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { SalesSummary } from '@/components/sales/SalesSummary';
import { exportSalesToExcel } from '@/utils/exportSalesToExcel';
import {
  SalesFilterParams,
  SalesSortField,
  SortDirection,
  SalesRecord,
} from '@/types/sales';

export default function SalesPage() {
  // 필터 상태 (기본값: 이번 달)
  const [filters, setFilters] = useState<SalesFilterParams>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    supplierId: null,
    status: null,
    orderType: 'all',
    searchQuery: '',
    showMissingPriceOnly: false,
  });

  // 정렬 상태
  const [sortField, setSortField] = useState<SalesSortField>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 확장된 행 ID 추적
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // 데이터 조회
  const { data, isLoading, error } = useSalesData(filters);

  // 정렬된 레코드
  const sortedRecords = useMemo(() => {
    if (!data?.records) return [];

    const sorted = [...data.records].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // null 값 처리
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // 문자열 비교
      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // 숫자 비교
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [data?.records, sortField, sortDirection]);

  // 정렬 토글
  const handleSort = (field: SalesSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SalesSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  // 행 확장 토글
  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // 엑셀 다운로드
  const handleExportExcel = () => {
    if (!data?.records) return;
    exportSalesToExcel(data.records);
  };

  // 상태 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-100 text-green-700';
      case '진행중':
        return 'bg-blue-100 text-blue-700';
      case '취소':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">데이터 조회 중 오류가 발생했습니다.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">💰 판매 내역</h1>
        <p className="text-gray-500 mt-2">
          발주 내역을 기반으로 판매 현황을 분석합니다
        </p>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 시작일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              placeholder="제목, 판매처, 수령인, 담당자"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filters.showMissingPriceOnly}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  showMissingPriceOnly: e.target.checked,
                })
              }
              className="mr-2"
            />
            판매가 미입력만 보기
          </label>

          <button
            onClick={handleExportExcel}
            disabled={!data?.records.length}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      {data?.summary && <SalesSummary summary={data.summary} />}

      {/* 판매가 미입력 경고 */}
      {data?.summary && data.summary.missingPriceCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>
              판매가 미입력 발주: {data.summary.missingPriceCount}건
            </strong>
            <br />
            정확한 판매 금액 분석을 위해 판매가 정보를 입력해주세요.
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  No
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('purchaseDate')}
                >
                  <div className="flex items-center">
                    발주일자
                    {renderSortIcon('purchaseDate')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    제목
                    {renderSortIcon('title')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('supplierName')}
                >
                  <div className="flex items-center">
                    판매처
                    {renderSortIcon('supplierName')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  수령인
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                  품목 수
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalPrice')}
                >
                  <div className="flex items-center justify-end">
                    총 금액
                    {renderSortIcon('totalPrice')}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center">
                    상태
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  담당자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRecords.map((record, index) => (
                <>
                  {/* 메인 행 */}
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRow(record.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedRows.has(record.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.purchaseDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.supplierName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {record.receiver}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {record.itemCount}종 {record.totalQuantity}개
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {record.totalPrice !== null ? (
                        `₩${record.totalPrice.toLocaleString()}`
                      ) : (
                        <span className="text-gray-400">미입력</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {record.manager}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {record.memo || '-'}
                    </td>
                  </tr>

                  {/* 확장 행 (품목 상세) */}
                  {expandedRows.has(record.id) && (
                    <tr>
                      <td colSpan={11} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            품목 상세
                          </div>
                          <div className="bg-white rounded border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                    품목명
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                                    품목코드
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                                    수량
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                                    단가
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                                    금액
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {record.orderItems.map((item) => {
                                  const itemPrice = item.sellingPrice ?? null;
                                  const itemTotal =
                                    itemPrice !== null && itemPrice !== undefined
                                      ? itemPrice * item.quantity
                                      : null;

                                  return (
                                    <tr key={item.id}>
                                      <td className="px-3 py-2 text-gray-900">
                                        {item.item?.teamItem?.itemName || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-gray-600">
                                        {item.item?.teamItem?.itemCode || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-900">
                                        {item.quantity}
                                      </td>
                                      <td className="px-3 py-2 text-right text-gray-900">
                                        {itemPrice !== null && itemPrice !== undefined ? (
                                          `₩${itemPrice.toLocaleString()}`
                                        ) : (
                                          <span className="text-gray-400">
                                            미입력
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                                        {itemTotal !== null ? (
                                          `₩${itemTotal.toLocaleString()}`
                                        ) : (
                                          <span className="text-gray-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* 추가 정보 */}
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-600">출고일:</span>{' '}
                              <span className="text-gray-900">
                                {record.originalOrder.outboundDate || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">설치일:</span>{' '}
                              <span className="text-gray-900">
                                {record.originalOrder.installationDate || '-'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">주소:</span>{' '}
                              <span className="text-gray-900">
                                {record.originalOrder.receiverAddress || '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">연락처:</span>{' '}
                              <span className="text-gray-900">
                                {record.originalOrder.receiverPhone || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {/* 합계 행 */}
              {data?.summary && (
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td colSpan={2}></td>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-sm font-bold text-right text-gray-900"
                  >
                    합계
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-center text-gray-900">
                    {data.summary.totalItems}종 {data.summary.totalQuantity}개
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                    ₩{data.summary.totalSales.toLocaleString()}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 데이터 없음 */}
        {sortedRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            조회된 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
