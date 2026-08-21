"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  cardContainerVariants,
  formItemVariants,
  pulseBreathingVariants,
} from "@/lib/auth-motion";

function PendingActivationContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || "OST-ACC-8924";
  const orgParam = searchParams.get("org") || "Phòng khám / Cơ sở Y tế Đối tác";

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 backdrop-blur-sm"
    >
      {/* Header Status with Breathing Pulse Icon */}
      <motion.div variants={formItemVariants} className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider font-mono-data">
          <motion.div
            variants={pulseBreathingVariants}
            animate="pulse"
            className="flex items-center"
          >
            <Clock size={14} className="text-amber-600 dark:text-amber-400" />
          </motion.div>
          <span>Hồ Sơ Chờ Kích Hoạt (Pending Approval)</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Hồ sơ y tế của bạn đang được xét duyệt
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Cảm ơn Quý đơn vị đã đăng ký tham gia mạng lưới chẩn đoán loãng xương OsteoSys Sonost 3000.
          Đội ngũ chuyên gia kỹ thuật y tế đang tiến hành thẩm định thông tin pháp lý &amp; điều kiện vận hành.
        </p>
      </motion.div>

      {/* Reference Card Box */}
      <motion.div
        variants={formItemVariants}
        className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-lg space-y-3"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Mã hồ sơ thẩm định (Reference ID):</span>
          <span className="font-mono-data font-bold text-[#0284c7] dark:text-sky-400 text-sm bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200/60 dark:border-sky-800/60">
            #{refParam}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Đơn vị y tế:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
            {decodeURIComponent(orgParam)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Thời gian thẩm định dự kiến:</span>
          <span className="font-mono-data font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
            Trong vòng 02–04 giờ làm việc
          </span>
        </div>
      </motion.div>

      {/* 3-Step Verification Timeline */}
      <motion.div variants={formItemVariants} className="space-y-2.5">
        <h3 className="text-xs font-mono-data uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
          Quy trình kích hoạt tài khoản
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">1. Tiếp nhận hồ sơ:</span> Đã lưu thông tin đăng ký lên hệ thống máy chủ an toàn.
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
            <Clock size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-300">2. Xác thực chuyên môn &amp; Thiết bị:</span> Kỹ sư liên hệ xác nhận nhu cầu thuê/kết nối máy Sonost 3000.
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 opacity-60">
            <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </span>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">3. Bàn giao tài khoản:</span> Kích hoạt quyền truy cập quản lý thiết bị và phần mềm chẩn đoán.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fast Contact Actions with Motion Tap */}
      <motion.div variants={formItemVariants} className="space-y-2 pt-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Cần đẩy nhanh tiến độ kích hoạt hồ sơ? Liên hệ trực tiếp bộ phận kỹ thuật:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="tel:0904000000"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <Phone size={14} />
            <span>Gọi Hotline: 0904 000 000</span>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://zalo.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
          >
            <MessageSquare size={14} />
            <span>Chat Zalo Kỹ thuật viên</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Back to Home Link */}
      <motion.div variants={formItemVariants} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
          ← Về trang chủ OsteoSys
        </Link>
        <Link href="/login" className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline">
          Đăng nhập tài khoản khác →
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function PendingActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#0284c7]" size={24} />
        </div>
      }
    >
      <PendingActivationContent />
    </Suspense>
  );
}
