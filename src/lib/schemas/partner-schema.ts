import { z } from "zod";

export const partnerTypeEnum = z.enum(["hospital", "clinic", "enterprise", "doctor", "individual"]);
export const partnerStatusEnum = z.enum(["active", "inactive"]);

/**
 * Zod Schema for Partner Primary Contact
 */
export const partnerContactSchema = z.object({
  name: z.string().min(2, "Họ tên người liên hệ phải có ít nhất 2 ký tự").trim(),
  phone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không được quá 15 số")
    .regex(/^(0|\+84)[0-9]{8,11}$/, "Số điện thoại không đúng định dạng (VD: 0904000000)")
    .trim(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  position: z.string().default("Phụ trách Trang thiết bị Y tế"),
});

/**
 * Zod Schema for Creating a Partner
 */
export const createPartnerSchema = z.object({
  name: z.string().min(3, "Tên cơ sở y tế / đối tác phải có ít nhất 3 ký tự").trim(),
  type: partnerTypeEnum.default("clinic"),
  taxCode: z
    .string()
    .regex(/^[0-9]{10}(-[0-9]{3})?$/, "Mã số thuế phải có 10 hoặc 13 chữ số (VD: 0101234567)")
    .optional()
    .or(z.literal("")),
  address: z.string().min(3, "Địa chỉ phải có ít nhất 3 ký tự").trim(),
  city: z.string().min(2, "Tỉnh / Thành phố là bắt buộc").default("Hà Nội"),
  district: z.string().optional(),
  ward: z.string().optional(),
  primaryContact: partnerContactSchema,
  status: partnerStatusEnum.default("active"),
  notes: z.string().optional(),
});

/**
 * Zod Schema for Updating a Partner
 */
export const updatePartnerSchema = createPartnerSchema.partial().extend({
  id: z.string().optional(),
  code: z.string().optional(),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type PartnerContactInput = z.infer<typeof partnerContactSchema>;
