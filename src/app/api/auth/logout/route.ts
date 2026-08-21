import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("osteosys_auth_token");

  return NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
    redirectUrl: "/login",
  });
}
