"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export type StatusVariant =
  | "available"
  | "operating"
  | "active"
  | "rented"
  | "under_maintenance"
  | "repairing"
  | "decommissioned"
  | "expiring_soon"
  | "overdue"
  | "pending"
  | "suspended"
  | "completed"
  | "qc_passed"
  | "urgent"
  | "normal"
  | "draft"
  | "inactive";

interface StatusBadgeProps {
  status: string;
  label?: string;
  dot?: boolean;
  icon?: LucideIcon;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_LABELS: Record<string, string> = {
  // Devices & Fleet
  available: "Sẵn sàng",
  operating: "Vận hành tốt",
  active: "Đang hoạt động",
  rented: "Đang thuê",
  under_maintenance: "Bảo dưỡng",
  repairing: "Đang sửa",
  decommissioned: "Đã thanh lý",
  expiring_soon: "Sắp hết hạn",
  overdue: "Quá hạn",

  // Accounts
  pending: "Chờ duyệt",
  suspended: "Đã khóa",

  // Contracts & Repairs
  completed: "Hoàn tất",
  terminated: "Đã kết thúc",
  draft: "Bản nháp",
  received: "Tiếp nhận",
  in_progress: "Đang xử lý",
  qc_passed: "Đạt chuẩn",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  urgent: "Khẩn cấp",
  normal: "Bình thường",
  inactive: "Tạm ngừng",
};

const VARIANT_STYLES: Record<string, string> = {
  // Green / Emerald
  available:
    "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
  operating:
    "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
  active:
    "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
  qc_passed:
    "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",

  // Blue / Cyan
  rented:
    "bg-sky-50 dark:bg-cyan-950/80 text-[#0284c7] dark:text-cyan-300 border-sky-200 dark:border-cyan-800/60",
  in_progress:
    "bg-sky-50 dark:bg-cyan-950/80 text-[#0284c7] dark:text-cyan-300 border-sky-200 dark:border-cyan-800/60",
  delivered:
    "bg-sky-50 dark:bg-cyan-950/80 text-[#0284c7] dark:text-cyan-300 border-sky-200 dark:border-cyan-800/60",

  // Yellow / Amber
  under_maintenance:
    "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
  expiring_soon:
    "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
  pending:
    "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
  received:
    "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",

  // Red / Rose
  repairing:
    "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
  overdue:
    "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
  suspended:
    "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
  urgent:
    "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",

  // Slate / Gray
  decommissioned:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  inactive:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  completed:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  terminated:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  cancelled:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  draft:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  normal:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const DOT_COLORS: Record<string, string> = {
  available: "bg-emerald-500",
  operating: "bg-emerald-500",
  active: "bg-emerald-500",
  qc_passed: "bg-emerald-500",
  rented: "bg-sky-500",
  in_progress: "bg-sky-500",
  delivered: "bg-sky-500",
  under_maintenance: "bg-amber-500",
  expiring_soon: "bg-amber-500",
  pending: "bg-amber-500",
  received: "bg-amber-500",
  repairing: "bg-rose-500",
  overdue: "bg-rose-500",
  suspended: "bg-rose-500",
  urgent: "bg-rose-500",
  decommissioned: "bg-slate-400",
  inactive: "bg-slate-400",
  completed: "bg-slate-400",
  draft: "bg-slate-400",
};

export function StatusBadge({
  status,
  label,
  dot = true,
  icon: Icon,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const normStatus = status.toLowerCase();
  const displayLabel = label || STATUS_LABELS[normStatus] || status;
  const style =
    VARIANT_STYLES[normStatus] ||
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  const dotColor = DOT_COLORS[normStatus] || "bg-slate-400";

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-[11px] font-medium"
      : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 leading-none rounded-full border select-none transition-colors ${sizeClasses} ${style} ${className}`}
    >
      {Icon ? (
        <Icon size={12} className="shrink-0" />
      ) : dot ? (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      ) : null}
      <span className="whitespace-nowrap">{displayLabel}</span>
    </span>
  );
}
