import React from "react";
import {
  SkeletonMetricCard,
  SkeletonDataTable,
  SkeletonChart,
} from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="h-6 w-64 bg-slate-200/80 dark:bg-slate-800 rounded animate-shimmer" />
          <div className="h-3.5 w-96 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-shimmer" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-slate-200/80 dark:bg-slate-800 rounded-md animate-shimmer" />
          <div className="h-8 w-32 bg-slate-200/80 dark:bg-slate-800 rounded-md animate-shimmer" />
        </div>
      </div>

      {/* 2. 4 Metric Cards Skeleton Grid (Zero CLS: 124px height) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>

      {/* 3. Main Data Area: Table (2 cols) & Chart / Repairs (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonDataTable rows={5} columns={5} />
        </div>
        <div className="space-y-6">
          <SkeletonChart />
        </div>
      </div>
    </div>
  );
}
