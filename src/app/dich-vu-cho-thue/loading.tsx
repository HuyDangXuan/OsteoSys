import React from "react";
import { SkeletonHero, SkeletonServiceCard } from "@/components/client/skeleton";

export default function RentalServiceLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-16 space-y-8">
      <SkeletonHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonServiceCard />
        <SkeletonServiceCard />
        <SkeletonServiceCard />
      </div>
    </div>
  );
}
