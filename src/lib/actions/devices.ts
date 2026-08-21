"use server";

import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Device, RentalContract, RepairTicket } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import {
  createDeviceSchema,
  updateDeviceSchema,
  CreateDeviceInput,
  UpdateDeviceInput,
} from "@/lib/schemas/inventory-schema";
import { ObjectId, Filter } from "mongodb";

export interface DeviceQueryOptions {
  search?: string;
  status?: string;
  calibrationFilter?: "all" | "expiring_30_days" | "overdue";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DeviceListItem {
  id: string;
  serial: string;
  model: string;
  year: number;
  location: string;
  status: "available" | "rented" | "under_maintenance" | "repairing" | "decommissioned";
  statusLabel: string;
  calibrationDate: string;
  nextCalibration: string;
  isExpiringSoon: boolean;
  isOverdue: boolean;
  remainingDaysToCalibration: number;
  cvScore: string;
  qcStatus: string;
  qcResult: "passed" | "warning" | "failed";
  calibratedBy: string;
  certifyingBody?: string;
  totalScans: number;
  accessories: string[];
  notes?: string;
  currentPartnerName?: string;
  currentContractCode?: string;
  createdAt: string;
}

export interface DeviceStatsSummary {
  totalDevices: number;
  availableDevices: number;
  rentedDevices: number;
  maintenanceDevices: number;
  repairingDevices: number;
  decommissionedDevices: number;
  expiringCalibration30Days: number;
  overdueCalibration: number;
  utilizationRate: number;
}

/**
 * 1. getDevices: Fetch paginated, searchable and filtered devices with calibration warnings
 */
export async function getDevices(
  options: DeviceQueryOptions = {}
): Promise<{ devices: DeviceListItem[]; total: number; page: number; totalPages: number }> {
  try {
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const {
      search = "",
      status = "all",
      calibrationFilter = "all",
      page = 1,
      limit = 50,
      sortBy = "serialNumber",
      sortOrder = "asc",
    } = options;

    const filter: Filter<Device> = {};
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Status filter
    if (status !== "all") {
      filter.currentStatus = status as Device["currentStatus"];
    }

    // Calibration deadline filter
    if (calibrationFilter === "expiring_30_days") {
      filter["calibration.nextDueDate"] = { $gte: now, $lte: in30Days };
    } else if (calibrationFilter === "overdue") {
      filter["calibration.nextDueDate"] = { $lt: now };
    }

    // Search query
    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { serialNumber: searchRegex },
        { location: searchRegex },
        { model: searchRegex },
        { notes: searchRegex },
      ];
    }

    const total = await devicesCol.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (Math.max(1, page) - 1) * limit;

    const sortOption: Record<string, 1 | -1> = {
      [sortBy === "serial" ? "serialNumber" : sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    const rawDevices = await devicesCol.find(filter).sort(sortOption).skip(skip).limit(limit).toArray();

    const devices: DeviceListItem[] = rawDevices.map((d) => {
      const nextDue = d.calibration?.nextDueDate ? new Date(d.calibration.nextDueDate) : null;
      let remainingDays = 90;
      let isExpiringSoon = false;
      let isOverdue = false;

      if (nextDue) {
        const diffMs = nextDue.getTime() - now.getTime();
        remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isOverdue = remainingDays < 0;
        isExpiringSoon = remainingDays >= 0 && remainingDays <= 30;
      }

      let statusLabel = "Sẵn sàng bàn giao";
      if (d.currentStatus === "rented") statusLabel = "Đang cho thuê";
      else if (d.currentStatus === "under_maintenance") statusLabel = "Bảo trì / Hiệu chuẩn";
      else if (d.currentStatus === "repairing") statusLabel = "Đang sửa chữa kỹ thuật";
      else if (d.currentStatus === "decommissioned") statusLabel = "Đã thanh lý / Ngừng sử dụng";

      return {
        id: d._id?.toString() || d.serialNumber,
        serial: d.serialNumber,
        model: d.model || "Sonost 3000 PRO",
        year: d.yearManufactured || 2024,
        location: d.location || "Kho Tổng Hà Nội",
        status: d.currentStatus || "available",
        statusLabel,
        calibrationDate: d.calibration?.lastDate
          ? new Date(d.calibration.lastDate).toLocaleDateString("vi-VN")
          : "",
        nextCalibration: nextDue ? nextDue.toLocaleDateString("vi-VN") : "",
        isExpiringSoon,
        isOverdue,
        remainingDaysToCalibration: remainingDays,
        cvScore: `${d.calibration?.phantomCv ?? 0.8}%`,
        qcStatus:
          d.calibration?.qcResult === "passed"
            ? "Đạt chuẩn ISCD"
            : d.calibration?.qcResult === "warning"
            ? "Cần kiểm chuẩn lại"
            : "Chưa đạt chuẩn",
        qcResult: d.calibration?.qcResult || "passed",
        calibratedBy: d.calibration?.calibratedBy || "Kỹ sư OsteoSys",
        certifyingBody: d.calibration?.notes?.includes("Viện")
          ? "Viện Đo lường Việt Nam"
          : "Trung tâm Kiểm chuẩn Y Sinh OsteoSys",
        totalScans: d.totalScansCount || 0,
        accessories: d.accessoriesIncluded || [],
        notes: d.notes || "",
        currentPartnerName: d.location?.includes("Kho") ? undefined : d.location,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return { devices, total, page, totalPages };
  } catch (error) {
    console.error("Error in getDevices Server Action:", error);
    return { devices: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * 2. getDeviceStatsSummary: Aggregation for inventory KPI metrics and alerts
 */
export async function getDeviceStatsSummary(): Promise<DeviceStatsSummary> {
  try {
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [stats] = await devicesCol
      .aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            available: [{ $match: { currentStatus: "available" } }, { $count: "count" }],
            rented: [{ $match: { currentStatus: "rented" } }, { $count: "count" }],
            maintenance: [{ $match: { currentStatus: "under_maintenance" } }, { $count: "count" }],
            repairing: [{ $match: { currentStatus: "repairing" } }, { $count: "count" }],
            decommissioned: [{ $match: { currentStatus: "decommissioned" } }, { $count: "count" }],
            expiring30Days: [
              {
                $match: {
                  currentStatus: { $ne: "decommissioned" },
                  "calibration.nextDueDate": { $gte: now, $lte: in30Days },
                },
              },
              { $count: "count" },
            ],
            overdue: [
              {
                $match: {
                  currentStatus: { $ne: "decommissioned" },
                  "calibration.nextDueDate": { $lt: now },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ])
      .toArray();

    const total = stats?.total?.[0]?.count || 0;
    const available = stats?.available?.[0]?.count || 0;
    const rented = stats?.rented?.[0]?.count || 0;
    const maintenance = stats?.maintenance?.[0]?.count || 0;
    const repairing = stats?.repairing?.[0]?.count || 0;
    const decommissioned = stats?.decommissioned?.[0]?.count || 0;
    const expiring30Days = stats?.expiring30Days?.[0]?.count || 0;
    const overdue = stats?.overdue?.[0]?.count || 0;

    const utilizationRate = total > 0 ? Math.round((rented / total) * 1000) / 10 : 0;

    return {
      totalDevices: total,
      availableDevices: available,
      rentedDevices: rented,
      maintenanceDevices: maintenance,
      repairingDevices: repairing,
      decommissionedDevices: decommissioned,
      expiringCalibration30Days: expiring30Days,
      overdueCalibration: overdue,
      utilizationRate,
    };
  } catch (error) {
    console.error("Error in getDeviceStatsSummary:", error);
    return {
      totalDevices: 0,
      availableDevices: 0,
      rentedDevices: 0,
      maintenanceDevices: 0,
      repairingDevices: 0,
      decommissionedDevices: 0,
      expiringCalibration30Days: 0,
      overdueCalibration: 0,
      utilizationRate: 0,
    };
  }
}

/**
 * 3. createDevice: Creates a new Sonost 3000 unit with Zod validation & audit log
 */
export async function createDevice(rawInput: CreateDeviceInput) {
  try {
    const validated = createDeviceSchema.parse(rawInput);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    // Check unique serial number
    const existing = await devicesCol.findOne({ serialNumber: validated.serialNumber });
    if (existing) {
      return {
        success: false,
        message: `Số Serial "${validated.serialNumber}" đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.`,
      };
    }

    const now = new Date();
    const lastDate = validated.calibration.lastDate || now;
    const nextDueDate =
      validated.calibration.nextDueDate ||
      new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days standard ISCD

    const newDevice: Device = {
      _id: new ObjectId(),
      serialNumber: validated.serialNumber.trim(),
      model: validated.model,
      yearManufactured: validated.yearManufactured,
      currentStatus: validated.currentStatus,
      location: validated.location.trim(),
      currentPartnerId: null,
      currentContractId: null,
      calibration: {
        lastDate,
        nextDueDate,
        qcResult: validated.calibration.qcResult,
        phantomCv: validated.calibration.phantomCv,
        calibratedBy: validated.calibration.calibratedBy || "Kỹ sư OsteoSys",
        certificateUrl: validated.calibration.certificateUrl,
        notes: validated.calibration.notes,
      },
      totalScansCount: 0,
      accessoriesIncluded: validated.accessoriesIncluded,
      notes: validated.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await devicesCol.insertOne(newDevice);

    // Record Audit Log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "device",
      resourceId: newDevice.serialNumber,
      resourceLabel: `Nhập kho thiết bị mới: ${newDevice.serialNumber} (${newDevice.model})`,
      after: {
        serialNumber: newDevice.serialNumber,
        model: newDevice.model,
        location: newDevice.location,
        status: newDevice.currentStatus,
      },
      status: "success",
    });

    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã thêm thành công thiết bị Sonost 3000 mang số Serial ${newDevice.serialNumber} vào kho!`,
      data: { serialNumber: newDevice.serialNumber },
    };
  } catch (error) {
    console.error("Error in createDevice Server Action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi không xác định khi tạo thiết bị mới.",
    };
  }
}

/**
 * 4. updateDevice: Updates device specifications, location, calibration records with Before/After snapshot
 */
export async function updateDevice(serialNumber: string, rawInput: UpdateDeviceInput) {
  try {
    const validated = updateDeviceSchema.parse(rawInput);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const existing = await devicesCol.findOne({ serialNumber });
    if (!existing) {
      return {
        success: false,
        message: `Không tìm thấy thiết bị mang số Serial ${serialNumber}`,
      };
    }

    const now = new Date();
    const updateDoc: Partial<Device> & { updatedAt: Date } = {
      updatedAt: now,
    };

    if (validated.model) updateDoc.model = validated.model;
    if (validated.yearManufactured) updateDoc.yearManufactured = validated.yearManufactured;
    if (validated.location) updateDoc.location = validated.location.trim();
    if (validated.currentStatus) updateDoc.currentStatus = validated.currentStatus;
    if (validated.notes !== undefined) updateDoc.notes = validated.notes.trim();
    if (validated.accessoriesIncluded) updateDoc.accessoriesIncluded = validated.accessoriesIncluded;

    // Calibration update with auto nextDueDate calculation
    if (validated.calibration) {
      const calib = validated.calibration;
      const lastDate = calib.lastDate ? new Date(calib.lastDate) : existing.calibration?.lastDate || now;
      const nextDueDate = calib.nextDueDate
        ? new Date(calib.nextDueDate)
        : new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);

      updateDoc.calibration = {
        lastDate,
        nextDueDate,
        qcResult: calib.qcResult || existing.calibration?.qcResult || "passed",
        phantomCv: calib.phantomCv !== undefined ? calib.phantomCv : existing.calibration?.phantomCv || 0.8,
        calibratedBy: calib.calibratedBy || existing.calibration?.calibratedBy || "Kỹ sư OsteoSys",
        certificateUrl: calib.certificateUrl || existing.calibration?.certificateUrl,
        notes: calib.notes || existing.calibration?.notes,
      };
    }

    await devicesCol.updateOne({ serialNumber }, { $set: updateDoc });

    // Record Audit Log with Before / After snapshot
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "update",
      resource: "device",
      resourceId: serialNumber,
      resourceLabel: `Cập nhật thông số thiết bị ${serialNumber}`,
      before: {
        location: existing.location,
        status: existing.currentStatus,
        calibration: existing.calibration,
      },
      after: {
        location: updateDoc.location || existing.location,
        status: updateDoc.currentStatus || existing.currentStatus,
        calibration: updateDoc.calibration || existing.calibration,
      },
      status: "success",
    });

    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/thue-may");
    revalidatePath("/admin/leasing");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Cập nhật thành công thiết bị ${serialNumber}!`,
    };
  } catch (error) {
    console.error("Error in updateDevice Server Action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi cập nhật thông tin thiết bị.",
    };
  }
}

/**
 * 5. deleteDevice: Data Integrity-enforced Deletion & Decommissioning
 * - Blocks delete if status = 'rented' or 'repairing'
 * - If device has historical contracts/repair tickets -> only allow Soft Delete / Decommission
 * - If freshly created by accident with zero history -> allow Hard Delete
 */
export async function deleteDevice(
  serialNumber: string,
  mode: "soft" | "hard" = "soft"
): Promise<{ success: boolean; message: string; mode?: "soft" | "hard" }> {
  try {
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const repairsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);

    const device = await devicesCol.findOne({ serialNumber });
    if (!device) {
      return { success: false, message: `Không tìm thấy thiết bị ${serialNumber}` };
    }

    // 1. Strict Business Rule: Cannot delete active rented or repairing machines
    if (device.currentStatus === "rented") {
      return {
        success: false,
        message: `Ràng buộc an toàn: Không thể xóa hoặc thanh lý máy ${serialNumber} vì đang trong hợp đồng thuê hiệu lực. Vui lòng làm thủ tục thu hồi / kết thúc hợp đồng trước.`,
      };
    }

    if (device.currentStatus === "repairing") {
      return {
        success: false,
        message: `Ràng buộc an toàn: Không thể xóa máy ${serialNumber} vì đang trong phiếu sửa chữa kỹ thuật chưa hoàn tất.`,
      };
    }

    // 2. Check for historical records in rental_contracts and repair_tickets
    const contractsCount = await contractsCol.countDocuments({
      $or: [{ deviceSerial: serialNumber }, { deviceId: device._id }],
    });

    const repairsCount = await repairsCol.countDocuments({
      $or: [{ deviceSerial: serialNumber }, { deviceId: device._id }],
    });

    const hasHistory = contractsCount > 0 || repairsCount > 0;

    // 3. If has historical linkage and hard delete was requested -> block hard delete, suggest soft delete
    if (hasHistory && mode === "hard") {
      return {
        success: false,
        message: `Không thể xóa vĩnh viễn (Hard Delete) máy ${serialNumber} vì đã phát sinh ${contractsCount} hợp đồng thuê và ${repairsCount} phiếu sửa chữa trong lịch sử. Hệ thống chỉ cho phép "Thanh lý / Ngừng sử dụng" (Soft Delete) để bảo toàn chứng từ y tế.`,
      };
    }

    // 4. Perform Soft Delete (Decommission)
    if (mode === "soft" || hasHistory) {
      await devicesCol.updateOne(
        { serialNumber },
        {
          $set: {
            currentStatus: "decommissioned",
            location: "Kho Thiết Bị Đã Thanh Lý / Ngừng Sử Dụng",
            updatedAt: new Date(),
          },
        }
      );

      await recordAuditLog({
        actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
        action: "delete",
        resource: "device",
        resourceId: serialNumber,
        resourceLabel: `Thanh lý thiết bị y tế ${serialNumber} (Soft Delete)`,
        before: { currentStatus: device.currentStatus, location: device.location },
        after: { currentStatus: "decommissioned" },
        status: "success",
      });

      revalidatePath("/admin/kho-thiet-bi");
      revalidatePath("/admin/inventory");
      revalidatePath("/admin");

      return {
        success: true,
        mode: "soft",
        message: `Đã chuyển máy ${serialNumber} sang trạng thái "Đã thanh lý / Ngừng sử dụng" (Soft Delete). Lịch sử y tế vẫn được bảo toàn nguyên vẹn.`,
      };
    }

    // 5. Perform Hard Delete (Only for fresh devices with 0 history)
    await devicesCol.deleteOne({ serialNumber });

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "delete",
      resource: "device",
      resourceId: serialNumber,
      resourceLabel: `Xóa vĩnh viễn thiết bị tạo nhầm ${serialNumber} (Hard Delete)`,
      before: { serialNumber, model: device.model },
      status: "success",
    });

    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return {
      success: true,
      mode: "hard",
      message: `Đã xóa vĩnh viễn thiết bị ${serialNumber} khỏi cơ sở dữ liệu MongoDB.`,
    };
  } catch (error) {
    console.error("Error in deleteDevice Server Action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi xử lý xóa thiết bị.",
    };
  }
}

/**
 * 6. quickCalibrateDevice: Quick QC Daily / Periodic Phantom calibration
 */
export async function quickCalibrateDevice(
  serialNumber: string,
  data: {
    phantomCv: number;
    qcResult: "passed" | "warning" | "failed";
    notes?: string;
    calibratedBy?: string;
  }
) {
  try {
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const now = new Date();
    const nextDueDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // +90 days ISCD

    const res = await devicesCol.updateOne(
      { serialNumber },
      {
        $set: {
          "calibration.lastDate": now,
          "calibration.nextDueDate": nextDueDate,
          "calibration.qcResult": data.qcResult,
          "calibration.phantomCv": Number(data.phantomCv),
          "calibration.calibratedBy": data.calibratedBy || "Kỹ sư Nguyễn Văn Tuấn (Kỹ Thuật OsteoSys)",
          "calibration.notes": data.notes || "Kiểm chuẩn Phantom Hologic định kỳ đạt chuẩn ISCD",
          currentStatus: data.qcResult === "passed" ? "available" : "under_maintenance",
          updatedAt: now,
        },
      }
    );

    if (res.matchedCount === 0) {
      return { success: false, message: `Không tìm thấy máy ${serialNumber}` };
    }

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "calibrate",
      resource: "device",
      resourceId: serialNumber,
      resourceLabel: `Kiểm chuẩn Phantom cho máy ${serialNumber} (CV: ${data.phantomCv}%, Kết quả: ${data.qcResult})`,
      after: { phantomCv: data.phantomCv, qcResult: data.qcResult, nextDueDate },
      status: "success",
    });

    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã cấp chứng nhận kiểm chuẩn Phantom cho máy ${serialNumber}! Hạn kiểm định kế tiếp: ${nextDueDate.toLocaleDateString("vi-VN")}.`,
    };
  } catch (error) {
    console.error("Error in quickCalibrateDevice:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi kiểm chuẩn thiết bị",
    };
  }
}
