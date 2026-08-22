import { z } from "zod";
import { partnerTypeEnum } from "./partner-schema";

export const rentalPackageTypeEnum = z.enum(["daily", "monthly", "long_term", "daily_event"]);
export const rentalContractStatusEnum = z.enum([
  "draft",
  "active",
  "expiring_soon",
  "overdue",
  "completed",
  "cancelled",
  "terminated",
]);

export const PARTNER_FACILITY_TYPE_LABELS: Record<string, string> = {
  general_hospital: "Bệnh viện Đa khoa",
  specialist_hospital: "Bệnh viện Chuyên khoa",
  general_clinic: "Phòng khám Đa khoa",
  specialist_clinic: "Phòng khám Chuyên khoa",
  mobile_screening: "Đoàn khám Sức khỏe Lưu động / Sự kiện",
  doctor_private: "Bác sĩ / Phòng mạch Tư nhân",
  hospital: "Bệnh viện Đa khoa",
  clinic: "Phòng khám Chuyên khoa",
  enterprise: "Doanh nghiệp / Khám đoàn",
  doctor: "Bác sĩ / Chuyên gia Y tế",
  individual: "Khách hàng Cá nhân",
};

/**
 * Zod Schema for Creating a Rental Contract with Full B2B Partner fields
 */
export const createRentalContractSchema = z.object({
  // 1. Partner Details
  partnerId: z.string().optional().or(z.literal("")),
  partnerName: z.string().min(2, "Vui lòng nhập tên Cơ sở / Bệnh viện đối tác").trim(),
  partnerType: partnerTypeEnum.default("general_clinic"),
  representativeName: z.string().min(2, "Vui lòng nhập họ tên người đại diện / phụ trách").trim(),
  phone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không vượt quá 15 số")
    .regex(/^(0|\+84)[0-9]{8,11}$/, "Số điện thoại không đúng định dạng (VD: 0904000000)")
    .trim(),
  deliveryAddress: z.string().min(3, "Vui lòng nhập địa chỉ cơ sở / vị trí đặt máy").trim(),
  taxCode: z
    .string()
    .regex(/^[0-9]{10}(-[0-9]{3})?$/, "Mã số thuế phải có 10 hoặc 13 chữ số (VD: 0101234567)")
    .optional()
    .or(z.literal("")),

  // 2. Equipment & Package
  deviceSerial: z.string().min(1, "Vui lòng chọn số serial máy Sonost 3000 sẵn sàng").trim(),
  packageType: rentalPackageTypeEnum.default("monthly"),
  startDate: z.coerce.date().default(() => new Date()),
  endDate: z.coerce.date().optional(),
  durationMonths: z.coerce.number().min(1, "Thời hạn tối thiểu 1 tháng").default(6).optional(),
  
  // 3. Financial Terms
  rentalFee: z.coerce.number().min(0, "Đơn giá thuê không thể âm").default(15000000),
  monthlyFee: z.coerce.number().min(0, "Đơn giá thuê không thể âm").optional(), // alias
  depositAmount: z.coerce.number().min(0, "Tiền cọc không thể âm").default(30000000),
  deposit: z.coerce.number().min(0, "Tiền cọc không thể âm").optional(), // alias
  paymentTerms: z.string().default("Thanh toán định kỳ hàng tháng"),
  notes: z.string().optional(),
});

export type CreateRentalContractInput = z.infer<typeof createRentalContractSchema>;
