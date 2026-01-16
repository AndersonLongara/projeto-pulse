/**
 * Analytics Loading Skeleton
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-12 h-6 rounded-full" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24 mt-1" />
              <Skeleton className="h-3 w-20 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10 p-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10 p-4">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Critical Conversations */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/50 dark:border-white/10">
        <div className="p-4 border-b border-slate-100 dark:border-white/10">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
