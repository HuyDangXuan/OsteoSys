import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth-schema";
import { registerUser } from "@/lib/actions/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin đăng ký chưa hợp lệ",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, phone, organization, password } = result.data;

    const regRes = await registerUser({
      fullName,
      email,
      phone,
      clinicName: organization,
      password,
    });

    if (!regRes.success) {
      return NextResponse.json(regRes, { status: 400 });
    }

    return NextResponse.json(regRes, { status: 201 });
  } catch (error) {
    console.error("Error in /api/auth/register:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý đăng ký tài khoản." },
      { status: 500 }
    );
  }
}
