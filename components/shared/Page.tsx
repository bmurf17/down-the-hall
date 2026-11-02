import { cn } from "@/lib/utils";

/**
 * Shared page shell. Keeps horizontal padding consistent instead of repeating
 * `mx-16` on every route.
 */
export default function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-16", className)}>{children}</div>;
}
