"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronDown,
  Activity,
  FileCheck,
} from "lucide-react";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none"
        aria-label="Tài khoản admin"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284c7] to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            TH
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
        </div>

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            BS. Nguyễn Trọng Hải
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-data">
            Kỹ Sư Trưởng Sonost
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`hidden md:block text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu with Scale-In Transform Origin */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 will-change-transform"
          >
            {/* User profile summary */}
            <div className="p-3.5 bg-slate-50/70 dark:bg-[#0b0f17]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0284c7] to-cyan-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  TH
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    BS. Nguyễn Trọng Hải
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono-data">
                    hai.nguyen@osteosys.vn
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 bg-sky-50 dark:bg-cyan-950/60 rounded border border-sky-200/60 dark:border-cyan-900/60">
                <ShieldCheck size={13} className="text-[#0284c7] dark:text-cyan-400" />
                <span className="text-[11px] font-medium text-[#0284c7] dark:text-cyan-300">
                  Quyền Quản trị viên Toàn quyền
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5 text-xs text-slate-700 dark:text-slate-300">
              <a
                href="/admin/cai-dat"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <User size={14} className="text-slate-400" />
                <span>Hồ sơ &amp; Chứng chỉ kỹ thuật</span>
              </a>
              <a
                href="/admin/sua-chua"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Activity size={14} className="text-slate-400" />
                <span>Nhật ký hiệu chuẩn thiết bị</span>
              </a>
              <a
                href="/admin/cai-dat"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <FileCheck size={14} className="text-slate-400" />
                <span>Mẫu in phiếu đo BMD &amp; T-score</span>
              </a>
              <a
                href="#"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <HelpCircle size={14} className="text-slate-400" />
                <span>Tài liệu kỹ thuật Sonost 3000 (PDF)</span>
              </a>
            </div>

            {/* Logout */}
            <div className="p-1.5 bg-slate-50/50 dark:bg-[#0b0f17]/60">
              <a
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut size={14} />
                <span>Đăng xuất tài khoản</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
