import React from "react";
import { SkeletonHero, SkeletonSpecTable } from "@/components/client/skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-16 space-y-8">
      <SkeletonHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonSpecTable rows={8} />
      </div>
    </div>
  );
}
