import React from "react";
import { SkeletonHero, SkeletonQuoteForm } from "@/components/client/skeleton";

export default function RepairServiceLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-20 pb-16 space-y-8">
      <SkeletonHero />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonQuoteForm />
      </div>
    </div>
  );
}
