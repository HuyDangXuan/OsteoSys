"use client";

import React from "react";
import { Search, RotateCcw, Plus } from "lucide-react";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  hasActions?: boolean;
}

export function TableSkeleton({
  rows = 4,
  columns = 6,
  hasActions = true,
}: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden animate-pulse">
      <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="py-4 px-4 flex items-center justify-between gap-4"
          >
            {/* Primary Cell */}
            <div className="w-28 sm:w-36 flex flex-col gap-2 shrink-0">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-3/5" />
            </div>

            {/* Middle Cells */}
            {Array.from({ length: Math.max(1, columns - (hasActions ? 2 : 1)) }).map(
              (_, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex-1 flex flex-col gap-2 ${
                    colIndex > 1 ? "hidden md:flex" : ""
                  }`}
                >
                  <div
                    className="h-3 bg-slate-200 dark:bg-slate-800 rounded"
                    style={{ width: `${60 + ((rowIndex + colIndex) % 4) * 10}%` }}
                  />
                  {colIndex === 0 && (
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
                  )}
                </div>
              )
            )}

            {/* Status / Badge Cell */}
            <div className="w-24 shrink-0 flex justify-center">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
            </div>

            {/* Action Cell */}
            {hasActions && (
              <div className="w-8 shrink-0 flex justify-end">
                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4 shadow-2xs"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
          </div>
          <div className="h-8 bg-slate-100 dark:bg-slate-800/80 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

interface TableEmptyStateProps {
  searchTerm?: string;
  title?: string;
  description?: string;
  onReset?: () => void;
  createLabel?: string;
  onCreate?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function TableEmptyState({
  searchTerm,
  title = "Không tìm thấy dữ liệu phù hợp",
  description,
  onReset,
  createLabel,
  onCreate,
  actionLabel,
  onAction,
}: TableEmptyStateProps) {
  const defaultDesc = searchTerm
    ? `Không tìm thấy kết quả nào khớp với từ khóa "${searchTerm}". Vui lòng kiểm tra lại chính tả hoặc thử cụm từ khác.`
    : "Hiện chưa có bản ghi nào trong danh mục này hoặc bộ lọc hiện tại không trả về kết quả.";

  const effectiveLabel = createLabel || actionLabel;
  const effectiveAction = onCreate || onAction;

  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto animate-in fade-in duration-200">
      {/* Icon Illustration */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-cyan-950/60 border border-sky-100 dark:border-cyan-900/60 flex items-center justify-center text-[#0284c7] dark:text-cyan-400">
          <Search size={28} strokeWidth={1.75} />
        </div>
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 border-2 border-white dark:border-slate-900 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold font-mono-data">
          0
        </span>
      </div>

      {/* Headings */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description || defaultDesc}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md transition-colors"
          >
            <RotateCcw size={13} />
            <span>Xóa bộ lọc tìm kiếm</span>
          </button>
        )}

        {effectiveLabel && effectiveAction && (
          <button
            onClick={effectiveAction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>{effectiveLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
