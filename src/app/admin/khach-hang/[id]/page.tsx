"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  Wrench,
  ShieldCheck,
  Activity,
  CreditCard,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Edit,
  FileText,
  Boxes,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { getPartnerDetail, PartnerDetailResult } from "@/lib/actions/partners";
import { SkeletonMetricCard, SkeletonDataTable } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const partnerId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<"contracts" | "repairs">("contracts");
  const [data, setData] = useState<PartnerDetailResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const res = await getPartnerDetail(partnerId);
        setData(res);
      } catch (err) {
        console.error("Failed to load partner detail:", err);
        toast.error("Không thể tải hồ sơ chi tiết đối tác");
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [partnerId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <SkeletonDataTable rows={6} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
          <Users size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Không tìm thấy hồ sơ đối tác
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Mã đối tác &ldquo;{partnerId}&rdquo; không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Link
          href="/admin/khach-hang"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284c7] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Quay lại danh sách khách hàng</span>
        </Link>
      </div>
    );
  }

  const { partner, metrics, contracts, repairs } = data;

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/khach-hang"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data font-bold text-xs text-[#0284c7] dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded border border-sky-200 dark:border-cyan-800/50">
                {partner.code}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {partner.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hồ sơ B2B Đối tác Y tế • Loại hình: {partner.typeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/thue-may`}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Tạo Hợp Đồng Thuê Máy</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Máy đang thuê</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400">
                {metrics.activeRentalsCount}
              </span>
              <span className="text-xs text-slate-400">Sonost 3000</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Boxes size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số Hợp đồng</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono-data text-slate-900 dark:text-slate-100">
                {metrics.totalContractsCount}
              </span>
              <span className="text-xs text-slate-400">hợp đồng</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-cyan-950 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Số lần bảo dưỡng/sửa</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono-data text-amber-600 dark:text-amber-400">
                {metrics.totalRepairsCount}
              </span>
              <span className="text-xs text-slate-400">phiếu kỹ thuật</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Wrench size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Giá trị tích lũy (LTV)</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono-data text-[#0284c7] dark:text-cyan-400">
                {metrics.formattedLifetimeValue}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* 3. Partner Profile Info Card */}
      <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#0284c7] dark:text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Thông tin liên hệ &amp; Pháp lý
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              partner.status === "active"
                ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200"
            }`}
          >
            {partner.statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Người đại diện / Phụ trách:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{partner.contactPerson}</p>
            <p className="text-slate-500 dark:text-slate-400">{partner.position}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Kênh liên lạc:</span>
            <p className="font-mono-data font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Phone size={12} className="text-slate-400" /> {partner.phone}
            </p>
            {partner.email && (
              <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" /> {partner.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium">Địa chỉ &amp; Mã số thuế:</span>
            <p className="text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
              <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" /> {partner.address}
            </p>
            {partner.taxCode && (
              <p className="font-mono-data text-slate-500">MST: {partner.taxCode}</p>
            )}
          </div>
        </div>

        {partner.notes && (
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <strong>Ghi chú:</strong> {partner.notes}
          </div>
        )}
      </div>

      {/* 4. Sub-Tabs: Rentals vs Repairs History */}
      <div className="space-y-4">
        {/* Tab Headers with Animated Pill */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("contracts")}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "contracts"
                ? "text-[#0284c7] dark:text-cyan-400"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <CalendarCheck size={15} />
            <span>Hợp Đồng Thuê Máy Sonost 3000 ({contracts.length})</span>
            {activeTab === "contracts" && (
              <motion.div
                layoutId="partner-detail-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0284c7] dark:bg-cyan-400"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("repairs")}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              activeTab === "repairs"
                ? "text-[#0284c7] dark:text-cyan-400"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Wrench size={15} />
            <span>Lịch Sử Sửa Chữa &amp; Bảo Dưỡng ({repairs.length})</span>
            {activeTab === "repairs" && (
              <motion.div
                layoutId="partner-detail-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0284c7] dark:bg-cyan-400"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Tab 1: Contracts Table */}
        {activeTab === "contracts" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
            {contracts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <CalendarCheck size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p>Đối tác này chưa có hợp đồng thuê máy Sonost 3000 nào.</p>
                <Link
                  href="/admin/thue-may"
                  className="inline-block mt-2 text-[#0284c7] dark:text-cyan-400 hover:underline font-semibold"
                >
                  + Khởi tạo hợp đồng đầu tiên
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Mã Hợp Đồng</th>
                      <th className="py-3 px-4">Máy Bàn Giao (Serial)</th>
                      <th className="py-3 px-4">Gói Thuê</th>
                      <th className="py-3 px-4">Thời Hạn</th>
                      <th className="py-3 px-4">Giá Thuê / Tháng</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {contracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4 font-mono-data font-bold text-[#0284c7] dark:text-cyan-400">
                          {c.contractCode}
                        </td>
                        <td className="py-3 px-4 font-mono-data font-semibold text-slate-800 dark:text-slate-200">
                          {c.deviceSerial}
                        </td>
                        <td className="py-3 px-4">{c.packageTypeLabel}</td>
                        <td className="py-3 px-4 font-mono-data text-slate-600 dark:text-slate-300">
                          {c.startDate} → {c.endDate}
                        </td>
                        <td className="py-3 px-4 font-mono-data font-semibold text-slate-900 dark:text-slate-100">
                          {c.formattedMonthlyFee}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              c.status === "active"
                                ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border-emerald-200"
                                : c.status === "expiring_soon"
                                ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-200"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200"
                            }`}
                          >
                            {c.statusLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Repairs History Table */}
        {activeTab === "repairs" && (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
            {repairs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Wrench size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p>Chưa có lịch sử sự cố hay yêu cầu sửa chữa nào từ cơ sở này.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Mã Phiếu</th>
                      <th className="py-3 px-4">Số Serial Máy</th>
                      <th className="py-3 px-4">Triệu Chứng / Hiện Tượng</th>
                      <th className="py-3 px-4">Kỹ Sư Phụ Trách</th>
                      <th className="py-3 px-4">Chi Phí</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Ngày Tiếp Nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {repairs.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-4 font-mono-data font-bold text-amber-600 dark:text-amber-400">
                          {r.ticketCode}
                        </td>
                        <td className="py-3 px-4 font-mono-data font-semibold text-slate-800 dark:text-slate-200">
                          {r.deviceSerial}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {r.reportedIssue}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                          {r.technicianName || "Kỹ sư OsteoSys"}
                        </td>
                        <td className="py-3 px-4 font-mono-data font-semibold text-slate-900 dark:text-slate-100">
                          {r.formattedCost}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {r.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono-data text-slate-500">
                          {r.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
