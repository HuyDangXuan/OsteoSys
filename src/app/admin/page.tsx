"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Wrench,
  Plus,
  RefreshCw,
  ChevronRight,
  Search,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRentalDrawer, CreateRepairModal } from "@/components/admin/AdminDrawers";
import { DynamicStatCards, DeviceStatsData } from "@/components/admin/DynamicStatCards";

export const dynamic = "force-dynamic";

interface RecentRentalItem {
  id: string;
  client: string;
  device: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring_soon" | "completed";
  statusLabel: string;
  monthlyFee: string;
}

interface RecentRepairItem {
  id: string;
  facility: string;
  device: string;
  issue: string;
  priority: string;
  priorityLabel: string;
  status: string;
  statusLabel: string;
  technician: string;
}

export default function AdminOverviewPage() {
  const [filterPeriod, setFilterPeriod] = useState<"7d" | "30d" | "quarter">("30d");
  const [searchTable, setSearchTable] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRentalDrawerOpen, setIsRentalDrawerOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  const [stats, setStats] = useState<DeviceStatsData | null>(null);
  const [rentals, setRentals] = useState<RecentRentalItem[]>([]);
  const [repairs, setRepairs] = useState<RecentRepairItem[]>([]);

  const fetchOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, statsRes] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/devices/stats", { cache: "no-store" }),
      ]);

      const overviewJson = await overviewRes.json();
      const statsJson = await statsRes.json();

      if (overviewJson.status === "success" && overviewJson.data) {
        setRentals(overviewJson.data.recentContracts || []);
        setRepairs(overviewJson.data.recentTickets || []);
      }

      if (statsJson.status === "success" && statsJson.data) {
        setStats(statsJson.data);
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const filteredRentals = rentals.filter(
    (r) =>
      r.client?.toLowerCase().includes(searchTable.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTable.toLowerCase()) ||
      r.device?.toLowerCase().includes(searchTable.toLowerCase())
  );

  const handleCreateRentalSuccess = () => {
    fetchOverviewData();
  };

  const handleCreateRepairSuccess = () => {
    fetchOverviewData();
  };

  const totalFleet = stats?.totalDevices || 48;
  const rentedPct = stats?.percentages?.rented || 0;
  const availPct = stats?.percentages?.available || 0;
  const maintPct = stats?.percentages?.maintenance || 0;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Tổng quan Hệ thống Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu kết nối trực tiếp MongoDB: trạng thái thiết bị, hợp đồng thuê và lệnh sửa chữa y tế.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOverviewData}
            title="Tải lại số liệu từ cơ sở dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* Period Filter */}
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-0.5 text-xs font-medium">
            <button
              onClick={() => {
                setFilterPeriod("7d");
                fetchOverviewData();
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPeriod === "7d"
                  ? "bg-[#0284c7] text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => {
                setFilterPeriod("30d");
                fetchOverviewData();
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPeriod === "30d"
                  ? "bg-[#0284c7] text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => {
                setFilterPeriod("quarter");
                fetchOverviewData();
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterPeriod === "quarter"
                  ? "bg-[#0284c7] text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Quý này
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsRentalDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Tạo hợp đồng</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Staggered 4 Key Dynamic Metric Cards */}
      <DynamicStatCards initialStats={stats} isLoading={isLoading} onRefresh={fetchOverviewData} />

      {/* 3. Main Data Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Hợp đồng thuê máy gần đây */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarCheck size={16} className="text-[#0284c7]" />
                Hợp đồng thuê Sonost 3000 gần đây
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Các đơn vị y tế đang thuê máy đo loãng xương siêu âm gót chân.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-44">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  placeholder="Lọc hợp đồng..."
                  className="w-full pl-7 pr-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>
              <Link
                href="/admin/thue-may"
                className="text-xs font-medium text-[#0284c7] dark:text-sky-400 hover:underline flex items-center gap-0.5 whitespace-nowrap"
              >
                Xem tất cả <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Table with Zero-CLS Skeleton & Empty States */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SkeletonDataTable rows={4} columns={6} />
              </motion.div>
            ) : filteredRentals.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <TableEmptyState
                  searchTerm={searchTable}
                  title="Không tìm thấy hợp đồng nào"
                  description={`Không có hợp đồng thuê nào khớp với từ khóa "${searchTable}".`}
                  onReset={() => setSearchTable("")}
                  createLabel="Tạo hợp đồng mới"
                  onCreate={() => setIsRentalDrawerOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Mã HĐ</th>
                      <th className="py-2.5 px-3">Khách hàng / Bệnh viện</th>
                      <th className="py-2.5 px-3">Thiết bị</th>
                      <th className="py-2.5 px-3">Thời hạn</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredRentals.map((rental, idx) => (
                      <motion.tr
                        key={rental.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.2 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                      >
                        <td className="py-3 px-3 font-mono-data font-semibold text-slate-900 dark:text-slate-100">
                          {rental.id}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-900 dark:text-slate-100 block">
                            {rental.client}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono-data">
                          #{rental.device}
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono-data">
                          {rental.startDate} → {rental.endDate || "Chưa xác định"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              rental.status === "active"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : rental.status === "expiring_soon"
                                ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {rental.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono-data font-semibold text-slate-800 dark:text-slate-200">
                          {rental.monthlyFee}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right 1 Col: Phiếu sửa chữa & Phân bổ máy Sonost 3000 */}
        <div className="space-y-6">
          {/* Sửa chữa & Cảnh báo */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Wrench size={15} className="text-amber-500" />
                Phiếu kỹ thuật cần xử lý
              </h2>
              <button
                onClick={() => setIsRepairModalOpen(true)}
                className="p-1 text-slate-400 hover:text-[#0284c7] transition-colors"
                title="Tạo phiếu sửa chữa mới"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="space-y-3">
              {repairs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  Không có phiếu sửa chữa nào cần xử lý.
                </p>
              ) : (
                repairs.map((repair) => (
                  <div
                    key={repair.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-md hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100">
                        {repair.id}
                      </span>
                      <span
                        className={`text-xs font-medium flex items-center gap-1 ${
                          repair.priority === "urgent"
                            ? "text-rose-600 dark:text-rose-400 font-semibold"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {repair.priority === "urgent" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        )}
                        {repair.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {repair.device}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {repair.issue}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate">{repair.facility}</span>
                      <span className="font-mono-data font-medium text-slate-600 dark:text-slate-300 shrink-0">
                        {repair.technician}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/admin/sua-chua"
              className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded text-center block transition-colors"
            >
              Xem danh sách bảo trì &amp; hiệu chuẩn →
            </Link>
          </div>

          {/* Phân bổ máy Sonost 3000 (Live Dynamic) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Trạng thái {totalFleet} máy Sonost 3000
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Đang cho thuê hoạt động
                </span>
                <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100">
                  {stats?.rentedDevices || 0} máy ({rentedPct}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Sẵn sàng trong kho
                </span>
                <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100">
                  {stats?.availableDevices || 0} máy ({availPct}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Đang bảo trì / Sửa chữa
                </span>
                <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100">
                  {stats?.maintenanceDevices || 0} máy ({maintPct}%)
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex mt-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${rentedPct}%` }}
                title={`Đang thuê (${rentedPct}%)`}
              />
              <div
                className="bg-sky-500 h-full transition-all duration-500"
                style={{ width: `${availPct}%` }}
                title={`Sẵn sàng (${availPct}%)`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${maintPct}%` }}
                title={`Bảo trì (${maintPct}%)`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer & Modal */}
      <CreateRentalDrawer
        isOpen={isRentalDrawerOpen}
        onClose={() => setIsRentalDrawerOpen(false)}
        onSuccess={handleCreateRentalSuccess}
      />
      <CreateRepairModal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        onSuccess={handleCreateRepairSuccess}
      />
    </div>
  );
}
