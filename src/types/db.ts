import { ObjectId } from "mongodb";

// Collection Names
export const COLLECTIONS = {
  ACCOUNTS: "accounts",
  DEVICES: "devices",
  LEADS: "leads",
  PARTNERS: "partners",
  RENTAL_CONTRACTS: "rental_contracts",
  REPAIR_TICKETS: "repair_tickets",
  AUDIT_LOGS: "audit_logs",
  CMS_CONTENTS: "cms_contents",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// 1. Account Model
export type AccountRole = "super_admin" | "sales" | "technician" | "support";
export type AccountStatus = "active" | "pending" | "suspended";

export interface AccountAppeal {
  note: string;
  contactPhone?: string;
  contactEmail?: string;
  submittedAt: Date;
  resolved?: boolean;
}

export interface Account {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  clinicName?: string;
  avatarUrl?: string;
  role: AccountRole;
  status: AccountStatus;
  suspensionReason?: string | null;
  suspendedAt?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  failedLoginAttempts?: number;
  appealNotes?: AccountAppeal[];
  refreshToken?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Device Model (Sonost 3000 Inventory)
export type DeviceModel = "Sonost 3000" | "Sonost 3000 PRO";
export type DeviceStatus =
  | "available"
  | "rented"
  | "under_maintenance"
  | "repairing"
  | "decommissioned";

export interface DeviceCalibration {
  lastDate: Date;
  nextDueDate: Date;
  certifiedBy: string; // Tên kỹ sư/đơn vị kiểm chuẩn
  certificateNumber?: string; // Số tem / số biên bản kiểm định
  iscdStandard: boolean; // Đạt chuẩn ISCD/WHO (true/false)
  qcResult?: "passed" | "warning" | "failed";
  phantomCv?: number; // Coefficient of Variation, e.g., 0.8%
  calibratedBy?: string; // Backward compatible alias for certifiedBy
  certificateUrl?: string;
  certifyingBody?: string;
  notes?: string; // Ghi chú tình trạng đầu dò/kết quả test
}

export interface Device {
  _id?: ObjectId;
  serialNumber: string; // Unique, e.g. "OST-3000-8842"
  model: DeviceModel;
  yearManufactured: number;
  currentStatus: DeviceStatus;
  location: string; // Warehouse or Hospital/Clinic Name
  probeType?: string;
  purchaseDate?: Date;
  createdBy?: ObjectId | null; // ID người nhập kho / tạo bản ghi
  createdByName?: string | null; // Snapshot tên người nhập kho
  currentPartnerId?: ObjectId | null;
  currentContractId?: ObjectId | null;
  calibration: DeviceCalibration;
  totalScansCount: number;
  accessories?: string[]; // Danh sách phụ kiện đi kèm thực tế được chọn
  accessoriesIncluded: string[]; // e.g. ["Bóng dầu Silicone tiếp xúc", "Khối Phantom Hologic kiểm chuẩn"]
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Lead Model (Inquiries & Consultations)
export type ServiceInterested = "buy" | "rental" | "repair" | "supplies";
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "contract_pending"
  | "closed_won"
  | "closed_lost";

export interface Lead {
  _id?: ObjectId;
  facilityName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  serviceInterested: ServiceInterested;
  estimatedScans?: string;
  location?: string;
  notes?: string;
  status: LeadStatus;
  assignedTo?: ObjectId | null; // AccountId of sales rep
  estimatedValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

// 4. Partner Model (Clinics, Hospitals, Doctors, Enterprises)
export type PartnerType =
  | "general_hospital"
  | "specialist_hospital"
  | "general_clinic"
  | "specialist_clinic"
  | "mobile_screening"
  | "doctor_private"
  | "hospital"
  | "clinic"
  | "enterprise"
  | "doctor"
  | "individual";

export type PartnerStatus = "active" | "inactive";

export interface PartnerContact {
  name: string;
  phone: string;
  email?: string;
  position?: string;
}

export interface Partner {
  _id?: ObjectId;
  code: string; // Unique Partner Code, e.g. "PTR-001"
  name: string;
  type: PartnerType;
  taxCode?: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  primaryContact: PartnerContact;
  activeContractsCount: number;
  devicesCount: number;
  status: PartnerStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 5. Rental Contract Model
export type RentalPackageType = "daily" | "monthly" | "long_term" | "daily_event";
export type RentalContractStatus =
  | "draft"
  | "active"
  | "expiring_soon"
  | "overdue"
  | "completed"
  | "cancelled"
  | "terminated";

export interface RentalContract {
  _id?: ObjectId;
  contractCode: string; // Unique, e.g. "HD-2026-089"
  partnerId: ObjectId;
  partnerName: string;
  partnerType?: string;
  contactPerson?: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryAddress?: string;
  deviceId: ObjectId;
  deviceSerial: string;
  packageType: RentalPackageType;
  startDate: Date;
  endDate: Date;
  rentalFee?: number; // Đơn giá thuê (VNĐ)
  monthlyRentalFee: number; // Backward compatibility alias
  depositAmount: number; // Tiền cọc thiết bị
  paymentTerms: string;
  handoverDate?: Date | null;
  returnDate?: Date | null;
  status: RentalContractStatus;
  signedDocUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 6. Repair Ticket Model
export type DeviceSource = "client_sent" | "warehouse_inventory";
export type RepairPriority = "urgent" | "calibration" | "normal" | "low";
export type RepairTicketStatus =
  | "received"
  | "diagnosing"
  | "parts_waiting"
  | "in_progress"
  | "calibrating"
  | "qc_passed"
  | "delivered"
  | "archived"
  | "cancelled";

export interface ReplacedPart {
  partName: string;
  partNumber?: string;
  cost: number;
  warrantyMonths: number;
}

export interface RepairTimelineEntry {
  status: RepairTicketStatus;
  note: string;
  updatedBy: string; // Name or Email of technician
  timestamp: Date;
}

export interface RepairTicket {
  _id?: ObjectId;
  ticketCode: string; // Unique, e.g. "REP-2026-042"
  deviceSource: DeviceSource;
  deviceId?: ObjectId | null;
  deviceSerial: string;
  partnerId?: ObjectId | null;
  partnerName: string;
  priority: RepairPriority;
  reportedIssue: string;
  diagnosis?: string;
  partsReplaced: ReplacedPart[];
  technicianId?: ObjectId | null;
  technicianName?: string;
  estimatedCompletionDate?: Date | null;
  actualCompletionDate?: Date | null;
  totalCost: number;
  status: RepairTicketStatus;
  timeline: RepairTimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// 7. Audit Log Model
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "calibrate"
  | "status_change"
  | "system_init";

export type AuditResource =
  | "account"
  | "device"
  | "lead"
  | "partner"
  | "rental_contract"
  | "repair_ticket"
  | "system";

export interface AuditActor {
  accountId?: string;
  email: string;
  fullName?: string;
  role?: string;
}

export interface AuditDetails {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  diff?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  _id?: ObjectId;
  actor: AuditActor;
  action: AuditAction | string;
  resource: AuditResource | string;
  resourceId?: string;
  resourceLabel?: string;
  details?: AuditDetails;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  errorMessage?: string;
  createdAt: Date;
}

// 8. CMS Content Model
export type CmsSectionKey =
  | "global"
  | "home_hero"
  | "sonost_specs"
  | "rental_packages"
  | "repair_services"
  | "faqs"
  | "clinical_evidence";

export interface CmsContent {
  _id?: ObjectId;
  sectionKey: CmsSectionKey;
  title: string;
  data: Record<string, any>;
  lastUpdatedBy: {
    accountId: string;
    fullName: string;
  };
  updatedAt: Date;
  createdAt: Date;
}

