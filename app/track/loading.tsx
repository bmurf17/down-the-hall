import Page from "@/components/shared/Page";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackLoading() {
  return (
    <Page>
      <div className="w-full py-3">
        <div className="flex gap-2 overflow-hidden rounded-xl bg-card p-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-28 shrink-0" />
          ))}
        </div>

        <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Skeleton className="h-11 w-full md:w-72" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="size-11" />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-card p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-3 border-b py-4 last:border-0"
            >
              <Skeleton className="aspect-[2/3] w-16 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
