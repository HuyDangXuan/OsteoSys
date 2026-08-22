"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ChevronRight,
  Radio,
} from "lucide-react";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Thiết bị Sonost 3000", href: "/san-pham/sonost-3000" },
  { label: "Thuê máy", href: "/dich-vu-cho-thue" },
  { label: "Sửa chữa & Kiểm định", href: "/dich-vu-sua-chua" },
  { label: "Báo giá B2B", href: "/bao-gia" },
];

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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs"
          : "bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-xs border-b border-slate-100 dark:border-slate-850"
      }`}
    >
      {/* Optional Top Announcement Bar */}
      {topBanner?.enabled && topBanner.text && (
        <div className="bg-[#0284c7] dark:bg-cyan-900 text-white text-[11px] font-medium py-1 px-4 text-center flex items-center justify-center gap-2">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none">
            <div className="w-8 h-8 bg-[#0284c7] dark:bg-cyan-600 rounded-md flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight">
                  OsteoSys
                </span>
                <span className="px-1.5 py-0.5 text-xs font-mono-data font-bold bg-sky-100 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 border border-transparent dark:border-cyan-800/50 rounded">
                  Sonost 3000
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 tracking-tight font-medium mt-0.5">
                Thiết Bị Đo Loãng Xương Y Khoa
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors relative ${
                    active
                      ? "text-[#0284c7] dark:text-cyan-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="activeClientNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0284c7] dark:bg-cyan-400 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${hotlineTel}`}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#0284c7] dark:hover:text-cyan-400 transition-colors"
            >
              <Phone size={13} className="text-[#0284c7] dark:text-cyan-400" />
              <span className="font-mono-data">{hotline}</span>
            </a>

            {/* Theme Toggle Button */}
            <ThemeToggleSimple />

            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0284c7] dark:hover:text-cyan-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cổng Đối Tác
            </Link>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Link
                href="/bao-gia"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
              >
                <span>Nhận Báo Giá B2B</span>
                <ChevronRight size={13} />
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu and toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggleSimple />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md"
              aria-label={open ? "Đóng menu" : "Mở menu"}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Slide-down Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-sky-50 dark:bg-cyan-950/60 text-[#0284c7] dark:text-cyan-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="w-full py-2 px-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md block"
                >
                  Đăng nhập Cổng Đối tác Y tế
                </Link>
                <Link
                  href="/bao-gia"
                  onClick={() => setOpen(false)}
                  className="w-full py-2.5 px-3 text-center text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-md block shadow-sm"
                >
                  Tư Vấn &amp; Nhận Báo Giá B2B →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
