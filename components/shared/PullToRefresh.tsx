"use client";

import { ArrowDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const THRESHOLD = 64;

export function PullToRefresh({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pull = useRef(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    let active = false;

    const onTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      startY.current = event.touches[0]?.clientY ?? null;
      active = startY.current !== null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!active || startY.current === null) return;

      const delta = (event.touches[0]?.clientY ?? startY.current) - startY.current;
      if (delta <= 0) {
        pull.current = 0;
        setPullDistance(0);
        return;
      }

      // Let the page scroll normally unless we are already at the top.
      if (window.scrollY > 0) return;

      event.preventDefault();
      const distance = Math.min(96, delta * 0.5);
      pull.current = distance;
      setPullDistance(distance);
    };

    const finish = () => {
      if (!active) return;
      active = false;
      startY.current = null;

      if (pull.current >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(44);
        router.refresh();
        window.setTimeout(() => {
          setRefreshing(false);
          setPullDistance(0);
          pull.current = 0;
        }, 900);
      } else {
        setPullDistance(0);
        pull.current = 0;
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", finish);
    window.addEventListener("touchcancel", finish);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", finish);
      window.removeEventListener("touchcancel", finish);
    };
  }, [refreshing, router]);

  const ready = pullDistance >= THRESHOLD;
  const height = refreshing ? 44 : pullDistance;

  return (
    <div className={cn("relative", className)}>
      <div
        aria-live="polite"
        className="pointer-events-none flex items-center justify-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground"
        style={{ height }}
      >
        {refreshing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Refreshing…
          </>
        ) : pullDistance > 0 ? (
          <>
            <ArrowDown
              className={cn(
                "size-4 transition-transform",
                ready && "rotate-180"
              )}
              aria-hidden
            />
            {ready ? "Release to refresh" : "Pull to refresh"}
          </>
        ) : null}
      </div>
      {children}
    </div>
  );
}
