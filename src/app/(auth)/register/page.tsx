"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  registerSchema,
  RegisterFormData,
  getPasswordStrength,
} from "@/lib/auth-schema";
import {
  cardContainerVariants,
  formItemVariants,
  errorShakeVariants,
} from "@/lib/auth-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      password: "",
      confirmPassword: "",
      agreeTerms: true,
    },
  });

  const passwordValue = watch("password") || "";
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setServerError(result.message || "Đăng ký không thành công.");
        return;
      }

      router.push(
        result.redirectUrl ||
          `/pending-activation?ref=${result.referenceId}&org=${encodeURIComponent(
            data.organization
          )}`
      );
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
          <Building2 size={14} />
          <span>Đăng Ký Đối Tác Y Tế</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Khởi tạo Tài khoản Bác sĩ / Phòng khám
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Đăng ký để tiếp cận hệ thống thuê máy Sonost 3000 và phần mềm đo loãng xương chuyên nghiệp.
        </p>
      </motion.div>

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

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Row 1: Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={formItemVariants} className="space-y-1">
            <label
              htmlFor="reg-fullName"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Họ và tên đại diện <span className="text-[#0284c7]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                id="reg-fullName"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="BS. Nguyễn Văn A"
                {...register("fullName")}
                className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-md outline-none transition-colors ${
                  errors.fullName
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                }`}
              />
            </div>
            {errors.fullName && (
              <motion.p
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
              >
                <AlertCircle size={12} /> {errors.fullName.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={formItemVariants} className="space-y-1">
            <label
              htmlFor="reg-phone"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Số điện thoại liên hệ <span className="text-[#0284c7]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone size={16} />
              </div>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                placeholder="0901 234 567"
                {...register("phone")}
                className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-md outline-none transition-colors ${
                  errors.phone
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                }`}
              />
            </div>
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
              >
                <AlertCircle size={12} /> {errors.phone.message}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Row 2: Organization Name & Work Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={formItemVariants} className="space-y-1">
            <label
              htmlFor="reg-organization"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Tên Phòng khám / Bệnh viện <span className="text-[#0284c7]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 size={16} />
              </div>
              <input
                id="reg-organization"
                type="text"
                autoComplete="organization"
                placeholder="PK Đa khoa Hoàn Mỹ"
                {...register("organization")}
                className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border rounded-md outline-none transition-colors ${
                  errors.organization
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10"
                }`}
              />
            </div>
            {errors.organization && (
              <motion.p
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
              >
                <AlertCircle size={12} /> {errors.organization.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={formItemVariants} className="space-y-1">
            <label
              htmlFor="reg-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email công vụ <span className="text-[#0284c7]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="bacsi@hoanmy.vn"
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
        </div>

        {/* Row 3: Password with Animated Strength Meter */}
        <motion.div variants={formItemVariants} className="space-y-1">
          <label
            htmlFor="reg-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Thiết lập mật khẩu <span className="text-[#0284c7]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự, chữ hoa, số & ký tự đặc biệt"
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
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Smooth Animated Password Strength Indicator */}
          {passwordValue && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pt-1.5 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Độ bảo mật mật khẩu:</span>
                <span className={`font-semibold font-mono-data ${passwordStrength.color.replace('bg-', 'text-')}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${passwordStrength.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: passwordStrength.width }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </motion.div>
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

        {/* Row 4: Confirm Password */}
        <motion.div variants={formItemVariants} className="space-y-1">
          <label
            htmlFor="reg-confirmPassword"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Nhập lại mật khẩu <span className="text-[#0284c7]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              id="reg-confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Xác nhận lại mật khẩu vừa nhập"
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
              tabIndex={-1}
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

        {/* Medical Privacy Commitment Checkbox */}
        <motion.div variants={formItemVariants} className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("agreeTerms")}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0284c7] focus:ring-[#0284c7] mt-0.5 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tôi cam kết thông tin đăng ký là đại diện chính thức của đơn vị y tế và đồng ý tuân thủ{" "}
              <a href="#" className="text-[#0284c7] dark:text-sky-400 hover:underline font-medium">
                Quy định Bảo mật Dữ liệu Bệnh nhân &amp; Chuẩn HIPAA/ISO 13485
              </a>.
            </span>
          </label>
          {errors.agreeTerms && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"
            >
              <AlertCircle size={12} /> {errors.agreeTerms.message}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={formItemVariants} className="pt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-md shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Đang xử lý hồ sơ...</span>
              </>
            ) : (
              <>
                <span>Gửi hồ sơ đăng ký đối tác</span>
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Back to Login Link */}
      <motion.div variants={formItemVariants} className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Đã có tài khoản đối tác?{" "}
          <Link href="/login" className="text-[#0284c7] dark:text-sky-400 font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
