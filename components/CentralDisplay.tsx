"use client";
import { addBook } from "@/actions/bookActions";
import { Book } from "@/types/book";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";
import BookListItem from "./shared/BookListItem";

interface Props {
  books: Book[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CentralDisplay({ books }: Props) {
  let [categories] = useState({
    Trending: [
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
    "Your Feed": [
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
                "rounded-xl bg-gray-300 p-3 animate-fade-in-grow",
                "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
              )}
            >
              <div className="flex flex-col gap-4">
                <>
                  {books.map((book, i) => {
                    return (
                      <BookListItem
                        book={book}
                        addBookToList={addBookToList}
                        key={book.book?.hardcoverId}
                      />
                    );
                  })}
                </>
              </div>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
