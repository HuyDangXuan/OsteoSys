import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/auth-schema";
import { requestPasswordReset } from "@/lib/actions/auth";

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

    const res = await requestPasswordReset(result.data.email);
    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("Error in /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi gửi link khôi phục." },
      { status: 500 }
    );
  }
}
