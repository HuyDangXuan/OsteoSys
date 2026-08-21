import { z } from "zod";

export const deviceStatusEnum = z.enum([
  "available",
  "rented",
  "under_maintenance",
  "repairing",
  "decommissioned",
]);

export const qcResultEnum = z.enum(["passed", "warning", "failed"]);
export const deviceModelEnum = z.enum(["Sonost 3000", "Sonost 3000 PRO"]);

/**
 * Zod Schema for Device Calibration
 */
export const deviceCalibrationSchema = z.object({
  lastDate: z.coerce.date().default(() => new Date()),
  nextDueDate: z.coerce.date().optional(),
  qcResult: qcResultEnum.default("passed"),
  phantomCv: z.coerce
    .number()
    .min(0, "Hệ số biến thiên không thể âm")
    .max(10, "Hệ số biến thiên không thể vượt quá 10%")
    .default(0.8),
  calibratedBy: z.string().default("Kỹ sư OsteoSys"),
  certifyingBody: z.string().default("Trung tâm Kiểm chuẩn Y Sinh OsteoSys"),
  certificateUrl: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Zod Schema for Creating a Device
 */
export const createDeviceSchema = z.object({
  serialNumber: z
    .string()
    .min(3, "Số Serial phải có ít nhất 3 ký tự")
    .max(50, "Số Serial không được vượt quá 50 ký tự")
    .regex(
      /^(OST-3000-[0-9]{4}|SN-[0-9A-Z-]+|[A-Z0-9-]+)$/i,
      "Định dạng số Serial không hợp lệ (VD: OST-3000-8842 hoặc SN-3000-01)"
    )
    .trim(),
  model: deviceModelEnum.default("Sonost 3000 PRO"),
  yearManufactured: z.coerce
    .number()
    .int("Năm sản xuất phải là số nguyên")
    .min(2015, "Năm sản xuất tối thiểu là 2015")
    .max(new Date().getFullYear() + 1, "Năm sản xuất không hợp lệ")
    .default(new Date().getFullYear()),
  probeType: z.string().min(1, "Vui lòng chọn loại đầu dò").default("Đầu dò gót chân tiêu chuẩn 0.5MHz"),
  purchaseDate: z.coerce.date().default(() => new Date()),
  location: z.string().min(1, "Vui lòng nhập vị trí kho ban đầu").default("Kho Tổng Hà Nội"),
  currentStatus: deviceStatusEnum.default("available"),
  calibration: deviceCalibrationSchema.default({
    lastDate: new Date(),
    qcResult: "passed",
    phantomCv: 0.8,
    calibratedBy: "Kỹ sư Nguyễn Văn Tuấn (Kỹ Thuật OsteoSys)",
    certifyingBody: "Trung tâm Kiểm chuẩn Y Sinh OsteoSys",
  }),
  accessoriesIncluded: z
    .array(z.string())
    .default([
      "Bóng dầu Silicone tiếp xúc",
      "Khối Phantom Hologic kiểm chuẩn",
      "Dây cáp nguồn chuẩn y tế",
      "Giấy in nhiệt 58mm",
    ]),
  notes: z.string().optional(),
});

/**
 * Zod Schema for Updating a Device
 */
export const updateDeviceSchema = createDeviceSchema.partial().extend({
  id: z.string().optional(),
  currentStatus: deviceStatusEnum.optional(),
  currentPartnerId: z.string().nullable().optional(),
  currentContractId: z.string().nullable().optional(),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type DeviceCalibrationInput = z.infer<typeof deviceCalibrationSchema>;
