"use client";

import { Book } from "@/types/book";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useMemo } from "react";
import IconButton from "../basicUI/IconButton";
import { CardIcon } from "../icons/CardIcon";
import { ListIcon } from "../icons/ListIcon";
import { ShelfIcon } from "../icons/ShelfIcon";
import FilterTrack from "./_FilterTracking";
import TrackBookViewLogic from "./_TrackBookViewLogic";

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

  const switchView = (toolName: string) =>
    setSelectedView(viewOptions.find((tool) => tool === toolName));

  const [selected, setSelected] = useState(options[0]);
  const [selectedPageSize, setSelectedPageSize] = useState(
    pageOptions.find((option) => option.name === urlPageSize) || pageOptions[1]
  );

  const viewOptions = ["Card", "List", "Shelf", "CrazyView"];
  const [selectedView, setSelectedView] = useState<string | undefined>(
    viewOptions[0]
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
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

  const pageSize = parseInt(selectedPageSize.name);
  const totalBooks = totalCount || books.length;
  const totalPages = Math.ceil(totalBooks / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + books.length;

  const paginatedBooks = books;

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
        })
    );
    setSelected(e);
  };

  const setPaginationSelection = (e: { name: string }) => {
    router.push(
      pathname +
        "?" +
        updateMultipleParams({
          pageSize: e.name,
          page: "1",
        })
    );
    setSelectedPageSize(e);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(pathname + "?" + createQueryString("page", page.toString()));
    }
  };

  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 p-4 bg-card rounded-lg">
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          Showing {startIndex + 1}-{Math.min(endIndex, totalBooks)} of{" "}
          {totalBooks} books
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-3 py-2 text-sm rounded-md border ${
                pageNum === currentPage
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Page size:</label>
        <FilterTrack
          options={pageOptions}
          selected={selectedPageSize}
          setSelected={setPaginationSelection}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div>
        <TabGroup>
          <TabList className="flex gap-4 w-full sm:mx-auto overflow-x-auto overflow-y-hidden no-scrollbar ">
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-card"
              onClick={() => {
                router.push(
                  pathname +
                    "?" +
                    updateMultipleParams({ status: "", page: "1" })
                );
              }}
            >
              All
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(
                  pathname +
                    "?" +
                    updateMultipleParams({ status: "0", page: "1" })
                );
              }}
            >
              Currently Reading
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(
                  pathname +
                    "?" +
                    updateMultipleParams({ status: "1", page: "1" })
                );
              }}
            >
              Read
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(
                  pathname +
                    "?" +
                    updateMultipleParams({ status: "2", page: "1" })
                );
              }}
            >
              Want To Read
            </Tab>
            <Tab
              className="data-[selected]:bg-primary text-white rounded-xl p-4 data-[hover]:bg-primary data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-white  bg-slate-400"
              onClick={() => {
                router.push(
                  pathname +
                    "?" +
                    updateMultipleParams({ status: "3", page: "1" })
                );
              }}
            >
              Did Not Finish
            </Tab>
          </TabList>

          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            <div className="top-16 w-72">
              <FilterTrack
                options={options}
                selected={selected}
                setSelected={setFilterSelection}
              />
            </div>
            <div className="flex gap-4">
              <IconButton
                icon={<CardIcon />}
                handleClick={() => {
                  switchView(viewOptions[0]);
                }}
                styles={""}
                tooltipText={viewOptions[0]}
                active={selectedView === viewOptions[0]}
              />
              <IconButton
                icon={<ListIcon />}
                handleClick={() => {
                  switchView(viewOptions[1]);
                }}
                styles={""}
                tooltipText={viewOptions[1]}
                active={selectedView === viewOptions[1]}
              />
              <IconButton
                icon={<ShelfIcon />}
                handleClick={() => {
                  switchView(viewOptions[2]);
                }}
                styles={""}
                tooltipText={viewOptions[2]}
                active={selectedView === viewOptions[2]}
              />

              <IconButton
                icon={<CardIcon />}
                handleClick={() => {
                  switchView(viewOptions[3]);
                }}
                styles={""}
                tooltipText={viewOptions[3]}
                active={selectedView === viewOptions[3]}
              />
            </div>
          </div>
          <PaginationControls />
          <TabPanels className="mb-4">
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={paginatedBooks}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={paginatedBooks}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={paginatedBooks}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={paginatedBooks}
                viewOptions={viewOptions}
              />
            </TabPanel>
            <TabPanel>
              <TrackBookViewLogic
                selectedView={selectedView}
                books={paginatedBooks}
                viewOptions={viewOptions}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
