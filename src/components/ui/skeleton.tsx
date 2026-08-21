import React from "react";

interface SkeletonBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonBaseProps) {
  return (
    <div
      className={`animate-shimmer bg-slate-200/85 dark:bg-slate-800/90 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton Metric KPI Card (Mirroring MetricCard: 48 units, 32 rented, 03 repairs, 28 clients)
 * Exact dimensions matching real MetricCard for Zero CLS
 */
export function SkeletonMetricCard() {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex flex-col justify-between h-[124px]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          {/* Title bar */}
          <Skeleton className="h-3.5 w-28" />
          {/* Value + Subvalue */}
          <div className="flex items-baseline gap-2 pt-1">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        {/* Icon box */}
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      </div>

      {/* Bottom trend bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

/**
 * Skeleton Data Table (Mirroring Data Tables with search bar, filters and rows)
 */
export function SkeletonDataTable({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4">
      {/* Toolbar: Search input + Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Table Head & Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <th className="py-2.5 px-3 w-[15%]">
                <Skeleton className="h-3.5 w-16" />
              </th>
              <th className="py-2.5 px-3 w-[35%]">
                <Skeleton className="h-3.5 w-32" />
              </th>
              <th className="py-2.5 px-3 w-[20%]">
                <Skeleton className="h-3.5 w-24" />
              </th>
              <th className="py-2.5 px-3 w-[15%]">
                <Skeleton className="h-3.5 w-16" />
              </th>
              <th className="py-2.5 px-3 w-[15%] text-right">
                <Skeleton className="h-3.5 w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx} className="h-14">
                <td className="py-3 px-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="py-3 px-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-28 opacity-70" />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="py-3 px-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </td>
                <td className="py-3 px-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton Chart (Mirroring analytics distribution & telemetry charts)
 */
export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-2xs space-y-4 h-[280px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56 opacity-70" />
        </div>
        <Skeleton className="h-6 w-20 rounded" />
      </div>

      {/* Simulated vertical chart bars */}
      <div className="flex items-end justify-between gap-3 h-36 pt-4 border-b border-slate-100 dark:border-slate-800 px-2">
        <Skeleton className="w-8 h-20 rounded-t" />
        <Skeleton className="w-8 h-28 rounded-t" />
        <Skeleton className="w-8 h-16 rounded-t" />
        <Skeleton className="w-8 h-32 rounded-t" />
        <Skeleton className="w-8 h-24 rounded-t" />
        <Skeleton className="w-8 h-36 rounded-t" />
        <Skeleton className="w-8 h-14 rounded-t" />
        <Skeleton className="w-8 h-30 rounded-t" />
      </div>

      {/* X-axis labels */}
      <div className="flex items-center justify-between text-xs px-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

/**
 * Skeleton Device Card (Mirroring Sonost 3000 inventory card: 48 machines)
 */
export function SkeletonDeviceCard() {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-3 h-[180px] flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      <div className="space-y-2 py-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  );
}
