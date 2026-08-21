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
  Kanban,
  Table as TableIcon,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  X,
  Stethoscope,
  ArrowRight,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRepairModal } from "@/components/admin/AdminDrawers";
import { CountUp } from "@/components/admin/DynamicStatCards";
import {
  getRepairTickets,
  getRepairStats,
  updateRepairTimeline,
  JoinedRepairTicketItem,
  RepairStatsResult,
} from "@/lib/actions/repairs";
import { RepairTicketStatus, ReplacedPart } from "@/types/db";

export const dynamic = "force-dynamic";

const KANBAN_COLUMNS: {
  id: RepairTicketStatus;
  title: string;
  badgeColor: string;
  borderColor: string;
}[] = [
  { id: "received", title: "1. Tiếp nhận", badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", borderColor: "border-slate-300 dark:border-slate-700" },
  { id: "diagnosing", title: "2. Đang chẩn đoán", badgeColor: "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400", borderColor: "border-sky-300 dark:border-sky-800" },
  { id: "parts_waiting", title: "3. Chờ linh kiện", badgeColor: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400", borderColor: "border-purple-300 dark:border-purple-800" },
  { id: "in_progress", title: "4. Đang sửa chữa", badgeColor: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400", borderColor: "border-amber-300 dark:border-amber-800" },
  { id: "calibrating", title: "5. Hiệu chuẩn & QC", badgeColor: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400", borderColor: "border-indigo-300 dark:border-indigo-800" },
  { id: "delivered", title: "6. Đã bàn giao", badgeColor: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400", borderColor: "border-emerald-300 dark:border-emerald-800" },
];

const AVAILABLE_SPARE_PARTS = [
  { partName: "Đầu dò siêu âm gót chân BUA/SOS (Sonost 3000)", cost: 5500000, warrantyMonths: 12 },
  { partName: "Màng bóng dầu Silicon Sonost chính hãng", cost: 850000, warrantyMonths: 6 },
  { partName: "Khối chuẩn Phantom Hologic định chuẩn QC", cost: 1200000, warrantyMonths: 12 },
  { partName: "Bo mạch xung cao tần Tx/Rx Board", cost: 3800000, warrantyMonths: 12 },
  { partName: "Bộ nguồn y tế cách ly MeanWell 24V/5A", cost: 1650000, warrantyMonths: 12 },
  { partName: "Màn hình LCD màu hiển thị kết quả 6.4 inch", cost: 2900000, warrantyMonths: 6 },
  { partName: "Module máy in nhiệt tích hợp & Cáp kết nối", cost: 1450000, warrantyMonths: 6 },
];

export default function RepairManagementPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tickets, setTickets] = useState<JoinedRepairTicketItem[]>([]);
  const [stats, setStats] = useState<RepairStatsResult>({
    totalTickets: 0,
    activeTickets: 0,
    receivedCount: 0,
    diagnosingCount: 0,
    partsWaitingCount: 0,
    inProgressCount: 0,
    calibratingCount: 0,
    deliveredCount: 0,
    urgentCount: 0,
    totalCost: 0,
    formattedTotalCost: "0 ₫",
  });

  // Progress Update Modal
  const [selectedTicketForProgress, setSelectedTicketForProgress] = useState<JoinedRepairTicketItem | null>(null);
  const [selectedParts, setSelectedParts] = useState<ReplacedPart[]>([]);
  const [laborCostInput, setLaborCostInput] = useState<string>("500000");
  const [progressNote, setProgressNote] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<RepairTicketStatus>("in_progress");
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        getRepairTickets({ search: searchTerm, priority: priorityFilter, status: statusFilter }),
        getRepairStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load repair data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, priorityFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadData]);

  const openProgressModal = (ticket: JoinedRepairTicketItem) => {
    setSelectedTicketForProgress(ticket);
    setSelectedParts([]);
    setLaborCostInput("500000");
    setProgressNote("");
    // Set default next logical step
    const currentIdx = KANBAN_COLUMNS.findIndex((c) => c.id === ticket.status);
    const nextStep = currentIdx >= 0 && currentIdx < KANBAN_COLUMNS.length - 1
      ? KANBAN_COLUMNS[currentIdx + 1].id
      : ticket.status;
    setTargetStatus(nextStep);
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForProgress) return;

    setIsSavingProgress(true);
    try {
      const res = await updateRepairTimeline(selectedTicketForProgress.ticketCode, targetStatus, {
        note: progressNote || `Chuyển tiến độ sang ${targetStatus}`,
        parts: selectedParts,
        laborCost: Number(laborCostInput) || 0,
      });

      if (res.success) {
        setSelectedTicketForProgress(null);
        loadData();
      } else {
        alert("Lỗi: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi cập nhật tiến độ");
    } finally {
      setIsSavingProgress(false);
    }
  };

  const togglePartSelection = (part: typeof AVAILABLE_SPARE_PARTS[0]) => {
    if (selectedParts.some((p) => p.partName === part.partName)) {
      setSelectedParts(selectedParts.filter((p) => p.partName !== part.partName));
    } else {
      setSelectedParts([
        ...selectedParts,
        { partName: part.partName, cost: part.cost, warrantyMonths: part.warrantyMonths },
      ]);
    }
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
            Quản lý Sửa chữa &amp; Bảo dưỡng Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quy trình kiểm chuẩn ISO y tế &amp; Kanban tiến độ phụ tùng thay thế thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle: Kanban ⇄ Table */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-900 text-[#0284c7] dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Kanban size={13} />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-[#0284c7] dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <TableIcon size={13} />
              <span>Danh sách chi tiết</span>
            </button>
          </div>

          <button
            onClick={loadData}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-md shadow-2xs transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Tạo lệnh sửa chữa mới</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[124px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Lệnh kỹ thuật đang xử lý</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono-data text-amber-600 dark:text-amber-400 tabular-nums">
                  <CountUp value={stats.activeTickets} />
                </span>
                <span className="text-xs text-slate-500">ca tiếp nhận</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center border border-amber-200 dark:border-amber-900">
              <Wrench size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>{stats.diagnosingCount} đang chẩn đoán • {stats.inProgressCount} đang sửa</span>
            <span className="text-emerald-600 font-semibold">{stats.deliveredCount} đã giao</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[124px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Sự cố khẩn cấp (Priority Urgent)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-bold font-mono-data tabular-nums ${
                  stats.urgentCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"
                }`}>
                  <CountUp value={stats.urgentCount} />
                </span>
                <span className="text-xs text-slate-500">máy ngừng đo</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              stats.urgentCount > 0
                ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200"
                : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200"
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-rose-600 font-medium">Ưu tiên điều phối kỹ sư ngay</span>
            <span className="text-slate-400">SLA &lt; 24h</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[124px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Chờ phụ tùng &amp; Hiệu chuẩn QC</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono-data text-indigo-600 dark:text-indigo-400 tabular-nums">
                  <CountUp value={stats.partsWaitingCount + stats.calibratingCount} />
                </span>
                <span className="text-xs text-slate-500">ca trong kho kỹ thuật</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>{stats.partsWaitingCount} chờ linh kiện</span>
            <span className="text-indigo-600 font-semibold">{stats.calibratingCount} đang chuẩn Phantom</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between min-h-[124px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Tổng chi phí linh kiện &amp; công</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {stats.formattedTotalCost}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Bảo hành chính hãng 12 tháng</span>
            <span className="text-emerald-600 font-medium">Đã đối soát</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Priority Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Mức độ:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "urgent", label: "🚨 Khẩn cấp" },
              { id: "calibration", label: "⚠️ Kiểm chuẩn" },
              { id: "normal", label: "ℹ️ Bình thường" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriorityFilter(p.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  priorityFilter === p.id
                    ? "bg-[#0284c7] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã SC, số serial, lỗi, kỹ sư..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs outline-none focus:border-[#0284c7]"
            />
          </div>
        </div>

        {/* 4. Main Body: Kanban Board OR Table View */}
        <AnimatePresence mode="wait">
          {viewMode === "kanban" ? (
            /* KANBAN BOARD VIEW */
            <motion.div
              key="kanban"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 pt-2"
            >
              {KANBAN_COLUMNS.map((col) => {
                const colTickets = tickets.filter((t) => {
                  if (col.id === "calibrating") return t.status === "calibrating" || t.status === "qc_passed";
                  return t.status === col.id;
                });

                return (
                  <div
                    key={col.id}
                    className="flex flex-col bg-slate-50/70 dark:bg-slate-950/40 rounded-lg p-2.5 border border-slate-200/80 dark:border-slate-800/80 min-h-[480px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                        {col.title}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono-data font-bold ${col.badgeColor}`}>
                        {colTickets.length}
                      </span>
                    </div>

                    {/* Column Cards List */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto">
                      {colTickets.length === 0 ? (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded text-slate-400 text-xs text-center p-2">
                          Không có lệnh nào
                        </div>
                      ) : (
                        colTickets.map((t) => (
                          <motion.div
                            key={t.id}
                            whileHover={{ y: -2, transition: { duration: 0.15 } }}
                            onClick={() => openProgressModal(t)}
                            className={`p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-2xs hover:border-[#0284c7] cursor-pointer transition-all space-y-2 relative group ${
                              t.priority === "urgent"
                                ? "border-rose-300 dark:border-rose-900/60 shadow-rose-500/5"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {/* Card Top: Code & Priority */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
                                {t.ticketCode}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                t.priority === "urgent"
                                  ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}>
                                {t.priority === "urgent" ? "🚨 Khẩn cấp" : "Bình thường"}
                              </span>
                            </div>

                            {/* Device & Location */}
                            <div>
                              <div className="font-mono-data font-semibold text-[#0284c7] dark:text-sky-400 text-xs flex items-center gap-1">
                                <Stethoscope size={11} />
                                <span>#{t.deviceSerial}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={t.partnerName}>
                                {t.partnerName}
                              </p>
                            </div>

                            {/* Reported Issue */}
                            <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {t.reportedIssue}
                            </div>

                            {/* Parts replaced badge if any */}
                            {t.partsReplaced && t.partsReplaced.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                <Package size={11} />
                                <span>{t.partsReplaced.length} linh kiện thay thế</span>
                              </div>
                            )}

                            {/* Footer: Technician & Action */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 truncate max-w-[120px]" title={t.technicianName}>
                                <User size={11} />
                                {t.technicianName}
                              </span>
                              <span className="text-[#0284c7] opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5">
                                Cập nhật <ArrowRight size={10} />
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            /* DATA TABLE VIEW */
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
                    <th className="py-3 px-3">Mã Phiếu</th>
                    <th className="py-3 px-3">Thiết Bị</th>
                    <th className="py-3 px-3">Cơ Sở Y Tế</th>
                    <th className="py-3 px-3">Sự Cố Kỹ Thuật</th>
                    <th className="py-3 px-3">Kỹ Sư Phụ Trách</th>
                    <th className="py-3 px-3">Giai Đoạn</th>
                    <th className="py-3 px-3 text-right">Chi Phí</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono-data font-bold text-slate-900 dark:text-slate-100">
                        {t.ticketCode}
                      </td>
                      <td className="py-3 px-3 font-mono-data font-semibold text-[#0284c7] dark:text-sky-400">
                        #{t.deviceSerial}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {t.partnerName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {t.reportedIssue}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {t.technicianName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {t.statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-data font-bold text-slate-900 dark:text-slate-100">
                        {t.formattedCost}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => openProgressModal(t)}
                          className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-xs font-semibold transition-colors"
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PROGRESS & QC MODAL */}
      <AnimatePresence>
        {selectedTicketForProgress && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicketForProgress(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Cập Nhật Tiến Độ &amp; Phụ Tùng Sửa Chữa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Phiếu: {selectedTicketForProgress.ticketCode} — Máy #{selectedTicketForProgress.deviceSerial}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicketForProgress(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
                {/* Summary Info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block">Cơ sở gửi:</span>
                    <span className="font-semibold">{selectedTicketForProgress.partnerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sự cố ghi nhận:</span>
                    <span>{selectedTicketForProgress.reportedIssue}</span>
                  </div>
                </div>

                {/* Next Step Selector */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chuyển giai đoạn tiến độ tiếp theo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as RepairTicketStatus)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] font-semibold"
                  >
                    <option value="received">1. Tiếp nhận (Received)</option>
                    <option value="diagnosing">2. Đang chẩn đoán kỹ thuật (Diagnosing)</option>
                    <option value="parts_waiting">3. Chờ xuất kho linh kiện (Parts Waiting)</option>
                    <option value="in_progress">4. Đang sửa chữa &amp; Thay thế (In Progress)</option>
                    <option value="calibrating">5. Đang hiệu chuẩn Phantom ISCD (Calibrating)</option>
                    <option value="delivered">6. Đã kiểm chuẩn ĐẠT &amp; Bàn giao về Kho Sẵn sàng (Delivered)</option>
                  </select>
                </div>

                {/* Spare Parts Replacement Selector */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Linh kiện / Phụ tùng y tế thay thế:</span>
                    <span className="text-[#0284c7] font-mono-data font-bold">
                      {selectedParts.length} mục đã chọn
                    </span>
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_SPARE_PARTS.map((part) => {
                      const isSelected = selectedParts.some((p) => p.partName === part.partName);
                      return (
                        <div
                          key={part.partName}
                          onClick={() => togglePartSelection(part)}
                          className={`p-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-sky-50 dark:bg-sky-950 border border-sky-300 dark:border-sky-800 text-[#0284c7]"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="font-medium text-xs truncate max-w-[340px]">
                            {part.partName}
                          </span>
                          <span className="font-mono-data font-bold shrink-0">
                            {new Intl.NumberFormat("vi-VN").format(part.cost)} ₫
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Costs & Labor */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Chi phí nhân công kỹ thuật (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={laborCostInput}
                      onChange={(e) => setLaborCostInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono-data outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Tổng chi phí nghiệm thu
                    </label>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800 font-mono-data font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {new Intl.NumberFormat("vi-VN").format(
                        selectedParts.reduce((sum, p) => sum + p.cost, 0) + (Number(laborCostInput) || 0)
                      )} ₫
                    </div>
                  </div>
                </div>

                {/* Technician Notes */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nhật ký kỹ thuật &amp; Kết luận QC
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: Đã thay thế màng bóng dầu silicon và kiểm chuẩn Phantom Hologic đạt CV 0.72%..."
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded outline-none focus:border-[#0284c7]"
                  />
                </div>

                {/* Auto QC Notice if marking delivered */}
                {(targetStatus === "delivered" || targetStatus === "calibrating") && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <Sparkles size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Tự động gia hạn kiểm định:</strong> Hệ thống sẽ tự động cập nhật chứng nhận kiểm chuẩn ISCD cho máy <strong>#{selectedTicketForProgress.deviceSerial}</strong> (CV 0.72%, QC Đạt chuẩn, hạn 90 ngày) và đưa máy về trạng thái <strong>Sẵn sàng trong kho</strong>.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForProgress(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProgress}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FileCheck size={14} />
                    <span>Lưu tiến độ &amp; Nghiệm thu</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tạo Lệnh Sửa Chữa Mới */}
      <CreateRepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
