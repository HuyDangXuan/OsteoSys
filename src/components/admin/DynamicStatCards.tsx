"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import {
  Boxes,
  CalendarCheck,
  Wrench,
  Radio,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export interface DeviceStatsData {
  totalDevices: number;
  rentedDevices: number;
  availableDevices: number;
  maintenanceDevices: number;
  breakdown: {
    underMaintenance: number;
    repairing: number;
    decommissioned: number;
  };
  percentages: {
    rented: number;
    available: number;
    maintenance: number;
  };
  alerts: {
    level: "danger" | "warning" | "normal";
    badge: string;
    isLowStock: boolean;
    isOutOfStock: boolean;
  };
  commercial: {
    activeRentalsCount: number;
    monthlyRevenue: number;
    formattedMonthlyRevenue: string;
  };
  updatedAt?: string;
}

/**
 * Smooth Count-Up Animation Component powered by Framer Motion
 */
export function CountUp({
  value,
  duration = 1.1,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  return <span className={`tabular-nums ${className}`}>{displayValue}</span>;
}

interface DynamicStatCardsProps {
  initialStats?: DeviceStatsData | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DynamicStatCards({
  initialStats,
  isLoading = false,
}: DynamicStatCardsProps) {
  const [stats, setStats] = useState<DeviceStatsData | null>(initialStats || null);
  const [isFetching, setIsFetching] = useState(!initialStats);

  const fetchStats = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/admin/devices/stats", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to load device stats:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
    } else {
      fetchStats();
    }
  }, [initialStats]);

  const currentStats: DeviceStatsData = stats || {
    totalDevices: 0,
    rentedDevices: 0,
    availableDevices: 0,
    maintenanceDevices: 0,
    breakdown: { underMaintenance: 0, repairing: 0, decommissioned: 0 },
    percentages: { rented: 0, available: 0, maintenance: 0 },
    alerts: {
      level: "normal",
      badge: "Đang tải dữ liệu...",
      isLowStock: false,
      isOutOfStock: false,
    },
    commercial: {
      activeRentalsCount: 0,
      monthlyRevenue: 0,
      formattedMonthlyRevenue: "0 ₫",
    },
  };

  const isActuallyLoading = isLoading || isFetching;

  return (
    <div className="space-y-3">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* CARD 1: TỔNG THIẾT BỊ SONOST 3000 */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
          }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="will-change-transform"
        >
          <Link
            href="/admin/kho-thiet-bi"
            className="p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-[#0284c7] dark:hover:border-cyan-500/40 dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all group flex flex-col justify-between min-h-[132px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tổng máy Sonost 3000
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-data text-slate-900 dark:text-slate-100 tabular-nums">
                    {isActuallyLoading ? (
                      <span className="text-slate-300 dark:text-slate-700 animate-pulse">--</span>
                    ) : (
                      <CountUp value={currentStats.totalDevices} />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    máy trong hệ thống
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-sky-100 dark:border-cyan-900/50">
                <Boxes size={20} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono-data text-[11px]">
                Kho Tổng Hà Nội &amp; TP.HCM
              </span>
              <span className="text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-cyan-400 flex items-center gap-0.5 font-medium transition-colors">
                Chi tiết <ArrowUpRight size={12} />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* CARD 2: ĐANG CHO THUÊ HOẠT ĐỘNG */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
          }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="will-change-transform"
        >
          <Link
            href="/admin/thue-may"
            className="p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group flex flex-col justify-between min-h-[132px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Đang cho thuê hoạt động
                </p>
                <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {isActuallyLoading ? (
                      <span className="text-slate-300 dark:text-slate-700 animate-pulse">--</span>
                    ) : (
                      <CountUp value={currentStats.rentedDevices} />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-data">
                    / {currentStats.totalDevices} máy ({currentStats.percentages.rented}%)
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-900/50">
                <CalendarCheck size={20} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-mono-data text-[11px] truncate">
                Doanh thu: {currentStats.commercial.formattedMonthlyRevenue}
              </span>
              <span className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-0.5 font-medium transition-colors shrink-0">
                Xem HĐ <ArrowUpRight size={12} />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* CARD 3: SẴN SÀNG BÀN GIAO + DYNAMIC WARNING BADGE */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
          }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="will-change-transform"
        >
          <Link
            href="/admin/kho-thiet-bi?status=available"
            className="p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-[#0284c7] dark:hover:border-cyan-400 transition-all group flex flex-col justify-between min-h-[132px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Sẵn sàng bàn giao
                </p>
                <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-data text-[#0284c7] dark:text-cyan-400 tabular-nums">
                    {isActuallyLoading ? (
                      <span className="text-slate-300 dark:text-slate-700 animate-pulse">--</span>
                    ) : (
                      <CountUp value={currentStats.availableDevices} />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-data">
                    / {currentStats.totalDevices} máy ({currentStats.percentages.available}%)
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-sky-100 dark:border-cyan-900/50">
                <Radio size={20} />
              </div>
            </div>

            {/* DYNAMIC ALERT BADGE */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              {currentStats.alerts.isOutOfStock ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                  Hết máy sẵn sàng
                </span>
              ) : currentStats.alerts.isLowStock ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400" />
                  Sắp hết máy cho thuê
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                  Sẵn sàng đáp ứng ngay
                </span>
              )}

              <span className="text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-cyan-400 flex items-center gap-0.5 font-medium transition-colors">
                Xem kho <ArrowUpRight size={12} />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* CARD 4: BẢO DƯỠNG & HIỆU CHUẨN */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
          }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="will-change-transform"
        >
          <Link
            href="/admin/sua-chua"
            className="p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs hover:border-amber-500 dark:hover:border-amber-400 transition-all group flex flex-col justify-between min-h-[132px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Bảo dưỡng &amp; Sửa chữa
                </p>
                <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold font-mono-data text-amber-600 dark:text-amber-400 tabular-nums">
                    {isActuallyLoading ? (
                      <span className="text-slate-300 dark:text-slate-700 animate-pulse">--</span>
                    ) : (
                      <CountUp value={currentStats.maintenanceDevices} />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-data">
                    / {currentStats.totalDevices} máy ({currentStats.percentages.maintenance}%)
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-100 dark:border-amber-900/50">
                <Wrench size={20} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-mono-data text-[11px] truncate">
                {currentStats.breakdown.underMaintenance} kiểm chuẩn • {currentStats.breakdown.repairing} sửa chữa
              </span>
              <span className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-0.5 font-medium transition-colors shrink-0">
                Kỹ thuật <ArrowUpRight size={12} />
              </span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
