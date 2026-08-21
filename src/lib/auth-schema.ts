import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email công vụ")
    .email("Định dạng email không hợp lệ (VD: bacsi@benhvien.vn)"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ và tên người đại diện")
      .min(3, "Họ và tên tối thiểu 3 ký tự"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email công vụ")
      .email("Email không hợp lệ"),
    phone: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại liên hệ")
      .regex(
        /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,
        "Số điện thoại không hợp lệ (VD: 0901234567)"
      ),
    organization: z
      .string()
      .min(1, "Vui lòng nhập tên phòng khám / bệnh viện / doanh nghiệp")
      .min(3, "Tên đơn vị tối thiểu 3 ký tự"),
    password: z
      .string()
      .min(1, "Vui lòng thiết lập mật khẩu")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ cái viết hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số")
      .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận lại mật khẩu"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Bạn cần đồng ý với điều khoản bảo mật dữ liệu y tế",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email liên kết tài khoản")
    .email("Địa chỉ email không hợp lệ"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ cái viết hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số")
      .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Calculates password strength on a 0-4 score scale
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  width: string;
} {
  if (!password) {
    return { score: 0, label: "Chưa nhập", color: "bg-slate-200 dark:bg-slate-700", width: "0%" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: "Yếu", color: "bg-rose-500", width: "25%" };
    case 2:
      return { score: 2, label: "Trung bình", color: "bg-amber-500", width: "50%" };
    case 3:
      return { score: 3, label: "Khá", color: "bg-sky-500", width: "75%" };
    case 4:
      return { score: 4, label: "Mạnh (Chuẩn y tế)", color: "bg-emerald-500", width: "100%" };
    default:
      return { score: 0, label: "Rất yếu", color: "bg-rose-400", width: "15%" };
  }
}
