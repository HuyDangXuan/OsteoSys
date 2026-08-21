import { NextResponse } from "next/server";
import { checkDatabaseConnection, getDatabase } from "@/lib/mongodb";
import { initDatabaseIndexes } from "@/lib/init-db";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const result = await checkDatabaseConnection();

  if (!result.isConnected) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB cluster",
        details: result,
      },
      { status: 503 }
    );
  }

  // Record an audit check
  await recordAuditLog({
    actor: { email: "system@osteosys.vn", fullName: "DB Diagnostic Check" },
    action: "status_change",
    resource: "system",
    resourceLabel: "MongoDB Ping Check",
    metadata: { latencyMs: result.latencyMs, collections: result.collections },
    request,
    status: "success",
  });

  return NextResponse.json({
    status: "healthy",
    message: "MongoDB connection is active and responsive",
    data: {
      database: result.databaseName,
      latencyMs: result.latencyMs,
      collectionsCount: result.collections.length,
      collections: result.collections,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(request: Request) {
  try {
    const initResult = await initDatabaseIndexes();
    return NextResponse.json({
      status: initResult.success ? "success" : "partial_success",
      message: `Database indexes created (${initResult.indexesCreated.length} indexes)`,
      data: initResult,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to initialize database indexes",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
