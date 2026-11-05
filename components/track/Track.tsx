"use client";

import { Book } from "@/types/book";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IconButton from "../basicUI/IconButton";
import { Button } from "../ui/button";
import { CardIcon } from "../icons/CardIcon";
import { CrazyViewIcon } from "../icons/CrazyViewIcon";
import { ListIcon } from "../icons/ListIcon";
import { ShelfIcon } from "../icons/ShelfIcon";
import FilterTrack from "./_FilterTracking";
import TrackBookViewLogic from "./_TrackBookViewLogic";
import { cn } from "@/lib/utils";

const options = [
  { name: "Updated Date" },
  { name: "Book Length" },
  { name: "Book Title" },
  { name: "Last Read" },
  { name: "Author" },
];

const pageOptions = [
  { name: "10" },
  { name: "25" },
  { name: "50" },
  { name: "100" },
];

const statusOptions = [
  { value: "", label: "All" },
  { value: "0", label: "Currently Reading" },
  { value: "1", label: "Read" },
  { value: "2", label: "Want To Read" },
  { value: "3", label: "Did Not Finish" },
];

const viewOptions = ["Card", "List", "Shelf", "CrazyView"];

interface Props {
  books: Book[];
  totalCount?: number;
}

function SanitizeOrderByParam(str: string): string {
  return str.replace(/\s/g, "").toLocaleLowerCase();
}

export default function Track({ books, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const urlPageSize = searchParams.get("pageSize") || "25";
  const currentStatus = searchParams.get("status") ?? "";

  const selected = useMemo(
    () =>
      options.find(
        (option) =>
          SanitizeOrderByParam(option.name) ===
          SanitizeOrderByParam(searchParams.get("order") || "")
      ) || options[0],
    [searchParams]
  );

  const selectedPageSize = useMemo(
    () =>
      pageOptions.find((option) => option.name === urlPageSize) ||
      pageOptions[1],
    [urlPageSize]
  );

  // Persist the view in the URL so reloads, links, and back/forward keep it.
  const selectedView = useMemo(
    () =>
      viewOptions.find(
        (view) =>
          SanitizeOrderByParam(view) ===
          SanitizeOrderByParam(searchParams.get("view") || "")
      ) || viewOptions[0],
    [searchParams]
  );

  const updateMultipleParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  // The shelf is the signature mobile view; desktop keeps the compact rows.
  useEffect(() => {
    if (searchParams.get("view")) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    router.replace(
      pathname + "?" + updateMultipleParams({ view: "shelf" }),
      { scroll: false }
    );
  }, [pathname, router, searchParams, updateMultipleParams]);

  const pageSize = parseInt(selectedPageSize.name);
  const totalBooks = totalCount || books.length;
  const totalPages = Math.max(1, Math.ceil(totalBooks / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + books.length;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const setFilterSelection = (e: { name: string }) => {
    router.push(
      pathname +
        "?" +
        updateMultipleParams({
          order: SanitizeOrderByParam(e.name),
          page: "1",
        }),
      { scroll: false }
    );
  };

  const setPaginationSelection = (e: { name: string }) => {
    router.push(
      pathname +
        "?" +
        updateMultipleParams({
          pageSize: e.name,
          page: "1",
        }),
      { scroll: false }
    );
  };

  const switchView = (view: string) => {
    router.push(
      pathname +
        "?" +
        updateMultipleParams({ view: SanitizeOrderByParam(view) }),
      { scroll: false }
    );
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(
        pathname + "?" + updateMultipleParams({ page: page.toString() }),
        { scroll: false }
      );
    }
  };

  const PaginationControls = () => (
    <div className="mt-6 flex flex-col gap-3 rounded-lg bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        <span>
          Showing {totalBooks === 0 ? 0 : startIndex + 1}-
          {Math.min(endIndex, totalBooks)} of {totalBooks} books
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-center">
        <Button
          variant="outline"
          className="min-h-11 min-w-11 px-3"
          aria-label="Previous page"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <span className="min-w-16 text-center text-sm font-medium tabular-nums sm:hidden">
          {currentPage} / {totalPages}
        </span>

        <div className="hidden gap-1 sm:flex">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => goToPage(pageNum)}
              aria-current={pageNum === currentPage ? "page" : undefined}
              className={cn(
                "min-h-11 min-w-11 rounded-md border px-3 text-sm transition-colors",
                pageNum === currentPage
                  ? "border-primary bg-primary text-white"
                  : "border-border hover:bg-accent"
              )}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="min-h-11 min-w-11 px-3"
          aria-label="Next page"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <label className="text-sm text-muted-foreground" htmlFor="track-page-size">
          Page size:
        </label>
        <div id="track-page-size" className="w-24">
          <FilterTrack
            options={pageOptions}
            selected={selectedPageSize}
            setSelected={setPaginationSelection}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <nav
        aria-label="Filter by reading status"
        className="flex w-full gap-1 overflow-x-auto overflow-y-hidden rounded-xl bg-card p-1 no-scrollbar"
      >
        {statusOptions.map((option) => {
          const active = currentStatus === option.value;
          const query = updateMultipleParams({
            status: option.value,
            page: "1",
          });

          return (
            <Link
              key={option.label}
              href={`${pathname}?${query}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="w-full md:w-72">
          <FilterTrack
            options={options}
            selected={selected}
            setSelected={setFilterSelection}
          />
        </div>
        <div className="flex justify-end gap-2">
          <IconButton
            icon={<CardIcon />}
            handleClick={() => switchView(viewOptions[0])}
            styles={""}
            tooltipText={viewOptions[0]}
            active={selectedView === viewOptions[0]}
          />
          <div className="hidden md:block">
            <IconButton
              icon={<ListIcon />}
              handleClick={() => switchView(viewOptions[1])}
              styles={""}
              tooltipText={viewOptions[1]}
              active={selectedView === viewOptions[1]}
            />
          </div>
          <IconButton
            icon={<ShelfIcon />}
            handleClick={() => switchView(viewOptions[2])}
            styles={""}
            tooltipText={viewOptions[2]}
            active={selectedView === viewOptions[2]}
          />
          <IconButton
            icon={<CrazyViewIcon />}
            handleClick={() => switchView(viewOptions[3])}
            styles={""}
            tooltipText={viewOptions[3]}
            active={selectedView === viewOptions[3]}
          />
        </div>
      </div>

      <PaginationControls />

      <div className="mb-4">
        <TrackBookViewLogic
          selectedView={selectedView}
          books={books}
          viewOptions={viewOptions}
        />
      </div>
    </div>
  );
}
