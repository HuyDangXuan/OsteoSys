import React from "react";

export default function CmsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="h-6 w-72 bg-slate-200/80 dark:bg-slate-800 rounded animate-shimmer" />
          <div className="h-3.5 w-96 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200/80 dark:bg-slate-800 rounded-lg animate-shimmer" />
          <div className="h-9 w-32 bg-slate-200/80 dark:bg-slate-800 rounded-lg animate-shimmer" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="h-10 w-36 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg animate-shimmer" />
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-shimmer" />
        ))}
      </div>
    </div>
  );
}
