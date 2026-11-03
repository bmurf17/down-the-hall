"use client";

import { deleteBook, editBook } from "@/actions/bookActions";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@/types/book";
import Link from "next/link";
import { useId, useState } from "react";
import StarRating from "./StarRating";
import { SelectBook } from "@/lib/schema";
import { SignedIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Popover, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { Label } from "../ui/label";
import { BookCover } from "./BookCover";
import { Input } from "../ui/input";

interface Props {
  book: Book;
}

function fallbackCoverNumber(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 7) + 1;
}

export default function BookListItem({ book }: Props) {
 const { toast } = useToast();
  const uid = useId();
  const [title, setTitle] = useState(book.book?.title ?? "");
  const [pageCount, setPageCount] = useState<number | undefined>(book.book?.pageCount ?? undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState<"save" | "delete" | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRead, setDateRead] = useState<Date | undefined>(
    book.book?.dateRead ? new Date(book.book.dateRead.toString()) : undefined
  );

  const fallbackCover = `https://hardcover.app/images/covers/cover${fallbackCoverNumber(
    `${book.book?.title ?? ""}|${book.author?.name ?? ""}`
  )}.png`;

  const hardcoverId = book.book?.hardcoverId;
  const hasHardcoverId = typeof hardcoverId === "number" && hardcoverId > 0;

  const handleSave = async () => {
    setPending("save");
    try {
      await editBook(book.book?.id ?? 0, title, book.book?.status ?? 0, book.book?.rating ?? "0", dateRead, pageCount ?? 0);
      setIsEditing(false);
      toast({ title: "Book updated", description: `${title} was updated` });
    } catch {
      toast({ title: "Couldn't update book", variant: "destructive" });
    } finally {
      setPending(null);
    }
  };

  const handleDelete = async () => {
    setPending("delete");
    try {
      await deleteBook(book.book?.id ?? 0);
      toast({ title: "Book deleted", description: `${book.book?.title} was deleted` });
    } catch {
      toast({ title: "Couldn't delete book", variant: "destructive" });
      setPending(null);
    }
  };

 const hasStatus = book.book?.status !== null;
  const meta = [book.book?.genres?.slice(0, 3).join(", "), pageCount ? `${pageCount} pages` : null]
    .filter(Boolean)
    .join(" · ");

return (
    <article className="relative flex flex-col gap-3 border-b border-border p-3 sm:p-4 md:flex-row md:items-center md:gap-4 md:hover:bg-muted/50">
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <BookCover src={book.book?.image || fallbackCover} className="w-16 shrink-0 sm:w-20 md:w-24" />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor={`${uid}-title`}>Title</Label>
                <Input id={`${uid}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor={`${uid}-pages`}>Pages</Label>
                  <Input
                    id={`${uid}-pages`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={pageCount ?? ""}
                    onChange={(e) => setPageCount(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`${uid}-date`}>Date finished</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button id={`${uid}-date`} variant="outline" className="w-full justify-between font-normal">
                        {dateRead ? dateRead.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    {/* PopoverContent + Calendar unchanged */}
                  </Popover>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug sm:text-lg">
                {hasHardcoverId ? (
                  // after:inset-0 stretches the link over the whole card
                  <Link href={`/book/${hardcoverId}`} className="underline-offset-4 after:absolute after:inset-0 hover:underline">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{book.author?.name}</p>
              {book.book?.seriesName && <p className="text-sm text-muted-foreground">{book.book.seriesName}</p>}
              {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
            </>
          )}

          {hasStatus && book.book && (
            <div className="relative z-10 mt-1">
              <StarRating book={book.book as SelectBook} />
            </div>
          )}
        </div>
      </div>

      {/* relative z-10 keeps buttons above the stretched link */}
      <div className="relative z-10 grid auto-cols-fr grid-flow-col gap-2 md:flex md:shrink-0">
        <SignedIn>{/* AddToListButton as before */}</SignedIn>
        {hasStatus && (
          <>
            <Button
              variant="outline"
              className="min-h-11 md:min-h-9"
              disabled={pending !== null}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {pending === "save" ? <Loader2 className="size-4 animate-spin" /> : isEditing ? "Save" : "Edit"}
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 text-destructive md:min-h-9"
              disabled={pending !== null}
              onClick={handleDelete} // wrap in an AlertDialog confirm
            >
              {pending === "delete" ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
