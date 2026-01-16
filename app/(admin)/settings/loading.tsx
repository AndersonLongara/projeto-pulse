import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Section 1 */}
          <div className="rounded-lg border border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900 p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div>
                  <Skeleton className="mb-2 h-5 w-40" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-lg border border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-900 p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div>
                  <Skeleton className="mb-2 h-5 w-48" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
