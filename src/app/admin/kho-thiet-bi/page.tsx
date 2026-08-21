"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Search,
  Plus,
  Radio,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  Activity,
} from "lucide-react";
import { SkeletonDeviceCard } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";

interface DeviceItem {
  serial: string;
  model: string;
  status: "rented" | "available" | "maintenance";
  statusText: string;
  location: string;
  lastQC: string;
  totalScans: number;
  phantomPrecision: string;
}

export default function InventoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const devices: DeviceItem[] = [
    {
      serial: "SN-4102",
      model: "Sonost 3000 PRO (Waterless Ultrasound)",
      status: "rented",
      statusText: "Đang cho thuê",
      location: "BV Đa khoa Hồng Ngọc",
      lastQC: "15/08/2026",
      totalScans: 1420,
      phantomPrecision: "CV 0.85%",
    },
    {
      serial: "SN-8842",
      model: "Sonost 3000 PRO (Waterless Ultrasound)",
      status: "rented",
      statusText: "Đang cho thuê",
      location: "PK Đa khoa Medlatec",
      lastQC: "01/08/2026",
      totalScans: 2850,
      phantomPrecision: "CV 0.92%",
    },
    {
      serial: "SN-3190",
      model: "Sonost 3000 PRO (Waterless Ultrasound)",
      status: "rented",
      statusText: "Đang cho thuê",
      location: "BV ĐH Y Dược TP.HCM",
      lastQC: "20/07/2026",
      totalScans: 4100,
      phantomPrecision: "CV 0.88%",
    },
    {
      serial: "SN-1022",
      model: "Sonost 3000 PRO (Waterless Ultrasound)",
      status: "available",
      statusText: "Sẵn sàng trong kho",
      location: "Kho Kỹ thuật Hà Nội",
      lastQC: "10/08/2026",
      totalScans: 850,
      phantomPrecision: "CV 0.79%",
    },
    {
      serial: "SN-9912",
      model: "Sonost 3000 PRO (Waterless Ultrasound)",
      status: "maintenance",
      statusText: "Đang sửa chữa",
      location: "Phòng Lab Hiệu chuẩn",
      lastQC: "20/08/2026",
      totalScans: 3200,
      phantomPrecision: "Đang cân chỉnh BUA",
    },
    {
      serial: "SN-5540",
      model: "Sonost 3000 PRO (Waterless Ultrasound)",
      status: "maintenance",
      statusText: "Kiểm chuẩn định kỳ",
      location: "Kho Kỹ thuật TP.HCM",
      lastQC: "19/08/2026",
      totalScans: 1950,
      phantomPrecision: "Phantom QC Pending",
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <Boxes className="text-[#0284c7]" size={24} />
            Kho Thiết Bị 48 Máy Sonost 3000
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi tình trạng máy, số serial, lịch sử kiểm chuẩn Phantom và vị trí vận hành.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors">
            <Plus size={14} />
            <span>Nhập máy mới</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-medium self-start">
            {[
              { id: "all", label: "Tất cả (48)" },
              { id: "rented", label: "Đang cho thuê (32)" },
              { id: "available", label: "Sẵn sàng kho (10)" },
              { id: "maintenance", label: "Hiệu chuẩn / Sửa (06)" },
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
              placeholder="Tìm theo số serial, vị trí kho, BV..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs outline-none focus:border-[#0284c7]"
            />
          </div>
        </div>

        {/* 3. Grid of Device Cards with Zero-CLS Skeleton */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonDeviceCard key={idx} />
              ))}
            </motion.div>
          ) : filteredDevices.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TableEmptyState
                searchTerm={searchTerm}
                title="Không tìm thấy thiết bị nào"
                description={`Không có máy Sonost 3000 nào khớp với điều kiện lọc "${searchTerm || statusFilter}".`}
                onReset={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDevices.map((d) => (
                <motion.div
                  key={d.serial}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                  }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-3 hover:border-[#0284c7] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono-data font-bold text-slate-900 dark:text-slate-100 text-sm">
                        #{d.serial}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {d.model}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === "rented"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : d.status === "available"
                          ? "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {d.statusText}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Vị trí hiện tại:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]">
                        {d.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Hiệu chuẩn Phantom:</span>
                      <span className="font-mono-data font-semibold text-[#0284c7] dark:text-sky-400">
                        {d.phantomPrecision}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Tổng ca đo:</span>
                      <span className="font-mono-data font-medium text-slate-700 dark:text-slate-300">
                        {d.totalScans.toLocaleString()} ca
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>QC gần nhất: {d.lastQC}</span>
                    <button className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline flex items-center gap-0.5">
                      <History size={12} /> Nhật ký
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
