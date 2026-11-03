"use client";

import { Book } from "@/types/book";
import { readingStatusString } from "@/types/enums/statusEnum";
import { Tab, TabGroup, TabList, TabPanel } from "@headlessui/react";
import Notes from "./_Notes";
import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import Series from "./_Series";
import "./BookDetails.css";

interface Props {
  hardCoverBookInfo: Book;
  dbBookInfo: Book | null;
  hcSeriesData: BookSeriesArray;
  seriesBooks: Book[];
}

export default function BookDetails({
  hardCoverBookInfo,
  dbBookInfo,
  hcSeriesData,
  seriesBooks,
}: Props) {
  const addbuttonText = () => {
    var status = hardCoverBookInfo.book?.status;

    if (status === null) {
      return readingStatusString[4];
    }

    return readingStatusString[status || 0];
  };

  const tabItems = [
    { value: "details", label: "Details" },
    { value: "series", label: "Series" },
    ...(dbBookInfo ? [{ value: "notes", label: "Notes" }] : []),
  ];

  return (
    <div>
      <div className="outside">
        <div className="book-wrapper">
          <div className="card">
            <div className="cover shadow">
              <img
                src={hardCoverBookInfo?.book?.image || ""}
                alt={hardCoverBookInfo?.book?.title}
              />
            </div>
            <div className="content">
              <h3 className="text-2xl font-bold">
                {hardCoverBookInfo?.book?.title}
              </h3>

              {hardCoverBookInfo.author?.name ? (
                <p className="mt-1 text-muted-foreground">
                  by {hardCoverBookInfo.author.name}
                </p>
              ) : null}

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {hardCoverBookInfo.book?.releaseYear ? (
                  <div>
                    <dt className="text-muted-foreground">Published</dt>
                    <dd>{hardCoverBookInfo.book.releaseYear}</dd>
                  </div>
                ) : null}
                {hardCoverBookInfo.book?.pageCount ? (
                  <div>
                    <dt className="text-muted-foreground">Pages</dt>
                    <dd>{hardCoverBookInfo.book.pageCount}</dd>
                  </div>
                ) : null}
                {hardCoverBookInfo.book?.seriesName ? (
                  <div>
                    <dt className="text-muted-foreground">Series</dt>
                    <dd>
                      {hardCoverBookInfo.book.seriesName}
                      {hardCoverBookInfo.book.seriesPosition
                        ? ` #${hardCoverBookInfo.book.seriesPosition}`
                        : ""}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {hardCoverBookInfo.book?.genres?.length ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {hardCoverBookInfo.book.genres.join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-2 lg:px-0 max-w-3xl ">
        <TabGroup>
          <TabList className="flex gap-4 w-full sm:mx-auto overflow-x-auto overflow-y-hidden no-scrollbar ">
            {tabItems.map((tab) => {
              return (
                <Tab
                  key={tab.value}
                  className="data-[selected]:border-b-4 data-[selected]:border-primary data-[hover]:border-b-4  data-[hover]:border-primary  text-lg  text-primary  p-2  data-[focus]:outline-1 data-[focus]:outline-white  "
                >
                  {tab.label}
                </Tab>
              );
            })}
          </TabList>
          <TabPanel>
            <p className="whitespace-pre-line">
              {hardCoverBookInfo.book?.description || "No description yet."}
            </p>
          </TabPanel>

          <TabPanel>
            <Series
              seriesInfo={hcSeriesData}
              authorName={hardCoverBookInfo.author?.name || ""}
              seriesBooks={seriesBooks}
            />
          </TabPanel>
          {dbBookInfo ? (
            <TabPanel>
              <Notes dbBookInfo={dbBookInfo} />
            </TabPanel>
          ) : null}
        </TabGroup>
      </div>
    </div>
  );
}
