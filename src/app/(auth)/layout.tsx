import React from "react";
import Link from "next/link";
import {
  Radio,
  ArrowLeft,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 antialiased relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      {/* Background Subtle Radial Gradient Glows for Medical Depth */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
                            radial-gradient(circle at 80% 80%, rgba(2, 132, 199, 0.08) 0%, transparent 50%)`,
        }}
      />

      {/* 1. Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1 duration-150"
          />
          <span>Quay lại Trang chủ Portal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono-data text-slate-400 dark:text-slate-500">
            <ShieldCheck size={13} className="text-[#0284c7] dark:text-cyan-400" />
            <span>Bảo mật 256-bit SSL</span>
          </div>
          <ThemeToggleSimple />
        </div>
      </header>

      {/* 2. Main Centered Content Area */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-6 flex flex-col items-center">
        {/* Brand Logo & Title Above Card */}
        <div className="mb-6 flex flex-col items-center text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0284c7] dark:bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-sky-950/20 transition-transform group-hover:scale-105 duration-200">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight leading-none">
                  Sonost 3000
                </span>
                <span className="px-1.5 py-0.5 text-xs font-mono-data font-bold bg-sky-100 dark:bg-cyan-950/70 text-[#0284c7] dark:text-cyan-400 border border-transparent dark:border-cyan-800/40 rounded">
                  PRO
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                OsteoSys Vietnam — Cổng Quản Trị Y Tế B2B
              </span>
            </div>
          </Link>
        </div>

        {/* The Centered Card itself */}
        <div className="w-full">{children}</div>
      </main>

      {/* 3. Bottom Footer Note */}
      <footer className="relative z-10 w-full max-w-xl mx-auto text-center py-4 text-xs text-slate-400 dark:text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <Lock size={12} className="text-[#0284c7] dark:text-cyan-400" />
          <span>Hệ thống tuân thủ tiêu chuẩn bảo mật y tế HIPAA &amp; ISO 13485</span>
        </p>
        <p>
          Hỗ trợ kỹ thuật 24/7:{" "}
          <a
            href="tel:0904000000"
            className="text-[#0284c7] dark:text-cyan-400 font-semibold hover:underline font-mono-data"
          >
            0904 000 000
          </a>
        </p>
      </footer>
    </div>
  );
}
