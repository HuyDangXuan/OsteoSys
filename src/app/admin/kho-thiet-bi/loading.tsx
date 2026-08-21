import React from "react";
import { SkeletonDeviceCard } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="h-6 w-64 bg-slate-200/80 dark:bg-slate-800 rounded animate-shimmer" />
          <div className="h-3.5 w-80 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-shimmer" />
        </div>
        <div className="h-8 w-28 bg-slate-200/80 dark:bg-slate-800 rounded-md animate-shimmer" />
      </div>

      {/* Grid of Skeleton Device Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonDeviceCard key={idx} />
        ))}
      </div>
    </div>
  );
}
