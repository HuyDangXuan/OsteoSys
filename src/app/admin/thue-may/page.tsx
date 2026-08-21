"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  Search,
  Plus,
  Building2,
  Phone,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRentalDrawer } from "@/components/admin/AdminDrawers";
import { CountUp } from "@/components/admin/DynamicStatCards";
import {
  getRentals,
  getRentalStats,
  updateRentalStatus,
  extendRentalContract,
  JoinedRentalItem,
  RentalStatsResult,
} from "@/lib/actions/rentals";

export const dynamic = "force-dynamic";

export default function RentalManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [contracts, setContracts] = useState<JoinedRentalItem[]>([]);
  const [stats, setStats] = useState<RentalStatsResult>({
    totalContracts: 0,
    activeContracts: 0,
    expiringSoon7Days: 0,
    urgentExpiring3Days: 0,
    overdueContracts: 0,
    completedContracts: 0,
    totalDeposit: 0,
    formattedTotalDeposit: "0 ₫",
    totalMonthlyRevenue: 0,
    formattedMonthlyRevenue: "0 ₫",
    packageDistribution: { monthly: 0, longTerm: 0, dailyEvent: 0 },
  });

  // Modals & Drawers state
  const [selectedDevice, setSelectedDevice] = useState<JoinedRentalItem | null>(null);
  const [selectedDetailContract, setSelectedDetailContract] = useState<JoinedRentalItem | null>(null);
  const [extendContractItem, setExtendContractItem] = useState<JoinedRentalItem | null>(null);
  const [returnContractItem, setReturnContractItem] = useState<JoinedRentalItem | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contractsData, statsData] = await Promise.all([
        getRentals({ search: searchTerm, status: statusFilter, packageType: packageFilter }),
        getRentalStats(),
      ]);
      setContracts(contractsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load rental data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, packageFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
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
            Dữ liệu MongoDB $lookup: mapping trực tiếp cơ sở y tế, số serial máy, hạn kiểm chuẩn và doanh thu realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Tải lại dữ liệu từ MongoDB"
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
            <span>Tạo hợp đồng thuê mới</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Top Metric Cards (getRentalStats realtime) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TỔNG HỢP ĐỒNG */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[128px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tổng hợp đồng cho thuê
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono-data text-slate-900 dark:text-slate-100 tabular-nums">
                  <CountUp value={stats.totalContracts} />
                </span>
                <span className="text-xs text-slate-500 font-medium">hợp đồng</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-[#0284c7] dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900/50">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>{stats.packageDistribution.monthly} tháng • {stats.packageDistribution.longTerm} dài hạn</span>
            <span className="text-[#0284c7] font-semibold">{stats.completedContracts} đã hoàn tất</span>
          </div>
        </div>

        {/* CARD 2: ĐANG VẬN HÀNH & DOANH THU */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[128px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Hợp đồng đang vận hành
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <CountUp value={stats.activeContracts} />
                </span>
                <span className="text-xs text-slate-500 font-medium">máy tại cơ sở</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Doanh thu / tháng:</span>
            <span className="font-mono-data font-bold text-emerald-600 dark:text-emerald-400">
              {stats.formattedMonthlyRevenue}
            </span>
          </div>
        </div>

        {/* CARD 3: SẮP HẾT HẠN & CẢNH BÁO QUÁ HẠN */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[128px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Cảnh báo Hạn hợp đồng
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-bold font-mono-data tabular-nums ${
                  stats.overdueContracts > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : stats.expiringSoon7Days > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                  <CountUp value={stats.expiringSoon7Days + stats.overdueContracts} />
                </span>
                <span className="text-xs text-slate-500 font-medium">cần xử lý</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              stats.overdueContracts > 0
                ? "bg-rose-50 dark:bg-rose-950/70 text-rose-600 border-rose-200"
                : "bg-amber-50 dark:bg-amber-950/70 text-amber-600 border-amber-200"
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {stats.expiringSoon7Days} HĐ sắp hết hạn (≤7 ngày)
            </span>
            {stats.overdueContracts > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                {stats.overdueContracts} quá hạn
              </span>
            )}
          </div>
        </div>

        {/* CARD 4: TỔNG TIỀN CỌC THIẾT BỊ */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[128px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Tổng tiền cọc bảo chứng máy
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono-data text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {stats.formattedTotalDeposit}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Bảo đảm 100% tài sản Sonost</span>
            <span className="text-indigo-600 font-medium">Ký gửi an toàn</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-medium self-start">
            {[
              { id: "all", label: `Tất cả (${stats.totalContracts})` },
              { id: "active", label: `Đang thuê (${stats.activeContracts})` },
              { id: "expiring_soon", label: `Sắp hết hạn (${stats.expiringSoon7Days})` },
              { id: "overdue", label: `Quá hạn (${stats.overdueContracts})` },
              { id: "completed", label: `Đã hoàn tất (${stats.completedContracts})` },
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

          {/* Search & Package Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]"
            >
              <option value="all">Tất cả gói thuê</option>
              <option value="monthly">Thuê tháng</option>
              <option value="long_term">Thuê dài hạn</option>
              <option value="daily_event">Khám lưu động</option>
            </select>

            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã HĐ, bệnh viện, số serial..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]"
              />
            </div>
          </div>
        </div>

        {/* 4. Table Container */}
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
                title="Không tìm thấy hợp đồng nào"
                description={`Không có hợp đồng thuê nào phù hợp với điều kiện lọc "${searchTerm || statusFilter}".`}
                onReset={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPackageFilter("all");
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
                    <th className="py-3 px-3">Cơ Sở Y Tế / Khách Hàng</th>
                    <th className="py-3 px-3">Thiết Bị Gán</th>
                    <th className="py-3 px-3">Thời Hạn Thuê</th>
                    <th className="py-3 px-3">Phí Thuê / Tháng</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {contracts.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 ${
                        c.isOverdue
                          ? "bg-rose-50/40 dark:bg-rose-950/20"
                          : c.isUrgentExpiring
                          ? "bg-amber-50/40 dark:bg-amber-950/20"
                          : ""
                      }`}
                    >
                      {/* Mã HĐ */}
                      <td className="py-3 px-3 font-mono-data">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {c.contractCode}
                          </span>
                          <button
                            onClick={() => handleCopy(c.contractCode)}
                            title="Sao chép mã hợp đồng"
                            className="text-slate-400 hover:text-[#0284c7] transition-colors p-0.5"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        {copiedCode === c.contractCode && (
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            Đã sao chép!
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-sans">
                          {c.packageTypeLabel}
                        </span>
                      </td>

                      {/* Cơ sở y tế */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block text-xs">
                            {c.partnerName}
                          </span>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-[#0284c7]" />
                              {c.partnerPhone}
                            </span>
                            <span>•</span>
                            <span>{c.contactPerson}</span>
                          </div>
                        </div>
                      </td>

                      {/* Thiết bị gán */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedDevice(c)}
                          className="p-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-md text-left transition-colors group cursor-pointer"
                          title="Click để xem chi tiết thông số máy và tình trạng đầu dò"
                        >
                          <div className="flex items-center gap-1.5 font-mono-data font-bold text-[#0284c7] dark:text-sky-400 text-xs">
                            <Stethoscope size={13} className="shrink-0" />
                            <span>#{c.deviceSerial}</span>
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                            {c.deviceModel} (CV: {c.deviceCvScore}%)
                          </p>
                        </button>
                      </td>

                      {/* Thời hạn thuê */}
                      <td className="py-3 px-3 font-mono-data">
                        <div className="space-y-1">
                          <div className="text-slate-700 dark:text-slate-300">
                            {c.startDate} → {c.endDate}
                          </div>

                          {/* Dynamic Highlight Badge */}
                          {c.isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                              <AlertTriangle size={11} />
                              Quá hạn {Math.abs(c.remainingDays)} ngày
                            </span>
                          ) : c.isUrgentExpiring ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse">
                              <Clock size={11} />
                              Còn {c.remainingDays} ngày (Cần gia hạn)
                            </span>
                          ) : c.isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200">
                              <Clock size={11} />
                              Còn {c.remainingDays} ngày
                            </span>
                          ) : c.status === "active" ? (
                            <span className="text-[11px] text-slate-400">
                              Còn {c.remainingDays} ngày hiệu lực
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Phí thuê */}
                      <td className="py-3 px-3 font-mono-data">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          {c.formattedMonthlyFee}
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          Cọc: {c.formattedDeposit}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === "active" && !c.isOverdue
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : c.isOverdue
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 font-bold"
                              : c.status === "expiring_soon" || c.isUrgentExpiring
                              ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold"
                              : c.status === "completed"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              : "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {c.statusLabel}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Xem chi tiết HĐ & Phiếu cọc */}
                          <button
                            onClick={() => setSelectedDetailContract(c)}
                            className="p-1.5 text-slate-500 hover:text-[#0284c7] hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Xem chi tiết hợp đồng & phiếu thu cọc"
                          >
                            <FileText size={14} />
                          </button>

                          {/* Nút Gia hạn */}
                          {c.status !== "completed" && c.status !== "terminated" && (
                            <button
                              onClick={() => setExtendContractItem(c)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded text-xs font-medium transition-colors inline-flex items-center gap-1"
                              title="Gia hạn thời gian thuê máy"
                            >
                              <Clock size={12} />
                              <span>Gia hạn</span>
                            </button>
                          )}

                          {/* Nút Báo trả máy */}
                          {c.status !== "completed" && c.status !== "terminated" ? (
                            <button
                              onClick={() => setReturnContractItem(c)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-xs font-medium transition-colors inline-flex items-center gap-1"
                              title="Báo trả máy và nghiệm thu thiết bị"
                            >
                              <CheckCircle2 size={12} />
                              <span>Trả máy</span>
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await updateRentalStatus(c.contractCode, "active");
                                loadData();
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs transition-colors"
                            >
                              Kích hoạt lại
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 1: GIA HẠN HỢP ĐỒNG */}
      <AnimatePresence>
        {extendContractItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExtendContractItem(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Gia Hạn Hợp Đồng Thuê Máy
                    </h3>
                    <p className="text-xs text-slate-500">Mã: {extendContractItem.contractCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => setExtendContractItem(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const months = form.months.value;
                  const notes = form.notes.value;
                  await extendRentalContract(extendContractItem.contractCode, Number(months), notes);
                  setExtendContractItem(null);
                  loadData();
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Đơn vị:</strong> {extendContractItem.partnerName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Thiết bị:</strong> #{extendContractItem.deviceSerial} ({extendContractItem.deviceModel})
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Hạn hiện tại:</strong> {extendContractItem.endDate}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Thời gian gia hạn thêm
                  </label>
                  <select
                    name="months"
                    defaultValue="3"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  >
                    <option value="1">Thêm 01 tháng (Sự kiện / Lưu động)</option>
                    <option value="3">Thêm 03 tháng (Phổ biến)</option>
                    <option value="6">Thêm 06 tháng (Kỳ mới)</option>
                    <option value="12">Thêm 12 tháng (Dài hạn ưu đãi)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú điều khoản gia hạn
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="VD: Gia hạn tiếp đợt 2, giữ nguyên đơn giá 15.000.000 ₫/tháng..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setExtendContractItem(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Xác nhận gia hạn</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: BÁO TRẢ MÁY & NGHIỆM THU THU HỒI */}
      <AnimatePresence>
        {returnContractItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReturnContractItem(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Hoàn Tất Hợp Đồng &amp; Thu Hồi Máy
                    </h3>
                    <p className="text-xs text-slate-500">Mã: {returnContractItem.contractCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReturnContractItem(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const targetDeviceStatus = form.targetStatus.value;
                  const notes = form.notes.value;
                  await updateRentalStatus(returnContractItem.contractCode, "completed", {
                    targetDeviceStatus,
                    notes,
                  });
                  setReturnContractItem(null);
                  loadData();
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Đơn vị hoàn trả:</strong> {returnContractItem.partnerName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Thiết bị thu hồi:</strong> #{returnContractItem.deviceSerial}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Tiền cọc cần hoàn/đối soát:</strong> {returnContractItem.formattedDeposit}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái chuyển tiếp cho máy sau khi thu hồi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="targetStatus"
                    defaultValue="under_maintenance"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  >
                    <option value="under_maintenance">
                      🔬 Chuyển sang Kiểm chuẩn lại (Phòng Kỹ thuật - Đề xuất)
                    </option>
                    <option value="available">
                      ✅ Đưa thẳng về Kho Sẵn sàng bàn giao (Đã kiểm tra tại chỗ)
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Biên bản bàn giao / Ghi chú kiểm tra
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="VD: Thu hồi đầy đủ bóng dầu Silicone, khối chuẩn Phantom, máy hoạt động tốt..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnContractItem(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Xác nhận thu hồi máy</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: XEM THÔNG SỐ & ĐẦU DÒ THIẾT BỊ (Device Detail Modal) */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDevice(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950 text-[#0284c7] flex items-center justify-center border border-sky-200 dark:border-sky-800">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Máy Đo Loãng Xương #{selectedDevice.deviceSerial}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedDevice.deviceModel}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Tình trạng đầu dò gót chân</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedDevice.deviceProbeStatus}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-0.5">Độ lặp lại Phantom (CV%)</span>
                    <span className="font-mono-data font-bold text-[#0284c7] dark:text-sky-400 text-sm">
                      {selectedDevice.deviceCvScore}% (Chuẩn ISCD &lt; 1.0%)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Cơ sở đang thuê:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedDevice.partnerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tổng số ca đo tích lũy:</span>
                    <span className="font-mono-data font-bold text-slate-800 dark:text-slate-200">
                      {(selectedDevice.deviceTotalScans || 0).toLocaleString()} ca
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Vị trí lắp đặt:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {selectedDevice.deviceLocation}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded border border-sky-200 dark:border-sky-800 flex items-start gap-2 text-sky-800 dark:text-sky-300">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5 text-[#0284c7]" />
                  <p className="text-xs leading-relaxed">
                    Thiết bị được bảo hiểm kỹ thuật 24/7 bởi OsteoSys. Định kỳ 3 tháng kỹ sư kiểm chuẩn lại khối chuẩn Phantom Hologic tận nơi.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300 text-xs"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: CHI TIẾT HỢP ĐỒNG & PHIẾU THU CỌC */}
      <AnimatePresence>
        {selectedDetailContract && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailContract(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText size={18} className="text-[#0284c7]" />
                    Hồ Sơ Hợp Đồng &amp; Phiếu Thu Cọc
                  </h3>
                  <p className="text-xs text-slate-500 font-mono-data">{selectedDetailContract.contractCode}</p>
                </div>
                <button
                  onClick={() => setSelectedDetailContract(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Partner Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                    <Building2 size={15} className="text-[#0284c7]" />
                    {selectedDetailContract.partnerName}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block">Đại diện:</span>
                      <span>{selectedDetailContract.contactPerson}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hotline / SĐT:</span>
                      <span className="font-mono-data font-semibold">{selectedDetailContract.partnerPhone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Địa chỉ phòng khám:</span>
                    <span>{selectedDetailContract.partnerAddress}</span>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm flex items-center gap-1.5">
                    <DollarSign size={16} />
                    Thông Tin Tài Chính &amp; Đặt Cọc
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-indigo-100 dark:border-indigo-900/50">
                      <span className="text-slate-400 block text-[11px]">Đơn giá thuê hàng tháng</span>
                      <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {selectedDetailContract.formattedMonthlyFee}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-indigo-100 dark:border-indigo-900/50">
                      <span className="text-slate-400 block text-[11px]">Tiền đặt cọc máy</span>
                      <span className="font-mono-data font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {selectedDetailContract.formattedDeposit}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Điều khoản thanh toán: </span>
                    <span className="font-medium">{selectedDetailContract.paymentTerms}</span>
                  </div>
                </div>

                {/* Machine and Period */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <Calendar size={15} className="text-[#0284c7]" />
                    Thời Hạn Hợp Đồng &amp; Máy Sonost
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block">Ngày bắt đầu:</span>
                      <span className="font-mono-data font-semibold">{selectedDetailContract.startDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ngày kết thúc:</span>
                      <span className="font-mono-data font-semibold">{selectedDetailContract.endDate}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 block">Thiết bị cấp phát:</span>
                    <span className="font-mono-data font-bold text-[#0284c7] dark:text-sky-400">
                      #{selectedDetailContract.deviceSerial} — {selectedDetailContract.deviceModel}
                    </span>
                  </div>
                  {selectedDetailContract.notes && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-400 block">Ghi chú điều khoản:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">{selectedDetailContract.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDetailContract(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold text-xs"
                >
                  Đóng hồ sơ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Drawer Tạo Hợp Đồng Mới */}
      <CreateRentalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
