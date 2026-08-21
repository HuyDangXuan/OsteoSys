import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth-schema";

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

    const { organization, email } = result.data;
    // Generate a reference code for the clinical onboarding dossier
    const referenceId = `OST-ACC-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      message: "Đăng ký hồ sơ đối tác y tế thành công",
      referenceId,
      organization,
      email,
      redirectUrl: `/pending-activation?ref=${referenceId}&org=${encodeURIComponent(organization)}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý đăng ký." },
      { status: 500 }
    );
  }
}
