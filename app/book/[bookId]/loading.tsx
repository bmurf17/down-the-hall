import Page from "@/components/shared/Page";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookLoading() {
  return (
    <Page>
      <div className="grid gap-8 py-6 md:grid-cols-[18rem_1fr] md:items-start">
        <div className="flex justify-center md:justify-start">
          <Skeleton className="aspect-[2/3] w-56 max-w-full md:w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <div className="grid max-w-md grid-cols-2 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </Page>
  );
}
