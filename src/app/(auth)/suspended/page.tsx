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
  Mail,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { submitAccountAppeal } from "@/lib/actions/accounts";
import {
  cardContainerVariants,
  formItemVariants,
  pulseBreathingVariants,
} from "@/lib/auth-motion";

function SuspendedContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const reasonParam = searchParams.get("reason") || "";

  const [email, setEmail] = useState(emailParam);
  const [appealNote, setAppealNote] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const displayReason =
    reasonParam ||
    "Tài khoản của đơn vị tạm ngưng hoạt động do cần gia hạn hợp đồng dịch vụ Sonost 3000 hoặc chưa hoàn tất kiểm định y tế định kỳ.";

  const handleSendAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !appealNote.trim()) {
      toast.error("Vui lòng nhập đầy đủ email và nội dung giải trình.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitAccountAppeal({
        email,
        note: appealNote,
        contactPhone,
      });

      if (res.success) {
        setRequestSent(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi yêu cầu hỗ trợ.");
    } finally {
      setIsSubmitting(false);
    }
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
          Tài khoản quản lý thiết bị Sonost 3000 của đơn vị đang tạm khóa quyền truy cập theo chính sách vận hành và điều khoản hợp đồng dịch vụ y tế.
        </p>
      </motion.div>

      {/* Dynamic Suspension Reason Box */}
      <motion.div
        variants={formItemVariants}
        className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-lg space-y-2 text-xs"
      >
        <div className="flex items-center justify-between text-rose-900 dark:text-rose-200">
          <span className="font-bold flex items-center gap-1.5">
            <CalendarX size={15} className="text-rose-600 dark:text-rose-400" />
            Lý do ghi nhận từ hệ thống:
          </span>
          {email && (
            <span className="font-mono-data font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
              {email}
            </span>
          )}
        </div>
        <p className="text-rose-800 dark:text-rose-300 leading-relaxed pl-5 font-medium">
          {displayReason}
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
            onSubmit={handleSendAppeal}
            className="space-y-3.5 pt-1 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email tài khoản bị khóa *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bacsi@phongkham.vn"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại liên hệ khẩn cấp
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono-data text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú / Giải trình hoặc Yêu cầu mở lại tài khoản *
              </label>
              <textarea
                rows={3}
                value={appealNote}
                onChange={(e) => setAppealNote(e.target.value)}
                placeholder="Vui lòng nhập lý do hoặc thông tin xác minh để ban quản trị Super Admin xem xét mở lại tài khoản..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-[#0284c7]"
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang gửi yêu cầu giải trình...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Gửi Yêu Cầu Hỗ Trợ Mở Khóa Tài Khoản</span>
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>Yêu cầu đã được chuyển tới Super Admin!</span>
            </div>
            <p className="leading-relaxed">
              Ban Quản Trị Hệ Thống OsteoSys đã tiếp nhận hồ sơ giải trình của bạn. Chúng tôi sẽ phản hồi qua email và số điện thoại liên hệ trong vòng 24h làm việc.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fast Contact Actions */}
      <motion.div variants={formItemVariants} className="pt-2 space-y-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Cần hỗ trợ kỹ thuật hoặc hợp đồng khẩn cấp?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a
            href="tel:0904888999"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Phone size={14} />
            <span>Hotline: 0904 888 999</span>
          </a>

          <a
            href="https://zalo.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <MessageSquare size={14} />
            <span>Hỗ trợ Hợp đồng qua Zalo</span>
          </a>
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
