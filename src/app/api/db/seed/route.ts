import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed-data";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      status: "success",
      message: "Database seeded successfully with realistic OsteoSys Sonost 3000 data",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
