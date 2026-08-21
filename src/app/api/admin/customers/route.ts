import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Partner } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { ObjectId, Filter } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";

    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);
    const filter: Filter<Partner> = {};

    if (type !== "all") {
      filter.type = type as Partner["type"];
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { code: searchRegex },
        { name: searchRegex },
        { address: searchRegex },
        { "primaryContact.name": searchRegex },
        { "primaryContact.phone": searchRegex },
      ];
    }

    const partners = await partnersCol.find(filter).sort({ code: 1 }).toArray();

    return NextResponse.json({
      status: "success",
      data: partners.map((p) => ({
        id: p.code,
        name: p.name,
        type:
          p.type === "hospital"
            ? "Bệnh viện Đa khoa"
            : p.type === "clinic"
            ? "Phòng khám Đa khoa"
            : p.type === "enterprise"
            ? "Doanh nghiệp / Khám đoàn"
            : "Bác sĩ / Cá nhân",
        contactPerson: `${p.primaryContact?.name || ""} (${p.primaryContact?.position || "Phụ trách"})`,
        phone: p.primaryContact?.phone || "",
        email: p.primaryContact?.email || "",
        address: `${p.address}, ${p.city}`,
        activeRentals: p.activeContractsCount || 0,
        devices: p.devicesCount > 0 ? `Sonost 3000 (${p.devicesCount} máy)` : "Chưa có thiết bị",
      })),
      total: partners.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch customers",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, taxCode, address, city, contactName, phone, email, position } = body;

    if (!name || !phone) {
      return NextResponse.json({ status: "error", message: "Missing required fields" }, { status: 400 });
    }

    const partnersCol = await getCollection<Partner>(COLLECTIONS.PARTNERS);
    const count = await partnersCol.countDocuments();
    const code = `PTR-${String(count + 1).padStart(3, "0")}`;

    const newPartner: Partner = {
      _id: new ObjectId(),
      code,
      name,
      type: type || "clinic",
      taxCode,
      address: address || "",
      city: city || "Hà Nội",
      primaryContact: {
        name: contactName || "Đại diện cơ sở",
        phone,
        email,
        position: position || "Phụ trách trang thiết bị",
      },
      activeContractsCount: 0,
      devicesCount: 0,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await partnersCol.insertOne(newPartner);

    await recordAuditLog({
      actor: { email: "admin@osteosys.vn", fullName: "BS. Nguyễn Trọng Hải", role: "super_admin" },
      action: "create",
      resource: "partner",
      resourceId: code,
      resourceLabel: `Khách hàng mới ${name}`,
      after: { code, name, phone },
      request,
      status: "success",
    });

    return NextResponse.json({
      status: "success",
      message: "Partner created successfully",
      data: newPartner,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create partner",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
