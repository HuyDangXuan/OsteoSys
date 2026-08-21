import { getDatabase, getCollection } from "./mongodb";
import { COLLECTIONS } from "@/types/db";
import { recordAuditLog } from "./audit";

export interface IndexCreationResult {
  collection: string;
  indexName: string;
  keys: Record<string, number | string>;
  isUnique?: boolean;
}

/**
 * Initializes all required MongoDB unique and compound performance indexes across all collections.
 */
export async function initDatabaseIndexes(): Promise<{
  success: boolean;
  indexesCreated: IndexCreationResult[];
  errors: string[];
}> {
  const db = await getDatabase();
  const indexesCreated: IndexCreationResult[] = [];
  const errors: string[] = [];

  // Helper for safe index creation
  const safeCreateIndex = async (
    collectionName: string,
    keys: Record<string, 1 | -1 | "text">,
    options: { unique?: boolean; name?: string; background?: boolean } = {}
  ) => {
    try {
      const col = db.collection(collectionName);
      const indexName = await col.createIndex(keys, options);
      indexesCreated.push({
        collection: collectionName,
        indexName,
        keys,
        isUnique: options.unique,
      });
    } catch (err) {
      const msg = `Failed to create index on ${collectionName} for ${JSON.stringify(keys)}: ${
        err instanceof Error ? err.message : String(err)
      }`;
      console.error(`⚠️ [DB Index Error] ${msg}`);
      errors.push(msg);
    }
  };

  console.log("🔧 [MongoDB] Starting database indexes initialization...");

  // 1. Accounts Collection Indexes
  await safeCreateIndex(COLLECTIONS.ACCOUNTS, { email: 1 }, { unique: true, name: "uniq_account_email" });
  await safeCreateIndex(COLLECTIONS.ACCOUNTS, { role: 1, status: 1 }, { name: "idx_account_role_status" });

  // 2. Devices (Sonost 3000) Collection Indexes
  await safeCreateIndex(COLLECTIONS.DEVICES, { serialNumber: 1 }, { unique: true, name: "uniq_device_serial" });
  await safeCreateIndex(COLLECTIONS.DEVICES, { currentStatus: 1 }, { name: "idx_device_status" });
  await safeCreateIndex(COLLECTIONS.DEVICES, { "calibration.nextDueDate": 1 }, { name: "idx_device_calibration_due" });

  // 3. Leads (Inquiries & Consultations) Indexes
  await safeCreateIndex(COLLECTIONS.LEADS, { phone: 1 }, { name: "idx_lead_phone" });
  await safeCreateIndex(COLLECTIONS.LEADS, { status: 1 }, { name: "idx_lead_status" });
  await safeCreateIndex(COLLECTIONS.LEADS, { createdAt: -1 }, { name: "idx_lead_created_desc" });

  // 4. Partners (Hospitals, Clinics) Indexes
  await safeCreateIndex(COLLECTIONS.PARTNERS, { code: 1 }, { unique: true, name: "uniq_partner_code" });
  await safeCreateIndex(COLLECTIONS.PARTNERS, { status: 1, city: 1 }, { name: "idx_partner_status_city" });

  // 5. Rental Contracts Indexes
  await safeCreateIndex(COLLECTIONS.RENTAL_CONTRACTS, { contractCode: 1 }, { unique: true, name: "uniq_contract_code" });
  await safeCreateIndex(COLLECTIONS.RENTAL_CONTRACTS, { partnerId: 1 }, { name: "idx_contract_partner" });
  await safeCreateIndex(COLLECTIONS.RENTAL_CONTRACTS, { deviceId: 1 }, { name: "idx_contract_device" });
  await safeCreateIndex(COLLECTIONS.RENTAL_CONTRACTS, { status: 1, endDate: 1 }, { name: "idx_contract_status_end" });

  // 6. Repair Tickets Indexes
  await safeCreateIndex(COLLECTIONS.REPAIR_TICKETS, { ticketCode: 1 }, { unique: true, name: "uniq_repair_ticket_code" });
  await safeCreateIndex(COLLECTIONS.REPAIR_TICKETS, { technicianId: 1, status: 1 }, { name: "idx_repair_tech_status" });
  await safeCreateIndex(COLLECTIONS.REPAIR_TICKETS, { priority: 1, status: 1 }, { name: "idx_repair_priority_status" });
  await safeCreateIndex(COLLECTIONS.REPAIR_TICKETS, { deviceSerial: 1 }, { name: "idx_repair_device_serial" });

  // 7. Audit Logs Indexes
  await safeCreateIndex(
    COLLECTIONS.AUDIT_LOGS,
    { "actor.accountId": 1, createdAt: -1 },
    { name: "idx_audit_actor_created" }
  );
  await safeCreateIndex(
    COLLECTIONS.AUDIT_LOGS,
    { resource: 1, resourceId: 1, createdAt: -1 },
    { name: "idx_audit_resource_created" }
  );
  await safeCreateIndex(COLLECTIONS.AUDIT_LOGS, { createdAt: -1 }, { name: "idx_audit_created_desc" });

  console.log(`✅ [MongoDB] Finished creating ${indexesCreated.length} indexes with ${errors.length} errors.`);

  // Record audit log for index initialization
  await recordAuditLog({
    actor: { email: "system@osteosys.vn", fullName: "System Auto-Init", role: "super_admin" },
    action: "system_init",
    resource: "system",
    resourceLabel: "MongoDB Indexes Initialized",
    details: {
      metadata: {
        totalIndexes: indexesCreated.length,
        errorsCount: errors.length,
      },
    },
    status: errors.length === 0 ? "success" : "failure",
    errorMessage: errors.length > 0 ? errors.join("; ") : undefined,
  });

  return {
    success: errors.length === 0,
    indexesCreated,
    errors,
  };
}
