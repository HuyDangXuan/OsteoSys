import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Device } from "@/types/db";
import { Filter } from "mongodb";

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

    return NextResponse.json({
      status: "success",
      data: devices.map((d) => ({
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
        calibrationDate: d.calibration?.lastDate ? new Date(d.calibration.lastDate).toLocaleDateString("vi-VN") : "",
        nextCalibration: d.calibration?.nextDueDate ? new Date(d.calibration.nextDueDate).toLocaleDateString("vi-VN") : "",
        cvScore: `${d.calibration?.phantomCv || 0.8}%`,
        qcStatus: d.calibration?.qcResult === "passed" ? "Đạt chuẩn ISCD" : "Cần kiểm tra",
        totalScans: d.totalScansCount || 0,
      })),
      total: devices.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch device inventory",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
