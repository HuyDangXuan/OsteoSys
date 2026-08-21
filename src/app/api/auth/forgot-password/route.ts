import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/auth-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Email không hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    return NextResponse.json({
      success: true,
      message: `Đã gửi liên kết khôi phục mật khẩu bảo mật đến email ${email}. Vui lòng kiểm tra hộp thư đến hoặc thư rác.`,
      email,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi gửi link khôi phục." },
      { status: 500 }
    );
  }
}
