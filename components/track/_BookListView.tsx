import React, { useState } from "react";
import { Book } from "@/types/book";

const ALL_COLUMNS = [
  { key: "image", label: "Image" },
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "pageCount", label: "Page Count" },
  { key: "status", label: "Status" },
  { key: "releaseYear", label: "Release Year" },
  { key: "seriesName", label: "Series Name" },
  { key: "seriesPosition", label: "Series Position" },
  { key: "genres", label: "Genres" },
  { key: "rating", label: "Rating" },
  { key: "dateRead", label: "Date Read" },
];

const DEFAULT_COLUMNS = ["image", "title", "author", "pageCount"];

export default function BookListView({ books }: { books: Book[] }) {
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(DEFAULT_COLUMNS);

  const renderColumn = (book: Book, columnKey: string) => {
    switch (columnKey) {
      case "image":
        return (
          <img
            className="relative overflow-hidden transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
            src={book.book?.image || ""}
            alt={book.book?.title}
            height={100}
            width={100}
          />
        );
      case "title":
        return book.book?.title;
      case "author":
        return book.author?.name;
      case "pageCount":
        return book.book?.pageCount;
      case "status":
        return book.book?.status;
      case "releaseYear":
        return book.book?.releaseYear;
      case "seriesName":
        return book.book?.seriesName;
      case "seriesPosition":
        return book.book?.seriesPosition;
      case "genres":
        return book.book?.genres?.join(", ");
      case "rating":
        return book.book?.rating;
      case "dateRead":
        return book.book?.dateRead?.toString();
      default:
        return null;
    }
  };

  const toggleColumn = (columnKey: string) => {
    if (DEFAULT_COLUMNS.includes(columnKey)) {
      return;
    }

    setSelectedColumns((current) =>
      current.includes(columnKey)
        ? current.filter((key) => key !== columnKey)
        : [...current, columnKey]
    );
  };

  return (
    <div className="w-full">
      <fieldset className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <legend className="text-sm font-medium">Select Columns:</legend>
        {ALL_COLUMNS.map((column) => {
          const isRequired = DEFAULT_COLUMNS.includes(column.key);

          return (
            <label
              key={column.key}
              className="flex items-center gap-1.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedColumns.includes(column.key)}
                disabled={isRequired}
                onChange={() => toggleColumn(column.key)}
              />
              {column.label}
              {isRequired && " (Required)"}
            </label>
          );
        })}
      </fieldset>

      {/* Book List Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-4 border-black">
          <thead>
            <tr className="text-left text-2xl">
              {selectedColumns.map((columnKey) => {
                const column = ALL_COLUMNS.find((col) => col.key === columnKey);
                return column ? (
                  <th key={columnKey} className="px-4 py-2 font-semibold">
                    {column.label}
                  </th>
                ) : null;
              })}
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr
                key={index}
                className="border-black border-y-2 hover:bg-gray-50 text-md md:text-lg font-semibold text-text"
              >
                {selectedColumns.map((columnKey) => (
                  <td key={columnKey} className="px-4 py-2">
                    {renderColumn(book, columnKey)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
