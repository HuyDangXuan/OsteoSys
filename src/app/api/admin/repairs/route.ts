import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, RepairTicket, Device } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { ObjectId, Filter } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const priority = searchParams.get("priority") || "all";

    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);
    const filter: Filter<RepairTicket> = {};

    if (priority !== "all") {
      filter.priority = priority as RepairTicket["priority"];
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { ticketCode: searchRegex },
        { partnerName: searchRegex },
        { deviceSerial: searchRegex },
        { reportedIssue: searchRegex },
        { technicianName: searchRegex },
      ];
    }

    const tickets = await ticketsCol.find(filter).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      status: "success",
      data: tickets.map((t) => ({
        id: t.ticketCode,
        facility: t.partnerName,
        device: t.deviceSerial,
        issue: t.reportedIssue,
        diagnosis: t.diagnosis || "Đang kiểm tra sơ bộ",
        priority: t.priority,
        priorityLabel: t.priority === "urgent" ? "Khẩn cấp" : t.priority === "calibration" ? "Hiệu chuẩn" : "Bình thường",
        status: t.status,
        statusLabel:
          t.status === "in_progress"
            ? "Đang sửa chữa"
            : t.status === "calibrating"
            ? "Đang hiệu chuẩn"
            : t.status === "parts_waiting"
            ? "Chờ linh kiện"
            : "Tiếp nhận",
        technician: t.technicianName || "Chưa phân công",
        receivedDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN") : "",
        partsCount: t.partsReplaced?.length || 0,
      })),
      total: tickets.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch repair tickets",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceSerial, partnerName, priority, reportedIssue, technicianName, estimatedDays } = body;

    if (!deviceSerial || !reportedIssue) {
      return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 });
    }

    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const count = await ticketsCol.countDocuments();
    const ticketCode = `REP-2026-${String(count + 50).padStart(3, "0")}`;

    const estDays = Number(estimatedDays || 2);
    const estDate = new Date(Date.now() + estDays * 86400000);

    const newTicket: RepairTicket = {
      _id: new ObjectId(),
      ticketCode,
      deviceSource: "client_sent",
      deviceSerial,
      partnerName: partnerName || "Kho Tổng / Cơ sở y tế",
      priority: priority || "urgent",
      reportedIssue,
      diagnosis: "Tiếp nhận lệnh sửa chữa và phân công kỹ sư đo kiểm",
      partsReplaced: [],
      technicianName: technicianName || "Kỹ sư Nguyễn Văn Tuấn",
      estimatedCompletionDate: estDate,
      totalCost: 0,
      status: "received",
      timeline: [
        {
          status: "received",
          note: `Khởi tạo phiếu sửa chữa kỹ thuật: ${reportedIssue}`,
          updatedBy: technicianName || "Admin Hệ Thống",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ticketsCol.insertOne(newTicket);

    // Update Device status in inventory to "repairing" or "under_maintenance"
    await devicesCol.updateOne(
      { serialNumber: deviceSerial },
      {
        $set: {
          currentStatus: priority === "calibration" ? "under_maintenance" : "repairing",
          updatedAt: new Date(),
        },
      }
    );

    // Record Audit Log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "repair_ticket",
      resourceId: ticketCode,
      resourceLabel: `Lệnh sửa chữa ${ticketCode} (Máy ${deviceSerial})`,
      after: { ticketCode, deviceSerial, priority, reportedIssue },
      request,
      status: "success",
    });

    return NextResponse.json({
      status: "success",
      message: "Repair ticket created successfully",
      data: newTicket,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create repair ticket",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
