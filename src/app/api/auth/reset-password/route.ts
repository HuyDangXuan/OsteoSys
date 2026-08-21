import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/auth-schema";

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

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Đang chuyển hướng về trang đăng nhập...",
      redirectUrl: "/login?status=password-reset-success",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật mật khẩu." },
      { status: 500 }
    );
  }
}
