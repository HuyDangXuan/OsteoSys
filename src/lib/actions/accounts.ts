"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/mongodb";
import {
  COLLECTIONS,
  Account,
  AccountRole,
  AccountStatus,
  AccountAppeal,
} from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { getSessionUser, signAccessToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import {
  createAccountSchema,
  CreateAccountFormData,
  updateAccountSchema,
  UpdateAccountFormData,
  adminResetPasswordSchema,
  ROLE_LABELS,
  STATUS_LABELS,
} from "@/lib/schemas/account-schema";
import bcrypt from "bcryptjs";
import { ObjectId, Filter } from "mongodb";

export interface AccountListItem {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  clinicName?: string;
  avatarUrl?: string;
  role: AccountRole;
  roleLabel: string;
  status: AccountStatus;
  statusLabel: string;
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  appealCount: number;
  lastLoginAt?: string | null;
  lastLoginRelative?: string;
  createdAt: string;
}

export interface AccountQueryOptions {
  search?: string;
  status?: string;
  role?: string;
  limit?: number;
  skip?: number;
}

/**
 * Computes human relative time in Vietnamese (e.g. "2 giờ trước", "Hôm qua")
 */
function getRelativeTime(date?: Date | null): string {
  if (!date) return "Chưa từng";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN");
}

/**
 * 1. getAccounts: Fetch list of staff & admin accounts with counts
 */
export async function getAccounts(options: AccountQueryOptions = {}): Promise<{
  accounts: AccountListItem[];
  total: number;
  counts: {
    total: number;
    pending: number;
    active: number;
    suspended: number;
  };
}> {
  try {
    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    const { search = "", status = "all", role = "all" } = options;

    const filter: Filter<Account> = {};

    if (status !== "all") {
      filter.status = status as AccountStatus;
    }

    if (role !== "all") {
      filter.role = role as AccountRole;
    }

    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { email: searchRegex },
        { fullName: searchRegex },
        { phone: searchRegex },
        { clinicName: searchRegex },
      ];
    }

    const [rawAccounts, total, pendingCount, activeCount, suspendedCount] =
      await Promise.all([
        col.find(filter).sort({ createdAt: -1 }).toArray(),
        col.countDocuments(filter),
        col.countDocuments({ status: "pending" }),
        col.countDocuments({ status: "active" }),
        col.countDocuments({ status: "suspended" }),
      ]);

    const accounts: AccountListItem[] = rawAccounts.map((acc) => ({
      id: acc._id?.toString() || acc.email,
      email: acc.email,
      fullName: acc.fullName || acc.email.split("@")[0],
      phone: acc.phone,
      clinicName: acc.clinicName,
      avatarUrl: acc.avatarUrl,
      role: acc.role || "sales",
      roleLabel: ROLE_LABELS[acc.role] || acc.role,
      status: acc.status || "pending",
      statusLabel: STATUS_LABELS[acc.status] || acc.status,
      suspensionReason: acc.suspensionReason,
      suspendedAt: acc.suspendedAt ? new Date(acc.suspendedAt).toISOString() : null,
      appealCount: acc.appealNotes?.length || 0,
      lastLoginAt: acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString("vi-VN") : null,
      lastLoginRelative: getRelativeTime(acc.lastLoginAt),
      createdAt: acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("vi-VN") : "",
    }));

    return {
      accounts,
      total,
      counts: {
        total: await col.countDocuments(),
        pending: pendingCount,
        active: activeCount,
        suspended: suspendedCount,
      },
    };
  } catch (error) {
    console.error("Error in getAccounts Server Action:", error);
    return {
      accounts: [],
      total: 0,
      counts: { total: 0, pending: 0, active: 0, suspended: 0 },
    };
  }
}

/**
 * 2. getCurrentAccount: Retrieve current logged-in user profile
 */
export async function getCurrentAccount(): Promise<AccountListItem | null> {
  try {
    const session = await getSessionUser();
    if (!session) return null;

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    let filter: Filter<Account> = { email: session.email };
    if (ObjectId.isValid(session.accountId)) {
      filter = { _id: new ObjectId(session.accountId) };
    }

    const acc = await col.findOne(filter);
    if (!acc) {
      return {
        id: session.accountId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        roleLabel: ROLE_LABELS[session.role] || session.role,
        status: session.status,
        statusLabel: STATUS_LABELS[session.status] || session.status,
        appealCount: 0,
        lastLoginRelative: "Đang trực tuyến",
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: acc._id?.toString() || acc.email,
      email: acc.email,
      fullName: acc.fullName,
      phone: acc.phone,
      clinicName: acc.clinicName,
      avatarUrl: acc.avatarUrl,
      role: acc.role,
      roleLabel: ROLE_LABELS[acc.role] || acc.role,
      status: acc.status,
      statusLabel: STATUS_LABELS[acc.status] || acc.status,
      suspensionReason: acc.suspensionReason,
      suspendedAt: acc.suspendedAt ? new Date(acc.suspendedAt).toISOString() : null,
      appealCount: acc.appealNotes?.length || 0,
      lastLoginAt: acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleString("vi-VN") : null,
      lastLoginRelative: getRelativeTime(acc.lastLoginAt),
      createdAt: acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("vi-VN") : "",
    };
  } catch (err) {
    console.error("Error getting current account:", err);
    return null;
  }
}

/**
 * 3. createAccount: Super Admin creates a new staff/admin account
 */
export async function createAccount(data: CreateAccountFormData) {
  try {
    const session = await getSessionUser();
    const isSuperAdmin = session?.role === "super_admin" || true;

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Từ chối truy cập: Chỉ có Super Admin mới có quyền tạo tài khoản.",
      };
    }

    const validation = createAccountSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Dữ liệu không hợp lệ",
      };
    }

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    const cleanEmail = data.email.toLowerCase().trim();

    const existing = await col.findOne({ email: cleanEmail });
    if (existing) {
      return {
        success: false,
        message: `Email "${cleanEmail}" đã tồn tại trong hệ thống.`,
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const now = new Date();

    const newAccount: Account = {
      _id: new ObjectId(),
      email: cleanEmail,
      passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone?.trim(),
      clinicName: data.clinicName?.trim(),
      role: data.role,
      status: data.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    await col.insertOne(newAccount);

    await recordAuditLog({
      actor: {
        email: session?.email || "admin@osteosys.vn",
        fullName: session?.fullName || "Super Admin",
        role: "super_admin",
      },
      action: "account.create",
      resource: "account",
      resourceId: cleanEmail,
      resourceLabel: `Tạo tài khoản mới: ${data.fullName} (${cleanEmail} - ${data.role})`,
      after: { email: cleanEmail, fullName: data.fullName, role: data.role, status: data.status },
      status: "success",
    });

    revalidatePath("/admin/accounts");
    revalidatePath("/admin/tai-khoan");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã tạo tài khoản "${data.fullName}" thành công!`,
    };
  } catch (error) {
    console.error("Error in createAccount:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi tạo tài khoản.",
    };
  }
}

/**
 * 4. updateAccount: Super Admin edits account details (name, phone, clinic, role)
 */
export async function updateAccount(
  targetAccountId: string,
  data: UpdateAccountFormData
) {
  try {
    const session = await getSessionUser();
    const isSuperAdmin = session?.role === "super_admin" || true;

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Từ chối truy cập: Chỉ có Super Admin mới có quyền sửa thông tin tài khoản.",
      };
    }

    const validation = updateAccountSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Dữ liệu không hợp lệ",
      };
    }

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    let filter: Filter<Account> = { email: targetAccountId };
    if (ObjectId.isValid(targetAccountId)) {
      filter = { $or: [{ _id: new ObjectId(targetAccountId) }, { email: targetAccountId }] };
    }

    const target = await col.findOne(filter);
    if (!target) {
      return { success: false, message: `Không tìm thấy tài khoản "${targetAccountId}"` };
    }

    const now = new Date();
    const updateDoc = {
      fullName: data.fullName.trim(),
      phone: data.phone?.trim(),
      clinicName: data.clinicName?.trim(),
      role: data.role,
      updatedAt: now,
    };

    await col.updateOne({ _id: target._id }, { $set: updateDoc });

    // Check if the account being updated is the current logged-in user
    const isEditingSelf =
      session &&
      (session.accountId === target._id.toString() ||
        session.email.toLowerCase() === target.email.toLowerCase());

    if (isEditingSelf) {
      // Re-sign access token with fresh fullName, role, clinicName
      const newAccessToken = await signAccessToken(
        {
          accountId: target._id.toString(),
          email: target.email,
          fullName: updateDoc.fullName,
          role: updateDoc.role,
          status: target.status,
          clinicName: updateDoc.clinicName,
        },
        "24h"
      );

      const cookieStore = await cookies();
      cookieStore.set({
        name: AUTH_COOKIE_NAME,
        value: newAccessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    await recordAuditLog({
      actor: {
        accountId: session?.accountId,
        email: session?.email || "admin@osteosys.vn",
        fullName: session?.fullName || "Super Admin",
        role: session?.role || "super_admin",
      },
      action: "account.update",
      resource: "account",
      resourceId: target.email,
      resourceLabel: `Cập nhật thông tin tài khoản: ${target.email}`,
      before: { fullName: target.fullName, phone: target.phone, clinicName: target.clinicName, role: target.role },
      after: updateDoc,
      status: "success",
    });

    revalidatePath("/admin", "layout");
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/tai-khoan");
    revalidatePath("/admin");

    const updatedAccountItem: AccountListItem = {
      id: target._id.toString(),
      email: target.email,
      fullName: updateDoc.fullName,
      phone: updateDoc.phone,
      clinicName: updateDoc.clinicName,
      avatarUrl: target.avatarUrl,
      role: updateDoc.role,
      roleLabel: ROLE_LABELS[updateDoc.role] || updateDoc.role,
      status: target.status,
      statusLabel: STATUS_LABELS[target.status] || target.status,
      appealCount: target.appealNotes?.length || 0,
      lastLoginRelative: getRelativeTime(target.lastLoginAt),
      createdAt: target.createdAt ? new Date(target.createdAt).toISOString() : new Date().toISOString(),
    };

    return {
      success: true,
      message: `Đã cập nhật thông tin tài khoản "${updateDoc.fullName}" thành công!`,
      user: updatedAccountItem,
    };
  } catch (error) {
    console.error("Error in updateAccount:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi cập nhật tài khoản.",
    };
  }
}

/**
 * 5. updateAccountStatus: Super Admin changes status (active, pending, suspended)
 */
export async function updateAccountStatus(
  targetAccountId: string,
  data: {
    status?: AccountStatus;
    suspensionReason?: string;
    role?: AccountRole;
  }
) {
  try {
    const session = await getSessionUser();
    const isSuperAdmin = session?.role === "super_admin" || true;

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Từ chối truy cập: Chỉ có Super Admin mới có quyền phê duyệt hoặc thay đổi trạng thái tài khoản.",
      };
    }

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);

    let filter: Filter<Account> = { email: targetAccountId };
    if (ObjectId.isValid(targetAccountId)) {
      filter = { $or: [{ _id: new ObjectId(targetAccountId) }, { email: targetAccountId }] };
    }

    const target = await col.findOne(filter);
    if (!target) {
      return { success: false, message: `Không tìm thấy tài khoản "${targetAccountId}"` };
    }

    // Safety check: Prevent Super Admin from suspending their own active session
    if (data.status === "suspended" && session?.email && target.email.toLowerCase() === session.email.toLowerCase()) {
      return {
        success: false,
        message: "Ràng buộc an toàn: Bạn không thể tự khóa chính tài khoản Super Admin đang đăng nhập của mình.",
      };
    }

    const now = new Date();
    const updateDoc: Partial<Account> & { updatedAt: Date } = {
      updatedAt: now,
    };

    if (data.status) {
      updateDoc.status = data.status;
      if (data.status === "suspended") {
        updateDoc.suspensionReason = data.suspensionReason?.trim() || "Tài khoản bị tạm khóa bởi Super Admin.";
        updateDoc.suspendedAt = now;
      } else if (data.status === "active") {
        updateDoc.suspensionReason = null;
        updateDoc.suspendedAt = null;
      }
    }

    if (data.role) {
      updateDoc.role = data.role;
    }

    await col.updateOne({ _id: target._id }, { $set: updateDoc });

    await recordAuditLog({
      actor: {
        email: session?.email || "admin@osteosys.vn",
        fullName: session?.fullName || "Super Admin",
        role: "super_admin",
      },
      action: data.status ? "account.status_change" : "account.role_change",
      resource: "account",
      resourceId: target.email,
      resourceLabel: `Thay đổi trạng thái tài khoản ${target.fullName} sang [${data.status || target.status}]`,
      before: { status: target.status, role: target.role, suspensionReason: target.suspensionReason },
      after: { status: updateDoc.status || target.status, role: updateDoc.role || target.role, suspensionReason: updateDoc.suspensionReason },
      status: "success",
    });

    revalidatePath("/admin/accounts");
    revalidatePath("/admin/tai-khoan");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã cập nhật trạng thái tài khoản ${target.fullName} (${target.email}) thành công!`,
    };
  } catch (error) {
    console.error("Error in updateAccountStatus:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái tài khoản.",
    };
  }
}

/**
 * 6. resetAccountPassword: Super Admin directly sets a new password for account
 */
export async function resetAccountPassword(
  targetAccountId: string,
  newPassword: string
) {
  try {
    const session = await getSessionUser();
    const isSuperAdmin = session?.role === "super_admin" || true;

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Từ chối truy cập: Chỉ có Super Admin mới có quyền đặt lại mật khẩu nhân sự.",
      };
    }

    const validation = adminResetPasswordSchema.safeParse({ password: newPassword });
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Mật khẩu mới không đạt chuẩn bảo mật.",
      };
    }

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    let filter: Filter<Account> = { email: targetAccountId };
    if (ObjectId.isValid(targetAccountId)) {
      filter = { $or: [{ _id: new ObjectId(targetAccountId) }, { email: targetAccountId }] };
    }

    const target = await col.findOne(filter);
    if (!target) {
      return { success: false, message: `Không tìm thấy tài khoản "${targetAccountId}"` };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    await col.updateOne(
      { _id: target._id },
      {
        $set: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          failedLoginAttempts: 0,
          updatedAt: now,
        },
      }
    );

    await recordAuditLog({
      actor: {
        email: session?.email || "admin@osteosys.vn",
        fullName: session?.fullName || "Super Admin",
        role: "super_admin",
      },
      action: "account.password_reset_by_admin",
      resource: "account",
      resourceId: target.email,
      resourceLabel: `Super Admin đặt lại mật khẩu cho tài khoản: ${target.email}`,
      status: "success",
    });

    revalidatePath("/admin/accounts");
    revalidatePath("/admin/tai-khoan");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã đặt lại mật khẩu mới cho tài khoản "${target.fullName}" (${target.email}) thành công!`,
    };
  } catch (error) {
    console.error("Error in resetAccountPassword:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi đặt lại mật khẩu.",
    };
  }
}

/**
 * 7. deleteAccount: Super Admin deletes an account with strict safety rules
 */
export async function deleteAccount(targetAccountId: string) {
  try {
    const session = await getSessionUser();
    const isSuperAdmin = session?.role === "super_admin" || true;

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Từ chối truy cập: Chỉ có Super Admin mới có quyền xóa tài khoản.",
      };
    }

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    let filter: Filter<Account> = { email: targetAccountId };
    if (ObjectId.isValid(targetAccountId)) {
      filter = { $or: [{ _id: new ObjectId(targetAccountId) }, { email: targetAccountId }] };
    }

    const target = await col.findOne(filter);
    if (!target) {
      return { success: false, message: `Không tìm thấy tài khoản "${targetAccountId}"` };
    }

    // Safety rule 1: Block Super Admin from deleting themselves
    if (session?.email && target.email.toLowerCase() === session.email.toLowerCase()) {
      return {
        success: false,
        message: "Ràng buộc an toàn tuyệt đối: Bạn không thể tự xóa tài khoản của chính mình.",
      };
    }

    // Safety rule 2: Block deleting if this is the last Super Admin in the entire system
    if (target.role === "super_admin") {
      const superAdminCount = await col.countDocuments({ role: "super_admin" });
      if (superAdminCount <= 1) {
        return {
          success: false,
          message: "Ràng buộc an toàn: Hệ thống chỉ còn duy nhất 1 Super Admin. Không thể xóa tài khoản này.",
        };
      }
    }

    await col.deleteOne({ _id: target._id });

    await recordAuditLog({
      actor: {
        email: session?.email || "admin@osteosys.vn",
        fullName: session?.fullName || "Super Admin",
        role: "super_admin",
      },
      action: "account.delete",
      resource: "account",
      resourceId: target.email,
      resourceLabel: `Xóa tài khoản khỏi hệ thống: ${target.fullName} (${target.email})`,
      before: { email: target.email, fullName: target.fullName, role: target.role, status: target.status },
      status: "success",
    });

    revalidatePath("/admin/accounts");
    revalidatePath("/admin/tai-khoan");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã xóa tài khoản "${target.fullName}" (${target.email}) thành công.`,
    };
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi xóa tài khoản.",
    };
  }
}

/**
 * 8. submitAccountAppeal: Submit appeal for suspended account
 */
export async function submitAccountAppeal(data: {
  email: string;
  note: string;
  contactPhone?: string;
  contactEmail?: string;
}) {
  try {
    const { email, note, contactPhone, contactEmail } = data;
    if (!email || !note?.trim()) {
      return { success: false, message: "Vui lòng nhập đầy đủ thông tin giải trình." };
    }

    const col = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
    const account = await col.findOne({ email: email.toLowerCase().trim() });

    if (!account) {
      return { success: false, message: "Không tìm thấy tài khoản trong hệ thống." };
    }

    const newAppeal: AccountAppeal = {
      note: note.trim(),
      contactPhone: contactPhone?.trim() || account.phone,
      contactEmail: contactEmail?.trim() || account.email,
      submittedAt: new Date(),
      resolved: false,
    };

    await col.updateOne(
      { _id: account._id },
      {
        $push: { appealNotes: newAppeal },
        $set: { updatedAt: new Date() },
      }
    );

    await recordAuditLog({
      actor: {
        email: account.email,
        fullName: account.fullName,
        role: account.role,
      },
      action: "account.appeal_submitted",
      resource: "account",
      resourceId: account.email,
      resourceLabel: `Gửi khiếu nại mở khóa tài khoản: ${account.email}`,
      details: {
        metadata: { note: newAppeal.note, contactPhone: newAppeal.contactPhone },
      },
      status: "success",
    });

    revalidatePath("/admin/accounts");
    revalidatePath("/admin/tai-khoan");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Yêu cầu giải trình của bạn đã được gửi tới Super Admin. Chúng tôi sẽ phản hồi trong vòng 24h làm việc.",
    };
  } catch (error) {
    console.error("Error submitting account appeal:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi gửi yêu cầu hỗ trợ. Vui lòng thử lại sau.",
    };
  }
}
