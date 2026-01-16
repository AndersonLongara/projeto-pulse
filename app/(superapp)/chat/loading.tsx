import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-6">
      {/* Chat Messages Skeleton */}
      <div className="flex flex-col gap-3">
        {/* AI Message */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* User Message */}
        <div className="flex gap-3 justify-end">
          <div className="flex-1 space-y-2 flex flex-col items-end">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        </div>

        {/* AI Message */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="mt-auto pt-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
