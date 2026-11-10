import Page from "@/components/shared/Page";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Page>
      <div className="grid grid-cols-1 gap-4 py-3 lg:grid-cols-3">
        <div className="order-1 rounded-xl border bg-card p-4 sm:p-6">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="mb-2 h-6 w-48" />
          <div className="flex justify-center py-4">
            <Skeleton className="aspect-[2/3] w-36" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </div>

        <div className="order-2 min-w-0 lg:col-span-2">
          <Skeleton className="mb-3 h-12 w-full rounded-xl" />
          <div className="rounded-xl bg-card p-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex gap-3 border-b py-4 last:border-0"
              >
                <Skeleton className="aspect-[2/3] w-16 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-3 rounded-xl border bg-card p-4 lg:col-start-1 lg:row-start-2">
          <Skeleton className="mb-3 h-6 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </Page>
  );
}
