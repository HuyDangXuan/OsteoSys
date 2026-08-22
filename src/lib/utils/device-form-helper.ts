import { DeviceListItem } from "@/lib/actions/devices";
import { CreateDeviceInput } from "@/lib/schemas/inventory-schema";

export interface FormDeviceData {
  serialNumber: string;
  model: "Sonost 3000" | "Sonost 3000 PRO";
  yearManufactured: number;
  probeType: string;
  location: string;
  currentStatus: "available" | "rented" | "under_maintenance" | "repairing" | "decommissioned";
  purchaseDate: string;
  lastCalibrationDate: string;
  nextDueDate: string;
  certifiedBy: string;
  certificateNumber: string;
  iscdStandard: boolean;
  qcResult: "passed" | "warning" | "failed";
  phantomCv: number;
  certifyingBody: string;
  accessoriesIncluded: string[];
  notes: string;
}

/**
 * Safely format Date object or ISO string to 'YYYY-MM-DD' for HTML5 <input type="date">
 */
export function formatDateForInput(date?: Date | string | null): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Normalizes any raw device record from MongoDB or DeviceListItem into
 * 100% type-safe, hydrated format ready for Edit/Create Form state.
 */
export function formatDeviceForForm(
  device?: DeviceListItem | any | null,
  fallbackCertifiedBy: string = "Kỹ sư Kiểm Chuẩn"
): FormDeviceData {
  if (!device) {
    const nowStr = new Date().toISOString().split("T")[0];
    return {
      serialNumber: "",
      model: "Sonost 3000 PRO",
      yearManufactured: new Date().getFullYear(),
      probeType: "Đầu dò gót chân tiêu chuẩn 0.5MHz",
      location: "Kho Tổng Hà Nội",
      currentStatus: "available",
      purchaseDate: nowStr,
      lastCalibrationDate: nowStr,
      nextDueDate: "",
      certifiedBy: fallbackCertifiedBy,
      certificateNumber: "",
      iscdStandard: true,
      qcResult: "passed",
      phantomCv: 0.8,
      certifyingBody: "Trung tâm Kiểm chuẩn Y Sinh OsteoSys",
      accessoriesIncluded: [
        "Bóng dầu Silicone tiếp xúc",
        "Khối Phantom Hologic kiểm chuẩn",
        "Dây cáp nguồn chuẩn y tế",
        "Giấy in nhiệt 58mm",
      ],
      notes: "",
    };
  }

  // 1. Resolve Serial Number & Model
  const serialNumber = (device.serialNumber || device.serial || "").trim();
  const model: "Sonost 3000" | "Sonost 3000 PRO" =
    device.model === "Sonost 3000" ? "Sonost 3000" : "Sonost 3000 PRO";

  // 2. Resolve Year Manufactured
  const yearManufactured = Number(
    device.yearManufactured || device.year || device.manufactureYear || new Date().getFullYear()
  );

  // 3. Resolve Probe & Location & Status
  const probeType = device.probeType || "Đầu dò gót chân tiêu chuẩn 0.5MHz";
  const location = (device.location || device.currentLocation || "Kho Tổng Hà Nội").trim();
  const currentStatus = (device.currentStatus || device.status || "available") as FormDeviceData["currentStatus"];

  // 4. Resolve Date fields into YYYY-MM-DD
  const purchaseDate = formatDateForInput(device.purchaseDate) || new Date().toISOString().split("T")[0];

  // 5. Resolve Calibration Sub-document with full fallbacks
  const cal = device.calibration || {};
  const lastCalibrationDate =
    formatDateForInput(cal.lastDate) ||
    formatDateForInput(device.calibrationDate) ||
    new Date().toISOString().split("T")[0];

  const nextDueDate =
    formatDateForInput(cal.nextDueDate) ||
    formatDateForInput(device.nextCalibration) ||
    "";

  const certifiedBy = (
    cal.certifiedBy ||
    cal.calibratedBy ||
    device.calibratedBy ||
    fallbackCertifiedBy
  ).trim();

  const certificateNumber = (cal.certificateNumber || `ISCD-QC-${serialNumber}`).trim();

  const iscdStandard =
    cal.iscdStandard !== undefined
      ? Boolean(cal.iscdStandard)
      : cal.qcResult !== "failed" && device.qcResult !== "failed";

  const qcResult = (cal.qcResult || device.qcResult || "passed") as "passed" | "warning" | "failed";

  const phantomCv =
    cal.phantomCv !== undefined && cal.phantomCv !== null
      ? Number(cal.phantomCv)
      : parseFloat(device.cvScore) || 0.8;

  const certifyingBody = (
    cal.certifyingBody ||
    device.certifyingBody ||
    "Trung tâm Kiểm chuẩn Y Sinh OsteoSys"
  ).trim();

  // 6. Resolve Accessories Array (guarantee at least array)
  const rawAccessories =
    device.accessoriesIncluded ||
    device.accessories ||
    cal.accessories ||
    [];

  const accessoriesIncluded = Array.isArray(rawAccessories) && rawAccessories.length > 0
    ? rawAccessories
    : [
        "Bóng dầu Silicone tiếp xúc",
        "Khối Phantom Hologic kiểm chuẩn",
        "Dây cáp nguồn chuẩn y tế",
        "Giấy in nhiệt 58mm",
      ];

  const notes = (device.notes || cal.notes || "").trim();

  return {
    serialNumber,
    model,
    yearManufactured,
    probeType,
    location,
    currentStatus,
    purchaseDate,
    lastCalibrationDate,
    nextDueDate,
    certifiedBy,
    certificateNumber,
    iscdStandard,
    qcResult,
    phantomCv,
    certifyingBody,
    accessoriesIncluded,
    notes,
  };
}
