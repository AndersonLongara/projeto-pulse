import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/50 dark:border-white/10"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-white/10 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-8">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12 ml-auto" />
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-200/50 dark:divide-white/10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-center gap-8">
                {/* User */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40 mt-1" />
                  </div>
                </div>

                {/* Matricula */}
                <Skeleton className="h-4 w-16" />

                {/* Cargo */}
                <div className="min-w-[120px]">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>

                {/* Role */}
                <Skeleton className="h-6 w-20 rounded-full" />

                {/* Status */}
                <Skeleton className="h-4 w-14" />

                {/* Conversations */}
                <Skeleton className="h-4 w-8" />

                {/* Actions */}
                <Skeleton className="h-8 w-8 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
