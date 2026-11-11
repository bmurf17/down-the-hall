"use client";

import { Book } from "@/types/book";
import { readingStatusString } from "@/types/enums/statusEnum";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Notes from "./_Notes";
import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import Series from "./_Series";
import { useCoverAccent } from "@/hooks/use-cover-accent";
import CoverFlip from "./_CoverFlip";
import { EmptyState } from "../shared/EmptyState";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  FileText,
  Layers,
  type LucideIcon,
} from "lucide-react";

interface Props {
  hardCoverBookInfo: Book;
  dbBookInfo: Book | null;
  hcSeriesData: BookSeriesArray;
  seriesBooks: Book[];
}

interface MetaItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export default function BookDetails({
  hardCoverBookInfo,
  dbBookInfo,
  hcSeriesData,
  seriesBooks,
}: Props) {
  const tabItems = [
    { value: "details", label: "Details" },
    { value: "series", label: "Series" },
    ...(dbBookInfo ? [{ value: "notes", label: "Notes" }] : []),
  ];

  const coverAccent = useCoverAccent(hardCoverBookInfo?.book?.image);
  const accent = coverAccent ?? "hsl(var(--primary))";

  const book = hardCoverBookInfo?.book;

  const metaItems: MetaItem[] = [];
  if (book?.releaseYear) {
    metaItems.push({
      icon: CalendarDays,
      label: "Published",
      value: book.releaseYear,
    });
  }
  if (book?.pageCount) {
    metaItems.push({ icon: FileText, label: "Pages", value: book.pageCount });
  }
  if (book?.seriesName) {
    metaItems.push({
      icon: Layers,
      label: "Series",
      value: `${book.seriesName}${
        book.seriesPosition ? ` #${book.seriesPosition}` : ""
      }`,
    });
  }

  const readingStatus =
    typeof dbBookInfo?.book?.status === "number"
      ? dbBookInfo.book.status
      : null;
  const statusLabel =
    readingStatus !== null ? readingStatusString[readingStatus] : null;

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_60px_-48px_rgba(45,30,15,0.9)]">
        {/* Soft glow pulled from the cover, plus a thin accent rule. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: accent }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-70"
          style={{
            backgroundImage: `linear-gradient(90deg, ${accent}, transparent 70%)`,
          }}
        />

        <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-8 lg:gap-10 lg:p-10">
          <div className="mx-auto w-36 shrink-0 sm:mx-0 sm:w-40 lg:w-52">
            <CoverFlip
              book={book}
              authorName={hardCoverBookInfo.author?.name ?? undefined}
              description={book?.description}
              statusLabel={statusLabel}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              {statusLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {statusLabel}
                </span>
              )}
              {book?.genres?.length ? (
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {book.genres.slice(0, 3).join(" · ")}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {book?.title}
            </h1>

            {hardCoverBookInfo.author?.name ? (
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                by{" "}
                <span className="font-medium text-foreground">
                  {hardCoverBookInfo.author.name}
                </span>
              </p>
            ) : null}

            {metaItems.length ? (
              <dl className="mt-6 flex flex-wrap gap-2">
                {metaItems.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="min-w-28 flex-1 rounded-xl border border-border/60 bg-background/60 px-3.5 py-2.5 sm:flex-none"
                  >
                    <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Icon className="size-3.5" aria-hidden />
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      <TabGroup>
        <TabList className="no-scrollbar mt-8 flex w-full gap-1 overflow-x-auto overflow-y-hidden rounded-xl border border-border/70 bg-card p-1 shadow-sm">
          {tabItems.map((tab) => (
            <Tab
              key={tab.value}
              className={({ selected }) =>
                cn(
                  "inline-flex min-h-11 flex-1 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="mt-5">
          <TabPanel className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              About this book
            </h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-foreground/80">
              {book?.description || "No description yet."}
            </p>
          </TabPanel>

          <TabPanel>
            {seriesBooks.length ? (
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <Series
                  seriesInfo={hcSeriesData}
                  authorName={hardCoverBookInfo.author?.name || ""}
                  seriesBooks={seriesBooks}
                />
              </div>
            ) : (
              <EmptyState
                icon={Layers}
                title="No series information"
                description="This book doesn't appear to belong to a series yet."
                className="rounded-2xl border border-dashed border-border bg-card/50"
              />
            )}
          </TabPanel>

          {dbBookInfo ? (
            <TabPanel>
              <Notes dbBookInfo={dbBookInfo} />
            </TabPanel>
          ) : null}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
