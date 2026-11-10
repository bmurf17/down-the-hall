import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** One consistent empty state with an icon, copy, and optional action. */
export function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center px-4 py-10 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mb-1 text-lg font-medium">{title}</h3>
      {description ? (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
