"use client";

import React, { useState, useEffect } from "react";
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

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initialCustomers = [
    {
      id: "KH-001",
      name: "Bệnh viện Đa khoa Hồng Ngọc",
      type: "Bệnh viện Đa khoa Tư nhân",
      contactPerson: "BS. Nguyễn Văn Hùng (Trưởng khoa CĐHA)",
      phone: "024 3927 5568",
      email: "contact@hongngochospital.vn",
      address: "55 Yên Ninh, Ba Đình, Hà Nội",
      activeRentals: 2,
      devices: "Sonost 3000 (#SN-4102, #SN-4105)",
    },
    {
      id: "KH-002",
      name: "Phòng khám Đa khoa Medlatec",
      type: "Hệ thống Y tế / Phòng khám",
      contactPerson: "KTV. Lê Thu Trang",
      phone: "1900 56 56 56",
      email: "info@medlatec.com",
      address: "42 Nghĩa Dũng, Ba Đình, Hà Nội",
      activeRentals: 1,
      devices: "Sonost 3000 (#SN-8842)",
    },
    {
      id: "KH-003",
      name: "Bệnh viện Đại học Y Dược TP.HCM",
      type: "Bệnh viện Công lập Hạng I",
      contactPerson: "PGS.TS. Trần Minh Đức",
      phone: "028 3855 4269",
      email: "bvdhyd@umc.edu.vn",
      address: "215 Hồng Bàng, Quận 5, TP.HCM",
      activeRentals: 3,
      devices: "Sonost 3000 (#SN-3190, #SN-3191, #SN-8800)",
    },
  ];

  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 450);
  };

  useEffect(() => {
    if (search.trim()) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const filteredCustomers = initialCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

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
            28 Bệnh viện, phòng khám đa khoa và doanh nghiệp đang hợp tác thuê và sử dụng thiết bị OsteoSys.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReload}
            title="Tải lại dữ liệu"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors">
            <Plus size={14} />
            <span>Thêm khách hàng mới</span>
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
        <CardGridSkeleton count={3} />
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <TableEmptyState
            searchTerm={search}
            title="Không tìm thấy khách hàng nào"
            description={`Không có bệnh viện hay phòng khám nào khớp với từ khóa "${search}".`}
            onReset={() => setSearch("")}
            createLabel="Thêm khách hàng mới"
            onCreate={() => alert("Mở form thêm khách hàng")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => (
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
                    {c.contactPerson}
                  </p>
                  <p className="flex items-center gap-2 font-mono-data">
                    <Phone size={12} className="text-slate-400" />
                    {c.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    {c.email}
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
