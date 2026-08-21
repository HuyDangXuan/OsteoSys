"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  CalendarX,
  Loader2,
} from "lucide-react";
import {
  cardContainerVariants,
  formItemVariants,
  pulseBreathingVariants,
} from "@/lib/auth-motion";

function SuspendedContent() {
  const searchParams = useSearchParams();
  const [requestSent, setRequestSent] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dynamicReason =
    searchParams.get("reason") ||
    "Hết hạn hợp đồng thuê máy Sonost 3000 (#HD-2026-041) hoặc chưa hoàn tất kiểm định hiệu chuẩn định kỳ.";
  const contractId = searchParams.get("contract") || "HD-2026-041";

  const handleSendUnlockRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRequestSent(true);
    }, 600);
  };

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 backdrop-blur-sm"
    >
      {/* Status Title with Breathing Warning Icon */}
      <motion.div variants={formItemVariants} className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider font-mono-data">
          <motion.div
            variants={pulseBreathingVariants}
            animate="pulse"
            className="flex items-center"
          >
            <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
          </motion.div>
          <span>Tài Khoản Tạm Ngưng (Account Suspended)</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Quyền truy cập tạm thời bị gián đoạn
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Tài khoản quản lý thiết bị Sonost 3000 của đơn vị đang tạm khóa quyền xuất kết quả và quản trị hệ thống theo điều khoản dịch vụ y tế.
        </p>
      </motion.div>

      {/* Dynamic Suspension Reason Box */}
      <motion.div
        variants={formItemVariants}
        className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-lg space-y-2.5 text-xs"
      >
        <div className="flex items-center justify-between text-rose-900 dark:text-rose-200">
          <span className="font-bold flex items-center gap-1.5">
            <CalendarX size={15} className="text-rose-600 dark:text-rose-400" />
            Lý do ghi nhận từ hệ thống:
          </span>
          <span className="font-mono-data font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
            Mã HĐ: #{contractId}
          </span>
        </div>
        <p className="text-rose-800 dark:text-rose-300 leading-relaxed pl-5 font-medium">
          {dynamicReason}
        </p>
      </motion.div>

      {/* Unlock Request Form / Sent Confirmation */}
      <AnimatePresence mode="wait">
        {!requestSent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSendUnlockRequest}
            className="space-y-3 pt-2"
          >
            <motion.div variants={formItemVariants} className="space-y-1">
              <label
                htmlFor="unlock-note"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Ghi chú / Yêu cầu gia hạn hoặc mở khóa tài khoản:
              </label>
              <textarea
                id="unlock-note"
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="VD: Phòng khám đã hoàn tất thanh toán hợp đồng tháng 8, xin mở khóa lại máy..."
                className="w-full p-3 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                required
              />
            </motion.div>

            <motion.div variants={formItemVariants}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Gửi yêu cầu mở khóa đến Quản trị viên</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-300 space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 size={16} />
              <span>Đã gửi yêu cầu mở khóa thành công!</span>
            </div>
            <p className="leading-relaxed">
              Bộ phận Quản lý Hợp đồng &amp; Kỹ thuật OsteoSys đã nhận được yêu cầu của bạn và sẽ phản hồi qua điện thoại trong vòng 30 phút.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fast Contact Actions with Motion Tap */}
      <motion.div variants={formItemVariants} className="pt-2 space-y-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Cần hỗ trợ xử lý ngay hợp đồng dịch vụ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="tel:0904000000"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <Phone size={14} />
            <span>Hotline: 0904 000 000</span>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://zalo.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <MessageSquare size={14} />
            <span>Hỗ trợ Hợp đồng qua Zalo</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Back Links */}
      <motion.div variants={formItemVariants} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
          ← Về trang chủ
        </Link>
        <Link href="/login" className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline">
          Đăng nhập tài khoản khác →
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function SuspendedPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#0284c7]" size={24} />
        </div>
      }
    >
      <SuspendedContent />
    </Suspense>
  );
}
