"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui";
import { useSerialSearch } from "@/hooks/useSerialSearch";
import { Search } from "lucide-react";
import { LoadingInline } from "@/components/ui/Loading";

interface SerialCodeSearchResult {
  orderId: number;
  orderTitle: string;
  supplierName: string;
  warehouseName: string;
  itemName: string;
  itemCode: string;
  serialCode1?: string | null;
  serialCode2?: string | null;
  serialCode3?: string | null;
}

interface SerialCodeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

const SerialCodeSearchModal: React.FC<SerialCodeSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: results, isLoading, isError } = useSerialSearch(searchCode);

  // 타입 안전하게 결과 변환
  const typedResults = useMemo(() => {
    if (!results || !Array.isArray(results)) return [];
    return results as SerialCodeSearchResult[];
  }, [results]);

  // 클라이언트 페이지네이션
  const totalPages = Math.max(
    1,
    Math.ceil(typedResults.length / ITEMS_PER_PAGE)
  );
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return typedResults.slice(start, start + ITEMS_PER_PAGE);
  }, [typedResults, currentPage]);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    setSearchCode(trimmed);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleOrderClick = (orderId: number) => {
    onClose();
    router.push(`/salesRecord/${orderId}`);
  };

  const handleClose = () => {
    setSearchInput("");
    setSearchCode("");
    setCurrentPage(1);
    onClose();
  };

  // 매칭된 시리얼코드 하이라이트
  const renderSerialCode = (
    code: string | null | undefined,
    label: string,
    colorClass: string
  ) => {
    if (!code) return null;
    const isMatch =
      searchCode && code.toLowerCase().includes(searchCode.toLowerCase());
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border ${
          isMatch
            ? `${colorClass} ring-1 ring-offset-1 ring-blue-400`
            : colorClass
        }`}
      >
        <span className="opacity-60">{label}</span> {code}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="시리얼코드 검색"
      size="lg"
    >
      <div className="space-y-4">
        {/* 검색 입력 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="시리얼코드를 입력하세요..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim() || isLoading}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <LoadingInline size="sm" /> : "검색"}
          </button>
        </div>

        {/* 결과 */}
        {searchCode && (
          <div className="min-h-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingInline size="md" />
                <span className="ml-2 text-sm text-gray-500">검색 중...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-red-500 text-sm">
                검색 중 오류가 발생했습니다. 다시 시도해주세요.
              </div>
            ) : typedResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                <div className="text-3xl mb-2">&#128269;</div>
                &quot;{searchCode}&quot;에 대한 검색 결과가 없습니다.
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-500 mb-2">
                  총 {typedResults.length}건의 결과
                </div>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                          시리얼코드
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                          품목명
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                          판매
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                          판매대상명
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                          창고
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedResults.map((result, index) => (
                        <tr
                          key={`${result.orderId}-${index}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {renderSerialCode(
                                result.serialCode1,
                                "S/N",
                                "text-gray-600 bg-gray-100 border-gray-200"
                              )}
                              {renderSerialCode(
                                result.serialCode2,
                                "건보",
                                "text-green-600 bg-green-50 border-green-200"
                              )}
                              {renderSerialCode(
                                result.serialCode3,
                                "예비",
                                "text-purple-600 bg-purple-50 border-purple-200"
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-900">
                            <div>{result.itemName}</div>
                            {result.itemCode && (
                              <div className="text-xs text-gray-500">
                                ({result.itemCode})
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => handleOrderClick(result.orderId)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                            >
                              #{result.orderId}
                            </button>
                            {result.orderTitle && (
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {result.orderTitle}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">
                            {result.supplierName || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-gray-700">
                            {result.warehouseName || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      이전
                    </button>
                    <span className="text-xs text-gray-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SerialCodeSearchModal;
