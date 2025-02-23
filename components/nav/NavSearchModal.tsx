"use client";

import { useState, useCallback, useEffect } from "react";

import { convertTrendingBookData } from "@/helpers/convertTrendingBookToBook";
import { Book } from "@/types/book";
import { TrendingData } from "@/types/trending/trendingbookresponse";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { Loader2, SearchIcon, X } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import { AddToListButton } from "../shared/AddToListButton";
import { fetchBooks } from "@/functions/fetchBook";

export function NavSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
  };

  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const theBooks: Book[] | undefined = await fetchBooks(query);

      if (theBooks !== null && theBooks !== undefined) {
        setSearchResults(theBooks);
      }
    } catch (err) {
      setError("Failed to fetch books. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search to reduce unnecessary API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        fetchSearchResults(searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, fetchSearchResults]);

  const addbuttonText = (book: Book) => {
    var status = book.book?.status;

    if (status === null) {
      return "Add to List";
    }

    return [
      "Want to Read",
      "Currently Reading",
      "Finished",
      "On Hold",
      "Add to List",
    ][status || 0];
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 text-white hover:bg-gray-100/20 p-2 rounded-md transition-colors"
      >
        <SearchIcon className="h-5 w-5" />
        <span className="hidden md:inline">Search</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                  <div className="p-6 pb-0 flex justify-between items-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Search Books
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6 pt-4">
                    <input
                      type="text"
                      placeholder="Search books by title, author, or genre"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {isLoading && (
                    <div className="flex justify-center items-center p-6">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  )}

                  {error && <div className="p-6 text-red-500">{error}</div>}

                  {!isLoading &&
                    !error &&
                    searchResults.length === 0 &&
                    searchTerm && (
                      <div className="p-6 text-gray-500">
                        No books found. Try adjusting your search terms.
                      </div>
                    )}

                  {searchResults.length > 0 && (
                    <div className="max-h-[500px] overflow-y-auto">
                      {searchResults.map((book) => (
                        <div
                          key={book.book?.hardcoverId}
                          className="flex justify-between items-center p-4 border-b hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={
                                book.book?.image ||
                                `/images/covers/cover${
                                  Math.floor(Math.random() * 7) + 1
                                }.png`
                              }
                              alt={book.book?.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-bold">{book.book?.title}</h4>
                              <p className="text-gray-600">
                                By: {book.author?.name}
                              </p>
                            </div>
                          </div>
                          <SignedIn>
                            <AddToListButton
                              title={book.book?.title || ""}
                              author={book.author?.name || ""}
                              image={book.book?.image || ""}
                              default_physical_edition_id={
                                book.book?.defaultPhysicalEditionId || 0
                              }
                              description={book.book?.description ?? ""}
                              hardcover_id={book.book?.hardcoverId || 0}
                              release_year={book.book?.releaseYear + ""}
                              series_length={book.book?.seriesLength || 0}
                              series_name={book.book?.seriesName || ""}
                              series_position={book.book?.seriesPosition || ""}
                              buttonText={addbuttonText(book)}
                              page_number={book.book?.pageCount || 0}
                              id={book.book?.id || 0}
                              rating={book.book?.rating || "0"}
                            />
                          </SignedIn>
                        </div>
                      ))}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
