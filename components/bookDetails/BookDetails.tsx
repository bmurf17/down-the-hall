"use client";

import { Book } from "@/types/book";
import { readingStatusString } from "@/types/enums/statusEnum";
import { Tab, TabGroup, TabList, TabPanel } from "@headlessui/react";
import { AddToListButton } from "../shared/AddToListButton";
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
          <TabPanel>{hardCoverBookInfo.book?.description}</TabPanel>

          <TabPanel>
            <Series
              seriesInfo={hcSeriesData}
              authorName={hardCoverBookInfo.author?.name || ""}
              seriesBooks={seriesBooks}
            />
          </TabPanel>
          <TabPanel>
            <Notes dbBookInfo={dbBookInfo} />
          </TabPanel>
        </TabGroup>
      </div>
    </div>
  );
}
