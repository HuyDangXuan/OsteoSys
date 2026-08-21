import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { COLLECTIONS, Device, RentalContract } from "@/types/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface DeviceStatsFacetResult {
  total: { count: number }[];
  rented: { count: number }[];
  available: { count: number }[];
  maintenance: { count: number }[];
  underMaintenanceOnly: { count: number }[];
  repairingOnly: { count: number }[];
  decommissioned: { count: number }[];
}

export async function GET() {
  try {
    const devicesCol = await getCollection<Device>(COLLECTIONS.DEVICES);
    const contractsCol = await getCollection<RentalContract>(COLLECTIONS.RENTAL_CONTRACTS);

    // MongoDB Aggregation with $facet for realtime device distribution
    const facetResults = await devicesCol
      .aggregate<DeviceStatsFacetResult>([
        {
          $facet: {
            total: [{ $count: "count" }],
            rented: [
              { $match: { currentStatus: "rented" } },
              { $count: "count" },
            ],
            available: [
              { $match: { currentStatus: "available" } },
              { $count: "count" },
            ],
            maintenance: [
              {
                $match: {
                  currentStatus: { $in: ["under_maintenance", "repairing"] },
                },
              },
              { $count: "count" },
            ],
            underMaintenanceOnly: [
              { $match: { currentStatus: "under_maintenance" } },
              { $count: "count" },
            ],
            repairingOnly: [
              { $match: { currentStatus: "repairing" } },
              { $count: "count" },
            ],
            decommissioned: [
              { $match: { currentStatus: "decommissioned" } },
              { $count: "count" },
            ],
          },
        },
      ])
      .toArray();

    const stats = facetResults[0] || {
      total: [],
      rented: [],
      available: [],
      maintenance: [],
      underMaintenanceOnly: [],
      repairingOnly: [],
      decommissioned: [],
    };

    const totalDevices = stats.total[0]?.count || 0;
    const rentedDevices = stats.rented[0]?.count || 0;
    const availableDevices = stats.available[0]?.count || 0;
    const maintenanceDevices = stats.maintenance[0]?.count || 0;
    const underMaintenanceCount = stats.underMaintenanceOnly[0]?.count || 0;
    const repairingCount = stats.repairingOnly[0]?.count || 0;
    const decommissionedCount = stats.decommissioned[0]?.count || 0;

    // Percentages calculated against total devices in fleet
    const safeTotal = totalDevices > 0 ? totalDevices : 1;
    const rentedPercentage = Number(((rentedDevices / safeTotal) * 100).toFixed(1));
    const availablePercentage = Number(((availableDevices / safeTotal) * 100).toFixed(1));
    const maintenancePercentage = Number(((maintenanceDevices / safeTotal) * 100).toFixed(1));

    // Dynamic stock alert status
    let alertLevel: "danger" | "warning" | "normal" = "normal";
    let alertBadge = "Sẵn sàng đáp ứng ngay";

    if (availableDevices === 0) {
      alertLevel = "danger";
      alertBadge = "Hết máy sẵn sàng";
    } else if (availableDevices < 5) {
      alertLevel = "warning";
      alertBadge = "Sắp hết máy cho thuê";
    }

    // Active rental contracts & revenue stats
    const activeContracts = await contractsCol
      .find({ status: { $in: ["active", "expiring_soon"] } })
      .toArray();
    const activeRentalsCount = activeContracts.length;
    const monthlyRevenue = activeContracts.reduce(
      (sum, c) => sum + (c.monthlyRentalFee || 0),
      0
    );

    return NextResponse.json(
      {
        status: "success",
        data: {
          totalDevices,
          rentedDevices,
          availableDevices,
          maintenanceDevices,
          breakdown: {
            underMaintenance: underMaintenanceCount,
            repairing: repairingCount,
            decommissioned: decommissionedCount,
          },
          percentages: {
            rented: rentedPercentage,
            available: availablePercentage,
            maintenance: maintenancePercentage,
          },
          alerts: {
            level: alertLevel,
            badge: alertBadge,
            isLowStock: availableDevices < 5,
            isOutOfStock: availableDevices === 0,
          },
          commercial: {
            activeRentalsCount,
            monthlyRevenue,
            formattedMonthlyRevenue:
              new Intl.NumberFormat("vi-VN").format(monthlyRevenue) + " ₫",
          },
          updatedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to calculate device statistics",
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
