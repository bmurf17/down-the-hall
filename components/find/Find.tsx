"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

const MIN_SEARCH_LENGTH = 2;
const RECENT_SEARCHES_KEY = "down-the-hall:recent-searches";
const GENRES = [
  "Fantasy",
  "Romance",
  "Science Fiction",
  "Mystery",
  "Thriller",
  "Horror",
  "Historical",
  "Nonfiction",
];

export default function Find({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearchTerm = searchParams.get("title") || "";

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceDelay = 400;

  // Keep the input in sync with browser back/forward navigation.
  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(
            parsed.filter((item): item is string => typeof item === "string")
          );
        }
      }
    } catch {
      // localStorage can be unavailable in private browsing - not important.
    }
  }, []);

  const rememberSearch = useCallback((term: string) => {
    setRecentSearches((current) => {
      const next = [
        term,
        ...current.filter(
          (item) => item.toLocaleLowerCase() !== term.toLocaleLowerCase()
        ),
      ].slice(0, 6);

      try {
        window.localStorage.setItem(
          RECENT_SEARCHES_KEY,
          JSON.stringify(next)
        );
      } catch {
        // Ignore storage failures.
      }

      return next;
    });
  }, []);

  const buildUrl = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("title", term);
      } else {
        params.delete("title");
      }
      const query = params.toString();
      return pathname + (query ? `?${query}` : "");
    },
    [pathname, searchParams]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const term = searchTerm.trim();

      if (term.length >= MIN_SEARCH_LENGTH) {
        rememberSearch(term);
      }

      const nextUrl = buildUrl(
        term.length >= MIN_SEARCH_LENGTH ? term : ""
      );
      const currentUrl =
        pathname + (searchParams.toString() ? `?${searchParams}` : "");

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl);
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    router,
    pathname,
    searchParams,
    buildUrl,
    rememberSearch,
  ]);

  const clear = () => {
    setSearchTerm("");
    router.replace(pathname);
  };

  const showDiscovery = searchTerm.trim().length < MIN_SEARCH_LENGTH;
  const searchLabel = useMemo(
    () => (searchTerm ? `Search results for ${searchTerm}` : "Search books"),
    [searchTerm]
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="sticky top-16 z-20 -mx-1 rounded-2xl bg-background/95 px-1 py-2 backdrop-blur">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            aria-label={searchLabel}
            className="min-h-12 w-full rounded-xl border-2 border-border bg-card py-3 pl-12 pr-14 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Search by title or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {showDiscovery ? (
        <section className="flex flex-col gap-4">
          {recentSearches.length > 0 ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Recent searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchTerm(term)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Search className="size-4" aria-hidden />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              Browse by genre
            </h2>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSearchTerm(genre)}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors",
                    "border border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {children}
    </div>
  );
}
