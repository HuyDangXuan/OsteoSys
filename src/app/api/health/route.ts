import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/mongodb";

export async function GET() {
  const dbCheck = await checkDatabaseConnection();

  const healthData = {
    status: dbCheck.isConnected ? "healthy" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      mongodb: {
        status: dbCheck.isConnected ? "connected" : "disconnected",
        database: dbCheck.databaseName,
        latencyMs: dbCheck.latencyMs,
        collectionsFound: dbCheck.collections.length,
        error: dbCheck.error,
      },
      app: {
        status: "running",
        nodeVersion: process.version,
      },
    },
  };

  return NextResponse.json(healthData, {
    status: dbCheck.isConnected ? 200 : 503,
  });
}
