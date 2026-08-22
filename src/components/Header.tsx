"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ChevronRight,
  ChevronDown,
  Radio,
  Rotate3d,
  Activity,
  Box,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  ExternalLink,
} from "lucide-react";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";

interface HeaderProps {
  globalData?: {
    hotline?: string;
    hotlineLabel?: string;
    topBanner?: {
      enabled?: boolean;
      text?: string;
      linkUrl?: string;
      linkLabel?: string;
    };
  };
}

export default function Header({ globalData }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hotline = globalData?.hotline || "0904 000 000";
  const hotlineTel = hotline.replace(/\s+/g, "");
  const topBanner = globalData?.topBanner;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setProductDropdownOpen(false);
  }, [pathname]);

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setProductDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setProductDropdownOpen(false);
    }, 180);
  };

  const isProductActive = pathname.startsWith("/san-pham");

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 overflow-x-clip ${
        scrolled
          ? "bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs"
          : "bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-850"
      }`}
    >
      {/* Optional Top Announcement Bar */}
      {topBanner?.enabled && topBanner.text && (
        <div className="bg-gradient-to-r from-[#0284c7] via-cyan-600 to-teal-600 text-white text-[11px] font-medium py-1 px-4 text-center flex items-center justify-center gap-2 border-b border-white/10">
          <span>{topBanner.text}</span>
          {topBanner.linkUrl && (
            <Link
              href={topBanner.linkUrl}
              className="underline font-bold hover:text-sky-200 transition-colors"
            >
              {topBanner.linkLabel || "Xem chi tiết →"}
            </Link>
          )}
        </div>
      )}

      {/* Main Navigation Bar Container (Zero-clipping guarantee) */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8 w-full gap-2 xl:gap-4">
        {/* ========================================================================= */}
        {/* 1. KHỐI TRÁI: LOGO THƯƠNG HIỆU & ĐỊNH DANH                                */}
        {/* ========================================================================= */}
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none select-none"
        >
          {/* Logo Icon with Cyan Glow */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-tr from-[#0284c7] via-cyan-500 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Radio size={18} className="animate-pulse" />
          </div>

          {/* Typography & Badges */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-slate-900 dark:text-white text-base lg:text-lg tracking-tight whitespace-nowrap">
                OsteoSys
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono-data font-bold bg-sky-100 dark:bg-cyan-950 text-[#0284c7] dark:text-cyan-400 border border-sky-200 dark:border-cyan-800/60 rounded whitespace-nowrap">
                Sonost 3000
              </span>
              <span className="hidden 2xl:inline-block px-1.5 py-0.5 text-[9px] font-mono-data font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 rounded whitespace-nowrap">
                Korea Tech
              </span>
            </div>
            <span className="hidden 2xl:block text-[11px] text-slate-500 dark:text-slate-400 tracking-tight font-medium mt-1 whitespace-nowrap">
              Thiết Bị Đo Loãng Xương Siêu Âm Y Khoa
            </span>
          </div>
        </Link>

        {/* ========================================================================= */}
        {/* 2. KHỐI GIỮA: MENU ĐIỀU HƯỚNG TINH GỌN (DESKTOP)                          */}
        {/* ========================================================================= */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3 text-xs xl:text-sm font-medium">
          {/* Link: Trang Chủ */}
          <Link
            href="/"
            className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg transition-colors whitespace-nowrap relative ${
              pathname === "/"
                ? "text-[#0284c7] dark:text-cyan-400 font-semibold"
                : "text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Trang Chủ</span>
            {pathname === "/" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0284c7] dark:bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          {/* Dropdown: Sản Phẩm & Công Nghệ */}
          <div
            className="relative"
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              onClick={() => setProductDropdownOpen(!productDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer relative ${
                isProductActive
                  ? "text-[#0284c7] dark:text-cyan-400 font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              }`}
              aria-expanded={productDropdownOpen}
            >
              <span>Sản Phẩm &amp; Công Nghệ</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  productDropdownOpen ? "rotate-180 text-[#0284c7] dark:text-cyan-400" : ""
                }`}
              />
              {isProductActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0284c7] dark:bg-cyan-400 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Dropdown Menu Popover */}
            <AnimatePresence>
              {productDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-1.5 w-80 sm:w-88 p-2.5 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-1 z-50"
                >
                  {/* Item 1: Tổng quan Sonost 3000 */}
                  <Link
                    href="/san-pham/sonost-3000"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-[#0284c7] dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Activity size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] dark:group-hover:text-cyan-300 transition-colors">
                        Tổng quan Sonost 3000
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        Thông số lâm sàng BQI/SOS/BUA, đầu dò gót chân
                      </span>
                    </div>
                  </Link>

                  {/* Item 2: Trải nghiệm 3D Interactive (Nổi Bật) */}
                  <Link
                    href="/san-pham/sonost-3000/3d-viewer"
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-gradient-to-r from-sky-50/80 via-cyan-50/40 to-transparent dark:from-sky-950/40 dark:via-cyan-950/20 dark:to-transparent border border-cyan-200/60 dark:border-cyan-800/50 hover:border-cyan-400 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 dark:bg-cyan-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/30 group-hover:rotate-12 transition-transform">
                      <Rotate3d size={16} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-cyan-300 transition-colors">
                          Trải nghiệm Tương tác 3D
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 text-[9px] font-mono-data font-extrabold uppercase animate-pulse">
                          3D Live
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-300 leading-tight mt-0.5">
                        Xoay 360°, 4 điểm neo &amp; máy in nhiệt mặt sau
                      </span>
                    </div>
                  </Link>

                  {/* Item 3: Bóc tách Cấu trúc Linh kiện (Exploded View) */}
                  <Link
                    href="/san-pham/sonost-3000/exploded-view"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Box size={16} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                          Bóc Tách Cấu Trúc (Exploded 3D)
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-mono-data font-bold">
                          MỚI
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        Tách rời 7 phân hệ cơ - âm - điện tử &amp; bo mạch
                      </span>
                    </div>
                  </Link>

                  {/* Item 4: Bảng Thông số Kỹ thuật */}
                  <Link
                    href="/san-pham/sonost-3000#specs"
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        Bảng Thông Số Kỹ Thuật
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        Hồ sơ đăng ký lưu hành y tế Bộ Y Tế &amp; ISCD
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Link: Dịch vụ Cho Thuê */}
          <Link
            href="/dich-vu-cho-thue"
            className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg transition-colors whitespace-nowrap relative ${
              pathname === "/dich-vu-cho-thue"
                ? "text-[#0284c7] dark:text-cyan-400 font-semibold"
                : "text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Thuê Máy</span>
            {pathname === "/dich-vu-cho-thue" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0284c7] dark:bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          {/* Link: Bảo Dưỡng & Sửa Chữa */}
          <Link
            href="/dich-vu-sua-chua"
            className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg transition-colors whitespace-nowrap relative ${
              pathname === "/dich-vu-sua-chua"
                ? "text-[#0284c7] dark:text-cyan-400 font-semibold"
                : "text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Sửa Chữa &amp; Kiểm Định</span>
            {pathname === "/dich-vu-sua-chua" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0284c7] dark:bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          {/* Link: Báo Giá B2B */}
          <Link
            href="/bao-gia"
            className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg transition-colors whitespace-nowrap relative ${
              pathname === "/bao-gia"
                ? "text-[#0284c7] dark:text-cyan-400 font-semibold"
                : "text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
            }`}
          >
            <span>Báo Giá B2B</span>
            {pathname === "/bao-gia" && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0284c7] dark:bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        </nav>

        {/* ========================================================================= */}
        {/* 3. KHỐI PHẢI: ACTION BAR & ZERO-CLIPPING CTA (DESKTOP)                     */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex items-center gap-2.5 xl:gap-3.5 shrink-0">
          {/* Theme Toggle Button */}
          <div className="shrink-0">
            <ThemeToggleSimple />
          </div>

          {/* Primary CTA Button */}
          <motion.div whileTap={{ scale: 0.98 }} className="shrink-0">
            <Link
              href="/bao-gia"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-teal-500 hover:to-cyan-500 transition-all shrink-0 shadow-cyan-500/20"
            >
              <span>Yêu Cầu Báo Giá / Tư Vấn</span>
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* 4. MOBILE / TABLET MENU TOGGLE BUTTON                                     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <ThemeToggleSimple />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            aria-label="Mở menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SLIDE-OVER MOBILE DRAWER (FRAMER MOTION)                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Slide-over Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[320px] sm:max-w-[360px] bg-white dark:bg-[#0b0f17] border-l border-slate-200 dark:border-slate-800 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              {/* Drawer Top: Header & Close Button */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-[#0284c7] to-cyan-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                      <Radio size={16} />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      OsteoSys Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Đóng menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* 3D Highlight Cards in Mobile Drawer */}
                <div className="grid grid-cols-1 gap-2">
                  {/* Card 1: 3D Studio 360° */}
                  <Link
                    href="/san-pham/sonost-3000/3d-viewer"
                    onClick={() => setMobileOpen(false)}
                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-cyan-500/40 text-white shadow-lg space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-mono-data font-bold uppercase">
                        3D Studio 360°
                      </span>
                      <Rotate3d size={16} className="text-cyan-400 group-hover:rotate-45 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-white">
                      Trải Nghiệm Mô Hình 3D Toàn Cảnh
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono-data text-cyan-300 font-semibold pt-0.5">
                      <span>Mở Studio 3D</span>
                      <ChevronRight size={11} />
                    </div>
                  </Link>

                  {/* Card 2: 3D Exploded View */}
                  <Link
                    href="/san-pham/sonost-3000/exploded-view"
                    onClick={() => setMobileOpen(false)}
                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 text-white shadow-lg space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono-data font-bold uppercase">
                        Exploded 3D
                      </span>
                      <Box size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-white">
                      Bóc Tách 7 Phân Hệ Cấu Trúc Máy
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono-data text-emerald-300 font-semibold pt-0.5">
                      <span>Bóc tách ngay</span>
                      <ChevronRight size={11} />
                    </div>
                  </Link>
                </div>

                {/* Mobile Links List */}
                <div className="space-y-1 text-sm font-medium">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/"
                        ? "bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Trang Chủ
                  </Link>

                  <Link
                    href="/san-pham/sonost-3000"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/san-pham/sonost-3000"
                        ? "bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Tổng Quan Thiết Bị Sonost 3000
                  </Link>

                  <Link
                    href="/dich-vu-cho-thue"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/dich-vu-cho-thue"
                        ? "bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Dịch Vụ Cho Thuê Máy
                  </Link>

                  <Link
                    href="/dich-vu-sua-chua"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/dich-vu-sua-chua"
                        ? "bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Bảo Dưỡng &amp; Sửa Chữa
                  </Link>

                  <Link
                    href="/bao-gia"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/bao-gia"
                        ? "bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Báo Giá B2B Cho Phòng Khám
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom: Hotline & Primary Quote CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <a
                  href={`tel:${hotlineTel}`}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold font-mono-data"
                >
                  <Phone size={13} className="text-emerald-500" />
                  <span>Hotline: {hotline}</span>
                </a>

                <Link
                  href="/bao-gia"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
                >
                  <span>Yêu Cầu Báo Giá &amp; Demo</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
