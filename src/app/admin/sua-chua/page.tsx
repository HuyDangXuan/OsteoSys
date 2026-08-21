"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Search,
  Plus,
  Clock,
  Building2,
  User,
  RefreshCw,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRepairModal } from "@/components/admin/AdminDrawers";

interface RepairTicketItem {
  id: string;
  device: string;
  issue: string;
  diagnosis: string;
  facility: string;
  priority: "urgent" | "calibration" | "normal" | "low";
  priorityLabel: string;
  status: string;
  statusLabel: string;
  technician: string;
  receivedDate: string;
  partsCount: number;
}

export default function RepairManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState<RepairTicketItem[]>([]);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      if (priorityFilter !== "all") query.set("priority", priorityFilter);

      const res = await fetch(`/api/admin/repairs?${query.toString()}`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setTickets(json.data);
      }
    } catch (err) {
      console.error("Failed to load repair tickets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, priorityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const handleCreateSuccess = () => {
    fetchTickets();
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
            <Wrench className="text-amber-500" size={24} />
            Quản lý Sửa chữa &amp; Hiệu chuẩn Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu trực tiếp MongoDB: lịch sử kiểm định Phantom, bảo dưỡng bóng khí và thay thế đầu dò siêu âm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Tạo lệnh sửa chữa</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Priority Tabs & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Priority Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-medium self-start">
            {[
              { id: "all", label: "Tất cả phiếu" },
              { id: "urgent", label: "🚨 Khẩn cấp" },
              { id: "calibration", label: "⚠️ Hiệu chuẩn" },
              { id: "normal", label: "ℹ️ Bình thường" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPriorityFilter(tab.id)}
                className={`px-3 py-1.5 rounded transition-all ${
                  priorityFilter === tab.id
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
              placeholder="Tìm theo số máy, sự cố, kỹ sư..."
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
          ) : tickets.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TableEmptyState
                searchTerm={searchTerm}
                title="Không tìm thấy phiếu kỹ thuật nào"
                description={`Không có bản ghi nào khớp với điều kiện lọc "${searchTerm || priorityFilter}".`}
                onReset={() => {
                  setSearchTerm("");
                  setPriorityFilter("all");
                }}
                actionLabel="Tạo phiếu kỹ thuật"
                onAction={() => setIsModalOpen(true)}
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
                    <th className="py-3 px-3">Mã Lệnh</th>
                    <th className="py-3 px-3">Thiết Bị &amp; Cơ Sở</th>
                    <th className="py-3 px-3">Hạng Mục Kỹ Thuật / Lỗi</th>
                    <th className="py-3 px-3">Mức Độ</th>
                    <th className="py-3 px-3">Kỹ Sư Phụ Trách</th>
                    <th className="py-3 px-3">Trạng Thái Xử Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {tickets.map((t, idx) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="py-3 px-3 font-mono-data font-bold text-slate-900 dark:text-slate-100">
                        {t.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block font-mono-data">
                            {t.device}
                          </span>
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Building2 size={11} /> {t.facility}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <span className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                          {t.issue}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            t.priority === "urgent"
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold"
                              : t.priority === "calibration"
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {t.priority === "urgent" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                          {t.priorityLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono-data font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          {t.technician}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <Clock size={12} className="text-[#0284c7]" />
                          {t.statusLabel}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centered Modal */}
      <CreateRepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
