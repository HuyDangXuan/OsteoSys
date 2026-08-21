"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRepairModal } from "@/components/admin/AdminDrawers";

interface RepairTicket {
  id: string;
  device: string;
  issue: string;
  facility: string;
  priority: "high" | "normal" | "low";
  priorityText: string;
  tech: string;
  status: string;
  receivedDate: string;
}

export default function RepairManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tickets, setTickets] = useState<RepairTicket[]>([
    {
      id: "SC-2026-034",
      device: "Sonost 3000 (#SN-9912)",
      issue: "Nhiễu tín hiệu đầu dò gót chân (BUA) sau 1.200 ca đo",
      facility: "BV Đa khoa Hà Đông",
      priority: "high",
      priorityText: "Khẩn cấp",
      tech: "KS. Tuấn",
      status: "Đang xử lý đầu dò",
      receivedDate: "20/08/2026",
    },
    {
      id: "SC-2026-033",
      device: "Sonost 3000 (#SN-5540)",
      issue: "Hiệu chuẩn định kỳ Phantom & kiểm tra bơm bóng khí tự động",
      facility: "Kho kỹ thuật Hà Nội",
      priority: "normal",
      priorityText: "Bình thường",
      tech: "KS. Hải",
      status: "Chờ kiểm định ISCD",
      receivedDate: "19/08/2026",
    },
    {
      id: "SC-2026-032",
      device: "Sonost 3000 (#SN-7721)",
      issue: "Kẹt giấy in nhiệt tích hợp & vệ sinh khay đặt gót chân",
      facility: "PK Y khoa An Khang",
      priority: "low",
      priorityText: "Thấp",
      tech: "KS. Hoàng",
      status: "Đã xuất linh kiện",
      receivedDate: "18/08/2026",
    },
    {
      id: "SC-2026-031",
      device: "Sonost 3000 (#SN-4022)",
      issue: "Thay thế màng bóng dầu siêu âm & cân chỉnh nhiệt độ cảm biến",
      facility: "PK Đa khoa Medlatec",
      priority: "normal",
      priorityText: "Bình thường",
      tech: "KS. Tuấn",
      status: "Đã bàn giao",
      receivedDate: "15/08/2026",
    },
  ]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, priorityFilter]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCreateSuccess = (newTicket: any) => {
    setTickets([
      {
        ...newTicket,
        priorityText:
          newTicket.priority === "high"
            ? "Khẩn cấp"
            : newTicket.priority === "normal"
            ? "Bình thường"
            : "Thấp",
        receivedDate: "Hôm nay",
      },
      ...tickets,
    ]);
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
            Lịch sử kiểm định Phantom, bảo dưỡng bóng khí và thay thế đầu dò siêu âm định kỳ.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              { id: "high", label: "🚨 Khẩn cấp (01)" },
              { id: "normal", label: "⚠️ Hiệu chuẩn (02)" },
              { id: "low", label: "ℹ️ Thấp (01)" },
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
          ) : filteredTickets.length === 0 ? (
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
                  {filteredTickets.map((t, idx) => (
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
                            t.priority === "high"
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold"
                              : t.priority === "normal"
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {t.priority === "high" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                          {t.priorityText}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono-data font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          {t.tech}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <Clock size={12} className="text-[#0284c7]" />
                          {t.status}
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
