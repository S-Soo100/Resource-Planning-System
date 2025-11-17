import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "@/components/ui";
import { Plus, Minus } from "lucide-react";

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
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4 mb-4">
          <h2 className="text-xl font-bold">
            {warehouseName}
          </h2>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="품목코드 또는 품목명 검색..."
                value={searchText}
                onChange={(e) => onSearch(e.target.value)}
                rightIcon={<SearchOutlined className="text-gray-400" />}
                className="border-0 bg-gray-50 rounded-2xl"
              />
              <p className="text-xs text-gray-500 mt-1">
                품목코드, 품목명, 카테고리, 메모로 검색 가능
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideZeroStock"
                checked={hideZeroStock}
                onChange={(e) => onHideZeroStockChange(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400"
              />
              <label
                htmlFor="hideZeroStock"
                className="ml-2 text-sm text-gray-700"
              >
                재고가 0인 품목 숨기기
              </label>
            </div>
          </div>

          {showButtons && (
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                onClick={onInboundClick}
                icon={<Plus className="w-4 h-4" />}
                iconPosition="left"
              >
                입고
              </Button>
              <Button
                variant="danger"
                onClick={onOutboundClick}
                icon={<Minus className="w-4 h-4" />}
                iconPosition="left"
              >
                출고
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
