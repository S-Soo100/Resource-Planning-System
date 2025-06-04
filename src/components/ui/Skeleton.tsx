"use client";
import React from "react";

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 rounded ${className}`}
      aria-label="로딩 중..."
    />
  );
};

// 테이블 스켈레톤
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton
                      className={`h-4 ${
                        colIndex === 0
                          ? "w-24"
                          : colIndex === 1
                          ? "w-32"
                          : colIndex === 2
                          ? "w-20"
                          : "w-16"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 카드 스켈레톤
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 페이지 헤더 스켈레톤
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
};

// 섹션 헤더 스켈레톤
export const SectionHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
  );
};

export default Skeleton;
