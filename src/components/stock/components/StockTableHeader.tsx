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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4 m-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="품목코드 또는 품목명 검색..."
              value={searchText}
              onChange={(e) => onSearch(e.target.value)}
              rightIcon={<SearchOutlined className="text-gray-400" />}
              className="bg-gray-50 border-0 rounded-2xl"
            />
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
        <div className="flex flex-col justify-between items-center mb-4 px-4 gap-2">
          <h2 className="flex justify-start text-start w-full text-xl font-bold">
            {warehouseName}
          </h2>

          {showButtons && (
            <div className="flex items-center space-x-2 justify-end w-full">
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
