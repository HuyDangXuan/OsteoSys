import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import {
  COLLECTIONS,
  Device,
  RentalContract,
  RepairTicket,
  Partner,
} from "@/types/db";

export async function GET() {
  try {
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const ticketsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);

    // 1. Device status breakdown
    const totalDevices = await devicesCol.countDocuments();
    const rentedDevices = await devicesCol.countDocuments({ currentStatus: "rented" });
    const availableDevices = await devicesCol.countDocuments({ currentStatus: "available" });
    const maintenanceDevices = await devicesCol.countDocuments({ currentStatus: "under_maintenance" });
    const repairingDevices = await devicesCol.countDocuments({ currentStatus: "repairing" });

    // 2. Active Rental Contracts
    const activeContracts = await contractsCol.find({ status: { $in: ["active", "expiring_soon"] } }).toArray();
    const totalActiveRentals = activeContracts.length;
    const expiringSoonRentals = activeContracts.filter((c) => c.status === "expiring_soon").length;

    // Monthly revenue calculation
    const monthlyRevenue = activeContracts.reduce((sum, c) => sum + (c.monthlyRentalFee || 0), 0);

    // 3. Pending Repair Tickets
    const pendingTickets = await ticketsCol
      .find({ status: { $nin: ["delivered", "cancelled"] } })
      .sort({ createdAt: -1 })
      .toArray();
    const urgentTickets = pendingTickets.filter((t) => t.priority === "urgent").length;

    // 4. Partner count
    const totalPartners = await partnersCol.countDocuments({ status: "active" });

    // 5. Recent Contracts (last 4)
    const recentContracts = await contractsCol
      .find()
      .sort({ createdAt: -1 })
      .limit(4)
      .toArray();

    // 6. Recent Tickets (last 4)
    const recentTickets = await ticketsCol
      .find()
      .sort({ createdAt: -1 })
      .limit(4)
      .toArray();

    return NextResponse.json({
      status: "success",
      data: {
        metrics: {
          activeRentals: {
            count: totalActiveRentals,
            expiringSoon: expiringSoonRentals,
            changeLabel: "+2 hợp đồng mới tháng này",
          },
          monthlyRevenue: {
            total: monthlyRevenue,
            formatted: new Intl.NumberFormat("vi-VN").format(monthlyRevenue) + " ₫",
            growth: "+14.8% so với tháng trước",
          },
          pendingRepairs: {
            count: pendingTickets.length,
            urgent: urgentTickets,
            statusLabel: `${urgentTickets} ca khẩn cấp cần kỹ sư xử lý`,
          },
          deviceFleet: {
            total: totalDevices,
            rented: rentedDevices,
            available: availableDevices,
            maintenance: maintenanceDevices,
            repairing: repairingDevices,
            utilizationRate: totalDevices > 0 ? ((rentedDevices / totalDevices) * 100).toFixed(1) + "%" : "0%",
          },
          totalPartners,
        },
        recentContracts: recentContracts.map((c) => ({
          id: c.contractCode,
          client: c.partnerName,
          device: c.deviceSerial,
          startDate: c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : "",
          endDate: c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "",
          status: c.status === "active" ? "active" : c.status === "expiring_soon" ? "expiring_soon" : "completed",
          statusLabel: c.status === "active" ? "Đang vận hành" : c.status === "expiring_soon" ? "Sắp hết hạn" : "Đã hoàn tất",
          monthlyFee: new Intl.NumberFormat("vi-VN").format(c.monthlyRentalFee) + " ₫",
        })),
        recentTickets: recentTickets.map((t) => ({
          id: t.ticketCode,
          facility: t.partnerName,
          device: t.deviceSerial,
          issue: t.reportedIssue,
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
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch admin overview data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
