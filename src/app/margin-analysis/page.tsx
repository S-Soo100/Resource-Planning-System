'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMarginData } from '@/hooks/useMarginData';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { MarginSummary } from '@/components/margin/MarginSummary';
import { exportMarginToExcel } from '@/utils/exportMarginToExcel';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingCentered } from '@/components/ui/Loading';
import {
  MarginFilterParams,
  MarginSortField,
  SortDirection,
  MarginAnalysisRecord,
} from '@/types/margin-analysis';

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

export default function MarginAnalysisPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  // 미디어 쿼리
  const isMobile = useMediaQuery('(max-width: 759px)');

  // 필터 상태 (기본값: 이번 달)
  const [filters, setFilters] = useState<MarginFilterParams>({
    yearMonth: format(new Date(), 'yyyy-MM'), // YYYY-MM
    searchQuery: '',
    showNegativeMarginOnly: false,
    showMissingDataOnly: false,
  });

  // 정렬 상태
  const [sortField, setSortField] = useState<MarginSortField>('marginRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 데이터 조회
  const { data, isLoading, error } = useMarginData(filters);

  // 정렬된 레코드
  const sortedRecords = useMemo(() => {
    if (!data?.records) return [];

    const sorted = [...data.records].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // null 값 처리
      if (aValue === null && bValue === null) return 0;
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

  // 권한 체크: Admin, Moderator만 접근 가능
  if (!user || (user.accessLevel !== 'admin' && user.accessLevel !== 'moderator')) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              접근 권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              마진 분석 페이지는 관리자 및 운영자만 접근할 수 있습니다.
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
  const handleSort = (field: MarginSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: MarginSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  // 엑셀 다운로드
  const handleExportExcel = () => {
    if (!sortedRecords || sortedRecords.length === 0) return;
    exportMarginToExcel(sortedRecords, filters.yearMonth);
  };

  // 원가 미입력 클릭 시 팀 물품 관리로 이동 (해당 품목 자동 수정 모달 열기)
  const handleMissingCostClick = (teamItemId?: number) => {
    if (teamItemId) {
      router.push(`/team-items?editId=${teamItemId}`);
    } else {
      router.push('/team-items');
    }
  };

  // 판매가 미입력 클릭 시 발주 기록으로 이동 (발주 필터링 필요)
  const handleMissingSalesClick = () => {
    router.push(`/orderRecord?showMissingPrice=true&month=${filters.yearMonth}`);
  };

  if (error) {
    return (
      <ErrorState
        title="데이터 조회 실패"
        message="마진 분석 데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
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

        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pb-10">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 마진 분석</h1>
        <p className="text-gray-500 mt-2">
          품목별 판매가와 원가를 비교하여 마진율을 분석합니다.
        </p>
      </div>

      {/* 요약 카드 */}
      {data?.summary && <MarginSummary summary={data.summary} />}

      {/* 필터 & 액션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 월 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              조회 월
            </label>
            <input
              type="month"
              value={filters.yearMonth}
              onChange={(e) =>
                setFilters({ ...filters, yearMonth: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              품목 검색
            </label>
            <input
              type="text"
              placeholder="품목코드 또는 품목명"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 필터 옵션 */}
          <div className="flex flex-col gap-2 justify-end">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.showNegativeMarginOnly}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    showNegativeMarginOnly: e.target.checked,
                  })
                }
                className="mr-2"
              />
              역마진만 보기
            </label>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={filters.showMissingDataOnly}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    showMissingDataOnly: e.target.checked,
                  })
                }
                className="mr-2"
              />
              미입력만 보기
            </label>
          </div>

          {/* 엑셀 다운로드 */}
          <div className="flex items-end">
            <button
              onClick={handleExportExcel}
              disabled={!sortedRecords || sortedRecords.length === 0}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              엑셀 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {sortedRecords && sortedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    No
                  </th>
                  <th
                    onClick={() => handleSort('itemName')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      품목명
                      {renderSortIcon('itemName')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                    거래건수
                  </th>
                  <th
                    onClick={() => handleSort('salesQuantity')}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center justify-center">
                      판매수량
                      {renderSortIcon('salesQuantity')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('salesAmount')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-32"
                  >
                    <div className="flex items-center justify-end">
                      판매가합계
                      {renderSortIcon('salesAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('costAmount')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-32"
                  >
                    <div className="flex items-center justify-end">
                      원가합계
                      {renderSortIcon('costAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('marginAmount')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-32"
                  >
                    <div className="flex items-center justify-end">
                      마진액
                      {renderSortIcon('marginAmount')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('marginRate')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-24"
                  >
                    <div className="flex items-center justify-end">
                      마진율
                      {renderSortIcon('marginRate')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRecords.map((record, index) => (
                  <tr
                    key={`${record.itemCode}-${index}`}
                    className={`hover:bg-gray-50 ${
                      record.isNegativeMargin ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className="font-medium">{record.itemName}</span>
                      <span className="text-xs text-gray-500 ml-1.5">
                        ({record.itemCode})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {record.transactionCount.toLocaleString()}건
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">
                      {record.salesQuantity.toLocaleString()}개
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {record.hasSalesPrice ? (
                        <div className="bg-blue-50 px-3 py-1.5 rounded-md inline-block">
                          <span className="font-bold text-blue-600">
                            ₩{record.salesAmount?.toLocaleString() || 0}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={handleMissingSalesClick}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-600 hover:text-white transition-colors"
                        >
                          미입력
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {record.hasCostPrice ? (
                        <div className="bg-orange-50 px-3 py-1.5 rounded-md inline-block">
                          <span className="font-bold text-orange-600">
                            ₩{record.costAmount?.toLocaleString() || 0}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleMissingCostClick(record.teamItemId)
                          }
                          className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-600 hover:text-white transition-colors"
                        >
                          미입력
                        </button>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-medium ${
                        record.marginAmount !== null
                          ? record.marginAmount >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {record.marginAmount !== null
                        ? `₩${record.marginAmount.toLocaleString()}`
                        : '-'}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-bold ${
                        record.marginRate !== null
                          ? record.marginRate >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {record.marginRate !== null
                        ? `${record.marginRate.toFixed(1)}%`
                        : '-'}
                    </td>
                  </tr>
                ))}

                {/* 합계 행 */}
                {data?.summary && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm font-bold text-right text-gray-900"
                    >
                      합계
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-center text-gray-900">
                      {sortedRecords.reduce(
                        (sum, r) => sum + r.transactionCount,
                        0
                      ).toLocaleString()}건
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-center text-gray-900">
                      {sortedRecords.reduce(
                        (sum, r) => sum + r.salesQuantity,
                        0
                      ).toLocaleString()}개
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                      ₩
                      {sortedRecords
                        .reduce(
                          (sum, r) =>
                            r.hasSalesPrice && r.salesAmount !== null
                              ? sum + r.salesAmount
                              : sum,
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-orange-600">
                      ₩
                      {sortedRecords
                        .reduce(
                          (sum, r) =>
                            r.hasCostPrice && r.costAmount !== null
                              ? sum + r.costAmount
                              : sum,
                          0
                        )
                        .toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                      ₩{data.summary.totalMarginAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-green-600">
                      {data.summary.averageMarginRate.toFixed(1)}%
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              조회된 데이터가 없습니다.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              다른 조회 조건을 선택해주세요.
            </p>
          </div>
        )}
      </div>

      {/* 역마진 경고 안내 */}
      {data?.summary && data.summary.negativeMarginCount > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <strong className="block mb-1">
              ⚠️ 역마진 품목: {data.summary.negativeMarginCount}개
            </strong>
            <p>
              판매가가 원가보다 낮은 품목이 발견되었습니다. 가격 정책을 검토해주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
