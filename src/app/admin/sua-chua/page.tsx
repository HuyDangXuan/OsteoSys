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
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Stethoscope,
  ArrowRight,
  FileCheck,
  Sparkles,
  Archive,
  RotateCcw,
  History,
  Eye,
  FileText,
  Inbox,
  Layers,
  Activity,
  Printer,
  QrCode,
  Check,
  MoreVertical,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { TableEmptyState } from "@/components/admin/TableStates";
import { CreateRepairModal } from "@/components/admin/AdminDrawers";
import { CountUp } from "@/components/admin/DynamicStatCards";
import {
  getRepairTickets,
  getRepairStats,
  updateRepairTimeline,
  archiveRepairTicket,
  JoinedRepairTicketItem,
  RepairStatsResult,
} from "@/lib/actions/repairs";
import { RepairTicketStatus, ReplacedPart } from "@/types/db";

export const dynamic = "force-dynamic";

interface PipelineStageConfig {
  id: string; // "all" | "urgent" | RepairTicketStatus
  title: string;
  stepNumber?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  badgeBg: string;
  badgeText: string;
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: "all",
    title: "Tất cả phiếu",
    icon: Layers,
    color: "text-slate-700 dark:text-slate-300",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-300",
  },
  {
    id: "urgent",
    title: "Khẩn cấp (SLA 24h)",
    icon: AlertTriangle,
    color: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-100 dark:bg-rose-950",
    badgeText: "text-rose-700 dark:text-rose-400",
  },
  {
    id: "received",
    stepNumber: 1,
    title: "1. Tiếp nhận",
    icon: Inbox,
    color: "text-slate-600 dark:text-slate-400",
    badgeBg: "bg-slate-200/80 dark:bg-slate-800",
    badgeText: "text-slate-700 dark:text-slate-300",
  },
  {
    id: "diagnosing",
    stepNumber: 2,
    title: "2. Chẩn đoán & Báo giá",
    icon: Stethoscope,
    color: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-100 dark:bg-cyan-950",
    badgeText: "text-cyan-700 dark:text-cyan-400",
  },
  {
    id: "parts_waiting",
    stepNumber: 3,
    title: "3. Chờ linh kiện",
    icon: Package,
    color: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-100 dark:bg-amber-950",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "in_progress",
    stepNumber: 4,
    title: "4. Đang sửa chữa",
    icon: Wrench,
    color: "text-sky-600 dark:text-sky-400",
    badgeBg: "bg-sky-100 dark:bg-sky-950",
    badgeText: "text-sky-700 dark:text-sky-400",
  },
  {
    id: "calibrating",
    stepNumber: 5,
    title: "5. Hiệu chuẩn QC",
    icon: ShieldCheck,
    color: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-100 dark:bg-indigo-950",
    badgeText: "text-indigo-700 dark:text-indigo-400",
  },
  {
    id: "delivered",
    stepNumber: 6,
    title: "6. Đã bàn giao",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950",
    badgeText: "text-emerald-700 dark:text-emerald-400",
  },
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

const STEP_ORDER: RepairTicketStatus[] = [
  "received",
  "diagnosing",
  "parts_waiting",
  "in_progress",
  "calibrating",
  "delivered",
];

export default function RepairManagementPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Master-Detail Expanded Rows
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

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

  // Print Handover Certificate Modal
  const [printTicket, setPrintTicket] = useState<JoinedRepairTicketItem | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        getRepairTickets({
          search: searchTerm,
          priority: priorityFilter,
          status: activeTab === "all" || activeTab === "urgent" ? "all" : activeTab,
        }),
        getRepairStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load repair data:", err);
      toast.error("Không thể tải dữ liệu sửa chữa");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, priorityFilter, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadData]);

  const toggleRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openProgressModal = (ticket: JoinedRepairTicketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTicketForProgress(ticket);
    setSelectedParts(ticket.partsReplaced || []);
    setLaborCostInput("500000");
    setProgressNote("");
    const currentIdx = STEP_ORDER.indexOf(ticket.status);
    const nextStep = currentIdx >= 0 && currentIdx < STEP_ORDER.length - 1
      ? STEP_ORDER[currentIdx + 1]
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
        toast.success(res.message);
        setSelectedTicketForProgress(null);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật tiến độ");
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleQuickAdvance = async (ticket: JoinedRepairTicketItem, nextStatus: RepairTicketStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await updateRepairTimeline(ticket.ticketCode, nextStatus, {
        note: `Chuyển nhanh trạng thái sang ${nextStatus}`,
        parts: ticket.partsReplaced,
        laborCost: 500000,
      });
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi chuyển trạng thái");
    }
  };

  const handleArchiveTicket = async (ticketCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await archiveRepairTicket(ticketCode);
      if (res.success) {
        toast.success(res.message);
        if (selectedTicketForProgress?.ticketCode === ticketCode) {
          setSelectedTicketForProgress(null);
        }
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu trữ hồ sơ");
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

  // Filter tickets for current tab
  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "urgent") return t.priority === "urgent" && t.status !== "archived";
    if (activeTab === "all") return t.status !== "archived";
    if (activeTab === "calibrating") return t.status === "calibrating" || t.status === "qc_passed";
    return t.status === activeTab;
  });

  const getStageCount = (stageId: string): number => {
    if (stageId === "all") return stats.activeTickets;
    if (stageId === "urgent") return stats.urgentCount;
    if (stageId === "received") return stats.receivedCount;
    if (stageId === "diagnosing") return stats.diagnosingCount;
    if (stageId === "parts_waiting") return stats.partsWaitingCount;
    if (stageId === "in_progress") return stats.inProgressCount;
    if (stageId === "calibrating") return stats.calibratingCount;
    if (stageId === "delivered") return stats.deliveredCount;
    return 0;
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
            Quản lý Tiến trình Sửa chữa &amp; Bảo dưỡng Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tiến trình dọc Master-Detail thời gian thực &amp; Kiểm chuẩn ISCD y tế chống tràn ngang.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Plus size={15} />
            <span>Tạo lệnh sửa chữa mới</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Lệnh kỹ thuật đang xử lý</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  <CountUp value={stats.activeTickets} />
                </span>
                <span className="text-xs text-slate-500">ca tiếp nhận</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center border border-amber-200 dark:border-amber-900">
              <Wrench size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>{stats.diagnosingCount} đang chẩn đoán • {stats.inProgressCount} đang sửa</span>
            <span className="text-emerald-600 font-semibold">{stats.deliveredCount} đã giao</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Sự cố khẩn cấp (SLA &lt; 24h)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                  stats.urgentCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"
                }`}>
                  <CountUp value={stats.urgentCount} />
                </span>
                <span className="text-xs text-slate-500">máy ngừng đo</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              stats.urgentCount > 0
                ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200"
                : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200"
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
            <span className="text-rose-600 font-medium">Ưu tiên điều phối kỹ sư ngay</span>
            <span className="text-slate-400">SLA 24h</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Chờ linh kiện &amp; Hiệu chuẩn QC</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                  <CountUp value={stats.partsWaitingCount + stats.calibratingCount} />
                </span>
                <span className="text-xs text-slate-500">ca trong kho kỹ thuật</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>{stats.partsWaitingCount} chờ linh kiện</span>
            <span className="text-indigo-600 font-semibold">{stats.calibratingCount} đang chuẩn Phantom</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Tổng chi phí phụ tùng &amp; công</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {stats.formattedTotalCost}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Bảo hành chính hãng 12 tháng</span>
            <span className="text-emerald-600 font-medium">Đã đối soát</span>
          </div>
        </div>
      </div>

      {/* 3. Top Pipeline Stepper Bar (6-Stage Pipeline + Filters) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-2xs">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const count = getStageCount(stage.id);
            const isActive = activeTab === stage.id;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveTab(stage.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-[#0284c7] text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : stage.color} />
                <span>{stage.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                    isActive
                      ? "bg-white/20 text-white"
                      : `${stage.badgeBg} ${stage.badgeText}`
                  }`}
                >
                  {count}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="active-repair-tab"
                    className="absolute inset-0 border-2 border-sky-400 rounded-lg pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Bộ lọc mức độ:</span>
          {[
            { id: "all", label: "Tất cả" },
            { id: "urgent", label: "🚨 Khẩn cấp" },
            { id: "calibration", label: "⚠️ Kiểm chuẩn" },
            { id: "normal", label: "ℹ️ Bình thường" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPriorityFilter(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                priorityFilter === p.id
                  ? "bg-[#0284c7] text-white shadow-xs font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã SC, số serial, cơ sở y tế, kỹ sư..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-[#0284c7] transition-colors"
          />
        </div>
      </div>

      {/* 5. Master-Detail Vertical Data Table (Full Width, Zero Horizontal Scroll) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-3">Mã Phiếu &amp; Ngày Tạo</th>
                <th className="py-3 px-3">Cơ Sở Y Tế &amp; Liên Hệ</th>
                <th className="py-3 px-3">Thiết Bị Sonost 3000</th>
                <th className="py-3 px-3">Sự Cố Kỹ Thuật</th>
                <th className="py-3 px-3">Kỹ Sư &amp; Tiến Độ</th>
                <th className="py-3 px-3 text-right">Chi Phí &amp; Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <TableEmptyState
                      title="Không có phiếu sửa chữa nào"
                      description="Không tìm thấy lệnh kỹ thuật phù hợp với bộ lọc hiện tại."
                    />
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isExpanded = !!expandedRowIds[t.id];
                  const currentStepIdx = STEP_ORDER.indexOf(t.status);
                  const stepNumber = currentStepIdx >= 0 ? currentStepIdx + 1 : 1;
                  const progressPct = Math.round((stepNumber / 6) * 100);

                  return (
                    <React.Fragment key={t.id}>
                      {/* Master Row */}
                      <tr
                        onClick={() => toggleRow(t.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          isExpanded ? "bg-sky-50/30 dark:bg-sky-950/20" : ""
                        }`}
                      >
                        {/* Expand Chevron Icon */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => toggleRow(t.id, e)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </td>

                        {/* Cột 1: Mã Phiếu & Ngày tiếp nhận */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                              {t.ticketCode}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </td>

                        {/* Cột 2: Cơ sở Y tế & Liên hệ */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col max-w-[200px]">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate flex items-center gap-1.5" title={t.partnerName}>
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate">{t.partnerName}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {t.partnerPhone || "024 3927 5568"}
                            </span>
                          </div>
                        </td>

                        {/* Cột 3: Thiết bị Sonost 3000 */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-[#0284c7] dark:text-sky-400 text-xs flex items-center gap-1">
                              <Stethoscope size={12} />
                              #{t.deviceSerial}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {t.deviceModel || "Sonost 3000 PRO"}
                            </span>
                          </div>
                        </td>

                        {/* Cột 4: Sự cố & Triệu chứng */}
                        <td className="py-3.5 px-3">
                          <div className="max-w-[220px]">
                            <p className="text-xs text-slate-700 dark:text-slate-300 truncate" title={t.reportedIssue}>
                              {t.reportedIssue}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {t.priority === "urgent" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200/60">
                                  <AlertTriangle size={10} />
                                  Khẩn cấp
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Độ ưu tiên: {t.priorityLabel}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cột 5: Kỹ sư & Tiến độ */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1.5 min-w-[130px]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {t.technicianName?.charAt(0) || "K"}
                              </div>
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                {t.technicianName}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  t.status === "delivered" ? "bg-emerald-500" : "bg-[#0284c7]"
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Giai đoạn {stepNumber}/6 ({t.statusLabel})
                            </span>
                          </div>
                        </td>

                        {/* Cột 6: Trạng thái & Chi phí */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                t.status === "delivered"
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                  : t.status === "calibrating"
                                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200"
                                  : t.status === "in_progress"
                                  ? "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200"
                                  : t.status === "parts_waiting"
                                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {t.status === "delivered" && <CheckCircle2 size={10} />}
                              {t.statusLabel}
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {t.formattedCost}
                            </span>
                          </div>
                        </td>

                        {/* Cột 7: Thao tác nhanh */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrintTicket(t);
                              }}
                              title="In biên bản nghiệm thu & bàn giao y tế"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs transition-colors"
                            >
                              <Printer size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => openProgressModal(t, e)}
                              className="px-2.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <span>Cập nhật</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Detail Sub-Accordion Row (Master-Detail) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-950/70">
                            <td colSpan={8} className="p-0 border-t border-b border-slate-200 dark:border-slate-800">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden p-5"
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                                  {/* Cột Trái (40% - 5 cols): Audit Timeline */}
                                  <div className="lg:col-span-5 space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                      <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Activity size={14} className="text-[#0284c7]" />
                                        <span>Nhật Ký Tiến Độ Kỹ Thuật (Audit Log)</span>
                                      </h4>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        {t.timeline?.length || 0} mốc ghi nhận
                                      </span>
                                    </div>

                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                      {t.timeline && t.timeline.length > 0 ? (
                                        t.timeline.map((entry, idx) => (
                                          <div key={idx} className="flex items-start gap-2.5 relative pl-4 pb-2 border-l-2 border-sky-300 dark:border-sky-800 last:border-transparent last:pb-0">
                                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#0284c7]" />
                                            <div className="space-y-0.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                                  {entry.statusLabel}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  {entry.timestamp}
                                                </span>
                                              </div>
                                              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                                                {entry.note}
                                              </p>
                                              <span className="text-[10px] text-slate-400 italic">
                                                Cập nhật bởi: {entry.updatedBy}
                                              </span>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-slate-400 italic">Chưa có nhật ký ghi nhận.</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Cột Phải (60% - 7 cols): Technical Details, Parts & 1-Touch Quick Advance */}
                                  <div className="lg:col-span-7 space-y-4">
                                    {/* 1. Bảng kê phụ tùng & Linh kiện thay thế */}
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
                                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                          <Package size={14} className="text-purple-600" />
                                          <span>Linh Kiện &amp; Phụ Tùng Y Tế Thay Thế</span>
                                        </h4>
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                                          Tổng: {t.formattedCost}
                                        </span>
                                      </div>

                                      {t.partsReplaced && t.partsReplaced.length > 0 ? (
                                        <div className="space-y-1.5">
                                          {t.partsReplaced.map((part, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs"
                                            >
                                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {part.partName}
                                              </span>
                                              <div className="flex items-center gap-3">
                                                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                                                  Bảo hành {part.warrantyMonths}T
                                                </span>
                                                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                                  {new Intl.NumberFormat("vi-VN").format(part.cost)} ₫
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-slate-400 italic text-[11px]">
                                          Không thay thế linh kiện (Chẩn đoán &amp; Hiệu chuẩn định kỳ).
                                        </p>
                                      )}
                                    </div>

                                    {/* 2. Thông số Kiểm Chuẩn Phantom ISCD */}
                                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                          <Sparkles size={16} />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
                                            Kiểm Chuẩn Khối Chuẩn Phantom ISCD QC
                                          </p>
                                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                                            Chứng chỉ: <strong>ISCD-REP-{t.ticketCode}</strong> • Hệ số CV: <strong>0.72%</strong> (Đạt chuẩn ISCD &lt; 1.0%)
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => setPrintTicket(t)}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                                      >
                                        <Printer size={13} />
                                        <span>In Biên Bản</span>
                                      </button>
                                    </div>

                                    {/* 3. Thanh Chuyển Bước Nhanh (1-Touch Quick Advance Action Bar) */}
                                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
                                      <span className="text-[11px] font-semibold text-slate-500 block">
                                        Chuyển nhanh trạng thái 1-chạm:
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {STEP_ORDER.map((s, sIdx) => {
                                          const isCurrent = t.status === s;
                                          return (
                                            <button
                                              key={s}
                                              type="button"
                                              disabled={isCurrent}
                                              onClick={(e) => handleQuickAdvance(t, s, e)}
                                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                                                isCurrent
                                                  ? "bg-[#0284c7] text-white font-bold cursor-default shadow-xs"
                                                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                              }`}
                                            >
                                              <span>{sIdx + 1}. {PIPELINE_STAGES.find((p) => p.id === s)?.title.replace(/^\d+\.\s*/, "")}</span>
                                              {isCurrent && <Check size={11} />}
                                            </button>
                                          );
                                        })}

                                        {t.status === "delivered" && (
                                          <button
                                            type="button"
                                            onClick={(e) => handleArchiveTicket(t.ticketCode, e)}
                                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors ml-auto"
                                            title="Lưu trữ hồ sơ và rút khỏi bảng"
                                          >
                                            <Archive size={11} />
                                            <span>Lưu trữ</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL CẬP NHẬT TIẾN ĐỘ & PHỤ TÙNG */}
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
              className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Cập Nhật Tiến Độ &amp; Linh Kiện Sửa Chữa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Phiếu: {selectedTicketForProgress.ticketCode} — Máy #{selectedTicketForProgress.deviceSerial} ({selectedTicketForProgress.deviceModel})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicketForProgress(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
                {/* Summary Info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block">Cơ sở y tế:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedTicketForProgress.partnerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sự cố ghi nhận:</span>
                    <span className="truncate">{selectedTicketForProgress.reportedIssue}</span>
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
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#0284c7] font-semibold"
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
                    <span className="text-[#0284c7] font-mono font-bold">
                      {selectedParts.length} mục đã chọn
                    </span>
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    {AVAILABLE_SPARE_PARTS.map((part) => {
                      const isSelected = selectedParts.some((p) => p.partName === part.partName);
                      return (
                        <div
                          key={part.partName}
                          onClick={() => togglePartSelection(part)}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-sky-50 dark:bg-sky-950 border border-sky-300 dark:border-sky-800 text-[#0284c7]"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="font-medium text-xs truncate max-w-[340px]">
                            {part.partName}
                          </span>
                          <span className="font-mono font-bold shrink-0">
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
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Tổng chi phí nghiệm thu
                    </label>
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
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
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#0284c7]"
                  />
                </div>

                {/* Auto QC Notice if marking delivered */}
                {(targetStatus === "delivered" || targetStatus === "calibrating") && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <Sparkles size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Tự động gia hạn kiểm định:</strong> Hệ thống sẽ tự động cập nhật chứng nhận kiểm chuẩn ISCD cho máy <strong>#{selectedTicketForProgress.deviceSerial}</strong> (CV 0.72%, QC Đạt chuẩn, hạn 90 ngày) và đưa máy về trạng thái <strong>Sẵn sàng trong kho tổng</strong>.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForProgress(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProgress}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
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

      {/* 7. MODAL IN BIÊN BẢN BÀN GIAO & BẢO HÀNH Y TẾ */}
      <AnimatePresence>
        {printTicket && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrintTicket(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5"
            >
              {/* Header Certificate */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284c7]">
                    OsteoSys Medical Equipment Service
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    BIÊN BẢN NGHIỆM THU &amp; BÀN GIAO THIẾT BỊ
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Mã hồ sơ: {printTicket.ticketCode} • Chứng chỉ ISCD: ISCD-REP-{printTicket.ticketCode}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck size={26} />
                </div>
              </div>

              {/* Body Details */}
              <div className="space-y-4 text-xs">
                {/* 2-Column Info */}
                <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">Cơ sở tiếp nhận:</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{printTicket.partnerName}</p>
                    <p className="text-slate-500">{printTicket.partnerPhone || "024 3927 5568"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">Thiết bị y tế:</span>
                    <p className="font-mono font-bold text-[#0284c7]">#{printTicket.deviceSerial}</p>
                    <p className="text-slate-600 dark:text-slate-400">{printTicket.deviceModel || "Máy đo loãng xương gót chân Sonost 3000"}</p>
                  </div>
                </div>

                {/* Calibration QC Specs */}
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1.5 text-emerald-900 dark:text-emerald-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>Kết Quả Kiểm Chuẩn Khối Chuẩn Phantom (ISCD QC Standards):</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div>CV% Lặp lại: <strong>0.72% (ĐẠT)</strong></div>
                    <div>Tiêu chuẩn ISCD: <strong>&lt; 1.0%</strong></div>
                    <div>Hạn kiểm chuẩn: <strong>90 ngày</strong></div>
                  </div>
                </div>

                {/* Parts Replaced */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Danh mục phụ tùng thay thế &amp; Chi phí:
                  </p>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-2">Tên phụ tùng</th>
                          <th className="p-2 text-center">Bảo hành</th>
                          <th className="p-2 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {printTicket.partsReplaced && printTicket.partsReplaced.length > 0 ? (
                          printTicket.partsReplaced.map((p, idx) => (
                            <tr key={idx}>
                              <td className="p-2">{p.partName}</td>
                              <td className="p-2 text-center">{p.warrantyMonths} tháng</td>
                              <td className="p-2 text-right font-mono font-semibold">
                                {new Intl.NumberFormat("vi-VN").format(p.cost)} ₫
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-2 text-center text-slate-400 italic">
                              Bảo dưỡng &amp; Định chuẩn QC
                            </td>
                          </tr>
                        )}
                        <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                          <td colSpan={2} className="p-2 text-right">Tổng thanh toán:</td>
                          <td className="p-2 text-right font-mono text-emerald-600">{printTicket.formattedCost}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures & QR Code */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 items-center">
                  <div className="text-center space-y-8">
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Đại diện Cơ sở Y tế</p>
                    <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center space-y-8">
                    <p className="font-semibold text-slate-600 dark:text-slate-400">Kỹ sư Trưởng OsteoSys</p>
                    <p className="font-bold text-slate-900 dark:text-white">{printTicket.technicianName}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <QrCode size={40} className="text-slate-800 dark:text-slate-200" />
                    <span className="text-[9px] font-mono text-slate-400 mt-1">Xác thực chứng chỉ</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPrintTicket(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer size={15} />
                  <span>In Biên Bản Ngay</span>
                </button>
              </div>
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
