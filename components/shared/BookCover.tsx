import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookCover({ src, alt = "", className }: {
  src?: string | null; alt?: string; className?: string;
}) {
  return src ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("aspect-[2/3] rounded-sm rounded-r-md bg-muted object-cover shadow-md", className)}
    />
  ) : (
    <div className={cn("flex aspect-[2/3] items-center justify-center rounded-md bg-muted", className)}>
      <BookOpen className="size-1/3 text-muted-foreground" aria-hidden />
    </div>
  );
}