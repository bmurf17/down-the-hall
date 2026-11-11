"use client";

import { useState } from "react";
import { Book } from "@/types/book";
import { BookCover } from "../shared/BookCover";
import "./_CoverFlip.css";

interface Props {
  book: Book["book"];
  authorName?: string;
  description?: string | null;
  statusLabel?: string | null;
}

/**
 * Interactive cover with the old 3D "open the book" hover. The inside page now
 * holds a small library card rather than all of the book's details, so nothing
 * is hidden behind a hover-only interaction.
 */
export default function CoverFlip({
  book,
  authorName,
  description,
  statusLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="book-3d" data-open={open ? "true" : "false"}>
      <button
        type="button"
        aria-label={open ? "Close book cover" : "Open book cover"}
        aria-pressed={open}
        onClick={() => setOpen((value) => !value)}
        className="book-3d__stage border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <span className="book-3d__page">
          <span className="book-3d__page-kicker">Down The Hall Library</span>
          <span className="book-3d__page-body">
            <span className="book-3d__page-title">{book?.title}</span>
            {authorName ? (
              <span className="book-3d__page-author">{authorName}</span>
            ) : null}
            {description ? (
              <span className="book-3d__page-desc">{description}</span>
            ) : null}
          </span>
          <span className="book-3d__stamp">{statusLabel ?? "Catalogued"}</span>
        </span>

        <span className="book-3d__cover">
          <BookCover
            src={book?.image}
            alt={book?.title ?? ""}
            className="h-full w-full shadow-none"
          />
          <span className="book-3d__spine" aria-hidden />
        </span>
      </button>
    </div>
  );
}
