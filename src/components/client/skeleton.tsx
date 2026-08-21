import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-slate-200/80 dark:bg-slate-800/80 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * SkeletonHero: Mirrors the Hero section layout (Zero-CLS)
 */
export function SkeletonHero() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Left Column (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Badge */}
        <Skeleton className="h-6 w-52 rounded-full" />

        {/* 2-line Main Title */}
        <div className="space-y-3">
          <Skeleton className="h-10 sm:h-12 w-full max-w-lg" />
          <Skeleton className="h-10 sm:h-12 w-3/4 max-w-md" />
        </div>

        {/* Subtitle / Paragraph */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* 2 CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <Skeleton className="h-11 w-36 rounded-md" />
          <Skeleton className="h-11 w-44 rounded-md" />
        </div>

        {/* 3 Value props strip */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Right Column (5 cols): Aspect 4/3 Scanner Visual */}
      <div className="lg:col-span-5">
        <div className="w-full aspect-4/3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-36 w-full rounded-lg" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonSpecTable: Mirrors the Specifications table with category tabs (Zero-CLS)
 */
export function SkeletonSpecTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Category Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1 max-w-md">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </div>

      {/* Table rows (30% vs 70%) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-3.5 flex items-center justify-between gap-6">
            <Skeleton className="h-4 w-1/3 max-w-[200px]" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonServiceCard: Mirrors Service package cards (Zero-CLS)
 */
export function SkeletonServiceCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * SkeletonQuoteForm: Mirrors the B2B Quote consultation form (Zero-CLS)
 */
export function SkeletonQuoteForm() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
      <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-80" />
      </div>

      {/* Chip selector */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      {/* 4 Input fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Textarea */}
      <Skeleton className="h-20 w-full rounded-md" />

      {/* Submit button */}
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}
