"use client";

import { Book } from "@/types/book";
import { readingStatusString } from "@/types/enums/statusEnum";
import { Tab, TabGroup, TabList, TabPanel } from "@headlessui/react";
import { AddToListButton } from "../shared/AddToListButton";
import Notes from "./_Notes";
import { BookSeriesArray } from "@/types/apiResponse/seriesResponse";
import Series from "./_Series";

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
    <div style={{ minHeight: "calc(100vh - 101px)" }}>
      <div
        className="relative h-80"
        style={{ marginTop: "-64px", paddingTop: "64px" }}
      >
        <div
          className="absolute top-0 bg-repeat bg-top w-full lg:h-[500px]"
          style={{
            backgroundImage: `url(${"https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/banner.webp?alt=media&token=aa88a249-421e-4f04-a56a-7b5257cbcd75"})`,
            width: "100%",
            height: "100%",
          }}
        >
          <div className="bg-gradient-to-b from-transparent to-white dark:to-gray-800 h-full flex flex-col justify-end items-center lg:from-50% lg:to-100% to-90%">
            <div className="lg:hidden">
              <div className="relative overflow-hidden group transition-all rounded-l-sm rounded-r-md border border-secondary"></div>
            </div>
            <div className="relative px-2 lg:px-0 lg:pt-8 mt-[180px] lg:mt-[80px]">
              <div className="mx-auto px-2 lg:px-0 my-2 max-w-3xl lg:h-0">
                <div className="flex flex-row">
                  <div className="hidden lg:block mr-4 flex-none">
                    <div className=" relative overflow-hidden group transition-all rounded-l-sm rounded-r-md border border-secondary ">
                      <img
                        src={hardCoverBookInfo?.book?.image || ""}
                        alt={hardCoverBookInfo?.book?.title}
                        width="180"
                        height="271"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="mt-4">
                        <h1 className="font-serif text-gray-800 dark:text-gray-200 mb-1 text-3xl lg:text-5xl">
                          {hardCoverBookInfo?.book?.title}
                        </h1>
                        <div className="mt-2 lg:mt-0">
                          <div className="font-semibold text-sm hidden lg:flex">
                            <div className="flex-inline flex-row flex-wrap leading-5">
                              <span className="text-md mr-1">By</span>

                              <span className="flex-inline flex-row mr-1">
                                <span className="ml-1">
                                  {hardCoverBookInfo.author?.name}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col col-span-4 lg:col-span-2">
                      <div className="hidden lg:block">
                        <AddToListButton
                          title={hardCoverBookInfo.book?.title || ""}
                          author={hardCoverBookInfo.author?.name || ""}
                          image={hardCoverBookInfo.book?.image || ``}
                          default_physical_edition_id={
                            hardCoverBookInfo.book?.defaultPhysicalEditionId ||
                            0
                          }
                          description={
                            hardCoverBookInfo.book?.description ?? ""
                          }
                          hardcover_id={
                            hardCoverBookInfo.book?.hardcoverId || 0
                          }
                          release_year={
                            hardCoverBookInfo.book?.releaseYear + ""
                          }
                          series_length={
                            hardCoverBookInfo.book?.seriesLength || 0
                          }
                          series_name={hardCoverBookInfo.book?.seriesName || ""}
                          series_position={
                            hardCoverBookInfo.book &&
                            hardCoverBookInfo.book.seriesPosition !== null
                              ? hardCoverBookInfo.book.seriesPosition
                              : ""
                          }
                          buttonText={addbuttonText()}
                          page_number={hardCoverBookInfo.book?.pageCount || 0}
                          id={hardCoverBookInfo.book?.id || 0}
                          rating={"0"}
                        />
                      </div>
                      <div>
                        <div className="mt-3 mb-2 flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 text-sm font-semibold flex gap-1">
                            <p>
                              Released {hardCoverBookInfo.book?.releaseYear} •
                            </p>
                            <p>{hardCoverBookInfo.book?.pageCount} Pages</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-2 py-8 lg:px-0 my-4 max-w-3xl lg:mt-80">
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
