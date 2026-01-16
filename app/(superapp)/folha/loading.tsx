import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-white/10">
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24 mt-1" />
          </div>
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24 mt-1" />
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-28 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Payslips List Header */}
      <div>
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),_0_4px_8px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-28 mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                  <Skeleton className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
