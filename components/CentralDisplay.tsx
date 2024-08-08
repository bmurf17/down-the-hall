"use client";
import { addBook } from "@/actions/bookActions";
import {
  TrendingBookData,
  TrendingBookDetails,
} from "@/types/trendingbookresponse";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Link from "next/link";
import { useState } from "react";
import { AddToListButton } from "./shared/AddToListButton";

interface Props {
  trendingData: TrendingBookData;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CentralDisplay({ trendingData }: Props) {
  let [categories] = useState({
    Recent: [
      {
        id: 1,
        title: "Does drinking coffee make you smarter?",
        date: "5h ago",
        commentCount: 5,
        shareCount: 2,
      },
      {
        id: 2,
        title: "So you've bought coffee... now what?",
        date: "2h ago",
        commentCount: 3,
        shareCount: 2,
      },
    ],
    Popular: [
      {
        id: 1,
        title: "Is tech making coffee better or worse?",
        date: "Jan 7",
        commentCount: 29,
        shareCount: 16,
      },
      {
        id: 2,
        title: "The most innovative things happening in coffee",
        date: "Mar 19",
        commentCount: 24,
        shareCount: 12,
      },
    ],
    Trending: [
      {
        id: 1,
        title: "Ask Me Anything: 10 answers to your questions about coffee",
        date: "2d ago",
        commentCount: 9,
        shareCount: 5,
      },
      {
        id: 2,
        title: "The worst advice we've ever heard about coffee",
        date: "4d ago",
        commentCount: 1,
        shareCount: 2,
      },
    ],
  });

  const addBookToList = (
    title: string,
    author: string,
    authorImg: string,
    status: number,
    image: string,
    release_year: string,
    default_physical_edition_id: number,
    description: string,
    series_position: number,
    series_length: number,
    series_name: string,
    hardcover_id: number
  ) => {
    addBook(
      title,
      author,
      "",
      status,
      image,
      release_year,
      default_physical_edition_id,
      description,
      series_position,
      series_length,
      series_name,
      hardcover_id
    );
  };

  var test: TrendingBookDetails[] = [];

  for (const [key, book] of Object.entries(trendingData.data)) {
    test.push(book);
  }

  return (
    <div className="w-full  px-2 py-2 sm:px-0">
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {Object.keys(categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              {category}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-2">
          {Object.values(categories).map((posts, idx) => (
            <TabPanel
              key={idx}
              className={classNames(
                "rounded-xl bg-gray-300 p-3",
                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
              )}
            >
              <div className="flex flex-col gap-4">
                <>
                  {test.map((book, i) => {
                    const number = Math.floor(Math.random() * 7) + 1;

                    return (
                      <div
                        className="flex justify-between p-4 border-b-2 border-gray-500 hover:bg-slate-200 hover:cursor-pointer"
                        key={book.dto_combined.title + i}
                      >
                        <Link href={`book/${book.id}`}>
                          <div className="flex gap-2">
                            <div>
                              <img
                                className="relative overflow-hidden group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                                src={`https://hardcover.app/images/covers/cover${number}.png`}
                                alt={book.dto_combined.title}
                                height={100}
                                width={100}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="font-serif text-yellow-500 dark:text-yellow-50 underline-offset-4 text-lg no-underline hover:underline decoration-gray-300 dark:decoration-gray-500">
                                {book.dto_combined.title}
                              </div>
                              {book.dto_combined.series.length > 0 ? (
                                <div className="text-md">
                                  By:{" "}
                                  {book.dto_combined.contributions[0].author_id}
                                </div>
                              ) : (
                                <></>
                              )}

                              <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                                Category
                              </div>

                              <div className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                                Page Count: {book.dto_combined.page_count}
                              </div>
                            </div>
                          </div>
                        </Link>
                        <div className="flex self-end">
                          <AddToListButton
                            title={book.dto_combined.title}
                            //todo: actually get author
                            author={
                              book.dto_combined.contributions[0].author_id +
                                "" || ""
                            }
                            //TODO actually get image
                            image={""}
                            //TODO: get physcial edition in
                            default_physical_edition_id={0}
                            description={book.dto_combined.description ?? ""}
                            hardcover_id={book.id}
                            release_year={book.dto_combined.release_year + ""}
                            series_length={book.dto_combined.series.length}
                            series_name={""}
                            //TODO: actually load the series correctly
                            series_position={0}
                            addBookToList={addBookToList}
                            buttonText="Add To List"
                          />
                        </div>
                      </div>
                    );
                  })}{" "}
                </>
              </div>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
