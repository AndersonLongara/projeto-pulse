/**
 * Férias Loading Skeleton
 *
 * Skeleton loading state for the Férias page.
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function FeriasLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>

      {/* Balance Header skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Progress skeleton */}
          <Skeleton className="w-32 h-32 rounded-full" />
          
          {/* Legend skeleton */}
          <div className="flex-1 space-y-3 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Períodos skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
                <Skeleton className="h-2 w-full mt-3 rounded-full" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Histórico skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>

        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-40 mt-1" />
                </div>
              </div>
              <Skeleton className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="h-20" />
    </div>
  );
}
