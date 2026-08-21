import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, RentalContract, Device } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { ObjectId, Filter } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tab = searchParams.get("tab") || "all";

    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);

    const filter: Filter<RentalContract> = {};

    if (tab === "active") {
      filter.status = "active";
    } else if (tab === "expiring_soon") {
      filter.status = "expiring_soon";
    } else if (tab === "completed") {
      filter.status = "completed";
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { contractCode: searchRegex },
        { partnerName: searchRegex },
        { deviceSerial: searchRegex },
      ];
    }

    const contracts = await contractsCol.find(filter).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      status: "success",
      data: contracts.map((c) => ({
        id: c.contractCode,
        client: c.partnerName,
        facilityType: c.packageType === "monthly" ? "Phòng khám Tiêu chuẩn" : c.packageType === "long_term" ? "Bệnh viện Đa khoa" : "Khám Lưu động Sự kiện",
        device: c.deviceSerial,
        startDate: c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : "",
        endDate: c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "",
        monthlyFee: new Intl.NumberFormat("vi-VN").format(c.monthlyRentalFee) + " ₫",
        status: c.status,
        statusLabel: c.status === "active" ? "Đang vận hành" : c.status === "expiring_soon" ? "Sắp hết hạn" : "Đã hoàn tất",
        scansCount: 420, // Accumulated scan count
      })),
      total: contracts.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch rental contracts",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerName, deviceSerial, packageType, durationMonths, monthlyFee, deposit, startDate, paymentTerms, notes } = body;

    if (!partnerName || !deviceSerial) {
      return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 });
    }

    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const count = await contractsCol.countDocuments();
    const contractCode = `HD-2026-${String(count + 100).padStart(3, "0")}`;

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(durationMonths || 6));

    const newContract: RentalContract = {
      _id: new ObjectId(),
      contractCode,
      partnerId: new ObjectId(),
      partnerName,
      deviceId: new ObjectId(),
      deviceSerial,
      packageType: packageType || "monthly",
      startDate: start,
      endDate: end,
      monthlyRentalFee: Number(monthlyFee || 15000000),
      depositAmount: Number(deposit || 30000000),
      paymentTerms: paymentTerms || "Thanh toán theo tháng",
      handoverDate: start,
      status: "active",
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await contractsCol.insertOne(newContract);

    // Update Device status in inventory to "rented"
    await devicesCol.updateOne(
      { serialNumber: deviceSerial },
      {
        $set: {
          currentStatus: "rented",
          location: `${partnerName}`,
          updatedAt: new Date(),
        },
      }
    );

    // Record Audit Log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "rental_contract",
      resourceId: contractCode,
      resourceLabel: `Hợp đồng thuê máy ${contractCode} (${partnerName})`,
      after: { contractCode, partnerName, deviceSerial, monthlyFee },
      request,
      status: "success",
    });

    return NextResponse.json({
      status: "success",
      message: "Rental contract created successfully",
      data: newContract,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create rental contract",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
