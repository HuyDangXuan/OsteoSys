"use server";

import { revalidatePath } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Partner, RentalContract, RepairTicket, PartnerType } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import {
  createPartnerSchema,
  updatePartnerSchema,
  CreatePartnerInput,
  UpdatePartnerInput,
} from "@/lib/schemas/partner-schema";
import { ObjectId, Filter } from "mongodb";

export interface PartnerQueryOptions {
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PartnerListItem {
  id: string;
  code: string;
  name: string;
  type: PartnerType;
  typeLabel: string;
  taxCode?: string;
  address: string;
  city: string;
  contactPerson: string;
  phone: string;
  email?: string;
  position: string;
  activeRentals: number;
  totalContracts: number;
  totalRepairs: number;
  status: "active" | "inactive";
  statusLabel: string;
  notes?: string;
  createdAt: string;
}

export interface PartnerDetailResult {
  partner: PartnerListItem;
  metrics: {
    activeRentalsCount: number;
    totalContractsCount: number;
    totalRepairsCount: number;
    totalRentalSpending: number;
    formattedRentalSpending: string;
    totalRepairSpending: number;
    formattedRepairSpending: string;
    totalLifetimeValue: number;
    formattedLifetimeValue: string;
  };
  contracts: Array<{
    id: string;
    contractCode: string;
    deviceSerial: string;
    packageType: string;
    packageTypeLabel: string;
    startDate: string;
    endDate: string;
    monthlyFee: number;
    formattedMonthlyFee: string;
    deposit: number;
    status: string;
    statusLabel: string;
  }>;
  repairs: Array<{
    id: string;
    ticketCode: string;
    deviceSerial: string;
    priority: string;
    priorityLabel: string;
    reportedIssue: string;
    diagnosis?: string;
    technicianName?: string;
    totalCost: number;
    formattedCost: string;
    status: string;
    statusLabel: string;
    createdAt: string;
  }>;
}

const PARTNER_TYPE_LABELS: Record<string, string> = {
  general_hospital: "Bệnh viện Đa khoa",
  specialist_hospital: "Bệnh viện Chuyên khoa",
  general_clinic: "Phòng khám Đa khoa",
  specialist_clinic: "Phòng khám Chuyên khoa",
  mobile_screening: "Đoàn khám Lưu động / Sự kiện",
  doctor_private: "Bác sĩ / Phòng mạch Tư nhân",
  hospital: "Bệnh viện Đa khoa",
  clinic: "Phòng khám Chuyên khoa",
  enterprise: "Doanh nghiệp / Khám đoàn",
  doctor: "Bác sĩ / Chuyên gia Y tế",
  individual: "Khách hàng Cá nhân",
};

/**
 * 1. getPartners: Fetch paginated, searchable and filtered partner list
 */
export async function getPartners(
  options: PartnerQueryOptions = {}
): Promise<{ partners: PartnerListItem[]; total: number; page: number; totalPages: number }> {
  try {
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const repairsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);

    const {
      search = "",
      type = "all",
      status = "all",
      page = 1,
      limit = 50,
      sortBy = "code",
      sortOrder = "asc",
    } = options;

    const filter: Filter<Partner> = {};

    if (type !== "all") {
      filter.type = type as Partner["type"];
    }

    if (status !== "all") {
      filter.status = status as Partner["status"];
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { code: searchRegex },
        { name: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { "primaryContact.name": searchRegex },
        { "primaryContact.phone": searchRegex },
        { "primaryContact.email": searchRegex },
        { taxCode: searchRegex },
      ];
    }

    const total = await partnersCol.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (Math.max(1, page) - 1) * limit;

    const sortOption: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "desc" ? -1 : 1,
    };

    const rawPartners = await partnersCol.find(filter).sort(sortOption).skip(skip).limit(limit).toArray();

    // Fetch dynamic counts per partner for high accuracy
    const partnerIds = rawPartners.map((p) => p._id).filter(Boolean);

    const [activeContractsList, totalContractsList, totalRepairsList] = await Promise.all([
      contractsCol
        .aggregate([
          { $match: { partnerId: { $in: partnerIds }, status: { $in: ["active", "expiring_soon"] } } },
          { $group: { _id: "$partnerId", count: { $sum: 1 } } },
        ])
        .toArray(),
      contractsCol
        .aggregate([
          { $match: { partnerId: { $in: partnerIds } } },
          { $group: { _id: "$partnerId", count: { $sum: 1 } } },
        ])
        .toArray(),
      repairsCol
        .aggregate([
          { $match: { partnerId: { $in: partnerIds } } },
          { $group: { _id: "$partnerId", count: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

    const activeMap = new Map(activeContractsList.map((item) => [String(item._id), item.count]));
    const totalContractsMap = new Map(totalContractsList.map((item) => [String(item._id), item.count]));
    const totalRepairsMap = new Map(totalRepairsList.map((item) => [String(item._id), item.count]));

    const partners: PartnerListItem[] = rawPartners.map((p) => {
      const pIdStr = p._id?.toString() || "";
      const activeRentals = activeMap.get(pIdStr) ?? p.activeContractsCount ?? 0;
      const totalContracts = totalContractsMap.get(pIdStr) ?? activeRentals;
      const totalRepairs = totalRepairsMap.get(pIdStr) ?? 0;

      return {
        id: p._id?.toString() || p.code,
        code: p.code,
        name: p.name,
        type: p.type || "clinic",
        typeLabel: PARTNER_TYPE_LABELS[p.type] || "Cơ sở Y tế",
        taxCode: p.taxCode,
        address: `${p.address}, ${p.city}`,
        city: p.city || "Hà Nội",
        contactPerson: p.primaryContact?.name || "Đại diện cơ sở",
        phone: p.primaryContact?.phone || "",
        email: p.primaryContact?.email,
        position: p.primaryContact?.position || "Phụ trách Thiết bị",
        activeRentals,
        totalContracts,
        totalRepairs,
        status: p.status || "active",
        statusLabel: p.status === "active" ? "Đang hợp tác" : "Tạm ngừng",
        notes: p.notes,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    return { partners, total, page, totalPages };
  } catch (error) {
    console.error("Error in getPartners Server Action:", error);
    return { partners: [], total: 0, page: 1, totalPages: 1 };
  }
}

/**
 * 2. getPartnerDetail: Complete corporate/clinic dossier with full historical rental contracts & repair tickets
 */
export async function getPartnerDetail(idOrCode: string): Promise<PartnerDetailResult | null> {
  try {
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const repairsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);

    let filter: Filter<Partner> = { code: idOrCode };
    if (ObjectId.isValid(idOrCode)) {
      filter = { $or: [{ _id: new ObjectId(idOrCode) }, { code: idOrCode }] };
    }

    const partner = await partnersCol.findOne(filter);
    if (!partner) return null;

    const partnerId = partner._id;

    // Fetch all linked contracts
    const rawContracts = await contractsCol
      .find({
        $or: [{ partnerId }, { partnerName: partner.name }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all linked repair tickets
    const rawRepairs = await repairsCol
      .find({
        $or: [{ partnerId }, { partnerName: partner.name }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    let activeRentalsCount = 0;
    let totalRentalSpending = 0;
    let totalRepairSpending = 0;

    const contracts = rawContracts.map((c) => {
      const isActive = c.status === "active" || c.status === "expiring_soon";
      if (isActive) activeRentalsCount++;

      // Calculate approximate spending
      const fee = Number(c.monthlyRentalFee || 0);
      totalRentalSpending += fee;

      let packageTypeLabel = "Theo tháng";
      if (c.packageType === "long_term") packageTypeLabel = "Dài hạn (Bệnh viện)";
      else if (c.packageType === "daily_event") packageTypeLabel = "Khám đoàn / Sự kiện";

      let statusLabel = "Đang chạy";
      if (c.status === "expiring_soon") statusLabel = "Sắp hết hạn";
      else if (c.status === "completed") statusLabel = "Đã hoàn tất";
      else if (c.status === "terminated") statusLabel = "Đã chấm dứt";
      else if (c.status === "draft") statusLabel = "Bản nháp";

      return {
        id: c._id?.toString() || c.contractCode,
        contractCode: c.contractCode,
        deviceSerial: c.deviceSerial,
        packageType: c.packageType || "monthly",
        packageTypeLabel,
        startDate: c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : "",
        endDate: c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "",
        monthlyFee: fee,
        formattedMonthlyFee: new Intl.NumberFormat("vi-VN").format(fee) + " ₫",
        deposit: Number(c.depositAmount || 0),
        status: c.status,
        statusLabel,
      };
    });

    const repairs = rawRepairs.map((r) => {
      const cost = Number(r.totalCost || 0);
      totalRepairSpending += cost;

      let priorityLabel = "Bình thường";
      if (r.priority === "urgent") priorityLabel = "Khẩn cấp";
      else if (r.priority === "calibration") priorityLabel = "Kiểm chuẩn định kỳ";

      let statusLabel = "Tiếp nhận";
      if (r.status === "in_progress") statusLabel = "Đang sửa chữa";
      else if (r.status === "qc_passed") statusLabel = "QC đạt chuẩn";
      else if (r.status === "delivered") statusLabel = "Đã bàn giao";

      return {
        id: r._id?.toString() || r.ticketCode,
        ticketCode: r.ticketCode,
        deviceSerial: r.deviceSerial,
        priority: r.priority,
        priorityLabel,
        reportedIssue: r.reportedIssue,
        diagnosis: r.diagnosis,
        technicianName: r.technicianName,
        totalCost: cost,
        formattedCost: new Intl.NumberFormat("vi-VN").format(cost) + " ₫",
        status: r.status,
        statusLabel,
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "",
      };
    });

    const totalLifetimeValue = totalRentalSpending + totalRepairSpending;

    const partnerFormatted: PartnerListItem = {
      id: partner._id?.toString() || partner.code,
      code: partner.code,
      name: partner.name,
      type: partner.type || "clinic",
      typeLabel: PARTNER_TYPE_LABELS[partner.type] || "Cơ sở Y tế",
      taxCode: partner.taxCode,
      address: `${partner.address}, ${partner.city}`,
      city: partner.city || "Hà Nội",
      contactPerson: partner.primaryContact?.name || "Đại diện cơ sở",
      phone: partner.primaryContact?.phone || "",
      email: partner.primaryContact?.email,
      position: partner.primaryContact?.position || "Phụ trách Thiết bị",
      activeRentals: activeRentalsCount,
      totalContracts: contracts.length,
      totalRepairs: repairs.length,
      status: partner.status || "active",
      statusLabel: partner.status === "active" ? "Đang hợp tác" : "Tạm ngừng",
      notes: partner.notes,
      createdAt: partner.createdAt ? new Date(partner.createdAt).toISOString() : new Date().toISOString(),
    };

    return {
      partner: partnerFormatted,
      metrics: {
        activeRentalsCount,
        totalContractsCount: contracts.length,
        totalRepairsCount: repairs.length,
        totalRentalSpending,
        formattedRentalSpending: new Intl.NumberFormat("vi-VN").format(totalRentalSpending) + " ₫",
        totalRepairSpending,
        formattedRepairSpending: new Intl.NumberFormat("vi-VN").format(totalRepairSpending) + " ₫",
        totalLifetimeValue,
        formattedLifetimeValue: new Intl.NumberFormat("vi-VN").format(totalLifetimeValue) + " ₫",
      },
      contracts,
      repairs,
    };
  } catch (error) {
    console.error("Error in getPartnerDetail Server Action:", error);
    return null;
  }
}

/**
 * 3. createPartner: Manually create new partner with Zod validation
 */
export async function createPartner(rawInput: CreatePartnerInput) {
  try {
    const validated = createPartnerSchema.parse(rawInput);
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);

    // Check duplicate phone or tax code
    if (validated.primaryContact.phone) {
      const existingPhone = await partnersCol.findOne({
        "primaryContact.phone": validated.primaryContact.phone.trim(),
      });
      if (existingPhone) {
        return {
          success: false,
          message: `Số điện thoại ${validated.primaryContact.phone} đã thuộc về đối tác "${existingPhone.name}" (${existingPhone.code}).`,
        };
      }
    }

    const count = await partnersCol.countDocuments();
    const code = `PTR-${String(count + 1).padStart(3, "0")}`;
    const now = new Date();

    const newPartner: Partner = {
      _id: new ObjectId(),
      code,
      name: validated.name.trim(),
      type: validated.type,
      taxCode: validated.taxCode?.trim() || undefined,
      address: validated.address.trim(),
      city: validated.city.trim(),
      primaryContact: {
        name: validated.primaryContact.name.trim(),
        phone: validated.primaryContact.phone.trim(),
        email: validated.primaryContact.email?.trim() || undefined,
        position: validated.primaryContact.position?.trim() || "Phụ trách Thiết bị Y tế",
      },
      activeContractsCount: 0,
      devicesCount: 0,
      status: validated.status,
      notes: validated.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    await partnersCol.insertOne(newPartner);

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "partner",
      resourceId: code,
      resourceLabel: `Thêm mới đối tác y tế: ${newPartner.name} (${code})`,
      after: { code, name: newPartner.name, type: newPartner.type, phone: newPartner.primaryContact.phone },
      status: "success",
    });

    revalidatePath("/admin/khach-hang");
    revalidatePath("/admin/partners");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã thêm thành công đối tác "${newPartner.name}" (${code})!`,
      data: { code },
    };
  } catch (error) {
    console.error("Error in createPartner Server Action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi thêm đối tác mới.",
    };
  }
}

/**
 * 4. updatePartner: Updates partner information with Before / After snapshot
 */
export async function updatePartner(idOrCode: string, rawInput: UpdatePartnerInput) {
  try {
    const validated = updatePartnerSchema.parse(rawInput);
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);

    let filter: Filter<Partner> = { code: idOrCode };
    if (ObjectId.isValid(idOrCode)) {
      filter = { $or: [{ _id: new ObjectId(idOrCode) }, { code: idOrCode }] };
    }

    const existing = await partnersCol.findOne(filter);
    if (!existing) {
      return { success: false, message: `Không tìm thấy đối tác ${idOrCode}` };
    }

    const now = new Date();
    const updateDoc: Partial<Partner> & { updatedAt: Date } = {
      updatedAt: now,
    };

    if (validated.name) updateDoc.name = validated.name.trim();
    if (validated.type) updateDoc.type = validated.type;
    if (validated.taxCode !== undefined) updateDoc.taxCode = validated.taxCode.trim() || undefined;
    if (validated.address) updateDoc.address = validated.address.trim();
    if (validated.city) updateDoc.city = validated.city.trim();
    if (validated.status) updateDoc.status = validated.status;
    if (validated.notes !== undefined) updateDoc.notes = validated.notes.trim();

    if (validated.primaryContact) {
      updateDoc.primaryContact = {
        name: validated.primaryContact.name?.trim() || existing.primaryContact?.name || "",
        phone: validated.primaryContact.phone?.trim() || existing.primaryContact?.phone || "",
        email: validated.primaryContact.email?.trim() || existing.primaryContact?.email,
        position: validated.primaryContact.position?.trim() || existing.primaryContact?.position || "",
      };
    }

    await partnersCol.updateOne({ _id: existing._id }, { $set: updateDoc });

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "update",
      resource: "partner",
      resourceId: existing.code,
      resourceLabel: `Cập nhật thông tin đối tác ${existing.name} (${existing.code})`,
      before: { name: existing.name, primaryContact: existing.primaryContact },
      after: { name: updateDoc.name || existing.name, primaryContact: updateDoc.primaryContact || existing.primaryContact },
      status: "success",
    });

    revalidatePath("/admin/khach-hang");
    revalidatePath(`/admin/khach-hang/${existing.code}`);
    revalidatePath(`/admin/khach-hang/${existing._id}`);
    revalidatePath("/admin/partners");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Cập nhật thông tin đối tác ${existing.name} thành công!`,
    };
  } catch (error) {
    console.error("Error in updatePartner Server Action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi cập nhật đối tác.",
    };
  }
}

/**
 * 5. togglePartnerStatus: Toggle active / inactive status
 */
export async function togglePartnerStatus(idOrCode: string) {
  try {
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);

    let filter: Filter<Partner> = { code: idOrCode };
    if (ObjectId.isValid(idOrCode)) {
      filter = { $or: [{ _id: new ObjectId(idOrCode) }, { code: idOrCode }] };
    }

    const partner = await partnersCol.findOne(filter);
    if (!partner) {
      return { success: false, message: `Không tìm thấy đối tác ${idOrCode}` };
    }

    const newStatus: Partner["status"] = partner.status === "active" ? "inactive" : "active";

    await partnersCol.updateOne({ _id: partner._id }, { $set: { status: newStatus, updatedAt: new Date() } });

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "status_change",
      resource: "partner",
      resourceId: partner.code,
      resourceLabel: `Chuyển trạng thái đối tác ${partner.name}: ${partner.status} → ${newStatus}`,
      before: { status: partner.status },
      after: { status: newStatus },
      status: "success",
    });

    revalidatePath("/admin/khach-hang");
    revalidatePath(`/admin/khach-hang/${partner.code}`);
    revalidatePath("/admin/partners");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã đổi trạng thái đối tác sang: ${newStatus === "active" ? "Đang hợp tác" : "Tạm ngừng"}.`,
      newStatus,
    };
  } catch (error) {
    console.error("Error in togglePartnerStatus:", error);
    return { success: false, message: "Lỗi chuyển đổi trạng thái đối tác." };
  }
}

/**
 * 6. deletePartner: Data Integrity-enforced Deletion
 * - Checks active rental contracts and ongoing repair tickets
 * - Blocks delete if active contracts or ongoing repairs exist
 * - Supports soft-delete toggle to inactive
 */
export async function deletePartner(
  idOrCode: string,
  mode: "soft" | "hard" = "soft"
): Promise<{ success: boolean; message: string; mode?: "soft" | "hard" }> {
  try {
    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);
    const repairsCol = await getCollection<RepairTicket>(COLLECTIONS.REPAIR_TICKETS);

    let filter: Filter<Partner> = { code: idOrCode };
    if (ObjectId.isValid(idOrCode)) {
      filter = { $or: [{ _id: new ObjectId(idOrCode) }, { code: idOrCode }] };
    }

    const partner = await partnersCol.findOne(filter);
    if (!partner) {
      return { success: false, message: `Không tìm thấy đối tác ${idOrCode}` };
    }

    const partnerId = partner._id;

    // 1. Strict Business Rule: Check for active contracts
    const activeContracts = await contractsCol.countDocuments({
      $or: [{ partnerId }, { partnerName: partner.name }],
      status: { $in: ["active", "expiring_soon"] },
    });

    if (activeContracts > 0) {
      return {
        success: false,
        message: `Ràng buộc an toàn: Không thể xóa đối tác "${partner.name}" vì đang có ${activeContracts} hợp đồng thuê máy Sonost 3000 đang hiệu lực. Vui lòng thanh lý hoặc kết thúc hợp đồng trước.`,
      };
    }

    // 2. Check for active repair tickets
    const activeRepairs = await repairsCol.countDocuments({
      $or: [{ partnerId }, { partnerName: partner.name }],
      status: { $nin: ["delivered", "cancelled"] },
    });

    if (activeRepairs > 0) {
      return {
        success: false,
        message: `Ràng buộc an toàn: Không thể xóa đối tác "${partner.name}" vì đang có ${activeRepairs} phiếu sửa chữa kỹ thuật chưa bàn giao.`,
      };
    }

    // 3. Check for total historical records
    const totalContracts = await contractsCol.countDocuments({
      $or: [{ partnerId }, { partnerName: partner.name }],
    });
    const totalRepairs = await repairsCol.countDocuments({
      $or: [{ partnerId }, { partnerName: partner.name }],
    });
    const hasHistory = totalContracts > 0 || totalRepairs > 0;

    // 4. If has historical linkage and hard delete requested -> reject hard delete
    if (hasHistory && mode === "hard") {
      return {
        success: false,
        message: `Không thể xóa vĩnh viễn (Hard Delete) đối tác "${partner.name}" vì có ${totalContracts} hợp đồng và ${totalRepairs} đơn sửa chữa trong lịch sử lưu trữ. Hãy chuyển sang "Tạm ngừng hợp tác" (Soft Delete) để bảo toàn chứng từ kế toán.`,
      };
    }

    // 5. Soft Delete
    if (mode === "soft" || hasHistory) {
      await partnersCol.updateOne({ _id: partner._id }, { $set: { status: "inactive", updatedAt: new Date() } });

      await recordAuditLog({
        actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
        action: "delete",
        resource: "partner",
        resourceId: partner.code,
        resourceLabel: `Ngừng hợp tác đối tác ${partner.name} (Soft Delete)`,
        before: { status: partner.status },
        after: { status: "inactive" },
        status: "success",
      });

      revalidatePath("/admin/khach-hang");
      revalidatePath("/admin/partners");
      revalidatePath("/admin");

      return {
        success: true,
        mode: "soft",
        message: `Đã chuyển đối tác "${partner.name}" sang trạng thái "Tạm ngừng hợp tác" (Soft Delete). Toàn bộ lịch sử hợp đồng và sửa chữa vẫn được lưu trữ an toàn.`,
      };
    }

    // 6. Hard Delete (only if 0 records)
    await partnersCol.deleteOne({ _id: partner._id });

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "delete",
      resource: "partner",
      resourceId: partner.code,
      resourceLabel: `Xóa vĩnh viễn đối tác tạo nhầm ${partner.name} (Hard Delete)`,
      before: { code: partner.code, name: partner.name },
      status: "success",
    });

    revalidatePath("/admin/khach-hang");
    revalidatePath("/admin/partners");
    revalidatePath("/admin");

    return {
      success: true,
      mode: "hard",
      message: `Đã xóa vĩnh viễn đối tác "${partner.name}" khỏi hệ thống MongoDB.`,
    };
  } catch (error) {
    console.error("Error in deletePartner Server Action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi xử lý xóa đối tác.",
    };
  }
}
