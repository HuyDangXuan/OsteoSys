"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Search,
  Plus,
  Building2,
  RefreshCw,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRentalDrawer } from "@/components/admin/AdminDrawers";

interface RentalContractItem {
  id: string;
  client: string;
  facilityType: string;
  device: string;
  startDate: string;
  endDate: string;
  monthlyFee: string;
  status: "active" | "expiring_soon" | "completed" | "terminated";
  statusLabel: string;
  scansCount: number;
}

export default function RentalManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contracts, setContracts] = useState<RentalContractItem[]>([]);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      if (statusFilter !== "all") query.set("tab", statusFilter);

      const res = await fetch(`/api/admin/rentals?${query.toString()}`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setContracts(json.data);
      }
    } catch (err) {
      console.error("Failed to load rental contracts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContracts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchContracts]);

  const handleCreateSuccess = () => {
    fetchContracts();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarCheck className="text-[#0284c7]" size={24} />
            Quản lý Hợp đồng Thuê Máy Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu trực tiếp MongoDB: theo dõi tiến độ bàn giao, kiểm định định kỳ và doanh thu cho thuê.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchContracts}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Thêm hợp đồng mới</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Filter Tabs & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-medium self-start">
            {[
              { id: "all", label: "Tất cả hợp đồng" },
              { id: "active", label: "Đang vận hành" },
              { id: "expiring_soon", label: "Sắp hết hạn" },
              { id: "completed", label: "Đã hoàn tất" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded transition-all ${
                  statusFilter === tab.id
                    ? "bg-white dark:bg-slate-900 text-[#0284c7] dark:text-sky-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã HĐ, tên bệnh viện, số máy..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs outline-none focus:border-[#0284c7]"
            />
          </div>
        </div>

        {/* 3. Table Container with Zero-CLS Skeleton */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SkeletonDataTable rows={5} columns={6} />
            </motion.div>
          ) : contracts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TableEmptyState
                searchTerm={searchTerm}
                title="Không tìm thấy hợp đồng phù hợp"
                description={`Không có bản ghi nào khớp với điều kiện lọc "${searchTerm || statusFilter}".`}
                onReset={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                actionLabel="Tạo hợp đồng mới"
                onAction={() => setIsDrawerOpen(true)}
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
                    <th className="py-3 px-3">Mã Hợp Đồng</th>
                    <th className="py-3 px-3">Khách Hàng / Đơn Vị</th>
                    <th className="py-3 px-3">Thiết Bị Cấp Thuê</th>
                    <th className="py-3 px-3">Thời Hạn Thuê</th>
                    <th className="py-3 px-3 text-center">Ca Đo Tích Lũy</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                    <th className="py-3 px-3 text-right">Phí Thuê Hàng Tháng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {contracts.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="py-3 px-3 font-mono-data font-bold text-slate-900 dark:text-slate-100">
                        {c.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {c.client}
                          </span>
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Building2 size={11} /> {c.facilityType}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono-data text-slate-700 dark:text-slate-300">
                        {c.device}
                      </td>
                      <td className="py-3 px-3 font-mono-data text-slate-500 dark:text-slate-400">
                        {c.startDate} → {c.endDate}
                      </td>
                      <td className="py-3 px-3 text-center font-mono-data font-semibold text-[#0284c7] dark:text-sky-400">
                        {c.scansCount} ca
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : c.status === "expiring_soon"
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {c.statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-data font-bold text-slate-900 dark:text-slate-100">
                        {c.monthlyFee}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over Drawer */}
      <CreateRentalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
