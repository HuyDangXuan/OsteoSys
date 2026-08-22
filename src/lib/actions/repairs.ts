"use server";

import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, RepairTicket, Device, Partner, ReplacedPart, RepairTicketStatus } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { findOrCreatePartner } from "@/lib/services/partner-sync";
import { ObjectId, Filter } from "mongodb";

export interface RepairQueryOptions {
  search?: string;
  status?: string;
  priority?: string;
  deviceSource?: string;
  sortBy?: string;
}

export interface JoinedRepairTicketItem {
  id: string;
  ticketCode: string;
  deviceSource: "client_sent" | "warehouse_inventory";
  deviceId?: string;
  deviceSerial: string;
  deviceModel?: string;
  deviceLocation?: string;
  partnerId?: string;
  partnerName: string;
  partnerPhone?: string;
  partnerAddress?: string;
  priority: "urgent" | "calibration" | "normal" | "low";
  priorityLabel: string;
  reportedIssue: string;
  diagnosis?: string;
  partsReplaced: ReplacedPart[];
  technicianId?: string;
  technicianName: string;
  estimatedCompletionDate?: string | null;
  actualCompletionDate?: string | null;
  totalCost: number;
  formattedCost: string;
  status: RepairTicketStatus;
  statusLabel: string;
  statusStep: number; // 1 to 6
  timeline: {
    status: RepairTicketStatus;
    statusLabel: string;
    note: string;
    updatedBy: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface RepairStatsResult {
  totalTickets: number;
  activeTickets: number;
  receivedCount: number;
  diagnosingCount: number;
  partsWaitingCount: number;
  inProgressCount: number;
  calibratingCount: number; // calibrating or qc_passed
  deliveredCount: number;
  urgentCount: number;
  totalCost: number;
  formattedTotalCost: string;
}

const STATUS_LABELS: Record<RepairTicketStatus, string> = {
  received: "Tiếp nhận",
  diagnosing: "Đang chẩn đoán",
  parts_waiting: "Chờ linh kiện",
  in_progress: "Đang sửa chữa",
  calibrating: "Đang hiệu chuẩn",
  qc_passed: "Đạt chuẩn ISCD",
  delivered: "Đã bàn giao",
  cancelled: "Đã hủy",
};

const STATUS_STEP_MAP: Record<RepairTicketStatus, number> = {
  received: 1,
  diagnosing: 2,
  parts_waiting: 3,
  in_progress: 4,
  calibrating: 5,
  qc_passed: 5,
  delivered: 6,
  cancelled: 0,
};

/**
 * 1. getRepairTickets: MongoDB Aggregation $lookup joining partners, devices, and technician accounts
 */
export async function getRepairTickets(options: RepairQueryOptions = {}): Promise<JoinedRepairTicketItem[]> {
  try {
    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);
    const { search = "", status = "all", priority = "all" } = options;

    const matchStage: Filter<RepairTicket> = {};

    if (status !== "all") {
      matchStage.status = status as RepairTicketStatus;
    }

    if (priority !== "all") {
      matchStage.priority = priority as RepairTicket["priority"];
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      matchStage.$or = [
        { ticketCode: searchRegex },
        { deviceSerial: searchRegex },
        { partnerName: searchRegex },
        { reportedIssue: searchRegex },
        { technicianName: searchRegex },
      ];
    }

    const pipeline: any[] = [
      { $match: matchStage },
      // $lookup Partner
      {
        $lookup: {
          from: COLLECTIONS.PARTNERS,
          let: { pName: "$partnerName", pId: "$partnerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$pId"] },
                    { $eq: ["$name", "$$pName"] },
                  ],
                },
              },
            },
          ],
          as: "partnerDetails",
        },
      },
      // $lookup Device
      {
        $lookup: {
          from: COLLECTIONS.DEVICES,
          localField: "deviceSerial",
          foreignField: "serialNumber",
          as: "deviceDetails",
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const rawTickets = await ticketsCol.aggregate(pipeline).toArray();

    return rawTickets.map((t: any) => {
      const partner = t.partnerDetails?.[0];
      const device = t.deviceDetails?.[0];

      let priorityLabel = "Bình thường";
      if (t.priority === "urgent") priorityLabel = "Khẩn cấp (Ưu tiên)";
      else if (t.priority === "calibration") priorityLabel = "Kiểm chuẩn định kỳ";
      else if (t.priority === "low") priorityLabel = "Ưu tiên thấp";

      const timelineFormatted = Array.isArray(t.timeline)
        ? t.timeline.map((entry: any) => ({
            status: entry.status,
            statusLabel: STATUS_LABELS[entry.status as RepairTicketStatus] || entry.status,
            note: entry.note || "",
            updatedBy: entry.updatedBy || "Kỹ sư OsteoSys",
            timestamp: entry.timestamp ? new Date(entry.timestamp).toLocaleString("vi-VN") : "",
          }))
        : [];

      return {
        id: t._id?.toString() || t.ticketCode,
        ticketCode: t.ticketCode,
        deviceSource: t.deviceSource || "client_sent",
        deviceId: t.deviceId?.toString() || "",
        deviceSerial: t.deviceSerial,
        deviceModel: device?.model || "Sonost 3000 PRO",
        deviceLocation: device?.location || t.partnerName,
        partnerId: t.partnerId?.toString() || "",
        partnerName: t.partnerName || "Kho Tổng / Cơ sở y tế",
        partnerPhone: partner?.primaryContact?.phone || "024 3927 5568",
        partnerAddress: partner?.address ? `${partner.address}, ${partner.city || ""}` : "Hà Nội",
        priority: t.priority || "normal",
        priorityLabel,
        reportedIssue: t.reportedIssue || "Kiểm tra kỹ thuật tổng quát",
        diagnosis: t.diagnosis || "Chẩn đoán đầu dò siêu âm & khối nguồn",
        partsReplaced: t.partsReplaced || [],
        technicianId: t.technicianId?.toString() || "",
        technicianName: t.technicianName || "Kỹ sư Nguyễn Văn Tuấn",
        estimatedCompletionDate: t.estimatedCompletionDate
          ? new Date(t.estimatedCompletionDate).toLocaleDateString("vi-VN")
          : null,
        actualCompletionDate: t.actualCompletionDate
          ? new Date(t.actualCompletionDate).toLocaleDateString("vi-VN")
          : null,
        totalCost: t.totalCost || 0,
        formattedCost: new Intl.NumberFormat("vi-VN").format(t.totalCost || 0) + " ₫",
        status: t.status as RepairTicketStatus,
        statusLabel: STATUS_LABELS[t.status as RepairTicketStatus] || t.status,
        statusStep: STATUS_STEP_MAP[t.status as RepairTicketStatus] || 1,
        timeline: timelineFormatted,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error in getRepairTickets Server Action:", error);
    return [];
  }
}

/**
 * 2. getRepairStats: Realtime $facet aggregation for repairs Kanban and metrics
 */
export async function getRepairStats(): Promise<RepairStatsResult> {
  try {
    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);

    const facetResults = await ticketsCol
      .aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [
              { $match: { status: { $nin: ["delivered", "cancelled"] } } },
              { $count: "count" },
            ],
            received: [{ $match: { status: "received" } }, { $count: "count" }],
            diagnosing: [{ $match: { status: "diagnosing" } }, { $count: "count" }],
            partsWaiting: [{ $match: { status: "parts_waiting" } }, { $count: "count" }],
            inProgress: [{ $match: { status: "in_progress" } }, { $count: "count" }],
            calibrating: [
              { $match: { status: { $in: ["calibrating", "qc_passed"] } } },
              { $count: "count" },
            ],
            delivered: [{ $match: { status: "delivered" } }, { $count: "count" }],
            urgent: [
              { $match: { priority: "urgent", status: { $nin: ["delivered", "cancelled"] } } },
              { $count: "count" },
            ],
            costs: [
              {
                $group: {
                  _id: null,
                  totalCost: { $sum: "$totalCost" },
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const data = facetResults[0] || {};
    const totalTickets = data.total?.[0]?.count || 0;
    const activeTickets = data.active?.[0]?.count || 0;
    const receivedCount = data.received?.[0]?.count || 0;
    const diagnosingCount = data.diagnosing?.[0]?.count || 0;
    const partsWaitingCount = data.partsWaiting?.[0]?.count || 0;
    const inProgressCount = data.inProgress?.[0]?.count || 0;
    const calibratingCount = data.calibrating?.[0]?.count || 0;
    const deliveredCount = data.delivered?.[0]?.count || 0;
    const urgentCount = data.urgent?.[0]?.count || 0;
    const totalCost = data.costs?.[0]?.totalCost || 0;

    return {
      totalTickets,
      activeTickets,
      receivedCount,
      diagnosingCount,
      partsWaitingCount,
      inProgressCount,
      calibratingCount,
      deliveredCount,
      urgentCount,
      totalCost,
      formattedTotalCost: new Intl.NumberFormat("vi-VN").format(totalCost) + " ₫",
    };
  } catch (error) {
    console.error("Error in getRepairStats Server Action:", error);
    return {
      totalTickets: 0,
      activeTickets: 0,
      receivedCount: 0,
      diagnosingCount: 0,
      partsWaitingCount: 0,
      inProgressCount: 0,
      calibratingCount: 0,
      deliveredCount: 0,
      urgentCount: 0,
      totalCost: 0,
      formattedTotalCost: "0 ₫",
    };
  }
}

/**
 * 3. createRepairTicket: Create new technical repair order SC-XXXX
 */
export async function createRepairTicket(formData: {
  deviceSerial: string;
  partnerName?: string;
  priority?: "urgent" | "calibration" | "normal" | "low";
  reportedIssue: string;
  technicianName?: string;
  estimatedDays?: number;
}) {
  try {
    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const {
      deviceSerial,
      partnerName = "Kho Tổng / Cơ sở y tế",
      priority = "urgent",
      reportedIssue,
      technicianName = "Kỹ sư Nguyễn Văn Tuấn",
      estimatedDays = 2,
    } = formData;

    const count = await ticketsCol.countDocuments();
    const ticketCode = `SC-${String(count + 100).padStart(4, "0")}`;

    const estDate = new Date(Date.now() + Number(estimatedDays) * 86400000);
    const now = new Date();

    let resolvedPartnerId: ObjectId | null = null;
    let finalPartnerName = partnerName;

    if (partnerName && !partnerName.includes("Kho Tổng")) {
      const syncResult = await findOrCreatePartner({ name: partnerName });
      resolvedPartnerId = syncResult.partnerId;
      finalPartnerName = syncResult.partnerName;
    }

    const newTicket: RepairTicket = {
      _id: new ObjectId(),
      ticketCode,
      deviceSource: "client_sent",
      deviceSerial,
      partnerId: resolvedPartnerId,
      partnerName: finalPartnerName,
      priority,
      reportedIssue,
      diagnosis: "Tiếp nhận thiết bị và đo kiểm độ suy hao tín hiệu siêu âm gót chân",
      partsReplaced: [],
      technicianName,
      estimatedCompletionDate: estDate,
      totalCost: 0,
      status: "received",
      timeline: [
        {
          status: "received",
          note: `Tiếp nhận lệnh sửa chữa y tế: ${reportedIssue}`,
          updatedBy: technicianName,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await ticketsCol.insertOne(newTicket);

    // Update Device status in inventory
    await devicesCol.updateOne(
      { serialNumber: deviceSerial },
      {
        $set: {
          currentStatus: priority === "calibration" ? "under_maintenance" : "repairing",
          location: `Phòng Kỹ Thuật OsteoSys (${technicianName})`,
          updatedAt: now,
        },
      }
    );

    // Audit log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "repair_ticket",
      resourceId: ticketCode,
      resourceLabel: `Khởi tạo lệnh sửa chữa ${ticketCode} cho máy ${deviceSerial}`,
      after: { ticketCode, deviceSerial, priority, reportedIssue, partnerName: finalPartnerName },
      status: "success",
    });

    revalidatePath("/admin/repairs");
    revalidatePath("/admin/sua-chua");
    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/khach-hang");
    revalidatePath("/admin/partners");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Tạo lệnh kỹ thuật ${ticketCode} thành công cho máy ${deviceSerial}.`,
      ticketCode,
    };
  } catch (error) {
    console.error("Error in createRepairTicket:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi tạo lệnh sửa chữa",
    };
  }
}

/**
 * 4. updateRepairTimeline: Update progress, replaced parts, costs & auto QC Phantom certificate
 */
export async function updateRepairTimeline(
  ticketCode: string,
  newStatus: RepairTicketStatus,
  options: {
    note: string;
    parts?: ReplacedPart[];
    laborCost?: number;
    technicianName?: string;
    diagnosis?: string;
    autoCalibrate?: boolean;
  }
) {
  try {
    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const ticket = await ticketsCol.findOne({ ticketCode });
    if (!ticket) {
      return { success: false, message: `Không tìm thấy phiếu sửa chữa ${ticketCode}` };
    }

    const now = new Date();
    const techName = options.technicianName || ticket.technicianName || "Kỹ sư Nguyễn Văn Tuấn";

    const newTimelineEntry = {
      status: newStatus,
      note: options.note || `Chuyển trạng thái sang ${STATUS_LABELS[newStatus] || newStatus}`,
      updatedBy: techName,
      timestamp: now,
    };

    // Calculate total cost
    const existingParts = ticket.partsReplaced || [];
    const addedParts = options.parts || [];
    const allParts = [...existingParts, ...addedParts];
    const partsCost = allParts.reduce((sum, p) => sum + (p.cost || 0), 0);
    const labor = Number(options.laborCost || 0);
    const totalCost = partsCost + labor;

    const updateDoc: Partial<RepairTicket> & { updatedAt: Date } = {
      status: newStatus,
      timeline: [...ticket.timeline, newTimelineEntry],
      partsReplaced: allParts,
      totalCost,
      updatedAt: now,
    };

    if (options.diagnosis) {
      updateDoc.diagnosis = options.diagnosis;
    }

    if (newStatus === "delivered" || newStatus === "qc_passed") {
      updateDoc.actualCompletionDate = now;

      // Automatically update device calibration & set device back to available in warehouse
      const nextDue = new Date(now.getTime() + 90 * 86400000);
      await devicesCol.updateOne(
        { serialNumber: ticket.deviceSerial },
        {
          $set: {
            currentStatus: newStatus === "delivered" ? "available" : "available",
            location: "Kho Tổng Hà Nội (Tầng 1) — Đã kiểm chuẩn ISCD",
            calibration: {
              lastDate: now,
              nextDueDate: nextDue,
              certifiedBy: techName,
              certificateNumber: `ISCD-REP-${ticketCode}`,
              iscdStandard: true,
              qcResult: "passed",
              phantomCv: 0.72,
              calibratedBy: techName,
              notes: `Hoàn tất theo lệnh sửa chữa ${ticketCode}. ${options.note}`,
            },
            updatedAt: now,
          },
        }
      );
    } else if (newStatus === "calibrating") {
      await devicesCol.updateOne(
        { serialNumber: ticket.deviceSerial },
        {
          $set: {
            currentStatus: "under_maintenance",
            location: "Phòng Kiểm Chuẩn Kỹ Thuật (Kho Tổng)",
            updatedAt: now,
          },
        }
      );
    }

    await ticketsCol.updateOne({ ticketCode }, { $set: updateDoc });

    // Audit log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "status_change",
      resource: "repair_ticket",
      resourceId: ticketCode,
      resourceLabel: `Cập nhật tiến độ lệnh ${ticketCode} -> ${STATUS_LABELS[newStatus]}`,
      after: { status: newStatus, totalCost },
      status: "success",
    });

    revalidatePath("/admin/repairs");
    revalidatePath("/admin/sua-chua");
    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Cập nhật tiến độ phiếu ${ticketCode} thành công! Thiết bị ${ticket.deviceSerial} đã được đồng bộ.`,
    };
  } catch (error) {
    console.error("Error in updateRepairTimeline:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi cập nhật tiến độ sửa chữa",
    };
  }
}
