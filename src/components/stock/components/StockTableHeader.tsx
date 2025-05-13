import React from "react";
import { SearchOutlined } from "@ant-design/icons";

interface StockTableHeaderProps {
  searchText: string;
  onSearch: (value: string) => void;
  hideZeroStock: boolean;
  onHideZeroStockChange: (value: boolean) => void;
  warehouseName: string;
  onInboundClick: () => void;
  onOutboundClick: () => void;
  showButtons?: boolean;
}

export default function StockTableHeader({
  searchText,
  onSearch,
  hideZeroStock,
  onHideZeroStockChange,
  warehouseName,
  onInboundClick,
  onOutboundClick,
  showButtons = true,
}: StockTableHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4 m-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="품목코드 또는 품목명 검색..."
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
            />
            <SearchOutlined className="absolute right-3 top-2.5 text-gray-400 text-sm" />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hideZeroStock"
              checked={hideZeroStock}
              onChange={(e) => onHideZeroStockChange(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-400 h-4 w-4"
            />
            <label
              htmlFor="hideZeroStock"
              className="ml-2 text-sm text-gray-700"
            >
              재고가 0인 품목 숨기기
            </label>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-4">
          <h2 className="text-xl font-bold">{warehouseName}</h2>

          {showButtons && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onInboundClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                입고
              </button>
              <button
                onClick={onOutboundClick}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 12H4"
                  />
                </svg>
                출고
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
