"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Search,
  Plus,
  RefreshCw,
  History,
  ShieldCheck,
} from "lucide-react";
import { SkeletonDeviceCard } from "@/components/ui/skeleton";
import { TableEmptyState } from "@/components/admin/TableStates";

interface DeviceItem {
  serial: string;
  model: string;
  year: number;
  location: string;
  status: "rented" | "available" | "under_maintenance" | "repairing" | "decommissioned";
  statusLabel: string;
  calibrationDate: string;
  nextCalibration: string;
  cvScore: string;
  qcStatus: string;
  totalScans: number;
}

export default function InventoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceItem[]>([]);

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      if (statusFilter !== "all") query.set("status", statusFilter);

      const res = await fetch(`/api/admin/devices?${query.toString()}`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setDevices(json.data);
      }
    } catch (err) {
      console.error("Failed to load devices:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDevices();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchDevices]);

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
            Dữ liệu trực tiếp MongoDB: theo dõi tình trạng máy, số serial, lịch sử kiểm chuẩn Phantom và vị trí vận hành.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDevices}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </motion.div>

      {/* 2. Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs font-medium self-start">
            {[
              { id: "all", label: `Tất cả (${devices.length})` },
              { id: "rented", label: "Đang cho thuê" },
              { id: "available", label: "Sẵn sàng kho" },
              { id: "under_maintenance", label: "Bảo trì / Hiệu chuẩn" },
              { id: "repairing", label: "Đang sửa chữa" },
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
          ) : devices.length === 0 ? (
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
                visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {devices.map((d) => (
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
                        {d.model} (SX: {d.year})
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === "rented"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : d.status === "available"
                          ? "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
                          : d.status === "under_maintenance"
                          ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {d.statusLabel}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Vị trí hiện tại:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]" title={d.location}>
                        {d.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Độ lặp lại Phantom:</span>
                      <span className="font-mono-data font-semibold text-[#0284c7] dark:text-sky-400">
                        CV {d.cvScore} ({d.qcStatus})
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
                    <span>QC gần nhất: {d.calibrationDate}</span>
                    <span className="font-mono-data text-xs text-slate-500">Hạn: {d.nextCalibration}</span>
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
