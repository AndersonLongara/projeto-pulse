import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-60 mt-2" />
      </div>

      {/* Banco de Horas Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>

      {/* Today's Record */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-40 mt-1" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-14 mt-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-16 mt-1" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-16 mt-1" />
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-36 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div>
        <Skeleton className="h-4 w-36 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl py-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[48px]">
                    <Skeleton className="h-6 w-8 mx-auto" />
                    <Skeleton className="h-3 w-8 mx-auto mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-5 w-12 rounded" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
