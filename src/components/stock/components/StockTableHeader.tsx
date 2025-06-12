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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center m-4 space-x-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="품목코드 또는 품목명 검색..."
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
              rightIcon={<SearchOutlined className="text-gray-400" />}
              className="border-0 bg-gray-50 rounded-2xl"
            />
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
      </div>

      <div className="mb-8">
        <div className="flex flex-col items-center justify-between gap-2 px-4 mb-4">
          <h2 className="flex justify-start w-full text-xl font-bold text-start">
            {warehouseName}
          </h2>

          {showButtons && (
            <div className="flex items-center justify-end w-full space-x-2">
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
