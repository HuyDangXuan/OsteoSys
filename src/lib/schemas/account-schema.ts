import { z } from "zod";
import { AccountRole, AccountStatus } from "@/types/db";

export const accountRoleEnum = z.enum([
  "super_admin",
  "sales",
  "technician",
  "support",
]);

export const accountStatusEnum = z.enum([
  "active",
  "pending",
  "suspended",
]);

export const ROLE_LABELS: Record<AccountRole, string> = {
  super_admin: "Super Admin (Toàn quyền)",
  sales: "Kinh doanh (Sales)",
  technician: "Kỹ sư Kỹ thuật (Technician)",
  support: "Hỗ trợ & CSKH (Support)",
};

export const STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Hoạt động",
  pending: "Chờ duyệt",
  suspended: "Tạm khóa",
};

export const createAccountSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ và tên nhân sự")
    .min(3, "Họ và tên tối thiểu 3 ký tự"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email đăng nhập")
    .email("Địa chỉ email không hợp lệ (VD: bacsi@phongkham.vn)"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(val),
      "Số điện thoại không hợp lệ (VD: 0901234567)"
    ),
  clinicName: z.string().optional(),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu khởi tạo")
    .min(8, "Mật khẩu phải có tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ cái viết hoa")
    .regex(/[0-9]/, "Cần ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),
  role: accountRoleEnum,
  status: accountStatusEnum.default("active"),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  fullName: z
    .string()
    .min(1, "Vui lòng nhập họ và tên nhân sự")
    .min(3, "Họ và tên tối thiểu 3 ký tự"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(val),
      "Số điện thoại không hợp lệ (VD: 0901234567)"
    ),
  clinicName: z.string().optional(),
  role: accountRoleEnum,
});

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

export const adminResetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu mới")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ cái viết hoa")
    .regex(/[0-9]/, "Cần ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "Cần ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),
});

export type AdminResetPasswordFormData = z.infer<typeof adminResetPasswordSchema>;

export const suspendAccountSchema = z.object({
  suspensionReason: z
    .string()
    .min(1, "Vui lòng nhập lý do tạm khóa tài khoản")
    .min(5, "Lý do tối thiểu 5 ký tự để người dùng hiểu rõ"),
});

export type SuspendAccountFormData = z.infer<typeof suspendAccountSchema>;
