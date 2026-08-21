"use client";

import React, { useState } from "react";
import {
  Settings,
  Printer,
  Database,
  Save,
  CheckCircle2,
  Sliders,
  Palette,
} from "lucide-react";
import { ThemeSelectDropdown } from "@/components/ui/theme-toggle";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="text-slate-600 dark:text-slate-300" size={24} />
            Cài đặt Hệ thống Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cấu hình tham chiếu ISCD/NHANES III, chuẩn kết nối DICOM 3.0 và mẫu in kết quả T-score.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
        >
          <Save size={14} />
          <span>Lưu cấu hình</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-md text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Đã lưu thành công cấu hình hệ thống!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Giao diện Sáng / Tối (Clinical Theme) */}
        <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Palette size={16} className="text-[#0284c7] dark:text-cyan-400" />
              <h3>Chế Độ Giao Diện Y Tế (Clinical Deep Slate)</h3>
            </div>
            <ThemeSelectDropdown />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tự động thích ứng với ánh sáng phòng khám hoặc sở thích người dùng. Chế độ Tối (Dark mode) sử dụng nền Deep Slate #0b0f17 giúp bác sĩ làm việc ban đêm không bị mỏi mắt.
          </p>
        </div>

        {/* Card 2: Chuẩn tham chiếu lâm sàng */}
        <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Sliders size={16} className="text-[#0284c7] dark:text-cyan-400" />
            <h3>Chuẩn Tham Chiếu Đo Loãng Xương (QUS)</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bộ dữ liệu dân số tham chiếu T-score
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 outline-none">
                <option>NHANES III (Asian / Vietnamese Cohort)</option>
                <option>WHO Caucasian Reference</option>
                <option>ISCD 2023 Guidelines</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Ngưỡng cảnh báo sai số biến thiên (CV%)
              </label>
              <input
                type="text"
                defaultValue="< 1.5 %"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md font-mono-data text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Kết nối DICOM / PACS */}
        <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Database size={16} className="text-[#0284c7] dark:text-cyan-400" />
            <h3>Cấu hình Kết nối PACS / DICOM 3.0</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                PACS Server IP
              </label>
              <input
                type="text"
                defaultValue="192.168.1.120"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md font-mono-data text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Port
              </label>
              <input
                type="text"
                defaultValue="104"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md font-mono-data text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                AE Title
              </label>
              <input
                type="text"
                defaultValue="SONOST3000_PACS"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md font-mono-data text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Mẫu in phiếu kết quả */}
        <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Printer size={16} className="text-[#0284c7] dark:text-cyan-400" />
            <h3>Mẫu In Phiếu Kết Quả Siêu Âm Xương (Thermal / A4)</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề phiếu khám
              </label>
              <input
                type="text"
                defaultValue="KẾT QUẢ ĐO MẬT ĐỘ XƯƠNG GÓT CHÂN (QUS)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tự động xuất đồ thị T-score / Z-score
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 outline-none">
                <option>Bật (Đồ thị phân loại WHO 3 vùng màu)</option>
                <option>Tắt (Chỉ in số liệu BUA/SOS)</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
