"use server";

import { cookies } from "next/headers";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Account } from "@/types/db";
import { recordAuditLog } from "@/lib/audit";
import { signAccessToken, AUTH_COOKIE_NAME, getSessionUser } from "@/lib/jwt";
import { findOrCreatePartner } from "@/lib/services/partner-sync";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ObjectId } from "mongodb";

/**
 * 1. loginUser: Real MongoDB + bcrypt + JWT login flow with strict status checking
 */
export async function loginUser(data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  try {
    const { email, password, rememberMe = false } = data;
    if (!email || !password) {
      return {
        success: false,
        message: "Vui lòng nhập đầy đủ email và mật khẩu.",
      };
    }

    const cleanEmail = email.toLowerCase().trim();
    const accountsCol = await getCollection<Account>(COLLECTIONS.ACCOUNTS);

    const account = await accountsCol.findOne({ email: cleanEmail });

    // Step 2 & 3: Credential verification
    if (!account) {
      // Demo fallback helper: if DB not seeded yet, check demo super admin
      if (cleanEmail === "admin@osteosys.vn" && password === "Admin@123") {
        const hashedPassword = await bcrypt.hash("Admin@123", 12);
        const newAdmin: Account = {
          _id: new ObjectId(),
          email: "admin@osteosys.vn",
          passwordHash: hashedPassword,
          fullName: "BS. Nguyễn Trọng Hải",
          phone: "0904888999",
          clinicName: "Trung tâm OsteoSys Việt Nam",
          role: "super_admin",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await accountsCol.insertOne(newAdmin);
        return performSuccessfulLogin(newAdmin, rememberMe);
      }

      await recordAuditLog({
        actor: { email: cleanEmail, fullName: "Khách chưa đăng nhập", role: "sales" },
        action: "auth.failed_login",
        resource: "account",
        resourceId: cleanEmail,
        resourceLabel: `Đăng nhập thất bại (Email không tồn tại): ${cleanEmail}`,
        status: "failure",
      });

      return {
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
      };
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      await accountsCol.updateOne(
        { _id: account._id },
        { $inc: { failedLoginAttempts: 1 }, $set: { updatedAt: new Date() } }
      );

      await recordAuditLog({
        actor: { email: account.email, fullName: account.fullName, role: account.role },
        action: "auth.failed_login",
        resource: "account",
        resourceId: account.email,
        resourceLabel: `Đăng nhập thất bại (Sai mật khẩu): ${account.email}`,
        status: "failure",
      });

      return {
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
      };
    }

    // Step 4: Check Account Status
    if (account.status === "pending") {
      await recordAuditLog({
        actor: { email: account.email, fullName: account.fullName, role: account.role },
        action: "auth.blocked_pending",
        resource: "account",
        resourceId: account.email,
        resourceLabel: `Chặn đăng nhập tài khoản chờ duyệt: ${account.email}`,
        status: "failure",
      });

      return {
        success: false,
        code: "ACCOUNT_PENDING",
        message: "Hồ sơ tài khoản của bạn đang trong quá trình xét duyệt thẩm định bởi Super Admin.",
        redirectUrl: "/pending-activation",
      };
    }

    if (account.status === "suspended") {
      await recordAuditLog({
        actor: { email: account.email, fullName: account.fullName, role: account.role },
        action: "auth.blocked_suspended",
        resource: "account",
        resourceId: account.email,
        resourceLabel: `Chặn đăng nhập tài khoản bị khóa: ${account.email}`,
        status: "failure",
      });

      return {
        success: false,
        code: "ACCOUNT_SUSPENDED",
        message: account.suspensionReason || "Tài khoản của đơn vị đã tạm ngưng hoạt động.",
        suspensionReason: account.suspensionReason,
        redirectUrl: `/suspended?email=${encodeURIComponent(account.email)}`,
      };
    }

    return performSuccessfulLogin(account, rememberMe);
  } catch (error) {
    console.error("Error in loginUser Server Action:", error);
    return {
      success: false,
      message: "Lỗi kết nối máy chủ xác thực. Vui lòng thử lại sau.",
    };
  }
}

async function performSuccessfulLogin(account: Account, rememberMe: boolean) {
  const accountsCol = await getCollection<Account>(COLLECTIONS.ACCOUNTS);
  const now = new Date();

  // Create JWT session token
  const token = await signAccessToken(
    {
      accountId: account._id?.toString() || account.email,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      status: account.status,
      clinicName: account.clinicName,
    },
    rememberMe ? "30d" : "24h"
  );

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
  });

  await accountsCol.updateOne(
    { _id: account._id },
    {
      $set: {
        lastLoginAt: now,
        failedLoginAttempts: 0,
        updatedAt: now,
      },
    }
  );

  await recordAuditLog({
    actor: { email: account.email, fullName: account.fullName, role: account.role },
    action: "auth.login",
    resource: "account",
    resourceId: account.email,
    resourceLabel: `Đăng nhập thành công: ${account.email} (${account.role})`,
    status: "success",
  });

  return {
    success: true,
    message: "Đăng nhập thành công!",
    user: {
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      clinicName: account.clinicName,
    },
    redirectUrl: "/admin",
  };
}

/**
 * 2. registerUser: Register new partner/staff account with hashed password & pending status
 */
export async function registerUser(data: {
  fullName: string;
  email: string;
  phone?: string;
  clinicName?: string;
  password: string;
}) {
  try {
    const { fullName, email, phone, clinicName, password } = data;

    if (!fullName || !email || !password) {
      return { success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc." };
    }

    if (password.length < 8) {
      return { success: false, message: "Mật khẩu phải có tối thiểu 8 ký tự." };
    }

    const cleanEmail = email.toLowerCase().trim();
    const accountsCol = await getCollection<Account>(COLLECTIONS.ACCOUNTS);

    const existing = await accountsCol.findOne({ email: cleanEmail });
    if (existing) {
      return {
        success: false,
        message: `Địa chỉ email "${cleanEmail}" đã được đăng ký trong hệ thống.`,
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    const newAccount: Account = {
      _id: new ObjectId(),
      email: cleanEmail,
      passwordHash,
      fullName: fullName.trim(),
      phone: phone?.trim(),
      clinicName: clinicName?.trim() || "Cơ sở Y tế Độc lập",
      role: "sales",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await accountsCol.insertOne(newAccount);

    // Auto provision partner dossier if medical facility provided
    if (clinicName) {
      await findOrCreatePartner({
        name: clinicName,
        phone: phone || "",
        email: cleanEmail,
        contactPerson: fullName,
      });
    }

    await recordAuditLog({
      actor: { email: cleanEmail, fullName: newAccount.fullName, role: "sales" },
      action: "auth.register",
      resource: "account",
      resourceId: cleanEmail,
      resourceLabel: `Đăng ký tài khoản mới: ${cleanEmail} (${clinicName || "Phòng khám"})`,
      after: { email: cleanEmail, fullName, clinicName },
      status: "success",
    });

    return {
      success: true,
      message: "Đăng ký tài khoản thành công! Hồ sơ đang được chuyển tới Super Admin duyệt.",
      redirectUrl: "/pending-activation",
    };
  } catch (error) {
    console.error("Error in registerUser:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi đăng ký. Vui lòng thử lại sau.",
    };
  }
}

/**
 * 3. requestPasswordReset: Generate secure 30-minute crypto token
 */
export async function requestPasswordReset(email: string) {
  try {
    if (!email) {
      return { success: false, message: "Vui lòng nhập email khôi phục." };
    }

    const cleanEmail = email.toLowerCase().trim();
    const accountsCol = await getCollection<Account>(COLLECTIONS.ACCOUNTS);

    const account = await accountsCol.findOne({ email: cleanEmail });
    if (!account) {
      // Don't leak email existence, return generic message
      return {
        success: true,
        message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
      };
    }

    // Generate random 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await accountsCol.updateOne(
      { _id: account._id },
      {
        $set: {
          resetPasswordToken: tokenHash,
          resetPasswordExpires: expiresAt,
          updatedAt: new Date(),
        },
      }
    );

    await recordAuditLog({
      actor: { email: cleanEmail, fullName: account.fullName, role: account.role },
      action: "auth.password_reset_request",
      resource: "account",
      resourceId: cleanEmail,
      resourceLabel: `Yêu cầu đặt lại mật khẩu: ${cleanEmail}`,
      status: "success",
    });

    return {
      success: true,
      message: "Đã tạo liên kết đặt lại mật khẩu thành công (Hiệu lực 30 phút).",
      resetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`,
      token: resetToken,
    };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { success: false, message: "Lỗi tạo liên kết đặt lại mật khẩu." };
  }
}

/**
 * 4. resetPasswordWithToken: Verify token and update passwordHash
 */
export async function resetPasswordWithToken(data: {
  token: string;
  email?: string;
  newPassword: string;
}) {
  try {
    const { token, email, newPassword } = data;
    if (!token || !newPassword) {
      return { success: false, message: "Thiếu mã xác thực hoặc mật khẩu mới." };
    }

    if (newPassword.length < 8) {
      return { success: false, message: "Mật khẩu mới phải có tối thiểu 8 ký tự." };
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const accountsCol = await getCollection<Account>(COLLECTIONS.ACCOUNTS);

    const filter: any = {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    };

    if (email) {
      filter.email = email.toLowerCase().trim();
    }

    const account = await accountsCol.findOne(filter);
    if (!account) {
      return {
        success: false,
        message: "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi yêu cầu mới.",
      };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await accountsCol.updateOne(
      { _id: account._id },
      {
        $set: {
          passwordHash: newPasswordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          failedLoginAttempts: 0,
          updatedAt: new Date(),
        },
      }
    );

    await recordAuditLog({
      actor: { email: account.email, fullName: account.fullName, role: account.role },
      action: "auth.password_reset_completed",
      resource: "account",
      resourceId: account.email,
      resourceLabel: `Hoàn tất đặt lại mật khẩu mới: ${account.email}`,
      status: "success",
    });

    return {
      success: true,
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
    };
  } catch (error) {
    console.error("Error in resetPasswordWithToken:", error);
    return { success: false, message: "Lỗi hệ thống khi cập nhật mật khẩu." };
  }
}

/**
 * 5. logoutUser: Clear auth cookie and record audit
 */
export async function logoutUser() {
  try {
    const session = await getSessionUser();
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    if (session) {
      await recordAuditLog({
        actor: { email: session.email, fullName: session.fullName, role: session.role },
        action: "auth.logout",
        resource: "account",
        resourceId: session.email,
        resourceLabel: `Đăng xuất khỏi hệ thống: ${session.email}`,
        status: "success",
      });
    }

    return { success: true };
  } catch (error) {
    return { success: true };
  }
}
