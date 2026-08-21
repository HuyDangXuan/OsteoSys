"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  Building2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRentalDrawer } from "@/components/admin/AdminDrawers";

interface RentalContract {
  id: string;
  client: string;
  facilityType: string;
  device: string;
  startDate: string;
  endDate: string;
  monthlyFee: string;
  status: "active" | "pending" | "completed" | "overdue";
  statusText: string;
  bmdCheckups: number;
}

export default function RentalManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [contracts, setContracts] = useState<RentalContract[]>([
    {
      id: "HD-2026-089",
      client: "Bệnh viện Đa khoa Hồng Ngọc",
      facilityType: "Bệnh viện Đa khoa",
      device: "Sonost 3000 (#SN-4102)",
      startDate: "15/08/2026",
      endDate: "15/02/2027",
      monthlyFee: "15.000.000 đ",
      status: "active",
      statusText: "Đang vận hành",
      bmdCheckups: 342,
    },
    {
      id: "HD-2026-088",
      client: "Phòng khám Đa khoa Medlatec",
      facilityType: "Phòng khám tư nhân",
      device: "Sonost 3000 (#SN-8842)",
      startDate: "01/08/2026",
      endDate: "01/11/2026",
      monthlyFee: "18.000.000 đ",
      status: "active",
      statusText: "Đang vận hành",
      bmdCheckups: 512,
    },
    {
      id: "HD-2026-087",
      client: "BV ĐH Y Dược TP.HCM",
      facilityType: "Bệnh viện Tuyến 1",
      device: "Sonost 3000 (#SN-3190)",
      startDate: "20/07/2026",
      endDate: "20/01/2027",
      monthlyFee: "16.500.000 đ",
      status: "active",
      statusText: "Đang vận hành",
      bmdCheckups: 720,
    },
    {
      id: "HD-2026-085",
      client: "TT Y tế Quận Cầu Giấy",
      facilityType: "Khám sức khỏe DN",
      device: "Sonost 3000 (#SN-5541)",
      startDate: "05/08/2026",
      endDate: "25/08/2026",
      monthlyFee: "12.000.000 đ",
      status: "overdue",
      statusText: "Sắp hết hạn",
      bmdCheckups: 180,
    },
    {
      id: "HD-2026-084",
      client: "PK Quốc tế CarePlus",
      facilityType: "Phòng khám quốc tế",
      device: "Sonost 3000 (#SN-1022)",
      startDate: "10/05/2026",
      endDate: "10/08/2026",
      monthlyFee: "15.000.000 đ",
      status: "completed",
      statusText: "Đã hoàn tất",
      bmdCheckups: 490,
    },
  ]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.device.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSuccess = (newContract: any) => {
    setContracts([
      {
        ...newContract,
        facilityType: "Cơ sở Y tế Đối tác",
        monthlyFee: newContract.revenue,
        bmdCheckups: 0,
      },
      ...contracts,
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
            <CalendarCheck className="text-[#0284c7]" size={24} />
            Quản lý Hợp đồng Thuê Máy Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi tiến độ bàn giao, kiểm định định kỳ và doanh thu cho thuê theo cơ sở y tế.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              { id: "active", label: "Đang vận hành (32)" },
              { id: "overdue", label: "Sắp hết hạn (03)" },
              { id: "completed", label: "Đã thanh lý (15)" },
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
          ) : filteredContracts.length === 0 ? (
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
                  {filteredContracts.map((c, idx) => (
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
                        {c.bmdCheckups} ca
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : c.status === "overdue"
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {c.statusText}
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
