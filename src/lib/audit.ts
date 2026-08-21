import { getCollection } from "./mongodb";
import { AuditLog, AuditAction, AuditResource, AuditActor, AuditDetails, COLLECTIONS } from "@/types/db";
import { Filter, Sort } from "mongodb";

export interface RecordAuditLogOptions {
  actor: AuditActor;
  action: AuditAction | string;
  resource: AuditResource | string;
  resourceId?: string;
  resourceLabel?: string;
  details?: AuditDetails;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failure";
  errorMessage?: string;
  request?: Request | Headers | null;
}

/**
 * Utility to calculate shallow & nested differences between before and after snapshots
 */
function calculateDiff(
  before?: Record<string, unknown> | null,
  after?: Record<string, unknown> | null
): Record<string, { from: unknown; to: unknown }> | undefined {
  if (!before && !after) return undefined;
  if (!before && after) {
    const diff: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(after)) {
      diff[key] = { from: null, to: after[key] };
    }
    return diff;
  }
  if (before && !after) {
    const diff: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(before)) {
      diff[key] = { from: before[key], to: null };
    }
    return diff;
  }

  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  for (const key of allKeys) {
    // Ignore internal timestamp / password hash fields from diff comparison
    if (key === "updatedAt" || key === "passwordHash" || key === "refreshToken") continue;

    const fromVal = before?.[key];
    const toVal = after?.[key];

    if (JSON.stringify(fromVal) !== JSON.stringify(toVal)) {
      diff[key] = { from: fromVal, to: toVal };
    }
  }

  return Object.keys(diff).length > 0 ? diff : undefined;
}

/**
 * Extract IP address and User-Agent from standard Web Request / Headers
 */
function extractRequestMeta(req?: Request | Headers | null): { ipAddress?: string; userAgent?: string } {
  if (!req) return {};
  const headers = req instanceof Headers ? req : req.headers;

  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : realIp || undefined;
  const userAgent = headers.get("user-agent") || undefined;

  return { ipAddress, userAgent };
}

/**
 * Non-blocking, fault-tolerant Audit Logger for OsteoSys
 *
 * Guarantees that any failure in database logging will NOT throw errors or disrupt the main business transaction.
 */
export async function recordAuditLog(options: RecordAuditLogOptions): Promise<void> {
  try {
    const { ipAddress: reqIp, userAgent: reqUa } = extractRequestMeta(options.request);

    // Compute diff if before/after are provided
    const calculatedDiff = options.details?.diff || calculateDiff(options.before, options.after);

    const logEntry: AuditLog = {
      actor: {
        accountId: options.actor.accountId,
        email: options.actor.email,
        fullName: options.actor.fullName,
        role: options.actor.role,
      },
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId,
      resourceLabel: options.resourceLabel,
      details: {
        before: options.before || options.details?.before,
        after: options.after || options.details?.after,
        diff: calculatedDiff,
        metadata: options.metadata || options.details?.metadata,
      },
      ipAddress: options.ipAddress || reqIp,
      userAgent: options.userAgent || reqUa,
      status: options.status || "success",
      errorMessage: options.errorMessage,
      createdAt: new Date(),
    };

    const collection = await getCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS);
    await collection.insertOne(logEntry);
  } catch (error) {
    // Non-blocking log catch: record warning to console without crashing caller
    console.error("⚠️ [AuditLog Error] Failed to write audit log:", error);
  }
}

export interface GetAuditLogsQuery {
  resource?: AuditResource | string;
  resourceId?: string;
  actorEmail?: string;
  action?: string;
  status?: "success" | "failure";
  limit?: number;
  skip?: number;
}

/**
 * Helper to query audit logs with pagination and filters
 */
export async function getAuditLogs(params: GetAuditLogsQuery = {}): Promise<{
  logs: AuditLog[];
  total: number;
  limit: number;
  skip: number;
}> {
  const { limit = 50, skip = 0 } = params;
  const filter: Filter<AuditLog> = {};

  if (params.resource) filter.resource = params.resource;
  if (params.resourceId) filter.resourceId = params.resourceId;
  if (params.actorEmail) filter["actor.email"] = params.actorEmail;
  if (params.action) filter.action = params.action;
  if (params.status) filter.status = params.status;

  const collection = await getCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS);
  const total = await collection.countDocuments(filter);
  const logs = await collection
    .find(filter)
    .sort({ createdAt: -1 } as Sort)
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    logs,
    total,
    limit,
    skip,
  };
}
