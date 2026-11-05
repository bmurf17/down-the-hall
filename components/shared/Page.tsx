import { cn } from "@/lib/utils";

export default function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-4 sm:mx-8 lg:mx-16", className)}>{children}</div>
  );
}