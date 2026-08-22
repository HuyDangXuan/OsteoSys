"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Boxes,
  Users,
  Settings,
  ShieldCheck,
  PlusCircle,
  FileText,
  Activity,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "./AdminThemeContext";

interface SearchItem {
  id: string;
  category: "Điều hướng" | "Thao tác nhanh" | "Thiết bị Sonost" | "Hợp đồng & Khách hàng";
  title: string;
  subtitle?: string;
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}

export default function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAdmin();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allItems: SearchItem[] = [
    // Điều hướng
    {
      id: "nav-overview",
      category: "Điều hướng",
      title: "Tổng quan Dashboard",
      subtitle: "Xem số liệu KPI, biểu đồ cho thuê & sửa chữa máy Sonost 3000",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      id: "nav-rentals",
      category: "Điều hướng",
      title: "Quản lý Thuê máy",
      subtitle: "Hợp đồng thuê, lịch bàn giao & thanh toán Sonost 3000",
      href: "/admin/thue-may",
      icon: CalendarCheck,
      badge: "HĐ đang chạy",
    },
    {
      id: "nav-repairs",
      category: "Điều hướng",
      title: "Phiếu Sửa chữa & Bảo trì",
      subtitle: "Tiếp nhận sự cố, hiệu chuẩn đầu dò ultrasound, bảo dưỡng định kỳ",
      href: "/admin/sua-chua",
      icon: Wrench,
      badge: "Kanban Board",
    },
    {
      id: "nav-inventory",
      category: "Điều hướng",
      title: "Kho thiết bị & Linh kiện",
      subtitle: "Danh sách máy Sonost 3000, đầu dò, phantom hiệu chuẩn, giấy in nhiệt",
      href: "/admin/kho-thiet-bi",
      icon: Boxes,
    },
    {
      id: "nav-customers",
      category: "Điều hướng",
      title: "Danh sách Khách hàng",
      subtitle: "Bệnh viện, phòng khám, trung tâm y tế & doanh nghiệp đối tác",
      href: "/admin/khach-hang",
      icon: Users,
    },
    {
      id: "nav-cms",
      category: "Điều hướng",
      title: "Quản trị Nội dung Website (CMS)",
      subtitle: "Tùy biến nội dung, thông số kỹ thuật, bảng giá thuê máy và SEO",
      href: "/admin/cms",
      icon: FileText,
      badge: "Dynamic CMS",
    },
    {
      id: "nav-accounts",
      category: "Điều hướng",
      title: "Quản lý Tài khoản & Phân quyền",
      subtitle: "Phân quyền vai trò Super Admin, Sales, Technician, xét duyệt & mở khóa",
      href: "/admin/accounts",
      icon: ShieldCheck,
      badge: "Super Admin",
    },
    {
      id: "nav-settings",
      category: "Điều hướng",
      title: "Cài đặt Hệ thống & DICOM",
      subtitle: "Cấu hình PACS, mẫu in kết quả T-score, quản lý tài khoản kỹ thuật viên",
      href: "/admin/cai-dat",
      icon: Settings,
    },

    // Thao tác nhanh
    {
      id: "action-new-rental",
      category: "Thao tác nhanh",
      title: "Tạo hợp đồng thuê máy mới",
      subtitle: "Xuất phiếu bàn giao Sonost 3000 và tính toán biểu phí",
      href: "/admin/thue-may",
      icon: PlusCircle,
      badge: "Phím tắt: N",
    },
    {
      id: "action-new-repair",
      category: "Thao tác nhanh",
      title: "Tạo phiếu tiếp nhận sửa chữa / hiệu chuẩn",
      subtitle: "Ghi nhận lỗi đầu dò, nguồn phát hoặc kiểm chuẩn SOS/BUA",
      href: "/admin/sua-chua",
      icon: Activity,
    },
    {
      id: "action-export-report",
      category: "Thao tác nhanh",
      title: "Xuất báo cáo doanh thu & thiết bị tháng",
      subtitle: "File Excel / PDF tổng hợp theo chuẩn y tế",
      href: "/admin/thue-may",
      icon: FileText,
    },

    // Thiết bị nổi bật
    {
      id: "device-sn3000-01",
      category: "Thiết bị Sonost",
      title: "Sonost 3000 - SN: #OST-3000-8842",
      subtitle: "Vị trí: BV Đa khoa Xanh Pôn (Đang thuê) • Hạn bảo dưỡng: 15/09/2026",
      href: "/admin/kho-thiet-bi?search=OST-3000-8842",
      icon: Boxes,
      badge: "Hoạt động tốt",
    },
    {
      id: "device-sn3000-02",
      category: "Thiết bị Sonost",
      title: "Sonost 3000 - SN: #OST-3000-7719",
      subtitle: "Vị trí: Kho Hà Nội (Sẵn sàng) • Kiểm chuẩn Phantom: Đạt",
      href: "/admin/kho-thiet-bi?search=OST-3000-7719",
      icon: Boxes,
      badge: "Sẵn sàng",
    },
  ];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const handleSelect = (item: SearchItem) => {
    setCommandPaletteOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm máy Sonost 3000, hợp đồng, phiếu sửa chữa, khách hàng... (Cmd+K)"
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X size={14} />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono-data bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="overflow-y-auto p-2 flex-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <Search size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Thử tìm theo mã máy (VD: OST-3000), tên bệnh viện, hoặc &ldquo;Thuê máy&rdquo;
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-sky-50 dark:bg-cyan-950/40 text-slate-900 dark:text-cyan-200 border border-sky-200 dark:border-cyan-800/50"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#0284c7] dark:bg-cyan-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span className="text-[10px] uppercase tracking-wider font-mono-data opacity-60">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} className="text-[#0284c7] dark:text-cyan-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0b0f17] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">
                ↓
              </kbd>{" "}
              Di chuyển
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px]">
                Enter
              </kbd>{" "}
              Chọn
            </span>
          </div>
          <span className="flex items-center gap-1 text-[#0284c7] dark:text-cyan-400 text-xs font-medium">
            <Sparkles size={12} /> Sonost 3000 Quick Search
          </span>
        </div>
      </div>
    </div>
  );
}
