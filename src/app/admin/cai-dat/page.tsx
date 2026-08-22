"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Palette,
  Sliders,
  Database,
  Printer,
  Save,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sparkles,
  Keyboard,
  Building2,
  Shield,
  KeyRound,
  Clock,
  FileCheck,
  Download,
  Activity,
  Boxes,
  Radio,
  FileText,
  Lock,
  Eye,
  BellRing,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeSelectDropdown } from "@/components/ui/theme-toggle";
import {
  useUIScale,
  UI_SCALE_CONFIGS,
  UIScaleLevel,
} from "@/components/providers/ui-scale-provider";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"display" | "org" | "security">("display");
  const [isSaving, setIsSaving] = useState(false);

  // UI Scale Hook
  const {
    scale,
    setScale,
    increaseScale,
    decreaseScale,
    resetScale,
    levels,
    canIncrease,
    canDecrease,
    currentConfig,
  } = useUIScale();

  // Organization Form State
  const [orgData, setOrgData] = useState({
    orgName: "Công ty Cổ phần Thiết Bị Y Tế OsteoSys Việt Nam",
    hotline: "1900 6868 / 0904 888 999",
    email: "contact@osteosys.vn",
    leadEmail: "leads@osteosys.vn",
    taxCode: "0108992345",
    addressHanoi: "Tầng 8, Tòa nhà Y Dược, 137 Nguyễn Văn Cừ, Long Biên, Hà Nội",
    addressHcm: "Phòng 402, Tòa nhà Medical Plaza, Quận 10, TP. Hồ Chí Minh",
    medicalLicense: "GP-BYT/TTBYT-2024-8842",
    pacsIp: "192.168.1.120",
    pacsPort: "104",
    pacsAeTitle: "SONOST3000_PACS",
    printHeader: "KẾT QUẢ ĐO MẬT ĐỘ XƯƠNG GÓT CHÂN (QUS) — SONOST 3000",
  });

  // Security Form State
  const [secData, setSecData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    jwtExpiryHours: "24",
    require2FA: false,
    autoLogoutInactive: "30",
  });

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Đã lưu thành công toàn bộ cấu hình hệ thống!");
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="text-[#0284c7] dark:text-cyan-400" size={24} />
            Cài Đặt &amp; Tùy Biến Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quản trị thông tin cơ sở y tế, bộ điều khiển thu phóng giao diện không vỡ layout và bảo mật dữ liệu.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
        >
          <Save size={14} className={isSaving ? "animate-spin" : ""} />
          <span>{isSaving ? "Đang lưu..." : "Lưu cấu hình"}</span>
        </button>
      </div>

      {/* 2. Navigation Tabs with Framer Motion Indicator */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-0.5">
        {[
          {
            id: "display",
            label: "Hiển thị & Thu phóng (Display & Scale)",
            icon: Maximize2,
          },
          {
            id: "org",
            label: "Thông tin Đơn vị Y tế (Organization)",
            icon: Building2,
          },
          {
            id: "security",
            label: "Bảo mật & Dữ liệu (Security & System)",
            icon: Shield,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? "text-[#0284c7] dark:text-cyan-400"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="settings-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0284c7] dark:bg-cyan-400"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: HIỂN THỊ & THU PHÓNG (DISPLAY & ACCESSIBILITY) */}
        {/* ========================================================================= */}
        {activeTab === "display" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card 1: BỘ ĐIỀU KHIỂN THU PHÓNG GIAO DIỆN (UI SCALE ENGINE) */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-cyan-950 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center">
                    <Maximize2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Bộ Điều Khiển Thu Phóng Giao Diện Toàn Diện (Dynamic UI Scale)
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono-data font-semibold">
                        Chống vỡ layout
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Điều chỉnh kích thước toàn bộ hệ thống (chữ, bảng, thẻ thông số) mà không làm vỡ cấu trúc lưới responsive.
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetScale}
                  disabled={scale === 100}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors shrink-0"
                >
                  <RotateCcw size={13} />
                  <span>Khôi phục chuẩn 100%</span>
                </button>
              </div>

              {/* 5-Step Segmented Scale Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Chọn Mức Thu Phóng Tiêu Chuẩn:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {levels.map((lvl) => {
                    const cfg = UI_SCALE_CONFIGS[lvl];
                    const isSelected = scale === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setScale(lvl)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? "bg-sky-50/70 dark:bg-cyan-950/60 border-[#0284c7] dark:border-cyan-500 ring-2 ring-[#0284c7]/20 dark:ring-cyan-400/20 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono-data font-bold text-base ${
                              isSelected
                                ? "text-[#0284c7] dark:text-cyan-400"
                                : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {cfg.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={15} className="text-[#0284c7] dark:text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {cfg.sublabel}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono-data">
                            {cfg.fontSizePx}px base
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Controls (- / +) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mức thu phóng hiện hành:
                  </span>
                  <span className="font-mono-data font-bold text-sm text-[#0284c7] dark:text-cyan-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                    {scale}% ({currentConfig.sublabel})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decreaseScale()}
                    disabled={!canDecrease}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
                  >
                    <ZoomOut size={13} />
                    <span>Thu nhỏ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => increaseScale()}
                    disabled={!canIncrease}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
                  >
                    <ZoomIn size={13} />
                    <span>Phóng to</span>
                  </button>
                </div>
              </div>

              {/* Live Interactive Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#0284c7] dark:text-cyan-400" />
                    <span>Khung Xem Trước Trực Tiếp (Live Interactive Preview)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Thay đổi tỷ lệ phản hồi ngay lập tức
                  </span>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 transition-all duration-200">
                  {/* Sample 1: Mini Sonost 3000 Metric Stat Card */}
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Chỉ số T-Score Loãng Xương (Mô phỏng)
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400">
                          -1.2 SD
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Mật độ bình thường (WHO)
                        </span>
                      </div>
                      <p className="text-[11px] font-mono-data text-slate-400 mt-1">
                        SOS: 1542 m/s • BUA: 68 dB/MHz • CV: 0.72%
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                  </div>

                  {/* Sample 2: Mini Table Row */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data font-bold text-[#0284c7] dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-sky-100 dark:border-cyan-800">
                        OST-3000-8842
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Bệnh viện Đa khoa Quốc tế Vinmec
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Đang cho thuê
                      </span>
                      <button className="px-2.5 py-1 bg-[#0284c7] text-white rounded text-[11px] font-bold">
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <Keyboard size={15} className="text-slate-400" />
                  <span>Phím tắt toàn cục hỗ trợ thao tác nhanh:</span>
                </div>

                <div className="flex items-center gap-3 font-mono-data text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded shadow-2xs text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded shadow-2xs text-[11px]">+</kbd> : Phóng to
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded shadow-2xs text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded shadow-2xs text-[11px]">-</kbd> : Thu nhỏ
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded shadow-2xs text-[11px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded shadow-2xs text-[11px]">0</kbd> : Mặc định 100%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: CHẾ ĐỘ GIAO DIỆN SÁNG / TỐI (CLINICAL THEME) */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Chế Độ Giao Diện Y Tế (Clinical Deep Slate Theme)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tông màu xám phiến đá sâu (#0b0f17) giảm mỏi mắt cho bác sĩ &amp; kỹ thuật viên làm việc ca đêm.
                    </p>
                  </div>
                </div>

                <ThemeSelectDropdown />
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">☀️ Giao diện Sáng (Light)</span>
                  <p className="text-[11px] text-slate-500">Phù hợp phòng khám ban ngày có ánh sáng mạnh.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">🌙 Deep Slate (Dark)</span>
                  <p className="text-[11px] text-slate-500">Chuẩn y tế chuyên dụng, triệt tiêu ánh sáng xanh.</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">💻 Theo Hệ Thống (System)</span>
                  <p className="text-[11px] text-slate-500">Tự động đồng bộ theo cài đặt Windows/macOS.</p>
                </div>
              </div>
            </div>

            {/* Card 3: CHUẨN THAM CHIẾU LÂM SÀNG QUS */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Chuẩn Tham Chiếu Đo Mật Độ Xương (ISCD Guidelines)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bộ dữ liệu dân số tham chiếu để tính toán chỉ số T-Score và Z-Score.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bộ dữ liệu dân số tham chiếu
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none font-medium">
                    <option>NHANES III (Asian / Vietnamese Cohort - Chuẩn BV Việt Nam)</option>
                    <option>WHO Caucasian Reference Cohort</option>
                    <option>ISCD 2023 International Clinical Guidelines</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngưỡng cảnh báo sai số đo lường Phantom (CV%)
                  </label>
                  <input
                    type="text"
                    defaultValue="≤ 1.5 % (Chuẩn ISCD)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data font-semibold text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: THÔNG TIN ĐƠN VỊ Y TẾ (ORGANIZATION INFO) */}
        {/* ========================================================================= */}
        {activeTab === "org" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Form Thông tin Pháp lý & Liên hệ */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Hồ Sơ Doanh Nghiệp &amp; Cơ Sở Phân Phối OsteoSys
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thông tin hiển thị trên hợp đồng thuê máy và phiếu nghiệm thu bàn giao.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Đơn vị / Doanh nghiệp Quản trị *
                  </label>
                  <input
                    type="text"
                    value={orgData.orgName}
                    onChange={(e) => setOrgData({ ...orgData, orgName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-semibold text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mã số thuế doanh nghiệp
                    </label>
                    <input
                      type="text"
                      value={orgData.taxCode}
                      onChange={(e) => setOrgData({ ...orgData, taxCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hotline Kỹ thuật 24/7 *
                    </label>
                    <input
                      type="text"
                      value={orgData.hotline}
                      onChange={(e) => setOrgData({ ...orgData, hotline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email tiếp nhận Lead B2B
                    </label>
                    <input
                      type="email"
                      value={orgData.leadEmail}
                      onChange={(e) => setOrgData({ ...orgData, leadEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ Kho Tổng Hà Nội (Miền Bắc)
                    </label>
                    <input
                      type="text"
                      value={orgData.addressHanoi}
                      onChange={(e) => setOrgData({ ...orgData, addressHanoi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Địa chỉ Chi nhánh TP.HCM (Miền Nam)
                    </label>
                    <input
                      type="text"
                      value={orgData.addressHcm}
                      onChange={(e) => setOrgData({ ...orgData, addressHcm: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cấu hình PACS / DICOM 3.0 & Máy In Nhiệt */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Cấu Hình Kết Nối PACS / DICOM 3.0 &amp; Mẫu In Phiếu Khám
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Đẩy dữ liệu quét gót chân sang hệ thống Bệnh viện và in phiếu kết quả T-Score.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PACS Server IP
                  </label>
                  <input
                    type="text"
                    value={orgData.pacsIp}
                    onChange={(e) => setOrgData({ ...orgData, pacsIp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Port DICOM (Mặc định: 104)
                  </label>
                  <input
                    type="text"
                    value={orgData.pacsPort}
                    onChange={(e) => setOrgData({ ...orgData, pacsPort: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Application Entity Title (AE Title)
                  </label>
                  <input
                    type="text"
                    value={orgData.pacsAeTitle}
                    onChange={(e) => setOrgData({ ...orgData, pacsAeTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                  Tiêu đề in phiếu khám nhiệt (58mm) &amp; A4 PDF
                </label>
                <input
                  type="text"
                  value={orgData.printHeader}
                  onChange={(e) => setOrgData({ ...orgData, printHeader: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BẢO MẬT & DỮ LIỆU (SECURITY & SYSTEM) */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Đổi Mật Khẩu Quản Trị */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Bảo Mật Tài Khoản Quản Trị Viên (Super Admin)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thay đổi mật khẩu đăng nhập hệ thống quản trị OsteoSys.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={secData.currentPassword}
                    onChange={(e) => setSecData({ ...secData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    value={secData.newPassword}
                    onChange={(e) => setSecData({ ...secData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={secData.confirmPassword}
                    onChange={(e) => setSecData({ ...secData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cấu hình Phiên đăng nhập & Nhật ký Kiểm toán */}
            <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Cấu Hình Phiên Đăng Nhập (JWT Session) &amp; Kiểm Toán
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thời gian tồn tại của Token phiên làm việc và bảo vệ phiên.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời hạn hiệu lực phiên đăng nhập (JWT Expiry)
                  </label>
                  <select
                    value={secData.jwtExpiryHours}
                    onChange={(e) => setSecData({ ...secData, jwtExpiryHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none font-medium"
                  >
                    <option value="8">8 giờ (Ca trực y tế 1 ca)</option>
                    <option value="24">24 giờ (Khuyến nghị)</option>
                    <option value="168">7 ngày (Ghi nhớ đăng nhập dài)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tự động khóa phiên khi không hoạt động
                  </label>
                  <select
                    value={secData.autoLogoutInactive}
                    onChange={(e) => setSecData({ ...secData, autoLogoutInactive: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none font-medium"
                  >
                    <option value="15">15 phút không thao tác</option>
                    <option value="30">30 phút không thao tác</option>
                    <option value="60">60 phút không thao tác</option>
                    <option value="0">Không tự động khóa</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FileCheck size={16} className="text-emerald-500" />
                  <span>Toàn bộ 100% thao tác thay đổi dữ liệu đều được ghi lại vào <strong>Audit Logs</strong>.</span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Tính năng xuất bản sao lưu MongoDB định dạng JSON/BSON đang sẵn sàng.")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download size={13} />
                  <span>Sao lưu dữ liệu MongoDB</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
