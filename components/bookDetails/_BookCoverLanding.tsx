"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  BOOK_LANDING_STORAGE_KEY,
  type BookLandingSnapshot,
} from "@/lib/book-transition";
import { useBookPull } from "../shared/BookPullProvider";

/**
 * Picks up the book cover where the shelf pull animation left it and settles it
 * into the real cover position on the detail page. It also tells the pull
 * overlay to disappear only once the real cover is mounted, so the route
 * loading skeleton never flashes through the transition.
 */
export default function BookCoverLanding({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const pull = useBookPull();
  const completeLanding = pull?.completeLanding;
  const ref = useRef<HTMLDivElement>(null);
  const checkedPath = useRef<string | null>(null);
  const snapshotRef = useRef<BookLandingSnapshot | null>(null);

  useLayoutEffect(() => {
    // Keep the cached snapshot across React's development-mode effect re-runs,
    // but clear it when this component is reused for a different book.
    if (checkedPath.current !== pathname) {
      checkedPath.current = pathname;
      snapshotRef.current = null;

      try {
        const raw = sessionStorage.getItem(BOOK_LANDING_STORAGE_KEY);
        if (raw) {
          const snapshot = JSON.parse(raw) as BookLandingSnapshot;

          if (
            snapshot.href === pathname &&
            Date.now() - snapshot.timestamp <= 15000
          ) {
            snapshotRef.current = snapshot;
          }

          sessionStorage.removeItem(BOOK_LANDING_STORAGE_KEY);
        }
      } catch {
        // Private browsing and storage-disabled cases simply skip the landing.
      }
    }

    const snapshot = snapshotRef.current;
    const node = ref.current;

    if (reduceMotion || !snapshot || !node) {
      completeLanding?.();
      return;
    }

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      completeLanding?.();
      return;
    }

    const translateX = snapshot.target.left - rect.left;
    const translateY = snapshot.target.top - rect.top;
    const scaleX = snapshot.target.width / rect.width;
    const scaleY = snapshot.target.height / rect.height;

    node.style.transformOrigin = "top left";
    node.style.transition = "none";
    node.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

    // The real cover is now sitting exactly where the pulled book ended, so
    // the overlay can crossfade away while this cover settles into place.
    completeLanding?.();

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        node.style.transition =
          "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)";
        node.style.transform = "translate(0px, 0px) scale(1, 1)";
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      node.style.transition = "";
      node.style.transform = "";
      node.style.transformOrigin = "";
    };
  }, [pathname, reduceMotion, completeLanding]);

  return (
    <div ref={ref} className="w-full">
      {children}
    </div>
  );
}
