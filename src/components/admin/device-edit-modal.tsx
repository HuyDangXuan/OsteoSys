"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  FileText,
  X,
  Plus,
  Edit,
  Check,
  AlertTriangle,
} from "lucide-react";
import { DeviceListItem } from "@/lib/actions/devices";
import { formatDeviceForForm, FormDeviceData } from "@/lib/utils/device-form-helper";

const ACCESSORY_OPTIONS = [
  "Bóng dầu Silicone tiếp xúc",
  "Khối Phantom Hologic kiểm chuẩn",
  "Dây cáp nguồn chuẩn y tế",
  "Giấy in nhiệt 58mm",
  "Can Gel siêu âm chuyên dụng",
  "Cáp tín hiệu USB / DICOM",
];

interface DeviceEditModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  device: DeviceListItem | null;
  currentUserFullName?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: FormDeviceData) => Promise<void>;
}

export function DeviceEditModal({
  isOpen,
  mode,
  device,
  currentUserFullName = "Kỹ sư Kiểm Chuẩn",
  isSubmitting = false,
  onClose,
  onSubmit,
}: DeviceEditModalProps) {
  const [formData, setFormData] = useState<FormDeviceData>(() =>
    formatDeviceForForm(mode === "edit" ? device : null, currentUserFullName)
  );

  // Hydration & Reactive Reset whenever device, mode or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && device) {
        setFormData(formatDeviceForForm(device, currentUserFullName));
      } else if (mode === "create") {
        const initial = formatDeviceForForm(null, currentUserFullName);
        initial.serialNumber = `OST-3000-${Math.floor(1000 + Math.random() * 9000)}`;
        initial.certificateNumber = `ISCD-QC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setFormData(initial);
      }
    }
  }, [device, isOpen, mode, currentUserFullName]);

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

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 rounded-xl border border-sky-200/60 dark:border-cyan-900/60">
                {mode === "create" ? <Plus size={20} /> : <Edit size={20} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {mode === "create" ? "Nhập kho Thiết bị Sonost 3000 Mới" : `Chỉnh sửa Thông tin: ${formData.serialNumber}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === "create"
                    ? "Khai báo số Serial, cấu hình đầu dò gót chân & hồ sơ kiểm chuẩn ISCD ban đầu"
                    : "Cập nhật trạng thái điều phối, vị trí kho và biên bản kiểm định định kỳ"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body / Form */}
          <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CỘT 1: Thông tin Phần cứng */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-[#0284c7] dark:text-cyan-400 uppercase tracking-wider font-mono-data">
                  <Boxes size={14} />
                  <span>1. Thông số Phần cứng &amp; Vị trí</span>
                </div>

                {/* Serial Number & Model */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số Serial (S/N) *
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="VD: OST-3000-8842"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Model Thiết bị *
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none font-medium"
                    >
                      <option value="Sonost 3000 PRO">Sonost 3000 PRO (Cao cấp)</option>
                      <option value="Sonost 3000">Sonost 3000 (Tiêu chuẩn)</option>
                    </select>
                  </div>
                </div>

                {/* Năm sản xuất & Loại đầu dò */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Năm sản xuất
                    </label>
                    <input
                      type="number"
                      value={formData.yearManufactured}
                      onChange={(e) => setFormData({ ...formData, yearManufactured: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Loại đầu dò siêu âm
                    </label>
                    <select
                      value={formData.probeType}
                      onChange={(e) => setFormData({ ...formData, probeType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="Đầu dò gót chân tiêu chuẩn 0.5MHz">Đầu dò gót chân tiêu chuẩn 0.5MHz</option>
                      <option value="Đầu dò kép đa tần số High-Precision">Đầu dò kép đa tần số High-Precision</option>
                    </select>
                  </div>
                </div>

                {/* Ngày nhập kho */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày mua / Nhập kho
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                {/* Vị trí kho & Trạng thái */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vị trí đặt máy / Bệnh viện *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="VD: Kho Tổng Hà Nội hoặc BV Bạch Mai"
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
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as any })}
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

                {/* Kỹ sư kiểm định & Số chứng nhận */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kỹ sư / Đơn vị kiểm chuẩn *
                    </label>
                    <input
                      type="text"
                      value={formData.certifiedBy}
                      onChange={(e) => setFormData({ ...formData, certifiedBy: e.target.value })}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#0284c7]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Số tem / Số biên bản QC
                    </label>
                    <input
                      type="text"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                      placeholder="VD: ISCD-QC-2026-001"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono-data text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* Ngày kiểm chuẩn & Phantom CV */}
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

                {/* Kết quả QC & ISCD Checkbox */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kết quả Đánh giá QC
                    </label>
                    <select
                      value={formData.qcResult}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setFormData({
                          ...formData,
                          qcResult: val,
                          iscdStandard: val !== "failed",
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="passed">✅ Đạt chuẩn ISCD (Passed - CV ≤ 1.5%)</option>
                      <option value="warning">⚠️ Cần kiểm tra lại (Warning - CV &gt; 1.5%)</option>
                      <option value="failed">❌ Không đạt chuẩn (Failed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tiêu chuẩn ISCD / WHO
                    </label>
                    <div className="h-[38px] flex items-center gap-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <input
                        type="checkbox"
                        id="iscdStandardModalCheck"
                        checked={formData.iscdStandard}
                        onChange={(e) => setFormData({ ...formData, iscdStandard: e.target.checked })}
                        className="w-4 h-4 text-[#0284c7] rounded accent-[#0284c7]"
                      />
                      <label htmlFor="iscdStandardModalCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                        Đạt chuẩn quốc tế
                      </label>
                    </div>
                  </div>
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
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang xử lý...</span>
                ) : mode === "create" ? (
                  <>
                    <Plus size={15} />
                    <span>Thêm thiết bị vào kho</span>
                  </>
                ) : (
                  <>
                    <Edit size={15} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
