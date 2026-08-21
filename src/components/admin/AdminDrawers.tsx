"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Calendar,
  Building2,
  Radio,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface RentalFormData {
  partnerName: string;
  partnerId?: string;
  deviceSerial: string;
  startDate: string;
  durationMonths: string;
  monthlyFee: string;
  deposit: string;
  packageType: string;
  notes: string;
}

export interface AvailableDeviceOption {
  serial: string;
  model: string;
  location: string;
  year: number;
}

export interface PartnerOption {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
}

/**
 * Slide-over Drawer: Thêm Hợp Đồng Thuê Máy Sonost 3000 (100% Dynamic DB Data)
 */
interface CreateRentalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contract: unknown) => void;
}

export function CreateRentalDrawer({
  isOpen,
  onClose,
  onSuccess,
}: CreateRentalDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<AvailableDeviceOption[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);

  const [formData, setFormData] = useState<RentalFormData>({
    partnerName: "",
    partnerId: "",
    deviceSerial: "",
    startDate: new Date().toISOString().split("T")[0],
    durationMonths: "6",
    monthlyFee: "15000000",
    deposit: "30000000",
    packageType: "monthly",
    notes: "",
  });

  // Fetch available devices and partners from DB when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoadingDevices(true);
      try {
        const [devicesRes, partnersRes] = await Promise.all([
          fetch("/api/admin/devices?status=available", { cache: "no-store" }),
          fetch("/api/admin/customers", { cache: "no-store" }),
        ]);

        const devicesJson = await devicesRes.json();
        const partnersJson = await partnersRes.json();

        if (devicesJson.status === "success" && Array.isArray(devicesJson.data)) {
          setAvailableDevices(devicesJson.data);
          if (devicesJson.data.length > 0 && !formData.deviceSerial) {
            setFormData((prev) => ({
              ...prev,
              deviceSerial: devicesJson.data[0].serial,
            }));
          }
        }

        if (partnersJson.status === "success" && Array.isArray(partnersJson.data)) {
          setPartners(partnersJson.data);
        }
      } catch (err) {
        console.error("Failed to load available devices or partners:", err);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    loadData();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceSerial) {
      alert("Vui lòng chọn thiết bị Sonost 3000 sẵn sàng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (onSuccess) onSuccess(data.data);
        onClose();
      } else {
        alert("Lỗi tạo hợp đồng: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối cơ sở dữ liệu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId === "custom") {
      setFormData((prev) => ({ ...prev, partnerId: "", partnerName: "" }));
    } else {
      const found = partners.find((p) => p.id === selectedId);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          partnerId: found.id,
          partnerName: found.name,
        }));
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full will-change-transform"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus size={16} className="text-[#0284c7]" />
                  Tạo Hợp Đồng Thuê Sonost 3000
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dữ liệu MongoDB: cấp phát máy sẵn sàng và đồng bộ trạng thái.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Partner selection or custom name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#0284c7]" />
                    Cơ sở Y tế / Bệnh viện đối tác <span className="text-rose-500">*</span>
                  </span>
                </label>

                {partners.length > 0 && (
                  <select
                    onChange={handlePartnerSelect}
                    defaultValue=""
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] text-xs mb-1.5"
                  >
                    <option value="" disabled>
                      -- Chọn nhanh từ danh sách Đối tác có sẵn --
                    </option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.contactPerson || p.type})
                      </option>
                    ))}
                    <option value="custom">✍️ Nhập tên cơ sở y tế mới...</option>
                  </select>
                )}

                <input
                  type="text"
                  required
                  placeholder="VD: Bệnh viện Đa khoa Tâm Anh"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>

              {/* Dynamic Device Serial Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Radio size={14} className="text-[#0284c7]" />
                    Chọn máy Sonost 3000 sẵn sàng kho <span className="text-rose-500">*</span>
                  </span>
                  <span className="font-mono-data text-sky-600 dark:text-sky-400 font-bold">
                    {availableDevices.length} máy sẵn sàng
                  </span>
                </label>

                {isLoadingDevices ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500">
                    <Loader2 size={14} className="animate-spin text-[#0284c7]" />
                    <span>Đang tải danh sách máy sẵn sàng từ MongoDB...</span>
                  </div>
                ) : availableDevices.length === 0 ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-400 flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Hết máy sẵn sàng trong kho</p>
                      <p className="text-xs mt-0.5">
                        Tất cả các máy đang trong hợp đồng thuê hoặc đang bảo trì. Vui lòng hoàn tất hợp đồng cũ hoặc kiểm chuẩn lại thiết bị trong kho trước khi tạo hợp đồng mới.
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={formData.deviceSerial}
                    onChange={(e) => setFormData({ ...formData, deviceSerial: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] font-mono-data"
                  >
                    {availableDevices.map((dev) => (
                      <option key={dev.serial} value={dev.serial}>
                        #{dev.serial} — {dev.model} ({dev.location})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Rental package type */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Gói dịch vụ cho thuê
                </label>
                <select
                  value={formData.packageType}
                  onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                >
                  <option value="monthly">Thuê tháng tiêu chuẩn (Phòng khám / BV)</option>
                  <option value="long_term">Thuê dài hạn &gt; 12 tháng (Ưu đãi bảo trì)</option>
                  <option value="daily_event">Thuê theo ngày / sự kiện tầm soát lưu động</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#0284c7]" />
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Thời hạn thuê
                  </label>
                  <select
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  >
                    <option value="1">01 tháng (Sự kiện / Khám đoàn)</option>
                    <option value="3">03 tháng (Ngắn hạn)</option>
                    <option value="6">06 tháng (Tiêu chuẩn)</option>
                    <option value="12">12 tháng (Dài hạn - Ưu đãi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-600" />
                    Đơn giá thuê / tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] font-mono-data"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tiền đặt cọc máy (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] font-mono-data"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú điều khoản bổ sung
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Bao gồm 02 can gel siêu âm gót chân và hiệu chuẩn định kỳ 3 tháng..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableDevices.length === 0}
                  className="w-2/3 py-2.5 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang lưu vào MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Xác nhận Cho thuê</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Centered Modal: Tạo Phiếu Sửa Chữa & Hiệu Chuẩn Máy
 */
interface CreateRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (ticket: unknown) => void;
}

export function CreateRepairModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRepairModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devices, setDevices] = useState<{ serial: string; model: string; location: string }[]>([]);
  const [formData, setFormData] = useState({
    deviceSerial: "",
    reportedIssue: "",
    priority: "urgent",
    partnerName: "Phòng Kiểm Chuẩn Kỹ Thuật (Kho Tổng)",
    technicianName: "Kỹ sư Nguyễn Văn Tuấn",
    estimatedDays: "2",
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchAllDevices = async () => {
      try {
        const res = await fetch("/api/admin/devices", { cache: "no-store" });
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setDevices(json.data);
          if (json.data.length > 0 && !formData.deviceSerial) {
            setFormData((prev) => ({ ...prev, deviceSerial: json.data[0].serial }));
          }
        }
      } catch (err) {
        console.error("Failed to load devices for repair modal:", err);
      }
    };
    fetchAllDevices();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (onSuccess) onSuccess(data.data);
        onClose();
      } else {
        alert("Lỗi tạo phiếu sửa chữa: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối cơ sở dữ liệu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-4 will-change-transform"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Wrench size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Tạo Lệnh Sửa Chữa &amp; Hiệu Chuẩn Sonost 3000
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Phân công kỹ sư y tế xử lý sự cố đầu dò hoặc kiểm chuẩn định kỳ.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Thiết bị cần bảo trì / sửa chữa
                </label>
                <select
                  value={formData.deviceSerial}
                  onChange={(e) => setFormData({ ...formData, deviceSerial: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] font-mono-data"
                >
                  {devices.map((d) => (
                    <option key={d.serial} value={d.serial}>
                      #{d.serial} — {d.model} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mô tả lỗi / Hạng mục kiểm tra <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nhiễu tín hiệu đầu dò gót chân BUA hoặc bơm bóng khí không căng..."
                  value={formData.reportedIssue}
                  onChange={(e) => setFormData({ ...formData, reportedIssue: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  >
                    <option value="urgent">🚨 Khẩn cấp (Máy ngừng đo)</option>
                    <option value="calibration">⚠️ Bình thường (Hiệu chuẩn Phantom)</option>
                    <option value="normal">ℹ️ Thấp (Bảo dưỡng linh kiện phụ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Kỹ sư tiếp nhận
                  </label>
                  <input
                    type="text"
                    value={formData.technicianName}
                    onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-semibold transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Xuất Lệnh Kỹ Thuật</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
