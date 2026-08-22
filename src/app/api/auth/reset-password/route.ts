import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/auth-schema";
import { resetPasswordWithToken } from "@/lib/actions/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu mới không hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, email } = body;
    const res = await resetPasswordWithToken({
      token: token || "",
      email: email || undefined,
      newPassword: result.data.password,
    });

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.",
      redirectUrl: "/login?status=password-reset-success",
    });
  } catch (error) {
    console.error("Error in /api/auth/reset-password:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật mật khẩu." },
      { status: 500 }
    );
  }
}
