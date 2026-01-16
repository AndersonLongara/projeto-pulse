/**
 * Home Loading Skeleton
 *
 * Skeleton loading state for the Home page.
 * Shows placeholder content while data is being fetched.
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      {/* Quick Actions skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 min-w-[72px]">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>

      {/* AI Assistant Card skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="w-5 h-5" />
        </div>
      </div>

      {/* Grid of cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 mt-1" />
                </div>
              </div>
              <Skeleton className="w-5 h-5" />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events skeleton */}
      <div className="mt-2">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 justify-center py-4">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
