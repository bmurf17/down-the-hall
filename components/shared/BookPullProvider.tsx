"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BOOK_LANDING_STORAGE_KEY,
  type BookLandingSnapshot,
  type BookPullRequest,
  type RectSnapshot,
} from "@/lib/book-transition";

interface BookPullContextValue {
  openBook: (request: BookPullRequest) => void;
  completeLanding: () => void;
  activeBookId?: number;
}

interface ActivePull extends BookPullRequest {
  target: RectSnapshot;
  fromPath: string;
}

const BookPullContext = createContext<BookPullContextValue | null>(null);

export function useBookPull() {
  return useContext(BookPullContext);
}

/**
 * Mirrors the responsive layout in BookDetails so the pulled book lands on the
 * exact rectangle the detail-page cover will occupy. Keeping the flight path
 * short at the end avoids the cover appearing to pop into place after the route
 * changes.
 */
function getTargetRect(): RectSnapshot {
  const viewportWidth = document.documentElement.clientWidth;
  const isLarge = window.matchMedia("(min-width: 1024px)").matches;
  const isMedium = window.matchMedia("(min-width: 640px)").matches;

  const pageMargin = isLarge ? 64 : isMedium ? 32 : 16;
  const sectionWidth = Math.min(viewportWidth - pageMargin * 2, 1024);
  const sectionLeft = (viewportWidth - sectionWidth) / 2;

  const padding = isLarge ? 40 : isMedium ? 32 : 20;
  const width = isLarge ? 208 : isMedium ? 160 : 144;
  const height = width * 1.5;

  // Track and book-detail pages both start with PageShell, so its document
  // position is the same after the route scrolls back to the top.
  const pageShell = document.querySelector("[data-page-shell]");
  const header = document.querySelector("header");
  const sectionTop = pageShell
    ? pageShell.getBoundingClientRect().top + window.scrollY
    : (header?.getBoundingClientRect().bottom ?? 0) + 16;

  if (isMedium) {
    return {
      left: sectionLeft + padding,
      top: sectionTop + padding,
      width,
      height,
    };
  }

  // On phones the cover is centred inside the card.
  return {
    left:
      sectionLeft + padding + (sectionWidth - padding * 2 - width) / 2,
    top: sectionTop + padding,
    width,
    height,
  };
}

export default function BookPullProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<ActivePull | null>(null);
  const [mounted, setMounted] = useState(false);
  const navigationStarted = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openBook = useCallback(
    (request: BookPullRequest) => {
      if (reduceMotion) {
        router.push(request.href);
        return;
      }

      navigationStarted.current = false;
      setActive({
        ...request,
        target: getTargetRect(),
        fromPath: pathname,
      });
    },
    [pathname, reduceMotion, router]
  );

  // Keep the pulled book over the route's loading skeleton until the real
  // detail cover mounts and takes over. The timeout is a safety net for failed
  // or interrupted navigations.
  useEffect(() => {
    if (!active || pathname === active.fromPath) return;

    const timer = window.setTimeout(() => setActive(null), 5000);
    return () => window.clearTimeout(timer);
  }, [active, pathname]);

  useEffect(() => {
    if (!active) return;

    const timer = window.setTimeout(() => setActive(null), 10000);
    return () => window.clearTimeout(timer);
  }, [active]);

  const completeLanding = useCallback(() => {
    setActive(null);
  }, []);

  // Keep the shelf from scrolling underneath the pulled book.
  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  const handleExpanded = () => {
    if (!active || navigationStarted.current) return;

    navigationStarted.current = true;

    const snapshot: BookLandingSnapshot = {
      href: active.href,
      target: active.target,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem(
        BOOK_LANDING_STORAGE_KEY,
        JSON.stringify(snapshot)
      );
    } catch {
      // Private browsing and storage-disabled cases simply skip the landing.
    }

    router.push(active.href);
  };

  const hasImage = Boolean(active?.image);

  return (
    <BookPullContext.Provider
      value={{
        openBook,
        completeLanding,
        activeBookId: active?.bookId,
      }}
    >
      {children}

      {mounted
        ? createPortal(
            <AnimatePresence>
              {active ? (
                <motion.div
                  key="book-pull-backdrop"
                  className="fixed inset-0 z-[90] bg-[#160f09]/75 backdrop-blur-[3px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  aria-hidden="true"
                />
              ) : null}

              {active ? (
                <motion.div
                  key="book-pull-cover"
                  className="fixed z-[100] overflow-hidden rounded-[3px] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.85)]"
                  initial={{
                    left: active.rect.left,
                    top: active.rect.top,
                    width: active.rect.width,
                    height: active.rect.height,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    left: active.target.left,
                    top: active.target.top,
                    width: active.target.width,
                    height: active.target.height,
                    rotate: [0, -4, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    left: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    top: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    width: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    height: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    rotate: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.15 },
                  }}
                  onAnimationComplete={handleExpanded}
                  style={{ position: "fixed" }}
                  aria-hidden="true"
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16, duration: 0.32 }}
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${active.palette.dark} 0%, ${active.palette.base} 18%, ${active.palette.base} 80%, ${active.palette.dark} 100%)`,
                    }}
                  >
                    {hasImage ? (
                      <img
                        src={active.image ?? ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
                        <span
                          className="font-serif text-2xl font-semibold leading-tight"
                          style={{ color: active.palette.ink }}
                        >
                          {active.title}
                        </span>
                        {active.author ? (
                          <span
                            className="text-sm opacity-75"
                            style={{ color: active.palette.ink }}
                          >
                            {active.author}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Spine crease and cover sheen. */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[2px]"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: hasImage ? 0 : 0.35 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${active.palette.dark} 0%, ${active.palette.base} 16%, ${active.palette.base} 78%, ${active.palette.dark} 100%)`,
                    }}
                  >
                    <div
                      className="absolute inset-x-1 top-4 h-px opacity-80"
                      style={{ backgroundColor: active.palette.foil }}
                    />
                    <div
                      className="absolute inset-x-1 bottom-4 h-px opacity-80"
                      style={{ backgroundColor: active.palette.foil }}
                    />
                    <span
                      className="max-h-full overflow-hidden whitespace-nowrap px-1 py-5 font-serif text-[10px] font-semibold uppercase tracking-[0.1em] [writing-mode:vertical-rl] rotate-180"
                      style={{ color: active.palette.ink }}
                    >
                      {active.title}
                      {active.author ? (
                        <span className="font-normal opacity-70">
                          {" "}
                          · {active.author}
                        </span>
                      ) : null}
                    </span>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </BookPullContext.Provider>
  );
}
