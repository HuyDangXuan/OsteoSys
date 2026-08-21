"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { loginSchema, LoginFormData } from "@/lib/auth-schema";
import {
  cardContainerVariants,
  formItemVariants,
  errorShakeVariants,
} from "@/lib/auth-motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isResetSuccess = searchParams.get("status") === "password-reset-success";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
          return;
        }
        setServerError(result.message || "Đăng nhập không thành công.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(result.redirectUrl || "/admin");
      }, 500);
    } catch (err) {
      setServerError("Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra mạng.");
    }
  };

  const fillDemoAccount = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <motion.div
      variants={cardContainerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm backdrop-blur-sm"
    >
      {/* Form Title & Subtitle */}
      <motion.div variants={formItemVariants} className="mb-6 space-y-1.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck size={14} />
          <span>Cổng Xác Thực Y Tế</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Đăng nhập Hệ thống OsteoSys
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Dành cho Bác sĩ, Kỹ sư quản lý thiết bị và Cơ sở y tế đối tác Sonost 3000.
        </p>
      </motion.div>

      {/* Password reset success alert */}
      <AnimatePresence>
        {isResetSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5"
          >
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập bằng mật khẩu mới.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Error Alert Banner with Shake Animation */}
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
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Xác thực không thành công</span>
              <span>{serverError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-lg text-xs text-[#0284c7] dark:text-sky-300 flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="shrink-0 text-[#0284c7] dark:text-sky-400" />
            <span className="font-semibold">Đăng nhập thành công! Đang chuyển hướng vào bảng điều khiển...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form with Staggered Inputs */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <motion.div variants={formItemVariants} className="space-y-1">
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Email công vụ / Tài khoản y tế <span className="text-[#0284c7]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="ten.bacsi@benhvien.vn"
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

        {/* Password Field */}
        <motion.div variants={formItemVariants} className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Mật khẩu truy cập <span className="text-[#0284c7]">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#0284c7] dark:text-sky-400 hover:underline"
              tabIndex={-1}
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu an toàn"
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              tabIndex={-1}
            >
              <motion.div
                key={showPassword ? "hide" : "show"}
                initial={{ opacity: 0, rotate: -20 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.15 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.div>
            </button>
          </div>
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

        {/* Remember Me Checkbox */}
        <motion.div variants={formItemVariants} className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Ghi nhớ đăng nhập (30 ngày)
            </span>
          </label>
        </motion.div>

        {/* Submit Button with Motion Tap */}
        <motion.div variants={formItemVariants}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang kiểm tra thông tin...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Demo Quick Accounts Pill List */}
      <motion.div variants={formItemVariants} className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <p className="text-xs font-mono-data uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          Tài khoản Demo thử nghiệm nhanh:
        </p>
        <div className="flex flex-wrap gap-1.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => fillDemoAccount("admin@osteosys.vn", "Admin@123")}
            className="px-2 py-1 bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 text-xs font-mono-data rounded transition-colors"
            title="Đăng nhập tài khoản Quản trị viên Kỹ thuật"
          >
            👨‍⚕️ Admin (admin@osteosys.vn)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => fillDemoAccount("pending@clinic.vn", "Doctor@123")}
            className="px-2 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-xs font-mono-data rounded transition-colors"
            title="Thử nghiệm tài khoản Chờ duyệt"
          >
            ⏳ Chờ kích hoạt
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => fillDemoAccount("suspended@clinic.vn", "Doctor@123")}
            className="px-2 py-1 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-xs font-mono-data rounded transition-colors"
            title="Thử nghiệm tài khoản Tạm ngưng/Hết hạn"
          >
            ⚠️ Tạm ngưng dịch vụ
          </motion.button>
        </div>
      </motion.div>

      {/* Register Redirect Link */}
      <motion.div variants={formItemVariants} className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chưa có tài khoản đối tác phòng khám?{" "}
          <Link
            href="/register"
            className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline"
          >
            Đăng ký hồ sơ y tế mới
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#0284c7]" size={24} />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
