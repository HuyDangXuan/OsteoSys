"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Clock,
  RotateCcw,
} from "lucide-react";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/auth-schema";
import {
  cardContainerVariants,
  formItemVariants,
  errorShakeVariants,
} from "@/lib/auth-motion";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle 60s countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || "Không thể gửi liên kết khôi phục.");
        return;
      }

      setSuccessMessage(result.message);
      setCountdown(60);
    } catch (err) {
      setServerError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  };

  const handleResend = () => {
    const email = getValues("email");
    if (email && countdown === 0) {
      onSubmit({ email });
    }
  };

  const progressPercent = (countdown / 60) * 100;

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm backdrop-blur-sm"
    >
      {/* Title */}
      <motion.div variants={formItemVariants} className="mb-6 space-y-1.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <KeyRound size={14} />
          <span>Khôi Phục Mật Khẩu</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Quên mật khẩu truy cập?
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Nhập địa chỉ email công vụ đã đăng ký để nhận liên kết thiết lập lại mật khẩu an toàn.
        </p>
      </motion.div>

      {/* Success banner with 60s countdown progress animation */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-300 space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>

            {/* Animated Progress Bar for 60s Resend */}
            {countdown > 0 && (
              <div className="space-y-1 pt-1">
                <div className="w-full bg-emerald-100 dark:bg-emerald-900 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    style={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
              <span className="text-xs text-emerald-700 dark:text-emerald-400">Chưa nhận được email?</span>
              {countdown > 0 ? (
                <span className="font-mono-data font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Clock size={12} className="animate-spin" /> Gửi lại sau ({countdown}s)
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-[#0284c7] dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Gửi lại ngay
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Error Alert with Shake */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            variants={errorShakeVariants}
            initial="idle"
            animate="shake"
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <motion.div variants={formItemVariants} className="space-y-1">
          <label
            htmlFor="forgot-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Email công vụ liên kết <span className="text-[#0284c7]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="bacsi@benhvien.vn"
              {...register("email")}
              className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-md outline-none transition-colors ${
                errors.email
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
              }`}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
            >
              <AlertCircle size={12} /> {errors.email.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={formItemVariants}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || countdown > 0}
            className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang gửi liên kết...</span>
              </>
            ) : (
              <span>Gửi liên kết khôi phục</span>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Demo testing shortcut to Reset Password */}
      <motion.div variants={formItemVariants} className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-md text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>💡 Xem trước trang Đặt lại mật khẩu:</span>
        <Link
          href="/reset-password?token=demo_token_123"
          className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline"
        >
          Mở trang Đặt lại mật khẩu →
        </Link>
      </motion.div>

      {/* Back to Login Link */}
      <motion.div variants={formItemVariants} className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1 duration-150" />
          <span>Quay lại trang Đăng nhập</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
