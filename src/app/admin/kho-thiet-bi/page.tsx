"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Plus,
  Download,
  Search,
  RefreshCw,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Calendar,
  Layers,
  MapPin,
  FileCheck,
  Trash2,
  Edit,
  X,
  Radio,
  Check,
  AlertOctagon,
  Eye,
  Activity,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { SkeletonDeviceCard, SkeletonDataTable } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";
import { DynamicStatCards, DeviceStatsData } from "@/components/admin/DynamicStatCards";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  quickCalibrateDevice,
  DeviceListItem,
} from "@/lib/actions/devices";

export const dynamic = "force-dynamic";

const ACCESSORY_OPTIONS = [
  "Bóng dầu Silicone tiếp xúc",
  "Khối Phantom Hologic kiểm chuẩn",
  "Dây cáp nguồn chuẩn y tế",
  "Giấy in nhiệt 58mm",
  "Can Gel siêu âm chuyên dụng",
  "Cáp tín hiệu USB / DICOM",
];

export default function InventoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [calibrationFilter, setCalibrationFilter] = useState<"all" | "expiring_30_days" | "overdue">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceListItem[]>([]);
  const [stats, setStats] = useState<DeviceStatsData | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceListItem | null>(null);

  // Form States for Create/Edit
  const [formData, setFormData] = useState({
    serialNumber: "",
    model: "Sonost 3000 PRO" as "Sonost 3000" | "Sonost 3000 PRO",
    yearManufactured: 2024,
    probeType: "Đầu dò gót chân tiêu chuẩn 0.5MHz",
    location: "Kho Tổng Hà Nội",
    currentStatus: "available" as any,
    purchaseDate: new Date().toISOString().split("T")[0],
    lastCalibrationDate: new Date().toISOString().split("T")[0],
    qcResult: "passed" as "passed" | "warning" | "failed",
    phantomCv: 0.8,
    calibratedBy: "Kỹ sư Nguyễn Văn Tuấn (Kỹ Thuật OsteoSys)",
    certifyingBody: "Trung tâm Kiểm chuẩn Y Sinh OsteoSys",
    accessoriesIncluded: [
      "Bóng dầu Silicone tiếp xúc",
      "Khối Phantom Hologic kiểm chuẩn",
      "Dây cáp nguồn chuẩn y tế",
      "Giấy in nhiệt 58mm",
    ],
    notes: "",
  });

  // Fast QC Calibration State
  const [qcCv, setQcCv] = useState(0.8);
  const [qcResultValue, setQcResultValue] = useState<"passed" | "warning" | "failed">("passed");
  const [qcNotes, setQcNotes] = useState("");
  const [isSubmittingQC, setIsSubmittingQC] = useState(false);

  // Delete modal state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchStats = useCallback(async () => {
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
    }
  }, []);

  const fetchDevicesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDevices({
        search: searchTerm,
        status: statusFilter,
        calibrationFilter,
        page: 1,
        limit: 100,
      });
      setDevices(result.devices);
    } catch (err) {
      console.error("Failed to load devices:", err);
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, calibrationFilter]);

  const refreshAll = useCallback(() => {
    fetchDevicesList();
    fetchStats();
  }, [fetchDevicesList, fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevicesList();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchDevicesList]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      serialNumber: `OST-3000-${Math.floor(1000 + Math.random() * 9000)}`,
      model: "Sonost 3000 PRO",
      yearManufactured: new Date().getFullYear(),
      probeType: "Đầu dò gót chân tiêu chuẩn 0.5MHz",
      location: "Kho Tổng Hà Nội",
      currentStatus: "available",
      purchaseDate: new Date().toISOString().split("T")[0],
      lastCalibrationDate: new Date().toISOString().split("T")[0],
      qcResult: "passed",
      phantomCv: 0.8,
      calibratedBy: "Kỹ sư Nguyễn Văn Tuấn (Kỹ Thuật OsteoSys)",
      certifyingBody: "Trung tâm Kiểm chuẩn Y Sinh OsteoSys",
      accessoriesIncluded: [
        "Bóng dầu Silicone tiếp xúc",
        "Khối Phantom Hologic kiểm chuẩn",
        "Dây cáp nguồn chuẩn y tế",
        "Giấy in nhiệt 58mm",
      ],
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (device: DeviceListItem) => {
    setSelectedDevice(device);
    setFormData({
      serialNumber: device.serial,
      model: device.model as any,
      yearManufactured: device.year,
      probeType: "Đầu dò gót chân tiêu chuẩn 0.5MHz",
      location: device.location,
      currentStatus: device.status,
      purchaseDate: new Date().toISOString().split("T")[0],
      lastCalibrationDate: new Date().toISOString().split("T")[0],
      qcResult: device.qcResult,
      phantomCv: parseFloat(device.cvScore) || 0.8,
      calibratedBy: device.calibratedBy || "Kỹ sư OsteoSys",
      certifyingBody: device.certifyingBody || "Trung tâm Kiểm chuẩn Y Sinh OsteoSys",
      accessoriesIncluded: device.accessories.length > 0 ? device.accessories : ACCESSORY_OPTIONS.slice(0, 4),
      notes: device.notes || "",
    });
    setIsEditModalOpen(true);
  };

  // Open Quick Calibration Modal
  const handleOpenCalibrateModal = (device: DeviceListItem) => {
    setSelectedDevice(device);
    setQcCv(parseFloat(device.cvScore) || 0.8);
    setQcResultValue("passed");
    setQcNotes("Kiểm chuẩn Phantom Hologic định kỳ đạt chuẩn ISCD");
    setIsCalibrateModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (device: DeviceListItem) => {
    setSelectedDevice(device);
    setDeleteConfirmText("");
    setIsDeleteModalOpen(true);
  };

  // Submit Create Device
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createDevice({
        serialNumber: formData.serialNumber,
        model: formData.model,
        yearManufactured: Number(formData.yearManufactured),
        probeType: formData.probeType,
        purchaseDate: new Date(formData.purchaseDate),
        location: formData.location,
        currentStatus: formData.currentStatus,
        calibration: {
          lastDate: new Date(formData.lastCalibrationDate),
          qcResult: formData.qcResult,
          phantomCv: Number(formData.phantomCv),
          calibratedBy: formData.calibratedBy,
          certifyingBody: formData.certifyingBody,
          notes: formData.notes,
        },
        accessoriesIncluded: formData.accessoriesIncluded,
        notes: formData.notes,
      });

      if (res.success) {
        toast.success(res.message);
        setIsCreateModalOpen(false);
        refreshAll();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo thiết bị");
    }
  };

  // Submit Update Device
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    try {
      const res = await updateDevice(selectedDevice.serial, {
        model: formData.model,
        yearManufactured: Number(formData.yearManufactured),
        location: formData.location,
        currentStatus: formData.currentStatus,
        calibration: {
          lastDate: new Date(formData.lastCalibrationDate),
          qcResult: formData.qcResult,
          phantomCv: Number(formData.phantomCv),
          calibratedBy: formData.calibratedBy,
          certifyingBody: formData.certifyingBody,
          notes: formData.notes,
        },
        accessoriesIncluded: formData.accessoriesIncluded,
        notes: formData.notes,
      });

      if (res.success) {
        toast.success(res.message);
        setIsEditModalOpen(false);
        refreshAll();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật thiết bị");
    }
  };

  // Submit Quick Calibration QC
  const handleQuickCalibrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setIsSubmittingQC(true);
    try {
      const res = await quickCalibrateDevice(selectedDevice.serial, {
        phantomCv: qcCv,
        qcResult: qcResultValue,
        notes: qcNotes,
      });
      if (res.success) {
        toast.success(res.message);
        setIsCalibrateModalOpen(false);
        refreshAll();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kiểm chuẩn");
    } finally {
      setIsSubmittingQC(false);
    }
  };

  // Submit Delete / Decommission
  const handleDeleteSubmit = async (mode: "soft" | "hard") => {
    if (!selectedDevice) return;
    setIsSubmittingDelete(true);
    try {
      const res = await deleteDevice(selectedDevice.serial, mode);
      if (res.success) {
        toast.success(res.message);
        setIsDeleteModalOpen(false);
        refreshAll();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xử lý xóa thiết bị");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Client Excel / CSV Export
  const handleExportCSV = () => {
    if (devices.length === 0) {
      toast.warning("Không có dữ liệu thiết bị để xuất");
      return;
    }
    const headers = [
      "Số Serial",
      "Model",
      "Năm SX",
      "Trạng thái",
      "Vị trí",
      "Ngày kiểm định",
      "Hạn kiểm định",
      "Sai số CV%",
      "Đánh giá QC",
      "Tổng ca quét",
    ];
    const rows = devices.map((d) => [
      d.serial,
      d.model,
      d.year,
      d.statusLabel,
      `"${d.location}"`,
      d.calibrationDate,
      d.nextCalibration,
      d.cvScore,
      d.qcStatus,
      d.totalScans,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OsteoSys_Kho_Thiet_Bi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất thành công danh sách kho thiết bị!");
  };

  const toggleAccessory = (acc: string) => {
    setFormData((prev) => {
      const exists = prev.accessoriesIncluded.includes(acc);
      return {
        ...prev,
        accessoriesIncluded: exists
          ? prev.accessoriesIncluded.filter((item) => item !== acc)
          : [...prev.accessoriesIncluded, acc],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Boxes className="text-[#0284c7] dark:text-cyan-400" size={24} />
            Kho Thiết Bị Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý tập trung toàn bộ máy đo loãng xương siêu âm gót chân, theo dõi hạn kiểm định ISCD và tình trạng hoạt động.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Xuất file CSV / Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md transition-colors shadow-2xs"
          >
            <Download size={14} className="text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Plus size={15} />
            <span>Thêm thiết bị mới</span>
          </button>

          <button
            onClick={refreshAll}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 2. Dynamic Metric Stat Cards */}
      <DynamicStatCards initialStats={stats} isLoading={isLoading} />

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo số Serial (VD: OST-3000-8842), vị trí, ghi chú..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] dark:focus:ring-cyan-500"
            />
          </div>

          {/* Filters & View switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Calibration Warning Filter */}
            <select
              value={calibrationFilter}
              onChange={(e) => setCalibrationFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200 outline-none font-medium"
            >
              <option value="all">Hạn kiểm định: Tất cả</option>
              <option value="expiring_30_days">⚠️ Sắp hết hạn (≤ 30 ngày)</option>
              <option value="overdue">🚨 Quá hạn kiểm định</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-[#0284c7] dark:text-cyan-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Dạng lưới thẻ"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-[#0284c7] dark:text-cyan-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Dạng bảng dữ liệu"
              >
                <TableIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {[
            { id: "all", label: "Tất cả máy" },
            { id: "available", label: "Sẵn sàng bàn giao" },
            { id: "rented", label: "Đang cho thuê" },
            { id: "under_maintenance", label: "Bảo trì / Kiểm chuẩn" },
            { id: "repairing", label: "Đang sửa chữa" },
            { id: "decommissioned", label: "Đã thanh lý" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-[#0284c7] dark:bg-cyan-950/80 text-white dark:text-cyan-300 border border-transparent dark:border-cyan-800/50 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {(searchTerm || statusFilter !== "all" || calibrationFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCalibrationFilter("all");
              }}
              className="ml-auto text-xs text-[#0284c7] dark:text-cyan-400 hover:underline flex items-center gap-1 shrink-0 font-medium pl-2"
            >
              <RotateCcw size={12} /> Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. Content Area: Grid View or Table View */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonDeviceCard key={i} />
            ))}
          </div>
        ) : (
          <SkeletonDataTable rows={8} />
        )
      ) : devices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xs">
          <TableEmptyState
            searchTerm={searchTerm}
            title="Không tìm thấy thiết bị nào"
            description={`Không có máy Sonost 3000 nào khớp với tiêu chí tìm kiếm hiện tại.`}
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCalibrationFilter("all");
            }}
            createLabel="Thêm máy mới"
            onCreate={handleOpenCreateModal}
          />
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <div
              key={d.id}
              className={`p-5 bg-white dark:bg-slate-900/90 border rounded-xl shadow-2xs flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                d.isOverdue
                  ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/10"
                  : d.isExpiringSoon
                  ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-[#0284c7] dark:hover:border-cyan-500/40"
              }`}
            >
              <div>
                {/* Header: Serial & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono-data font-bold text-sm text-[#0284c7] dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/70 px-2 py-0.5 rounded border border-sky-100 dark:border-cyan-800/40">
                      {d.serial}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {d.model} • Năm SX: {d.year}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      d.status === "available"
                        ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                        : d.status === "rented"
                        ? "bg-sky-50 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 border-sky-200 dark:border-cyan-800/40"
                        : d.status === "under_maintenance"
                        ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                        : d.status === "repairing"
                        ? "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {d.statusLabel}
                  </span>
                </div>

                {/* Location & Calibration details */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{d.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      QC Phantom CV:
                    </span>
                    <span className="font-mono-data font-semibold text-slate-800 dark:text-slate-200">
                      {d.cvScore} ({d.qcStatus})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Hạn kiểm chuẩn:</span>
                    <span
                      className={`font-mono-data font-semibold ${
                        d.isOverdue
                          ? "text-rose-600 dark:text-rose-400"
                          : d.isExpiringSoon
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {d.nextCalibration || "Chưa có"}
                      {d.isOverdue && " (Quá hạn)"}
                      {d.isExpiringSoon && ` (Còn ${d.remainingDaysToCalibration} ngày)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenCalibrateModal(d)}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors border border-emerald-200/60 dark:border-emerald-800/40"
                >
                  <Activity size={13} />
                  <span>QC Kiểm chuẩn</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(d)}
                  title="Chỉnh sửa thông số"
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                </button>

                <button
                  onClick={() => handleOpenDeleteModal(d)}
                  title="Xóa / Thanh lý"
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Số Serial &amp; Model</th>
                  <th className="py-3 px-4">Vị trí hiện tại</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Kiểm chuẩn ISCD</th>
                  <th className="py-3 px-4">Hạn kế tiếp</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono-data font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {d.serial}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {d.model} • {d.year}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {d.location}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          d.status === "available"
                            ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : d.status === "rented"
                            ? "bg-sky-50 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 border-sky-200 dark:border-cyan-800/40"
                            : d.status === "under_maintenance"
                            ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                            : d.status === "repairing"
                            ? "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {d.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-data">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{d.cvScore}</span>
                      <span className="text-[10px] text-slate-400 block">{d.qcStatus}</span>
                    </td>
                    <td className="py-3 px-4 font-mono-data">
                      <span
                        className={`font-semibold ${
                          d.isOverdue
                            ? "text-rose-600 dark:text-rose-400"
                            : d.isExpiringSoon
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {d.nextCalibration}
                      </span>
                      {d.isExpiringSoon && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block">
                          Còn {d.remainingDaysToCalibration} ngày
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenCalibrateModal(d)}
                          className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded text-[11px] font-medium transition-colors"
                        >
                          QC
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(d)}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(d)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Create / Edit Slide-over Modal (2 Columns) */}
      <AnimatePresence>
        {(isCreateModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0b0f17]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0284c7] dark:bg-cyan-600 text-white flex items-center justify-center">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {isCreateModalOpen ? "Nhập Kho Thiết Bị Sonost 3000 Mới" : `Chỉnh Sửa Thiết Bị: ${formData.serialNumber}`}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hồ sơ kỹ thuật y tế &amp; thông số kiểm chuẩn Phantom ISCD
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body 2 Columns */}
              <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit} className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CỘT 1: Thông tin thiết bị & Đầu dò */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-[#0284c7] dark:text-cyan-400 uppercase tracking-wider font-mono-data">
                      <Radio size={14} />
                      <span>1. Thông tin Thiết bị &amp; Vị trí</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Số Serial Thiết bị *
                      </label>
                      <input
                        type="text"
                        disabled={isEditModalOpen}
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                        placeholder="VD: OST-3000-8842"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7] disabled:opacity-60"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Model máy
                        </label>
                        <select
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                        >
                          <option value="Sonost 3000 PRO">Sonost 3000 PRO</option>
                          <option value="Sonost 3000">Sonost 3000 Tiêu chuẩn</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Năm sản xuất
                        </label>
                        <input
                          type="number"
                          value={formData.yearManufactured}
                          onChange={(e) => setFormData({ ...formData, yearManufactured: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                          min={2018}
                          max={2030}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Loại đầu dò siêu âm
                      </label>
                      <input
                        type="text"
                        value={formData.probeType}
                        onChange={(e) => setFormData({ ...formData, probeType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Vị trí lưu kho / Cơ sở bàn giao *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="VD: Kho Tổng Hà Nội hoặc BV Đa khoa Xanh Pôn"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Trạng thái thiết bị
                      </label>
                      <select
                        value={formData.currentStatus}
                        onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none font-medium"
                      >
                        <option value="available">Sẵn sàng bàn giao (Kho)</option>
                        <option value="rented">Đang cho thuê</option>
                        <option value="under_maintenance">Bảo trì / Kiểm chuẩn</option>
                        <option value="repairing">Đang sửa chữa</option>
                        <option value="decommissioned">Đã thanh lý / Ngừng sử dụng</option>
                      </select>
                    </div>
                  </div>

                  {/* CỘT 2: Hồ sơ Kiểm định Y tế & Phụ kiện */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono-data">
                      <ShieldCheck size={14} />
                      <span>2. Hồ sơ Kiểm chuẩn ISCD &amp; Phụ kiện</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Ngày kiểm chuẩn gần nhất
                        </label>
                        <input
                          type="date"
                          value={formData.lastCalibrationDate}
                          onChange={(e) => setFormData({ ...formData, lastCalibrationDate: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Độ biến thiên Phantom CV %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.phantomCv}
                          onChange={(e) => setFormData({ ...formData, phantomCv: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data font-semibold text-slate-900 dark:text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kết quả Đánh giá QC
                      </label>
                      <select
                        value={formData.qcResult}
                        onChange={(e) => setFormData({ ...formData, qcResult: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      >
                        <option value="passed">✅ Đạt chuẩn ISCD (Passed - CV ≤ 1.5%)</option>
                        <option value="warning">⚠️ Cần kiểm tra lại (Warning - CV &gt; 1.5%)</option>
                        <option value="failed">❌ Không đạt chuẩn (Failed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Đơn vị cấp chứng nhận kiểm định
                      </label>
                      <input
                        type="text"
                        value={formData.certifyingBody}
                        onChange={(e) => setFormData({ ...formData, certifyingBody: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>

                    {/* Phụ kiện đi kèm checklist */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Phụ kiện bàn giao đi kèm:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ACCESSORY_OPTIONS.map((acc) => {
                          const checked = formData.accessoriesIncluded.includes(acc);
                          return (
                            <button
                              type="button"
                              key={acc}
                              onClick={() => toggleAccessory(acc)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] text-left transition-colors border ${
                                checked
                                  ? "bg-sky-50 dark:bg-cyan-950/60 border-sky-300 dark:border-cyan-800 text-[#0284c7] dark:text-cyan-300 font-medium"
                                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                  checked ? "bg-[#0284c7] text-white" : "border border-slate-300 dark:border-slate-700"
                                }`}
                              >
                                {checked && <Check size={10} />}
                              </div>
                              <span className="truncate">{acc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Ghi chú kỹ thuật
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ghi chú về màng bóng silicone, kết nối DICOM..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                  >
                    {isCreateModalOpen ? "Lưu & Nhập Kho Máy" : "Cập Nhật Thông Số"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Quick QC Calibration Modal */}
      <AnimatePresence>
        {isCalibrateModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Kiểm Chuẩn QC Phantom ISCD
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono-data">
                      Thiết bị: {selectedDevice.serial}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCalibrateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleQuickCalibrationSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Độ biến thiên Phantom CV % (Chuẩn ISCD ≤ 1.5%)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={qcCv}
                    onChange={(e) => setQcCv(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data font-bold text-slate-900 dark:text-slate-100 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kết quả kiểm định
                  </label>
                  <select
                    value={qcResultValue}
                    onChange={(e) => setQcResultValue(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="passed">✅ Đạt chuẩn ISCD (Gia hạn +90 ngày)</option>
                    <option value="warning">⚠️ Cần hiệu chỉnh lại</option>
                    <option value="failed">❌ Không đạt - Cần sửa chữa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú kiểm định
                  </label>
                  <input
                    type="text"
                    value={qcNotes}
                    onChange={(e) => setQcNotes(e.target.value)}
                    placeholder="Ghi chú kết quả đo kiểm SOS / BUA..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCalibrateModalOpen(false)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQC}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs"
                  >
                    {isSubmittingQC ? "Đang xử lý..." : "Cấp Chứng Nhận QC"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Safety Deletion / Decommission Dialog */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
                  <AlertOctagon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Xác Nhận Xóa / Thanh Lý Thiết Bị
                  </h3>
                  <p className="text-xs text-slate-500 font-mono-data">
                    Số Serial: {selectedDevice.serial}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                <p>
                  <strong>Trạng thái máy:</strong> {selectedDevice.statusLabel}
                </p>
                <p>
                  <strong>Vị trí:</strong> {selectedDevice.location}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  💡 <strong>Quy chuẩn y tế:</strong> Nếu thiết bị đã từng có hợp đồng thuê hoặc phiếu sửa chữa, hệ thống sẽ thực hiện <em>Soft Delete (Thanh lý / Ngừng sử dụng)</em> để bảo toàn lịch sử chẩn đoán &amp; hóa đơn.
                </p>
              </div>

              {/* Hard Delete Verification input */}
              <div className="space-y-1 text-xs">
                <label className="block text-[11px] text-slate-500">
                  Nhập chữ <strong className="text-rose-600 dark:text-rose-400 font-mono-data">XAC NHAN</strong> nếu bạn muốn yêu cầu xóa vĩnh viễn (Hard Delete):
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="XAC NHAN"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-xs text-slate-900 dark:text-slate-100 outline-none uppercase"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy
                </button>

                {deleteConfirmText === "XAC NHAN" ? (
                  <button
                    type="button"
                    disabled={isSubmittingDelete}
                    onClick={() => handleDeleteSubmit("hard")}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    {isSubmittingDelete ? "Đang xử lý..." : "Xóa Vĩnh Viễn (Hard Delete)"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingDelete}
                    onClick={() => handleDeleteSubmit("soft")}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    {isSubmittingDelete ? "Đang xử lý..." : "Thanh Lý / Ngừng Dùng (Soft Delete)"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
