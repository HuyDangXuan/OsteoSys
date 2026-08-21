"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAdmin } from "./AdminThemeContext";

interface NavItem {
  name: string;
  href: string;
  aliases?: string[];
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  badgeKey?: "rentals" | "repairs" | "inventory";
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
    aliases: ["/admin/leasing"],
    icon: CalendarCheck,
    badgeKey: "rentals",
    badgeType: "info",
  },
  {
    name: "Sửa chữa",
    href: "/admin/sua-chua",
    aliases: ["/admin/repairs"],
    icon: Wrench,
    badgeKey: "repairs",
    badgeType: "warning",
  },
  {
    name: "Kho thiết bị",
    href: "/admin/kho-thiet-bi",
    aliases: ["/admin/inventory"],
    icon: Boxes,
    badgeKey: "inventory",
    badgeType: "success",
  },
  {
    name: "Khách hàng",
    href: "/admin/khach-hang",
    aliases: ["/admin/partners"],
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

  const [dynamicCounts, setDynamicCounts] = useState<{
    inventory: number;
    rentals: number;
    repairs: number;
    rentedDevices: number;
    totalDevices: number;
    utilizationRate: number;
  }>({
    inventory: 48,
    rentals: 12,
    repairs: 3,
    rentedDevices: 28,
    totalDevices: 48,
    utilizationRate: 58.3,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/devices/stats", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const d = json.data;
          setDynamicCounts({
            inventory: d.totalDevices,
            rentals: d.commercial?.activeRentalsCount || d.rentedDevices,
            repairs: d.maintenanceDevices,
            rentedDevices: d.rentedDevices,
            totalDevices: d.totalDevices,
            utilizationRate: d.percentages?.rented || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load sidebar stats:", err);
      }
    };

    fetchStats();
  }, [pathname]);

  const isNavActive = (item: NavItem) => {
    if (item.href === "/admin") {
      return pathname === "/admin";
    }
    if (pathname.startsWith(item.href)) {
      return true;
    }
    if (item.aliases?.some((alias) => pathname.startsWith(alias))) {
      return true;
    }
    return false;
  };

  const getBadgeValue = (key?: "rentals" | "repairs" | "inventory") => {
    if (!key) return undefined;
    return String(dynamicCounts[key]);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0b0f17] border-r border-slate-200 dark:border-slate-800 transition-all duration-200 select-none">
      {/* 1. Header: Logo Sonost 3000 */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 group overflow-hidden focus-visible:outline-none"
        >
          {/* Sonost 3000 Ultrasound Wave Icon */}
          <div className="w-9 h-9 rounded-md bg-[#0284c7] dark:bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <Radio size={19} className="animate-pulse" />
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight leading-none">
                  Sonost 3000
                </span>
                <span className="px-1.5 py-0.5 text-xs font-mono-data font-bold bg-sky-100 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 border border-transparent dark:border-cyan-800/40 rounded">
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
        <div className="mx-3 mt-3.5 p-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-md">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Activity size={12} className="text-emerald-500" />
              <span>Máy đang cho thuê</span>
            </span>
            <span className="font-mono-data font-bold text-emerald-600 dark:text-emerald-400">
              {dynamicCounts.rentedDevices}/{dynamicCounts.totalDevices}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, dynamicCounts.utilizationRate))}%` }}
            />
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
          const active = isNavActive(item);
          const Icon = item.icon;
          const badgeValue = getBadgeValue(item.badgeKey);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              title={isSidebarCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group relative ${
                active
                  ? "bg-[#0284c7] dark:bg-cyan-950/60 text-white dark:text-cyan-400 shadow-2xs font-semibold border-l-0 dark:border-l-2 dark:border-cyan-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
              } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform group-hover:scale-105 ${
                  active
                    ? "text-white dark:text-cyan-400"
                    : "text-slate-400 dark:text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-cyan-400"
                }`}
              />

              {!isSidebarCollapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {!isSidebarCollapsed && badgeValue && (
                <span
                  className={`text-xs font-mono-data font-bold px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-white/20 dark:bg-cyan-900/60 text-white dark:text-cyan-300"
                      : item.badgeType === "warning"
                      ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-transparent dark:border-amber-800/40"
                      : item.badgeType === "success"
                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {badgeValue}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                  {badgeValue && ` (${badgeValue})`}
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
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
              isSidebarCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <ExternalLink size={15} className="shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Xem Portal B2B Public</span>}
          </Link>
        </div>
      </div>

      {/* 4. Footer Controls: Dark/Light Mode & Collapse Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 shrink-0">
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
                ? "bg-[#0b0f17] text-cyan-400 shadow-sm border border-slate-700"
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
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
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
