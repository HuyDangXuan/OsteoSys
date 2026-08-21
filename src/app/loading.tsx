import React from "react";
import { SkeletonHero, SkeletonSpecTable } from "@/components/client/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SkeletonHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SkeletonSpecTable rows={6} />
      </div>
    </div>
  );
}
