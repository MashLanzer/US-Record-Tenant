import { Skeleton } from "@/components/ui/primitives";

/**
 * Route-group loading UI. Renders automatically while an in-app route resolves.
 * Mirrors the dashboard layout so the transition feels instant, never janky.
 */
export default function Loading() {
  return (
    <div className="px-4 pt-4">
      {/* Header row: avatar + two lines */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Large hero card */}
      <Skeleton className="mt-4 h-[120px] w-full rounded-2xl" />

      {/* Two stat cards */}
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-20 flex-1 rounded-2xl" />
        <Skeleton className="h-20 flex-1 rounded-2xl" />
      </div>

      {/* List rows */}
      <div className="mt-5 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
