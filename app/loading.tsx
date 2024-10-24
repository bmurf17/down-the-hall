import { Loader2 } from "lucide-react";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
    </div>
  );
}
