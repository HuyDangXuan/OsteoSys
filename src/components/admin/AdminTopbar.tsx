"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  ChevronRight,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "./AdminThemeContext";
import NotificationDropdown from "./NotificationDropdown";
import UserMenu from "./UserMenu";

const routeNames: Record<string, { label: string; parent?: string }> = {
  "/admin": { label: "Tổng quan Dashboard" },
  "/admin/thue-may": { label: "Quản lý Thuê máy Sonost 3000" },
  "/admin/sua-chua": { label: "Sửa chữa & Hiệu chuẩn" },
  "/admin/kho-thiet-bi": { label: "Kho thiết bị & Linh kiện" },
  "/admin/khach-hang": { label: "Danh sách Khách hàng B2B" },
  "/admin/cai-dat": { label: "Cài đặt Hệ thống" },
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setMobileSidebarOpen, setCommandPaletteOpen } = useAdmin();

  // Compute breadcrumb path
  const currentRoute = routeNames[pathname] || { label: "Quản trị" };

  return (
    <header
      className={`sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-all duration-200 ${
        isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      }`}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Mở menu thanh bên"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
            <Link
              href="/admin"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1 shrink-0"
            >
              <Radio size={13} className="text-[#0284c7] shrink-0" />
              <span>Sonost 3000</span>
            </Link>

            {pathname !== "/admin" && (
              <>
                <ChevronRight size={13} className="text-slate-400 dark:text-slate-600 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {currentRoute.label}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Center: Search input button (Cmd+K) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-md text-xs text-slate-500 dark:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
            title="Mở tìm kiếm nhanh (Cmd+K / Ctrl+K)"
          >
            <span className="flex items-center gap-2 truncate">
              <Search size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">Tìm máy Sonost, hợp đồng, phiếu sửa chữa...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono-data bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile search icon button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            aria-label="Tìm kiếm"
          >
            <Search size={18} />
          </button>

          {/* Quick Create Action */}
          <Link
            href="/admin/thue-may?action=new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-medium rounded-md shadow-2xs transition-colors"
          >
            <Plus size={14} />
            <span>Tạo mới</span>
          </Link>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Admin Avatar Profile */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
