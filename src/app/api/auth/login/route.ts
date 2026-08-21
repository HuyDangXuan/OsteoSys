import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/auth-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu xác thực không hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;

    // Handle special test scenarios for comprehensive QA demonstration:
    if (email === "suspended@clinic.vn") {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_SUSPENDED",
          message: "Tài khoản của đơn vị đã tạm ngưng hoạt động do hết hạn hợp đồng dịch vụ Sonost 3000.",
          redirectUrl: "/suspended",
        },
        { status: 403 }
      );
    }

    if (email === "pending@clinic.vn") {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_PENDING",
          message: "Hồ sơ y tế của phòng khám đang trong quá trình xét duyệt thẩm định.",
          redirectUrl: "/pending-activation",
        },
        { status: 403 }
      );
    }

    // Default credential validation simulation
    // Accept valid demo password "Admin@123" or standard passwords
    const isValidAdmin = email.endsWith("@osteosys.vn") || email.endsWith(".vn") || email.includes("@");
    if (!isValidAdmin || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
        },
        { status: 401 }
      );
    }

    // Generate simulated secure session token
    const mockToken = `jwt_osteosys_${Buffer.from(email).toString("base64")}_${Date.now()}`;
    const cookieStore = await cookies();

    cookieStore.set({
      name: "osteosys_auth_token",
      value: mockToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days or 1 day
    });

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user: {
        email,
        name: email.includes("admin") ? "BS. Nguyễn Trọng Hải" : "BS. Đại diện Y khoa",
        role: "CLINICAL_ADMIN",
      },
      redirectUrl: "/admin",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.",
      },
      { status: 500 }
    );
  }
}
