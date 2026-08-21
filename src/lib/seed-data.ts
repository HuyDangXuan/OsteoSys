import { getDatabase, getCollection } from "./mongodb";
import {
  COLLECTIONS,
  Account,
  Device,
  Partner,
  RentalContract,
  RepairTicket,
  Lead,
  AuditLog,
} from "@/types/db";
import { initDatabaseIndexes } from "./init-db";
import { ObjectId } from "mongodb";

export async function seedDatabase() {
  console.log("🌱 [Seed] Initializing database indexes...");
  await initDatabaseIndexes();

  const db = await getDatabase();

  console.log("🌱 [Seed] Clearing existing collections for fresh dynamic demo data...");
  await db.collection(COLLECTIONS.ACCOUNTS).deleteMany({});
  await db.collection(COLLECTIONS.DEVICES).deleteMany({});
  await db.collection(COLLECTIONS.PARTNERS).deleteMany({});
  await db.collection(COLLECTIONS.RENTAL_CONTRACTS).deleteMany({});
  await db.collection(COLLECTIONS.REPAIR_TICKETS).deleteMany({});
  await db.collection(COLLECTIONS.LEADS).deleteMany({});
  await db.collection(COLLECTIONS.AUDIT_LOGS).deleteMany({});

  const now = new Date();

  // 1. Seed Accounts
  const accountsData: Account[] = [
    {
      _id: new ObjectId(),
      email: "admin@osteosys.vn",
      fullName: "BS. Nguyễn Trọng Hải",
      passwordHash: "demo_hash_admin_123",
      role: "super_admin",
      status: "active",
      phone: "0904 000 001",
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 15),
      createdAt: new Date("2026-01-01"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      email: "sales@osteosys.vn",
      fullName: "Trần Thị Mai (Kinh Doanh B2B)",
      passwordHash: "demo_hash_sales_123",
      role: "sales",
      status: "active",
      phone: "0904 000 002",
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdAt: new Date("2026-01-05"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      email: "kythuat@osteosys.vn",
      fullName: "Nguyễn Văn Tuấn (Kỹ Sư Y Sinh)",
      passwordHash: "demo_hash_tech_123",
      role: "technician",
      status: "active",
      phone: "0904 000 003",
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 45),
      createdAt: new Date("2026-01-10"),
      updatedAt: now,
    },
  ];
  await db.collection(COLLECTIONS.ACCOUNTS).insertMany(accountsData);

  // 2. Seed 15 Partners (Hospitals & Clinics)
  const partnersRaw = [
    {
      code: "PTR-001",
      name: "Bệnh viện Đa khoa Hồng Ngọc",
      type: "hospital" as const,
      taxCode: "0101438921",
      address: "55 Yên Ninh, Ba Đình",
      city: "Hà Nội",
      contactName: "BS. Nguyễn Văn Hùng (Trưởng khoa CĐHA)",
      phone: "024 3927 5568",
      email: "cdha@hongngochospital.vn",
      position: "Trưởng khoa Chẩn đoán Hình ảnh",
    },
    {
      code: "PTR-002",
      name: "Bệnh viện Đại học Y Dược TP.HCM",
      type: "hospital" as const,
      taxCode: "0303889123",
      address: "215 Hồng Bàng, Phường 11, Quận 5",
      city: "TP. Hồ Chí Minh",
      contactName: "PGS.TS. Trần Minh Đức",
      phone: "028 3855 4269",
      email: "bvdhyd@umc.edu.vn",
      position: "Phó Giám Đốc Chuyên Môn",
    },
    {
      code: "PTR-003",
      name: "Hệ thống Y tế Medlatec",
      type: "clinic" as const,
      taxCode: "0102458999",
      address: "42 Nghĩa Dũng, Ba Đình",
      city: "Hà Nội",
      contactName: "KTV. Lê Thu Trang",
      phone: "1900 56 56 56",
      email: "thutrang.le@medlatec.com",
      position: "Trưởng nhóm Kỹ thuật Xét nghiệm & CĐHA",
    },
    {
      code: "PTR-004",
      name: "Bệnh viện Đa khoa Quốc tế Vinmec Central Park",
      type: "hospital" as const,
      taxCode: "0107293847",
      address: "208 Nguyễn Hữu Cảnh, Bình Thạnh",
      city: "TP. Hồ Chí Minh",
      contactName: "BS. Hoàng Quốc Dũng",
      phone: "028 3622 1166",
      email: "info.cp@vinmec.com",
      position: "Bác sĩ Chuyên khoa Cơ Xương Khớp",
    },
    {
      code: "PTR-005",
      name: "Bệnh viện Hữu nghị Việt Đức",
      type: "hospital" as const,
      taxCode: "0100109923",
      address: "40 Tràng Thi, Hoàn Kiếm",
      city: "Hà Nội",
      contactName: "TS.BS. Đặng Vũ Hải",
      phone: "024 3825 3531",
      email: "bvvd@vietduchospital.edu.vn",
      position: "Trưởng khoa Phục hồi Chức năng",
    },
    {
      code: "PTR-006",
      name: "Bệnh viện Chợ Rẫy",
      type: "hospital" as const,
      taxCode: "0301129934",
      address: "201B Nguyễn Chí Thanh, Quận 5",
      city: "TP. Hồ Chí Minh",
      contactName: "BS.CKII. Phạm Gia Luật",
      phone: "028 3855 4137",
      email: "choray@choray.vn",
      position: "Khoa Khám Xuất Cảnh & Tầm Soát",
    },
    {
      code: "PTR-007",
      name: "Phòng khám Đa khoa Tâm Anh",
      type: "clinic" as const,
      taxCode: "0104889211",
      address: "108 Hoàng Như Tiếp, Long Biên",
      city: "Hà Nội",
      contactName: "BS. Vũ Tuyết Mai",
      phone: "024 7106 6858",
      email: "cskh@tamanhhospital.vn",
      position: "Phụ trách Khu Khám Lưu Động",
    },
    {
      code: "PTR-008",
      name: "Bệnh viện Đa khoa Quốc tế Thu Cúc",
      type: "hospital" as const,
      taxCode: "0105342111",
      address: "286 Thụy Khuê, Tây Hồ",
      city: "Hà Nội",
      contactName: "KTV. Bùi Đình Quân",
      phone: "0936 388 288",
      email: "contact@thucuchospital.vn",
      position: "Quản lý Trang thiết bị Y tế",
    },
    {
      code: "PTR-009",
      name: "Bệnh viện Thống Nhất TP.HCM",
      type: "hospital" as const,
      taxCode: "0301458922",
      address: "1 Lý Thường Kiệt, Phường 7, Tân Bình",
      city: "TP. Hồ Chí Minh",
      contactName: "BS.CKI. Nguyễn Thành Nam",
      phone: "028 3864 2142",
      email: "thongnhathospital@gov.vn",
      position: "Khoa Lão khoa & Xương khớp",
    },
    {
      code: "PTR-010",
      name: "Phòng khám Cơ Xương Khớp Việt Đức",
      type: "clinic" as const,
      taxCode: "0108992341",
      address: "12 Chu Văn An, Hà Đông",
      city: "Hà Nội",
      contactName: "BS. Lê Quang Minh",
      phone: "0912 345 678",
      email: "pk.vietduc@gmail.com",
      position: "Giám đốc Phòng khám",
    },
    {
      code: "PTR-011",
      name: "Bệnh viện Hoàn Mỹ Sài Gòn",
      type: "hospital" as const,
      taxCode: "0302334455",
      address: "60-60A Phan Xích Long, Phú Nhuận",
      city: "TP. Hồ Chí Minh",
      contactName: "KTV. Đỗ Thị Thu",
      phone: "028 3990 2468",
      email: "hoanmy@hoanmy.com",
      position: "Phụ trách Thiết bị Y sinh",
    },
    {
      code: "PTR-012",
      name: "Bệnh viện Đa khoa Đà Nẵng",
      type: "hospital" as const,
      taxCode: "0400123984",
      address: "124 Hải Phòng, Thạch Thang",
      city: "Đà Nẵng",
      contactName: "BS. Huỳnh Văn Hải",
      phone: "0236 382 1118",
      email: "bvdakhoadn@danang.gov.vn",
      position: "Trưởng khoa Thăm dò Chức năng",
    },
    {
      code: "PTR-013",
      name: "Phòng khám Đa khoa Hùng Vương",
      type: "clinic" as const,
      taxCode: "2600892341",
      address: "Thị xã Đoan Hùng",
      city: "Phú Thọ",
      contactName: "BS. Nguyễn Văn Quyết",
      phone: "0969 888 115",
      email: "hungvuongclinic@gmail.com",
      position: "Trưởng đoàn Khám Sức Khỏe",
    },
    {
      code: "PTR-014",
      name: "Bệnh viện Đa khoa Becamex",
      type: "hospital" as const,
      taxCode: "3702123490",
      address: "Đại lộ Bình Dương, Thuận An",
      city: "Bình Dương",
      contactName: "BS. Phan Văn Trọng",
      phone: "0274 3681 681",
      email: "becamex@bih.vn",
      position: "Khoa Nội Cơ Xương Khớp",
    },
    {
      code: "PTR-015",
      name: "Tập đoàn Vingroup (Khám Đoàn)",
      type: "enterprise" as const,
      taxCode: "0101245486",
      address: "Số 7 Bằng Lăng 1, Vinhomes Riverside",
      city: "Hà Nội",
      contactName: "Bà Đặng Phương Mai",
      phone: "024 3974 9999",
      email: "phuongmai@vingroup.net",
      position: "Trưởng ban Y tế & Phúc lợi Doanh nghiệp",
    },
  ];

  const partners: Partner[] = partnersRaw.map((p, idx) => ({
    _id: new ObjectId(),
    code: p.code,
    name: p.name,
    type: p.type,
    taxCode: p.taxCode,
    address: p.address,
    city: p.city,
    primaryContact: {
      name: p.contactName,
      phone: p.phone,
      email: p.email,
      position: p.position,
    },
    activeContractsCount: idx < 6 ? 2 : idx < 12 ? 1 : 0,
    devicesCount: idx < 6 ? 2 : idx < 12 ? 1 : 0,
    status: "active",
    createdAt: new Date(Date.now() - (30 - idx) * 86400000),
    updatedAt: now,
  }));
  await db.collection(COLLECTIONS.PARTNERS).insertMany(partners);

  // 3. Seed 48 Sonost 3000 / Sonost 3000 PRO Devices
  const devices: Device[] = [];
  for (let i = 1; i <= 48; i++) {
    const padded = String(i).padStart(2, "0");
    const serialNumber = `OST-3000-88${padded}`;
    const model = i % 2 === 0 ? "Sonost 3000 PRO" : "Sonost 3000";
    const yearManufactured = 2023 + (i % 4);

    let currentStatus: Device["currentStatus"] = "available";
    let location = i <= 24 ? "Kho Tổng Hà Nội (Tầng 1)" : "Kho Tổng TP.HCM (Quận 10)";
    let currentPartnerId: ObjectId | null = null;

    if (i <= 28) {
      currentStatus = "rented";
      const p = partners[(i - 1) % partners.length];
      currentPartnerId = p._id!;
      location = `${p.name} — ${p.city}`;
    } else if (i <= 42) {
      currentStatus = "available";
    } else if (i <= 45) {
      currentStatus = "under_maintenance";
      location = "Phòng Kiểm Chuẩn Kỹ Thuật (Hà Nội)";
    } else {
      currentStatus = "repairing";
      location = "Xưởng Sửa Chữa Thiết Bị Y Sinh (TP.HCM)";
    }

    const lastCalibDays = 10 + ((i * 7) % 60);
    const lastDate = new Date(Date.now() - lastCalibDays * 86400000);
    const nextDueDate = new Date(lastDate.getTime() + 90 * 86400000);

    devices.push({
      _id: new ObjectId(),
      serialNumber,
      model,
      yearManufactured,
      currentStatus,
      location,
      currentPartnerId,
      calibration: {
        lastDate,
        nextDueDate,
        qcResult: currentStatus === "under_maintenance" ? "warning" : "passed",
        phantomCv: Number((0.6 + (i % 7) * 0.1).toFixed(2)),
        calibratedBy: "Kỹ sư Nguyễn Văn Tuấn",
      },
      totalScansCount: 450 + i * 135,
      accessoriesIncluded: ["Bóng dầu Silicone", "Khối chuẩn Phantom Hologic", "Dây nguồn AC", "Cáp in nhiệt"],
      notes: currentStatus === "repairing" ? "Đang chờ thay màng bóng dầu silicon" : undefined,
      createdAt: new Date(Date.now() - (180 - i) * 86400000),
      updatedAt: now,
    });
  }
  await db.collection(COLLECTIONS.DEVICES).insertMany(devices);

  // 4. Seed 12 Rental Contracts
  const rentalContracts: RentalContract[] = [
    {
      _id: new ObjectId(),
      contractCode: "HD-2026-088",
      partnerId: partners[0]._id!,
      partnerName: partners[0].name,
      deviceId: devices[0]._id!,
      deviceSerial: devices[0].serialNumber,
      packageType: "monthly",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-07-15"),
      monthlyRentalFee: 15000000,
      depositAmount: 30000000,
      paymentTerms: "Thanh toán theo quý (3 tháng/lần)",
      handoverDate: new Date("2026-01-15"),
      status: "active",
      createdAt: new Date("2026-01-10"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      contractCode: "HD-2026-089",
      partnerId: partners[1]._id!,
      partnerName: partners[1].name,
      deviceId: devices[1]._id!,
      deviceSerial: devices[1].serialNumber,
      packageType: "long_term",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-09-01"),
      monthlyRentalFee: 13500000,
      depositAmount: 25000000,
      paymentTerms: "Hợp đồng 12 tháng, thanh toán hàng tháng",
      handoverDate: new Date("2025-09-01"),
      status: "active",
      createdAt: new Date("2025-08-25"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      contractCode: "HD-2026-090",
      partnerId: partners[2]._id!,
      partnerName: partners[2].name,
      deviceId: devices[2]._id!,
      deviceSerial: devices[2].serialNumber,
      packageType: "monthly",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-08-31"),
      monthlyRentalFee: 15000000,
      depositAmount: 30000000,
      paymentTerms: "Thanh toán từng tháng",
      handoverDate: new Date("2026-03-01"),
      status: "expiring_soon",
      createdAt: new Date("2026-02-20"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      contractCode: "HD-2026-091",
      partnerId: partners[3]._id!,
      partnerName: partners[3].name,
      deviceId: devices[3]._id!,
      deviceSerial: devices[3].serialNumber,
      packageType: "long_term",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-11-01"),
      monthlyRentalFee: 13500000,
      depositAmount: 30000000,
      paymentTerms: "Hợp đồng 12 tháng có kỹ thuật viên kèm máy",
      handoverDate: new Date("2025-11-01"),
      status: "active",
      createdAt: new Date("2025-10-25"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      contractCode: "HD-2026-092",
      partnerId: partners[4]._id!,
      partnerName: partners[4].name,
      deviceId: devices[4]._id!,
      deviceSerial: devices[4].serialNumber,
      packageType: "daily_event",
      startDate: new Date("2026-08-20"),
      endDate: new Date("2026-08-25"),
      monthlyRentalFee: 1500000,
      depositAmount: 10000000,
      paymentTerms: "Thanh toán ngay khi bàn giao",
      handoverDate: new Date("2026-08-20"),
      status: "active",
      createdAt: new Date("2026-08-18"),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      contractCode: "HD-2026-093",
      partnerId: partners[5]._id!,
      partnerName: partners[5].name,
      deviceId: devices[5]._id!,
      deviceSerial: devices[5].serialNumber,
      packageType: "monthly",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-08-28"),
      monthlyRentalFee: 15000000,
      depositAmount: 30000000,
      paymentTerms: "Thanh toán theo tháng",
      handoverDate: new Date("2026-02-01"),
      status: "expiring_soon",
      createdAt: new Date("2026-01-25"),
      updatedAt: now,
    },
  ];
  await db.collection(COLLECTIONS.RENTAL_CONTRACTS).insertMany(rentalContracts);

  // 5. Seed 8 Repair & Calibration Tickets
  const repairTickets: RepairTicket[] = [
    {
      _id: new ObjectId(),
      ticketCode: "REP-2026-041",
      deviceSource: "client_sent",
      deviceId: devices[45]._id,
      deviceSerial: devices[45].serialNumber,
      partnerName: "Bệnh viện Hữu nghị Việt Đức",
      priority: "urgent",
      reportedIssue: "Đầu dò siêu âm gót chân báo lỗi Ultrasound Timeout, kết quả BUA nhảy thất thường",
      diagnosis: "Hỏng cáp đồng trục tín hiệu đầu dò 0.5MHz bên trái và rách viền màng dầu",
      partsReplaced: [
        { partName: "Cụm đầu dò phát siêu âm 0.5MHz Sonost", partNumber: "OST-PRB-05M", cost: 8500000, warrantyMonths: 12 },
        { partName: "Màng bóng dầu Silicon kháng khuẩn", partNumber: "OST-PAD-SIL", cost: 1200000, warrantyMonths: 6 },
      ],
      technicianName: "Nguyễn Văn Tuấn (Kỹ Sư Y Sinh)",
      estimatedCompletionDate: new Date(Date.now() + 86400000 * 2),
      totalCost: 9700000,
      status: "in_progress",
      timeline: [
        { status: "received", note: "Tiếp nhận máy từ đại diện BV Việt Đức", updatedBy: "KTV Mai", timestamp: new Date(Date.now() - 86400000 * 2) },
        { status: "diagnosing", note: "Đo xung áp phát hiện suy hao 45% tại đầu dò phát", updatedBy: "KS Tuấn", timestamp: new Date(Date.now() - 86400000) },
        { status: "in_progress", note: "Đã tháo lắp đầu dò mới, đang hàn cố định jack kết nối", updatedBy: "KS Tuấn", timestamp: now },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      ticketCode: "REP-2026-042",
      deviceSource: "warehouse_inventory",
      deviceId: devices[46]._id,
      deviceSerial: devices[46].serialNumber,
      partnerName: "Kho Tổng Hà Nội",
      priority: "calibration",
      reportedIssue: "Hiệu chuẩn định kỳ 3 tháng bằng Phantom Hologic chuẩn",
      diagnosis: "Sai số SOS lệch +1.8% so với chuẩn khuyến cáo ISCD",
      partsReplaced: [],
      technicianName: "BS. Nguyễn Trọng Hải",
      estimatedCompletionDate: new Date(Date.now() + 86400000),
      totalCost: 0,
      status: "calibrating",
      timeline: [
        { status: "received", note: "Đưa máy vào phòng hiệu chuẩn y sinh", updatedBy: "BS Hải", timestamp: new Date(Date.now() - 86400000) },
        { status: "calibrating", note: "Thực hiện chuỗi 10 lần đo với Phantom chuẩn 1540 m/s", updatedBy: "BS Hải", timestamp: now },
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      ticketCode: "REP-2026-043",
      deviceSource: "client_sent",
      deviceId: devices[47]._id,
      deviceSerial: devices[47].serialNumber,
      partnerName: "Phòng khám Đa khoa Medlatec",
      priority: "normal",
      reportedIssue: "Kẹt dao cắt tự động máy in nhiệt 58mm tích hợp",
      diagnosis: "Mòn bánh răng mô tơ kéo giấy in nhiệt",
      partsReplaced: [
        { partName: "Mô tơ kéo giấy in nhiệt 58mm Sonost", partNumber: "OST-PRT-58M", cost: 1800000, warrantyMonths: 6 },
      ],
      technicianName: "Nguyễn Văn Tuấn",
      totalCost: 1800000,
      status: "parts_waiting",
      timeline: [
        { status: "received", note: "Tiếp nhận máy tại trung tâm kỹ thuật", updatedBy: "KTV Mai", timestamp: new Date(Date.now() - 86400000 * 3) },
        { status: "parts_waiting", note: "Đang chờ nhập linh kiện từ kho tổng", updatedBy: "KS Tuấn", timestamp: new Date(Date.now() - 86400000) },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: now,
    },
  ];
  await db.collection(COLLECTIONS.REPAIR_TICKETS).insertMany(repairTickets);

  // 6. Seed 6 Leads
  const leads: Lead[] = [
    {
      _id: new ObjectId(),
      facilityName: "Bệnh viện Đa khoa Quốc tế Bắc Hà",
      contactPerson: "BS. Phạm Thu Hương",
      phone: "0912 888 999",
      email: "thuhuong@bachahospital.vn",
      serviceInterested: "rental",
      estimatedScans: "300-1000 ca/tháng",
      location: "Hà Nội",
      notes: "Cần thuê gấp 02 máy Sonost 3000 PRO cho gói khám sức khỏe cơ quan tháng 9",
      status: "qualified",
      createdAt: new Date(Date.now() - 86400000 * 1),
      updatedAt: now,
    },
    {
      _id: new ObjectId(),
      facilityName: "Phòng khám Chuyên khoa Khớp An Bình",
      contactPerson: "BS. Lê Hoàng Long",
      phone: "0908 777 666",
      email: "pk.anbinh@gmail.com",
      serviceInterested: "buy",
      estimatedScans: "100-300 ca/tháng",
      location: "TP.HCM",
      notes: "Xin báo giá mua đứt máy Sonost 3000 kèm chuyển giao công nghệ",
      status: "new",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: now,
    },
  ];
  await db.collection(COLLECTIONS.LEADS).insertMany(leads);

  // 7. Seed Initial Audit Logs
  const auditLogs: AuditLog[] = [
    {
      _id: new ObjectId(),
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "rental_contract",
      resourceId: "HD-2026-088",
      resourceLabel: "Hợp đồng thuê máy #HD-2026-088 (BV Hồng Ngọc)",
      details: {
        after: { contractCode: "HD-2026-088", partner: "Bệnh viện Đa khoa Hồng Ngọc", monthlyRentalFee: 15000000 },
      },
      status: "success",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      _id: new ObjectId(),
      actor: { email: "kythuat@osteosys.vn", fullName: "Nguyễn Văn Tuấn", role: "technician" },
      action: "update",
      resource: "repair_ticket",
      resourceId: "REP-2026-041",
      resourceLabel: "Phiếu sửa chữa #REP-2026-041 (BV Việt Đức)",
      details: {
        before: { status: "diagnosing" },
        after: { status: "in_progress" },
        diff: { status: { from: "diagnosing", to: "in_progress" } },
      },
      status: "success",
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
  ];
  await db.collection(COLLECTIONS.AUDIT_LOGS).insertMany(auditLogs);

  console.log("✅ [Seed] Successfully seeded dynamic database data for OsteoSys Sonost 3000!");
  return {
    accountsCount: accountsData.length,
    partnersCount: partners.length,
    devicesCount: devices.length,
    contractsCount: rentalContracts.length,
    ticketsCount: repairTickets.length,
    leadsCount: leads.length,
    auditLogsCount: auditLogs.length,
  };
}
