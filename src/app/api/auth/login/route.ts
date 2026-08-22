import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth-schema";
import { loginUser } from "@/lib/actions/auth";

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

    const loginRes = await loginUser(result.data);

    if (!loginRes.success) {
      const code = "code" in loginRes ? loginRes.code : undefined;
      const statusCode =
        code === "ACCOUNT_PENDING" || code === "ACCOUNT_SUSPENDED"
          ? 403
          : 401;

      return NextResponse.json(loginRes, { status: statusCode });
    }

    return NextResponse.json(loginRes, { status: 200 });
  } catch (error) {
    console.error("Error in /api/auth/login route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi máy chủ nội bộ khi xác thực.",
      },
      { status: 500 }
    );
  }
}
