"use client";

import { addBookToList } from "@/functions/addBook";
import { Book } from "@/types/book";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Button from "../basicUI/Button";
import BookListItem from "../shared/BookListItem";

interface Props {
  books: Book[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Find({ books }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");

  // Debounce delay (e.g., 300ms)
  const debounceDelay = 300;

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        router.push(pathname + "?" + createQueryString("title", searchTerm));
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, router, pathname, createQueryString]);

  const clear = () => ({});

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-5 relative gap-2 lg:gap-4">
      <div className="relative col-span-1">
        <div className="flex gap-2 items-center">
          <div className="font-medium text-lg">Filters</div>
          <Button
            text={"Clear"}
            handleClick={clear}
            styles={
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:primary border rounded-lg active:translate-y-1 transition-all bg-primary border-primary hover:bg-primary text-white py-2 px-2 active:shadow-none gap-2"
            }
          />
        </div>
      </div>
      <div className="lg:col-span-4 relative">
        <div className="flex justify-center gap-2 align-middle">
          <input
            className="flex border-2 border-gray-200 p-4 rounded-xl mb-2 w-full"
            placeholder="Search"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4 ">
          {books.length > 0 ? (
            <>
              <div
                className={classNames(
                  "rounded-xl bg-gray-300 p-3 animate-fade-in-grow",
                  "ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                )}
              >
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
            </>
          ) : (
            <> Search to see results</>
          )}
        </div>
      </div>
    </div>
  );
}
