'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Link from 'next/link';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  FileText,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSalesData } from '@/hooks/useSalesData';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SalesSummary } from '@/components/sales/SalesSummary';
import { exportSalesToExcel } from '@/utils/exportSalesToExcel';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { TransactionStatementModal } from '@/components/sales/TransactionStatementModal';
import { LoadingCentered } from '@/components/ui/Loading';
import { MonthRangePicker } from '@/components/common/MonthRangePicker';
import {
  SalesFilterParams,
  SalesSortField,
  SortDirection,
  SalesRecord,
} from '@/types/sales';

// 미디어 쿼리 훅
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

export default function SalesPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  // 미디어 쿼리
  const isMobile = useMediaQuery('(max-width: 759px)');

  // 권한별 마진 컬럼 표시 여부 (Admin, Moderator만)
  const showMarginColumns =
    user?.accessLevel === 'admin' || user?.accessLevel === 'moderator';

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

  // 거래명세서 모달 상태
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  // 데이터 조회
  const { data, isLoading, error } = useSalesData(filters);

  // 정렬된 레코드
  const sortedRecords = useMemo(() => {
    if (!data?.records) return [];

    // 요청, 반려, 출고자반려 상태 제외
    const filtered = data.records.filter(
      (record) =>
        record.status !== 'requested' &&
        record.status !== 'rejected' &&
        record.status !== 'rejectedByShipper'
    );

    const sorted = [...filtered].sort((a, b) => {
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

  // 필터링된 레코드 기반 요약 데이터 재계산
  const actualSummary = useMemo(() => {
    if (!sortedRecords || sortedRecords.length === 0) {
      return {
        totalOrders: 0,
        totalItems: 0,
        totalQuantity: 0,
        totalSales: 0,
        missingPriceCount: 0,
        totalCost: 0,
        totalMargin: 0,
        averageMarginRate: 0,
        negativeMarginCount: 0,
        missingCostCount: 0,
      };
    }

    const totalItems = sortedRecords.reduce((sum, r) => sum + r.itemCount, 0);
    const totalQuantity = sortedRecords.reduce((sum, r) => sum + r.totalQuantity, 0);
    const totalSales = sortedRecords.reduce(
      (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
      0
    );
    const missingPriceCount = sortedRecords.filter((r) => r.totalPrice === null).length;

    // 마진 분석 요약
    const totalCost = sortedRecords.reduce(
      (sum, r) => (r.costAmount !== null && r.costAmount !== undefined ? sum + r.costAmount : sum),
      0
    );

    const totalMargin = sortedRecords.reduce(
      (sum, r) => (r.marginAmount !== null && r.marginAmount !== undefined ? sum + r.marginAmount : sum),
      0
    );

    const recordsWithMargin = sortedRecords.filter((r) => r.marginRate !== null && r.marginRate !== undefined);
    const averageMarginRate =
      recordsWithMargin.length > 0
        ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
          recordsWithMargin.length
        : 0;

    const negativeMarginCount = sortedRecords.filter((r) => r.isNegativeMargin).length;
    const missingCostCount = sortedRecords.filter((r) => !r.hasCostPrice).length;

    return {
      totalOrders: sortedRecords.length,
      totalItems,
      totalQuantity,
      totalSales,
      missingPriceCount,
      totalCost,
      totalMargin,
      averageMarginRate,
      negativeMarginCount,
      missingCostCount,
    };
  }, [sortedRecords]);

  // 권한 체크: 로그인 및 사용자 로딩 상태
  if (isUserLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingCentered size="lg" />
        </div>
      </div>
    );
  }

  // 권한 체크: Supplier는 접근 불가
  if (!user || user.accessLevel === 'supplier') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              접근 권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              판매 내역 페이지는 팀 멤버만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  // 날짜 포맷 간소화 (2026-02-10T00:00:00.000Z → 26-02-10)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2); // 26
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 02
    const day = date.getDate().toString().padStart(2, '0'); // 10
    return `${year}-${month}-${day}`;
  };

  // 판매 제목 자동 생성
  const generateSalesTitle = (record: SalesRecord) => {
    const { orderItems, originalOrder } = record;

    // 패키지 판매인 경우
    if (originalOrder.packageId && originalOrder.package) {
      const packageName = originalOrder.package.packageName;
      const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      return `${packageName} ${totalQuantity}개 판매`;
    }

    // 품목이 없는 경우
    if (!orderItems || orderItems.length === 0) {
      return '품목 정보 없음';
    }

    // 개별 품목 판매인 경우 (1개 품목)
    if (orderItems.length === 1) {
      const itemName = orderItems[0].item.teamItem.itemName;
      const quantity = orderItems[0].quantity;
      return `${itemName} ${quantity}개 판매`;
    }

    // 여러 품목인 경우 (2개 이상)
    const firstItemName = orderItems[0].item.teamItem.itemName;
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    return `${firstItemName} 등 ${orderItems.length}개 품목 판매`;
  };

  // 메모 텍스트 처리 (최대 2줄, 이후 ... 처리)
  const truncateMemo = (memo: string | null) => {
    if (!memo) return '-';
    const lines = memo.split('\n');
    if (lines.length <= 2) return memo;
    return lines.slice(0, 2).join('\n') + '...';
  };

  // 엑셀 다운로드 (권한별 컬럼 차별화)
  const handleExportExcel = () => {
    if (!data?.records) return;
    exportSalesToExcel(data.records, undefined, showMarginColumns);
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

  // 거래명세서 열기
  const handleOpenStatement = (record: SalesRecord) => {
    setSelectedRecord(record);
    setIsStatementModalOpen(true);
  };

  // 제목 클릭 시 발주 상세 페이지로 이동
  const handleTitleClick = (orderId: number) => {
    router.push(`/orderRecord/${orderId}`);
  };

  if (error) {
    return (
      <ErrorState
        title="데이터 조회 실패"
        message="판매 내역을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        <LoadingSkeleton type="summary" />
        <LoadingSkeleton type={isMobile ? 'card' : 'table'} count={5} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pb-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          💰 판매 내역 {showMarginColumns && '& 마진 분석'}
        </h1>
        <p className="text-gray-500 mt-2">
          승인된 발주를 기반으로 판매 현황
          {showMarginColumns && ' 및 마진율'}을 분석합니다
        </p>
      </div>

      {/* 상태 안내 카드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong className="block mb-1">📊 어떤 발주가 판매 내역에 포함되나요?</strong>
            <div className="space-y-1">
              <div>
                <span className="font-medium">✅ 포함되는 발주:</span>{' '}
                <span className="text-blue-700">
                  승인된 발주, 출고 확인된 발주, 출고 완료된 발주
                </span>
              </div>
              <div>
                <span className="font-medium">❌ 제외되는 발주:</span>{' '}
                <span className="text-blue-600">
                  승인 대기 중인 발주, 반려된 발주
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        {/* 월 범위 선택 */}
        <MonthRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) =>
            setFilters({ ...filters, startDate: date })
          }
          onEndDateChange={(date) =>
            setFilters({ ...filters, endDate: date })
          }
          className="mb-4"
        />

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
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      {actualSummary && <SalesSummary summary={actualSummary} />}

      {/* 판매가 미입력 경고 */}
      {actualSummary && actualSummary.missingPriceCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>
              판매가 미입력 판매: {actualSummary.missingPriceCount}건
            </strong>
            <br />
            정확한 판매 금액 분석을 위해 판매가 정보를 입력해주세요.
          </div>
        </div>
      )}

      {/* 테이블/카드 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isMobile ? (
          /* 모바일 카드형 리스트 */
          <div className="divide-y divide-gray-100">
            {sortedRecords.map((record, index) => (
              <div
                key={record.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* 헤더: 제목 & 상태 */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex-1 mr-3 cursor-pointer"
                    onClick={() => handleTitleClick(record.id)}
                  >
                    <h3 className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-1">
                      {generateSalesTitle(record)}
                    </h3>
                    {record.title && (
                      <p className="text-xs text-gray-500 mb-1">
                        {record.title}
                      </p>
                    )}
                    <p className="text-xs">
                      {record.supplierName ? (
                        <Link
                          href="/supplier"
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {record.supplierName}
                        </Link>
                      ) : (
                        <span className="text-gray-500">{record.receiver}</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </div>

                {/* 금액 강조 */}
                <div className="mb-3 space-y-2">
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">판매가</span>
                      <span className="text-base font-bold text-blue-600">
                        {record.totalPrice !== null ? (
                          `₩${record.totalPrice.toLocaleString()}`
                        ) : (
                          <span className="text-gray-400">미입력</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {showMarginColumns && (
                    <>
                      <div className="p-2 bg-orange-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">원가</span>
                          <span className="text-sm font-bold text-orange-600">
                            {record.hasCostPrice && record.costAmount !== null && record.costAmount !== undefined
                              ? `₩${record.costAmount.toLocaleString()}`
                              : '미입력'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-600 mb-1">마진액</div>
                          <div
                            className={`text-sm font-bold ${
                              record.marginAmount !== null && record.marginAmount !== undefined
                                ? record.marginAmount >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {record.marginAmount !== null && record.marginAmount !== undefined
                              ? `₩${record.marginAmount.toLocaleString()}`
                              : '-'}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-600 mb-1">마진율</div>
                          <div
                            className={`text-sm font-bold ${
                              record.marginRate !== null && record.marginRate !== undefined
                                ? record.marginRate >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {record.marginRate !== null && record.marginRate !== undefined
                              ? `${record.marginRate.toFixed(1)}%`
                              : '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 상세 정보 */}
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">판매일자</span>
                    <span>{formatDate(record.purchaseDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">담당자</span>
                    <span className="font-medium">{record.manager || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">품목 수</span>
                    <span className="font-medium">
                      {record.itemCount}종 {record.totalQuantity}개
                    </span>
                  </div>
                  {record.memo && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <span className="text-gray-500">비고:</span>
                      <p className="text-gray-600 whitespace-pre-line mt-1">
                        {truncateMemo(record.memo)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 거래명세서 버튼 */}
                <button
                  onClick={() => handleOpenStatement(record)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">거래명세서</span>
                </button>
              </div>
            ))}

            {/* 합계 카드 */}
            {actualSummary && sortedRecords.length > 0 && (
              <div className="p-4 bg-blue-50 border-t-2 border-blue-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">합계</span>
                    <span className="text-sm font-bold text-blue-600">
                      ₩{actualSummary.totalSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>품목 수</span>
                    <span className="font-medium">
                      {actualSummary.totalItems}종 {actualSummary.totalQuantity}개
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 데이터 없음 */}
            {sortedRecords.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                조회된 데이터가 없습니다.
              </div>
            )}
          </div>
        ) : (
          /* 데스크톱 테이블형 리스트 */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('purchaseDate')}
                  >
                    <div className="flex items-center">
                      판매일자
                      {renderSortIcon('purchaseDate')}
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
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      제목
                      {renderSortIcon('title')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                    담당자
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                    품목 수
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-32"
                    onClick={() => handleSort('totalPrice')}
                  >
                    <div className="flex items-center justify-end">
                      판매가
                      {renderSortIcon('totalPrice')}
                    </div>
                  </th>
                  {showMarginColumns && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-32">
                        원가
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-32">
                        마진액
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-24">
                        마진율
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 w-28">
                    거래명세서
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-gray-50 ${
                      showMarginColumns && record.isNegativeMargin
                        ? 'bg-red-50'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(record.purchaseDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {record.supplierName && record.originalOrder.supplierId ? (
                        <Link
                          href={`/supplier/${record.originalOrder.supplierId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {record.supplierName}
                        </Link>
                      ) : (
                        <span className="text-gray-900">{record.supplierName || record.receiver}</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleTitleClick(record.id)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-blue-600 hover:text-blue-700">
                          {generateSalesTitle(record)}
                        </div>
                        {record.title && (
                          <div className="text-xs text-gray-500">
                            {record.title}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {record.manager || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {record.itemCount}종 {record.totalQuantity}개
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {record.totalPrice !== null ? (
                        <div className="bg-blue-50 px-3 py-1.5 rounded-md inline-block">
                          <span className="font-bold text-blue-600">
                            ₩{record.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">미입력</span>
                      )}
                    </td>
                    {showMarginColumns && (
                      <>
                        <td className="px-4 py-3 text-sm text-right">
                          {record.hasCostPrice && record.costAmount !== null && record.costAmount !== undefined ? (
                            <div className="bg-orange-50 px-3 py-1.5 rounded-md inline-block">
                              <span className="font-bold text-orange-600">
                                ₩{record.costAmount.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">미입력</span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-medium ${
                            record.marginAmount !== null && record.marginAmount !== undefined
                              ? record.marginAmount >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {record.marginAmount !== null && record.marginAmount !== undefined
                            ? `₩${record.marginAmount.toLocaleString()}`
                            : '-'}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-bold ${
                            record.marginRate !== null && record.marginRate !== undefined
                              ? record.marginRate >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {record.marginRate !== null && record.marginRate !== undefined
                            ? `${record.marginRate.toFixed(1)}%`
                            : '-'}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenStatement(record)}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="거래명세서 보기"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* 합계 행 */}
                {actualSummary && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-sm font-bold text-right text-gray-900"
                    >
                      합계
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-center text-gray-900">
                      {actualSummary.totalItems}종 {actualSummary.totalQuantity}개
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                      ₩{actualSummary.totalSales.toLocaleString()}
                    </td>
                    {showMarginColumns && (
                      <>
                        <td className="px-4 py-3 text-sm font-bold text-right text-orange-600">
                          ₩{(actualSummary?.totalCost || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                          ₩{(actualSummary?.totalMargin || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                          {(actualSummary?.averageMarginRate || 0).toFixed(1)}%
                        </td>
                      </>
                    )}
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 데이터 없음 (데스크톱용) */}
        {!isMobile && sortedRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            조회된 데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 역마진 경고 안내 (Admin/Moderator만) */}
      {showMarginColumns &&
        actualSummary &&
        actualSummary.negativeMarginCount &&
        actualSummary.negativeMarginCount > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong className="block mb-1">
                ⚠️ 역마진 발주: {actualSummary.negativeMarginCount}건
              </strong>
              <p>
                판매가가 원가보다 낮은 발주가 발견되었습니다. 가격 정책을
                검토해주세요.
              </p>
            </div>
          </div>
        )}

      {/* 거래명세서 모달 */}
      {selectedRecord && (
        <TransactionStatementModal
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          record={selectedRecord}
        />
      )}
    </div>
  );
}
