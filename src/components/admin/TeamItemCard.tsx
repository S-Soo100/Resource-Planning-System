"use client";
import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  memo?: string;
  category?: {
    id: number;
    name: string;
    priority: number;
  };
}

interface TeamItemCardProps {
  item: TeamItem;
  isReadOnly: boolean;
  onEdit: (item: TeamItem) => void;
  onDelete: (itemId: number) => void;
  isDeleting: boolean;
  disabled: boolean;
}

const TeamItemCard: React.FC<TeamItemCardProps> = ({
  item,
  isReadOnly,
  onEdit,
  onDelete,
  isDeleting,
  disabled,
}) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {item.itemName}
            </h3>
            <span className="mt-1 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {item.itemCode || "-"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-16">
                카테고리
              </span>
              <span className="text-sm text-gray-900">
                {item.category?.name || "없음"}
              </span>
            </div>

            {item.memo && (
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-16 mt-0.5">
                  메모
                </span>
                <span className="text-sm text-gray-700 flex-1">
                  {item.memo}
                </span>
              </div>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              disabled={disabled}
              icon={<Edit className="w-4 h-4" />}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              disabled={disabled}
              loading={isDeleting}
              icon={<Trash2 className="w-4 h-4 text-red-500" />}
            />
          </div>
        )}

        {isReadOnly && (
          <div className="ml-4">
            <span className="text-xs text-gray-400">읽기 전용</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamItemCard;
