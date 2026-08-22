import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, RentalContract, Device, Partner } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { ObjectId, Filter } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    } else if (tab === "terminated") {
      filter.status = "terminated";
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

    return NextResponse.json(
      {
        status: "success",
        data: contracts.map((c) => ({
          id: c.contractCode,
          client: c.partnerName,
          facilityType:
            c.packageType === "monthly"
              ? "Phòng khám Tiêu chuẩn"
              : c.packageType === "long_term"
              ? "Bệnh viện Đa khoa"
              : "Khám Lưu động Sự kiện",
          device: c.deviceSerial,
          startDate: c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : "",
          endDate: c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "",
          returnDate: c.returnDate ? new Date(c.returnDate).toLocaleDateString("vi-VN") : null,
          monthlyFee: new Intl.NumberFormat("vi-VN").format(c.monthlyRentalFee) + " ₫",
          monthlyFeeRaw: c.monthlyRentalFee,
          depositAmount: c.depositAmount,
          status: c.status,
          statusLabel:
            c.status === "active"
              ? "Đang vận hành"
              : c.status === "expiring_soon"
              ? "Sắp hết hạn"
              : c.status === "completed"
              ? "Đã hoàn tất"
              : "Đã thanh lý",
          paymentTerms: c.paymentTerms,
          notes: c.notes,
          scansCount: 420,
        })),
        total: contracts.length,
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
        message: "Failed to fetch rental contracts",
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      partnerName,
      partnerId,
      partnerType,
      representativeName,
      phone,
      deliveryAddress,
      taxCode,
      deviceSerial,
      packageType,
      durationMonths,
      rentalFee,
      monthlyFee,
      depositAmount,
      deposit,
      startDate,
      endDate,
      paymentTerms,
      notes,
    } = body;

    if (!partnerName || !deviceSerial) {
      return NextResponse.json(
        { status: "error", message: "Vui lòng nhập tên Cơ sở / Bệnh viện và chọn số serial máy" },
        { status: 400 }
      );
    }

    const { createRentalContract } = await import("@/lib/actions/rentals");
    const result = await createRentalContract({
      partnerName,
      partnerId,
      partnerType,
      representativeName,
      phone,
      deliveryAddress,
      taxCode,
      deviceSerial,
      packageType,
      durationMonths,
      rentalFee,
      monthlyFee,
      depositAmount,
      deposit,
      startDate,
      endDate,
      paymentTerms,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { status: "error", message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: result.message,
      data: { contractCode: result.contractCode, contractId: result.contractId },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Lỗi xử lý tạo hợp đồng" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { contractCode, status, targetDeviceStatus, returnLocation, notes } = body;

    if (!contractCode || !status) {
      return NextResponse.json(
        { status: "error", message: "Thiếu mã hợp đồng hoặc trạng thái mới" },
        { status: 400 }
      );
    }

    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const contract = await contractsCol.findOne({ contractCode });
    if (!contract) {
      return NextResponse.json(
        { status: "error", message: `Không tìm thấy hợp đồng ${contractCode}` },
        { status: 404 }
      );
    }

    const previousStatus = contract.status;
    const now = new Date();
    const updateData: Partial<RentalContract> & { updatedAt: Date } = {
      status,
      updatedAt: now,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Handle contract completion or termination
    if (status === "completed" || status === "terminated") {
      updateData.returnDate = now;

      // Synchronize device status back to available or under_maintenance
      const nextDeviceStatus = targetDeviceStatus || "available";
      const nextLocation =
        returnLocation || "Kho Tổng Hà Nội (Tầng 1) — Sau kiểm tra hoàn tất hợp đồng";

      await devicesCol.updateOne(
        { serialNumber: contract.deviceSerial },
        {
          $set: {
            currentStatus: nextDeviceStatus,
            location: nextLocation,
            currentPartnerId: null,
            currentContractId: null,
            updatedAt: now,
          },
        }
      );
    } else if (status === "active") {
      // Re-activate contract and sync device to rented
      await devicesCol.updateOne(
        { serialNumber: contract.deviceSerial },
        {
          $set: {
            currentStatus: "rented",
            location: contract.partnerName,
            currentPartnerId: contract.partnerId,
            currentContractId: contract._id,
            updatedAt: now,
          },
        }
      );
    }

    await contractsCol.updateOne({ contractCode }, { $set: updateData });

    // Record Audit Log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "status_change",
      resource: "rental_contract",
      resourceId: contractCode,
      resourceLabel: `Cập nhật trạng thái hợp đồng ${contractCode} (${previousStatus} → ${status})`,
      before: { status: previousStatus },
      after: { status, targetDeviceStatus: status === "completed" ? "available" : undefined },
      request,
      status: "success",
    });

    // Revalidate paths
    try {
      revalidatePath("/admin/thue-may");
      revalidatePath("/admin/leasing");
      revalidatePath("/admin/kho-thiet-bi");
      revalidatePath("/admin/inventory");
      revalidatePath("/admin");
    } catch {
      // Ignore during build/worker
    }

    return NextResponse.json({
      status: "success",
      message: `Cập nhật trạng thái hợp đồng ${contractCode} thành công và đã đồng bộ thiết bị ${contract.deviceSerial}`,
      data: {
        contractCode,
        previousStatus,
        newStatus: status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Lỗi cập nhật trạng thái hợp đồng",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
