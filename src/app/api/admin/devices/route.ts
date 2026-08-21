import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Device } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { Filter } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const filter: Filter<Device> = {};

    if (status !== "all") {
      filter.currentStatus = status as Device["currentStatus"];
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { serialNumber: searchRegex },
        { location: searchRegex },
        { model: searchRegex },
      ];
    }

    const devices = await devicesCol.find(filter).sort({ serialNumber: 1 }).toArray();

    return NextResponse.json(
      {
        status: "success",
        data: devices.map((d) => ({
          id: d._id?.toString(),
          serial: d.serialNumber,
          model: d.model,
          year: d.yearManufactured,
          location: d.location,
          status: d.currentStatus,
          statusLabel:
            d.currentStatus === "rented"
              ? "Đang cho thuê"
              : d.currentStatus === "available"
              ? "Sẵn sàng trong kho"
              : d.currentStatus === "under_maintenance"
              ? "Bảo trì / Hiệu chuẩn"
              : d.currentStatus === "repairing"
              ? "Đang sửa chữa"
              : "Ngừng hoạt động",
          calibrationDate: d.calibration?.lastDate
            ? new Date(d.calibration.lastDate).toLocaleDateString("vi-VN")
            : "",
          nextCalibration: d.calibration?.nextDueDate
            ? new Date(d.calibration.nextDueDate).toLocaleDateString("vi-VN")
            : "",
          cvScore: `${d.calibration?.phantomCv || 0.8}%`,
          qcStatus:
            d.calibration?.qcResult === "passed"
              ? "Đạt chuẩn ISCD"
              : d.calibration?.qcResult === "warning"
              ? "Cần hiệu chuẩn lại"
              : "Chưa kiểm chuẩn",
          qcResult: d.calibration?.qcResult || "passed",
          totalScans: d.totalScansCount || 0,
          accessories: d.accessoriesIncluded || [],
          notes: d.notes || "",
        })),
        total: devices.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch device inventory",
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { serialNumber, status, location, qcResult, phantomCv, notes } = body;

    if (!serialNumber) {
      return NextResponse.json(
        { status: "error", message: "Vui lòng cung cấp số serial thiết bị" },
        { status: 400 }
      );
    }

    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const existing = await devicesCol.findOne({ serialNumber });

    if (!existing) {
      return NextResponse.json(
        { status: "error", message: `Không tìm thấy thiết bị ${serialNumber}` },
        { status: 404 }
      );
    }

    const previousStatus = existing.currentStatus;
    const now = new Date();
    const updateDoc: Partial<Device> & { updatedAt: Date } = {
      updatedAt: now,
    };

    if (status) {
      updateDoc.currentStatus = status as Device["currentStatus"];
    }

    if (location) {
      updateDoc.location = location;
    }

    if (notes !== undefined) {
      updateDoc.notes = notes;
    }

    if (qcResult || phantomCv !== undefined) {
      const nextDue = new Date(now.getTime() + 90 * 86400000);
      updateDoc.calibration = {
        lastDate: now,
        nextDueDate: nextDue,
        qcResult: qcResult || existing.calibration?.qcResult || "passed",
        phantomCv: phantomCv !== undefined ? Number(phantomCv) : existing.calibration?.phantomCv || 0.8,
        calibratedBy: "Kỹ sư Nguyễn Văn Tuấn (Kỹ Thuật OsteoSys)",
        notes: notes || existing.calibration?.notes,
      };
    }

    await devicesCol.updateOne({ serialNumber }, { $set: updateDoc });

    // Record Audit Log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "status_change",
      resource: "device",
      resourceId: serialNumber,
      resourceLabel: `Cập nhật trạng thái máy ${serialNumber} (${previousStatus} → ${status || previousStatus})`,
      before: { currentStatus: previousStatus, location: existing.location },
      after: { currentStatus: status || previousStatus, location: location || existing.location },
      request,
      status: "success",
    });

    // Revalidate paths
    try {
      revalidatePath("/admin/kho-thiet-bi");
      revalidatePath("/admin/inventory");
      revalidatePath("/admin/thue-may");
      revalidatePath("/admin/leasing");
      revalidatePath("/admin");
    } catch {
      // Ignore during build/worker
    }

    return NextResponse.json({
      status: "success",
      message: `Đã cập nhật thông tin thiết bị ${serialNumber} thành công`,
      data: {
        serialNumber,
        previousStatus,
        newStatus: status || previousStatus,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Lỗi cập nhật thiết bị",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
