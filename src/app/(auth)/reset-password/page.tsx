"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
  getPasswordStrength,
} from "@/lib/auth-schema";
import {
  cardContainerVariants,
  formItemVariants,
  errorShakeVariants,
  scaleInSuccessVariants,
} from "@/lib/auth-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          token,
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || "Không thể đặt lại mật khẩu.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?status=password-reset-success");
      }, 1500);
    } catch (err) {
      setServerError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  };

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
          <span>Bảo Mật Tài Khoản</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Thiết lập mật khẩu mới
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Vui lòng chọn mật khẩu mới có độ bảo mật cao để bảo vệ dữ liệu chẩn đoán hình ảnh và thông tin y tế.
        </p>
      </motion.div>

      {/* Success Banner */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            variants={scaleInSuccessVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-3"
          >
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Đổi mật khẩu thành công!</p>
              <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                Đang chuyển hướng về trang đăng nhập trong giây lát...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Error Alert */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            variants={errorShakeVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-md text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
          >
            <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* New Password */}
        <motion.div variants={formItemVariants} className="space-y-1">
          <label
            htmlFor="reset-pass"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Mật khẩu mới <span className="text-[#0284c7]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              id="reset-pass"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
              {...register("password")}
              className={`w-full pl-9 pr-10 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-md outline-none transition-colors ${
                errors.password
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength indicator */}
          {passwordValue && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: passwordStrength.width }}
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                />
              </div>
            </div>
          )}

          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
            >
              <AlertCircle size={12} /> {errors.password.message}
            </motion.p>
          )}
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={formItemVariants} className="space-y-1">
          <label
            htmlFor="reset-confirm"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Xác nhận lại mật khẩu mới <span className="text-[#0284c7]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              id="reset-confirm"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Nhập lại chính xác mật khẩu trên"
              {...register("confirmPassword")}
              className={`w-full pl-9 pr-10 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-md outline-none transition-colors ${
                errors.confirmPassword
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
            >
              <AlertCircle size={12} /> {errors.confirmPassword.message}
            </motion.p>
          )}
        </motion.div>

        {/* Submit */}
        <motion.div variants={formItemVariants} className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang cập nhật mật khẩu...</span>
              </>
            ) : (
              <>
                <span>Cập nhật mật khẩu mới</span>
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Back to Login */}
      <motion.div variants={formItemVariants} className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link
          href="/login"
          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Quay lại trang Đăng nhập
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#0284c7]" size={24} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
