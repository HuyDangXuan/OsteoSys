"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Boxes,
  Users,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Activity,
  Radio,
  ExternalLink,
  X,
  Stethoscope,
} from "lucide-react";
import { useAdmin } from "./AdminThemeContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  badge?: string;
  badgeType?: "info" | "warning" | "success";
}

const navItems: NavItem[] = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Thuê máy",
    href: "/admin/thue-may",
    icon: CalendarCheck,
    badge: "12",
    badgeType: "info",
  },
  {
    name: "Sửa chữa",
    href: "/admin/sua-chua",
    icon: Wrench,
    badge: "3",
    badgeType: "warning",
  },
  {
    name: "Kho thiết bị",
    href: "/admin/kho-thiet-bi",
    icon: Boxes,
    badge: "48",
    badgeType: "success",
  },
  {
    name: "Khách hàng",
    href: "/admin/khach-hang",
    icon: Users,
  },
  {
    name: "Cài đặt",
    href: "/admin/cai-dat",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const {
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAdmin();

  const isNavActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 select-none">
      {/* 1. Header: Logo Sonost 3000 */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 group overflow-hidden focus-visible:outline-none"
        >
          {/* Sonost 3000 Ultrasound Wave Icon */}
          <div className="w-9 h-9 rounded-md bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <Radio size={19} className="animate-pulse" />
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                  Sonost 3000
                </span>
                <span className="px-1.5 py-0.5 text-xs font-mono-data font-bold bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 rounded">
                  PRO
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Hệ thống Quản lý Y tế B2B
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
          aria-label="Đóng menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Device Quick Status Indicator (when expanded) */}
      {!isSidebarCollapsed && (
        <div className="mx-3 mt-3.5 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-md">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Activity size={12} className="text-emerald-500" />
              <span>Máy Sonost trực tuyến</span>
            </span>
            <span className="font-mono-data font-bold text-emerald-600 dark:text-emerald-400">
              42/48
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[87.5%]" />
          </div>
        </div>
      )}

      {/* 3. Navigation Menu */}
      <div className="flex-1 py-4 px-2.5 overflow-y-auto space-y-1">
        {!isSidebarCollapsed && (
          <div className="px-2.5 pb-2 text-xs font-mono-data uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
            Danh mục Quản trị
          </div>
        )}

        {navItems.map((item) => {
          const active = isNavActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              title={isSidebarCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group relative ${
                active
                  ? "bg-[#0284c7] text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform group-hover:scale-105 ${
                  active ? "text-white" : "text-slate-400 dark:text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-sky-400"
                }`}
              />

              {!isSidebarCollapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={`text-xs font-mono-data font-bold px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : item.badgeType === "warning"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                      : item.badgeType === "success"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                  {item.badge && ` (${item.badge})`}
                </div>
              )}
            </Link>
          );
        })}

        {/* Portal landing page link */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            href="/"
            target="_blank"
            title={isSidebarCollapsed ? "Trang chủ Khách hàng" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
              isSidebarCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <ExternalLink size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Xem Portal B2B Public</span>}
          </Link>
        </div>
      </div>

      {/* 4. Footer Controls: Dark/Light Mode & Collapse Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2 shrink-0">
        {/* Dark / Light Toggle */}
        <div
          className={`flex items-center ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          } bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-md`}
        >
          {!isSidebarCollapsed && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 pl-2">
              Giao diện {theme === "dark" ? "Tối" : "Sáng"}
            </span>
          )}

          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              theme === "dark"
                ? "bg-slate-900 text-sky-400 shadow-sm"
                : "bg-white text-amber-500 shadow-sm"
            } ${isSidebarCollapsed ? "w-8 h-8 p-0" : ""}`}
            aria-label="Chuyển đổi Dark/Light mode"
            title={`Chuyển sang chế độ ${theme === "dark" ? "Sáng" : "Tối"}`}
          >
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            {!isSidebarCollapsed && (
              <span className="text-xs text-slate-800 dark:text-slate-200">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center gap-2 w-full py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          aria-label={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Thu gọn thanh bên</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
