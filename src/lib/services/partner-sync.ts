import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Partner, PartnerType } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { ObjectId } from "mongodb";

export interface FindOrCreatePartnerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  taxCode?: string;
  type?: PartnerType;
  contactPerson?: string;
  position?: string;
  notes?: string;
}

export interface PartnerSyncResult {
  partnerId: ObjectId;
  partnerCode: string;
  partnerName: string;
  isNew: boolean;
  partner: Partner;
}

/**
 * Normalizes phone numbers for consistent deduplication (e.g. "+84 904 000 000" -> "0904000000")
 */
export function normalizePhoneNumber(rawPhone?: string): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/[\s\.\-\(\)]/g, "");
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length >= 11) {
    cleaned = "0" + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Intelligent classification of facility type based on business keywords
 */
export function detectPartnerType(name: string, explicitType?: PartnerType): PartnerType {
  if (explicitType) return explicitType;
  const lower = name.toLowerCase();
  if (
    lower.includes("chuyên khoa") &&
    (lower.includes("bệnh viện") || lower.includes("bv "))
  ) {
    return "specialist_hospital";
  }
  if (
    lower.includes("bệnh viện") ||
    lower.includes("bv ") ||
    lower.includes("hospital") ||
    lower.includes("viện ")
  ) {
    return "general_hospital";
  }
  if (
    lower.includes("chuyên khoa") ||
    lower.includes("sản") ||
    lower.includes("nhi") ||
    lower.includes("cơ xương khớp") ||
    lower.includes("xương khớp") ||
    lower.includes("tai mũi họng") ||
    lower.includes("mắt") ||
    lower.includes("da liễu")
  ) {
    return "specialist_clinic";
  }
  if (
    lower.includes("phòng khám") ||
    lower.includes("pk ") ||
    lower.includes("clinic") ||
    lower.includes("trung tâm y tế") ||
    lower.includes("ttyt")
  ) {
    return "general_clinic";
  }
  if (
    lower.includes("lưu động") ||
    lower.includes("khám đoàn") ||
    lower.includes("sự kiện") ||
    lower.includes("tầm soát") ||
    lower.includes("công ty") ||
    lower.includes("doanh nghiệp") ||
    lower.includes("tập đoàn") ||
    lower.includes("tổng công ty")
  ) {
    return "mobile_screening";
  }
  if (
    lower.includes("bs.") ||
    lower.includes("bác sĩ") ||
    lower.includes("thạc sĩ") ||
    lower.includes("tiến sĩ") ||
    lower.includes("pgs.") ||
    lower.includes("gs.") ||
    lower.includes("dr.") ||
    lower.includes("phòng mạch")
  ) {
    return "doctor_private";
  }
  return "general_clinic";
}

/**
 * Auto-Extraction & Sync Engine:
 * Finds an existing partner or atomically provisions a new partner record with audit logging.
 */
export async function findOrCreatePartner(
  input: FindOrCreatePartnerInput
): Promise<PartnerSyncResult> {
  const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);
  const trimmedName = input.name.trim();
  const normalizedPhone = normalizePhoneNumber(input.phone);
  const normalizedTax = input.taxCode?.trim();

  // 1. Search for existing partner by Phone, TaxCode, or Name
  const searchConditions: any[] = [];

  if (normalizedPhone) {
    searchConditions.push({ "primaryContact.phone": normalizedPhone });
    searchConditions.push({ "primaryContact.phone": input.phone?.trim() });
  }

  if (normalizedTax) {
    searchConditions.push({ taxCode: normalizedTax });
  }

  if (trimmedName) {
    searchConditions.push({ name: { $regex: `^${trimmedName}$`, $options: "i" } });
  }

  let existingPartner: Partner | null = null;
  if (searchConditions.length > 0) {
    existingPartner = await partnersCol.findOne({ $or: searchConditions });
  }

  const now = new Date();

  // 2. Existing Partner found -> Update additional info if provided
  if (existingPartner && existingPartner._id) {
    const updateFields: Partial<Partner> & { updatedAt: Date } = {
      updatedAt: now,
    };

    let hasUpdates = false;

    if (input.address && (!existingPartner.address || existingPartner.address === "Hà Nội")) {
      updateFields.address = input.address;
      hasUpdates = true;
    }
    if (input.city && (!existingPartner.city || existingPartner.city === "Hà Nội")) {
      updateFields.city = input.city;
      hasUpdates = true;
    }
    if (normalizedTax && !existingPartner.taxCode) {
      updateFields.taxCode = normalizedTax;
      hasUpdates = true;
    }
    if (input.email && !existingPartner.primaryContact?.email) {
      if (!updateFields.primaryContact) {
        updateFields.primaryContact = { ...existingPartner.primaryContact, email: input.email };
      } else {
        updateFields.primaryContact.email = input.email;
      }
      hasUpdates = true;
    }

    if (hasUpdates) {
      await partnersCol.updateOne({ _id: existingPartner._id }, { $set: updateFields });
    }

    return {
      partnerId: existingPartner._id,
      partnerCode: existingPartner.code,
      partnerName: existingPartner.name,
      isNew: false,
      partner: { ...existingPartner, ...updateFields },
    };
  }

  // 3. New Partner -> Generate Code and Insert
  const count = await partnersCol.countDocuments();
  const partnerCode = `PTR-${String(count + 1).padStart(3, "0")}`;
  const inferredType = detectPartnerType(trimmedName, input.type);

  const newPartnerDoc: Partner = {
    _id: new ObjectId(),
    code: partnerCode,
    name: trimmedName,
    type: inferredType,
    taxCode: normalizedTax || undefined,
    address: input.address?.trim() || "Cơ sở Y tế Khách hàng",
    city: input.city?.trim() || "Hà Nội",
    primaryContact: {
      name: input.contactPerson?.trim() || "Đại diện Cơ sở",
      phone: normalizedPhone || input.phone?.trim() || "0904000000",
      email: input.email?.trim() || undefined,
      position: input.position?.trim() || "Phụ trách Thiết bị Y tế",
    },
    activeContractsCount: 0,
    devicesCount: 0,
    status: "active",
    notes: input.notes?.trim() || `Tự động bóc tách từ giao dịch hệ thống ngày ${now.toLocaleDateString("vi-VN")}`,
    createdAt: now,
    updatedAt: now,
  };

  await partnersCol.insertOne(newPartnerDoc);

  // Record Audit Log for Auto Creation
  await recordAuditLog({
    actor: {
      email: "system@osteosys.vn",
      fullName: "Partner Auto-Extraction Engine",
      role: "super_admin",
    },
    action: "create",
    resource: "partner",
    resourceId: partnerCode,
    resourceLabel: `Tự động bóc tách & khởi tạo đối tác: ${trimmedName} (${partnerCode})`,
    after: {
      code: partnerCode,
      name: trimmedName,
      type: inferredType,
      phone: newPartnerDoc.primaryContact.phone,
    },
    status: "success",
  });

  return {
    partnerId: newPartnerDoc._id!,
    partnerCode: newPartnerDoc.code,
    partnerName: newPartnerDoc.name,
    isNew: true,
    partner: newPartnerDoc,
  };
}
