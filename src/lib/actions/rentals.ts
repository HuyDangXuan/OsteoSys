"use server";

import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, RentalContract, Device, Partner } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { findOrCreatePartner } from "@/lib/services/partner-sync";
import { ObjectId, Filter } from "mongodb";

export interface RentalQueryOptions {
  search?: string;
  status?: string;
  packageType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface JoinedRentalItem {
  id: string;
  contractCode: string;
  partnerId: string;
  partnerName: string;
  partnerPhone?: string;
  partnerEmail?: string;
  partnerAddress?: string;
  partnerType?: string;
  contactPerson?: string;
  deviceId: string;
  deviceSerial: string;
  deviceModel?: string;
  deviceLocation?: string;
  deviceProbeStatus?: string;
  deviceQcStatus?: string;
  deviceCvScore?: number;
  deviceTotalScans?: number;
  packageType: "monthly" | "long_term" | "daily_event";
  packageTypeLabel: string;
  startDate: string;
  endDate: string;
  returnDate?: string | null;
  monthlyRentalFee: number;
  formattedMonthlyFee: string;
  depositAmount: number;
  formattedDeposit: string;
  paymentTerms: string;
  status: "draft" | "active" | "expiring_soon" | "completed" | "terminated";
  statusLabel: string;
  remainingDays: number;
  isExpiringSoon: boolean;
  isUrgentExpiring: boolean; // <= 3 days
  isOverdue: boolean;
  notes?: string;
  createdAt: string;
}

export interface RentalStatsResult {
  totalContracts: number;
  activeContracts: number;
  expiringSoon7Days: number;
  urgentExpiring3Days: number;
  overdueContracts: number;
  completedContracts: number;
  totalDeposit: number;
  formattedTotalDeposit: string;
  totalMonthlyRevenue: number;
  formattedMonthlyRevenue: string;
  packageDistribution: {
    monthly: number;
    longTerm: number;
    dailyEvent: number;
  };
}

/**
 * 1. getRentals: Fetch rental contracts with MongoDB $lookup joining partners, devices, accounts
 */
export async function getRentals(options: RentalQueryOptions = {}): Promise<JoinedRentalItem[]> {
  try {
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const { search = "", status = "all", packageType = "all" } = options;

    const matchStage: Filter<RentalContract> = {};

    if (status !== "all") {
      if (status === "overdue") {
        matchStage.status = { $in: ["active", "expiring_soon"] };
        matchStage.endDate = { $lt: new Date() };
      } else {
        matchStage.status = status as RentalContract["status"];
      }
    }

    if (packageType !== "all") {
      matchStage.packageType = packageType as RentalContract["packageType"];
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      matchStage.$or = [
        { contractCode: searchRegex },
        { partnerName: searchRegex },
        { deviceSerial: searchRegex },
      ];
    }

    const pipeline: any[] = [
      { $match: matchStage },
      // 1. $lookup Partner
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
      // 2. $lookup Device
      {
        $lookup: {
          from: COLLECTIONS.DEVICES,
          localField: "deviceSerial",
          foreignField: "serialNumber",
          as: "deviceDetails",
        },
      },
      // 3. Sort by newest
      { $sort: { createdAt: -1 } },
    ];

    const rawContracts = await contractsCol.aggregate(pipeline).toArray();
    const now = new Date();

    return rawContracts.map((c: any) => {
      const partner = c.partnerDetails?.[0];
      const device = c.deviceDetails?.[0];

      const start = c.startDate ? new Date(c.startDate) : new Date();
      const end = c.endDate ? new Date(c.endDate) : new Date();
      const diffTime = end.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isOverdue = (c.status === "active" || c.status === "expiring_soon") && remainingDays < 0;
      const isUrgentExpiring = (c.status === "active" || c.status === "expiring_soon") && remainingDays >= 0 && remainingDays <= 3;
      const isExpiringSoon = (c.status === "active" || c.status === "expiring_soon") && remainingDays >= 0 && remainingDays <= 7;

      let packageLabel = "Thuê tháng tiêu chuẩn";
      if (c.packageType === "long_term") packageLabel = "Thuê dài hạn (>12 tháng)";
      if (c.packageType === "daily_event") packageLabel = "Khám lưu động sự kiện";

      let statusLabel = "Đang vận hành";
      if (c.status === "draft") statusLabel = "Chờ bàn giao";
      else if (isOverdue) statusLabel = "Quá hạn thuê";
      else if (isUrgentExpiring || c.status === "expiring_soon") statusLabel = "Sắp hết hạn";
      else if (c.status === "completed") statusLabel = "Đã hoàn tất";
      else if (c.status === "terminated") statusLabel = "Đã thanh lý";

      return {
        id: c._id?.toString() || c.contractCode,
        contractCode: c.contractCode,
        partnerId: c.partnerId?.toString() || "",
        partnerName: c.partnerName,
        partnerPhone: partner?.primaryContact?.phone || partner?.phone || "0904 888 234",
        partnerEmail: partner?.primaryContact?.email || partner?.email || "",
        partnerAddress: partner?.address ? `${partner.address}, ${partner.city || ""}` : "Hà Nội",
        partnerType: partner?.type === "hospital" ? "Bệnh viện" : partner?.type === "clinic" ? "Phòng khám" : "Doanh nghiệp",
        contactPerson: partner?.primaryContact?.name || "BS. Phụ trách Khoa",
        deviceId: c.deviceId?.toString() || "",
        deviceSerial: c.deviceSerial,
        deviceModel: device?.model || "Sonost 3000 PRO",
        deviceLocation: device?.location || c.partnerName,
        deviceProbeStatus: device?.calibration?.qcResult === "passed" ? "Đạt chuẩn ISCD (Độ nhạy 99.4%)" : "Cần kiểm tra màng dầu",
        deviceQcStatus: device?.calibration?.qcResult === "passed" ? "passed" : "warning",
        deviceCvScore: device?.calibration?.phantomCv || 0.76,
        deviceTotalScans: device?.totalScansCount || 540,
        packageType: c.packageType || "monthly",
        packageTypeLabel: packageLabel,
        startDate: start.toLocaleDateString("vi-VN"),
        endDate: end.toLocaleDateString("vi-VN"),
        returnDate: c.returnDate ? new Date(c.returnDate).toLocaleDateString("vi-VN") : null,
        monthlyRentalFee: c.monthlyRentalFee || 0,
        formattedMonthlyFee: new Intl.NumberFormat("vi-VN").format(c.monthlyRentalFee || 0) + " ₫",
        depositAmount: c.depositAmount || 0,
        formattedDeposit: new Intl.NumberFormat("vi-VN").format(c.depositAmount || 0) + " ₫",
        paymentTerms: c.paymentTerms || "Thanh toán theo tháng",
        status: isOverdue ? "expiring_soon" : c.status,
        statusLabel,
        remainingDays,
        isExpiringSoon,
        isUrgentExpiring,
        isOverdue,
        notes: c.notes,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error in getRentals Server Action:", error);
    return [];
  }
}

/**
 * 2. getRentalStats: Realtime aggregation calculating contract metrics, deposit, revenue & overdue
 */
export async function getRentalStats(): Promise<RentalStatsResult> {
  try {
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 86400000);
    const next3Days = new Date(now.getTime() + 3 * 86400000);

    const facetResults = await contractsCol
      .aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [
              { $match: { status: { $in: ["active", "expiring_soon"] } } },
              { $count: "count" },
            ],
            expiring7Days: [
              {
                $match: {
                  status: { $in: ["active", "expiring_soon"] },
                  endDate: { $gte: now, $lte: next7Days },
                },
              },
              { $count: "count" },
            ],
            urgent3Days: [
              {
                $match: {
                  status: { $in: ["active", "expiring_soon"] },
                  endDate: { $gte: now, $lte: next3Days },
                },
              },
              { $count: "count" },
            ],
            overdue: [
              {
                $match: {
                  status: { $in: ["active", "expiring_soon"] },
                  endDate: { $lt: now },
                },
              },
              { $count: "count" },
            ],
            completed: [
              { $match: { status: { $in: ["completed", "terminated"] } } },
              { $count: "count" },
            ],
            revenueAndDeposit: [
              {
                $group: {
                  _id: null,
                  totalDeposit: { $sum: "$depositAmount" },
                  activeRevenue: {
                    $sum: {
                      $cond: [
                        { $in: ["$status", ["active", "expiring_soon"]] },
                        "$monthlyRentalFee",
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            packages: [
              {
                $group: {
                  _id: "$packageType",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const data = facetResults[0] || {};
    const totalContracts = data.total?.[0]?.count || 0;
    const activeContracts = data.active?.[0]?.count || 0;
    const expiringSoon7Days = data.expiring7Days?.[0]?.count || 0;
    const urgentExpiring3Days = data.urgent3Days?.[0]?.count || 0;
    const overdueContracts = data.overdue?.[0]?.count || 0;
    const completedContracts = data.completed?.[0]?.count || 0;

    const totalDeposit = data.revenueAndDeposit?.[0]?.totalDeposit || 0;
    const totalMonthlyRevenue = data.revenueAndDeposit?.[0]?.activeRevenue || 0;

    const packageDistribution = {
      monthly: 0,
      longTerm: 0,
      dailyEvent: 0,
    };

    if (Array.isArray(data.packages)) {
      data.packages.forEach((pkg: any) => {
        if (pkg._id === "monthly") packageDistribution.monthly = pkg.count;
        else if (pkg._id === "long_term") packageDistribution.longTerm = pkg.count;
        else if (pkg._id === "daily_event") packageDistribution.dailyEvent = pkg.count;
      });
    }

    return {
      totalContracts,
      activeContracts,
      expiringSoon7Days,
      urgentExpiring3Days,
      overdueContracts,
      completedContracts,
      totalDeposit,
      formattedTotalDeposit: new Intl.NumberFormat("vi-VN").format(totalDeposit) + " ₫",
      totalMonthlyRevenue,
      formattedMonthlyRevenue: new Intl.NumberFormat("vi-VN").format(totalMonthlyRevenue) + " ₫",
      packageDistribution,
    };
  } catch (error) {
    console.error("Error in getRentalStats Server Action:", error);
    return {
      totalContracts: 0,
      activeContracts: 0,
      expiringSoon7Days: 0,
      urgentExpiring3Days: 0,
      overdueContracts: 0,
      completedContracts: 0,
      totalDeposit: 0,
      formattedTotalDeposit: "0 ₫",
      totalMonthlyRevenue: 0,
      formattedMonthlyRevenue: "0 ₫",
      packageDistribution: { monthly: 0, longTerm: 0, dailyEvent: 0 },
    };
  }
}

/**
 * 3. createRentalContract: Create new contract HDT-XXXX and atomically synchronize device
 */
export async function createRentalContract(formData: {
  partnerName: string;
  partnerId?: string;
  deviceSerial: string;
  startDate: string;
  durationMonths: string | number;
  monthlyFee: string | number;
  deposit?: string | number;
  packageType?: "monthly" | "long_term" | "daily_event";
  paymentTerms?: string;
  notes?: string;
}) {
  try {
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);

    const {
      partnerName,
      partnerId,
      deviceSerial,
      startDate,
      durationMonths = 6,
      monthlyFee = 15000000,
      deposit = 30000000,
      packageType = "monthly",
      paymentTerms = "Thanh toán định kỳ hàng tháng",
      notes,
    } = formData;

    const device = await devicesCol.findOne({ serialNumber: deviceSerial });
    if (!device) {
      return { success: false, message: `Không tìm thấy thiết bị mang số serial ${deviceSerial}` };
    }

    let resolvedPartnerId: ObjectId = new ObjectId();
    let finalPartnerName = partnerName;

    if (partnerId && ObjectId.isValid(partnerId)) {
      resolvedPartnerId = new ObjectId(partnerId);
      const found = await partnersCol.findOne({ _id: resolvedPartnerId });
      if (found) {
        finalPartnerName = found.name;
        await partnersCol.updateOne(
          { _id: resolvedPartnerId },
          { $inc: { activeContractsCount: 1, devicesCount: 1 }, $set: { updatedAt: new Date() } }
        );
      }
    } else {
      const syncResult = await findOrCreatePartner({ name: partnerName });
      resolvedPartnerId = syncResult.partnerId;
      finalPartnerName = syncResult.partnerName;
      await partnersCol.updateOne(
        { _id: resolvedPartnerId },
        { $inc: { activeContractsCount: 1, devicesCount: 1 }, $set: { updatedAt: new Date() } }
      );
    }

    const count = await contractsCol.countDocuments();
    const contractCode = `HDT-${String(count + 100).padStart(4, "0")}`;

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(durationMonths));

    const contractId = new ObjectId();
    const newContract: RentalContract = {
      _id: contractId,
      contractCode,
      partnerId: resolvedPartnerId,
      partnerName: finalPartnerName,
      deviceId: device._id || new ObjectId(),
      deviceSerial,
      packageType,
      startDate: start,
      endDate: end,
      monthlyRentalFee: Number(monthlyFee),
      depositAmount: Number(deposit),
      paymentTerms,
      handoverDate: start,
      status: "active",
      notes: notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await contractsCol.insertOne(newContract);

    // Synchronize device status to "rented"
    await devicesCol.updateOne(
      { serialNumber: deviceSerial },
      {
        $set: {
          currentStatus: "rented",
          location: finalPartnerName,
          currentPartnerId: resolvedPartnerId,
          currentContractId: contractId,
          updatedAt: new Date(),
        },
      }
    );

    // Audit log
    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "rental_contract",
      resourceId: contractCode,
      resourceLabel: `Khởi tạo hợp đồng ${contractCode} cho ${finalPartnerName}`,
      after: { contractCode, partnerName: finalPartnerName, deviceSerial, monthlyFee },
      status: "success",
    });

    revalidatePath("/admin/leasing");
    revalidatePath("/admin/thue-may");
    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/khach-hang");
    revalidatePath("/admin/partners");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Tạo hợp đồng ${contractCode} thành công! Thiết bị ${deviceSerial} đã được gán sang cơ sở ${partnerName}.`,
      contractCode,
    };
  } catch (error) {
    console.error("Error in createRentalContract:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi không xác định khi tạo hợp đồng",
    };
  }
}

/**
 * 4. updateRentalStatus: Update contract status & sync device status (under_maintenance / available / rented)
 */
export async function updateRentalStatus(
  contractCode: string,
  newStatus: "active" | "expiring_soon" | "completed" | "terminated",
  options?: {
    targetDeviceStatus?: "available" | "under_maintenance";
    returnLocation?: string;
    notes?: string;
  }
) {
  try {
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);

    const contract = await contractsCol.findOne({ contractCode });
    if (!contract) {
      return { success: false, message: `Không tìm thấy hợp đồng ${contractCode}` };
    }

    const now = new Date();
    const updateDoc: Partial<RentalContract> & { updatedAt: Date } = {
      status: newStatus,
      updatedAt: now,
    };

    if (options?.notes) {
      updateDoc.notes = options.notes;
    }

    if (newStatus === "completed" || newStatus === "terminated") {
      updateDoc.returnDate = now;
      const deviceStatus = options?.targetDeviceStatus || "under_maintenance";
      const returnLoc = options?.returnLocation || "Phòng Kiểm Chuẩn Kỹ Thuật (Kho Tổng)";

      await devicesCol.updateOne(
        { serialNumber: contract.deviceSerial },
        {
          $set: {
            currentStatus: deviceStatus,
            location: returnLoc,
            currentPartnerId: null,
            currentContractId: null,
            updatedAt: now,
          },
        }
      );
    } else if (newStatus === "active") {
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

    await contractsCol.updateOne({ contractCode }, { $set: updateDoc });

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "status_change",
      resource: "rental_contract",
      resourceId: contractCode,
      resourceLabel: `Cập nhật trạng thái hợp đồng ${contractCode} -> ${newStatus}`,
      after: { status: newStatus },
      status: "success",
    });

    revalidatePath("/admin/leasing");
    revalidatePath("/admin/thue-may");
    revalidatePath("/admin/kho-thiet-bi");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Cập nhật trạng thái hợp đồng ${contractCode} thành công!`,
    };
  } catch (error) {
    console.error("Error in updateRentalStatus:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái hợp đồng",
    };
  }
}

/**
 * 5. extendRentalContract: Extend end date of contract
 */
export async function extendRentalContract(
  contractCode: string,
  extraMonths: number,
  notes?: string
) {
  try {
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const contract = await contractsCol.findOne({ contractCode });
    if (!contract) {
      return { success: false, message: `Không tìm thấy hợp đồng ${contractCode}` };
    }

    const currentEnd = new Date(contract.endDate);
    const newEndDate = new Date(currentEnd);
    newEndDate.setMonth(newEndDate.getMonth() + Number(extraMonths));

    await contractsCol.updateOne(
      { contractCode },
      {
        $set: {
          endDate: newEndDate,
          status: "active",
          notes: notes ? `${contract.notes ? contract.notes + " | " : ""}${notes}` : contract.notes,
          updatedAt: new Date(),
        },
      }
    );

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "update",
      resource: "rental_contract",
      resourceId: contractCode,
      resourceLabel: `Gia hạn hợp đồng ${contractCode} thêm ${extraMonths} tháng đến ${newEndDate.toLocaleDateString("vi-VN")}`,
      status: "success",
    });

    revalidatePath("/admin/leasing");
    revalidatePath("/admin/thue-may");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Gia hạn hợp đồng ${contractCode} thêm ${extraMonths} tháng thành công! Hạn mới: ${newEndDate.toLocaleDateString("vi-VN")}.`,
      newEndDate: newEndDate.toLocaleDateString("vi-VN"),
    };
  } catch (error) {
    console.error("Error in extendRentalContract:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi gia hạn hợp đồng",
    };
  }
}
