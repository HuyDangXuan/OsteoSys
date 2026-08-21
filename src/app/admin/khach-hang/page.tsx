"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CalendarCheck,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { CardGridSkeleton, TableEmptyState } from "@/components/admin/TableStates";

interface PartnerItem {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  activeRentals: number;
  devices: string;
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<PartnerItem[]>([]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);

      const res = await fetch(`/api/admin/customers?${query.toString()}`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="text-indigo-500" size={24} />
            Danh sách Khách hàng B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dữ liệu trực tiếp MongoDB: Bệnh viện, phòng khám đa khoa và doanh nghiệp đang hợp tác thuê và sử dụng thiết bị OsteoSys.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCustomers}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bệnh viện, người liên hệ, địa chỉ..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>

        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-[#0284c7] hover:underline flex items-center gap-1 font-medium"
          >
            <RotateCcw size={12} /> Đặt lại tìm kiếm
          </button>
        )}
      </div>

      {/* Content Grid with Skeleton & Empty States */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <TableEmptyState
            searchTerm={search}
            title="Không tìm thấy khách hàng nào"
            description={`Không có bệnh viện hay phòng khám nào khớp với từ khóa "${search}".`}
            onReset={() => setSearch("")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between gap-4 hover:border-[#0284c7] dark:hover:border-sky-500 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono-data uppercase tracking-wider text-[#0284c7] font-semibold bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CalendarCheck size={13} /> {c.activeRentals} máy đang thuê
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {c.type}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Liên hệ:</span>{" "}
                    <span className="truncate">{c.contactPerson}</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono-data">
                    <Phone size={12} className="text-slate-400" />
                    {c.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}</span>
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Thiết bị đang dùng:</span>{" "}
                <span className="font-mono-data text-[#0284c7]">{c.devices}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
