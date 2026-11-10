"use client";

import { deleteBook, editBook } from "@/actions/bookActions";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@/types/book";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import StarRating from "./StarRating";
import { SelectBook } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Status, readingStatusString } from "@/types/enums/statusEnum";
import { SignedIn } from "@clerk/nextjs";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger } from "../ui/popover";
import { Button, buttonVariants } from "../ui/button";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { Label } from "../ui/label";
import { BookCover } from "./BookCover";
import { Input } from "../ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface Props {
  book: Book;
}

/** Reading statuses available from the mobile action sheet. */
const STATUS_OPTIONS = [
  Status.InProgress,
  Status.Finished,
  Status.WantToStart,
  Status.DidNotFinish,
].map((value) => ({ value, label: readingStatusString[value] }));

function fallbackCoverNumber(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 7) + 1;
}

/**
 * Confirmation step for deleting a book. The trigger is passed as children so
 * the same dialog works from the desktop row and from inside the mobile sheet
 * (nesting it in the sheet keeps Radix focus handling correct).
 */
function ConfirmDelete({
  bookTitle,
  onConfirm,
  children,
}: {
  bookTitle: string;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this book?</AlertDialogTitle>
          <AlertDialogDescription>
            {bookTitle} will be deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function BookListItem({ book }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const uid = useId();
  const initialDateRead = book.book?.dateRead
    ? new Date(book.book.dateRead.toString())
    : undefined;
  const [title, setTitle] = useState(book.book?.title ?? "");
  const [pageCount, setPageCount] = useState<number | undefined>(
    book.book?.pageCount ?? undefined
  );
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<number | null>(
    book.book?.status ?? null
  );
  const [pending, setPending] = useState<
    "save" | "delete" | "status" | null
  >(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dateRead, setDateRead] = useState<Date | undefined>(initialDateRead);

  const fallbackCover = `https://hardcover.app/images/covers/cover${fallbackCoverNumber(
    `${book.book?.title ?? ""}|${book.author?.name ?? ""}`
  )}.png`;

  const hardcoverId = book.book?.hardcoverId;
  const hasHardcoverId = typeof hardcoverId === "number" && hardcoverId > 0;

  const handleSave = async () => {
    setPending("save");
    try {
      await editBook(
        book.book?.id ?? 0,
        title,
        status ?? 0,
        book.book?.rating ?? "0",
        dateRead,
        pageCount ?? 0
      );
      setIsEditing(false);
      toast({ title: "Book updated", description: `${title} was updated` });
      router.refresh();
    } catch {
      toast({ title: "Couldn't update book", variant: "destructive" });
    } finally {
      setPending(null);
    }
  };

  const handleStatusChange = async (nextStatus: number) => {
    if (nextStatus === status) return;
    setPending("status");
    try {
      const nextDate =
        nextStatus === Status.Finished ? dateRead ?? new Date() : dateRead;
      await editBook(
        book.book?.id ?? 0,
        title,
        nextStatus,
        book.book?.rating ?? "0",
        nextDate,
        pageCount ?? 0
      );
      setStatus(nextStatus);
      setSheetOpen(false);
      toast({
        title: "Status updated",
        description: `${title} moved to ${readingStatusString[nextStatus]}`,
      });
      router.refresh();
    } catch {
      toast({ title: "Couldn't update status", variant: "destructive" });
    } finally {
      setPending(null);
    }
  };

  // Mobile only: the desktop row has no cancel, so this just resets the form.
  const handleCancel = () => {
    setTitle(book.book?.title ?? "");
    setPageCount(book.book?.pageCount ?? undefined);
    setDateRead(initialDateRead);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setPending("delete");
    try {
      await deleteBook(book.book?.id ?? 0);
      toast({ title: "Book deleted", description: `${book.book?.title} was deleted` });
      router.refresh();
    } catch {
      toast({ title: "Couldn't delete book", variant: "destructive" });
    } finally {
      setPending(null);
    }
  };

  const confirmDelete = () => {
    setSheetOpen(false);
    void handleDelete();
  };

  const hasStatus = status !== null && Boolean(book.book);
  const meta = [book.book?.genres?.slice(0, 3).join(", "), pageCount ? `${pageCount} pages` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="relative flex flex-col gap-3 border-b border-border p-3 sm:p-4 md:flex-row md:items-center md:gap-4 md:hover:bg-muted/50">
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <BookCover src={book.book?.image || fallbackCover} className="w-16 shrink-0 sm:w-20 md:w-24" />

        {/* pr-10 leaves room for the absolute "⋯" trigger on mobile */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1",
            hasStatus && !isEditing && "pr-10 md:pr-0"
          )}
        >
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

          {/* Inline rating is desktop only; on mobile it lives in the sheet. */}
          {hasStatus && book.book && (
            <div className="relative z-10 mt-1 hidden md:block">
              <StarRating book={book.book as SelectBook} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: "⋯" trigger that opens the actions sheet */}
      {hasStatus && book.book && !isEditing && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${book.book.title}`}
              className="absolute right-1 top-1 z-10 size-11 md:hidden"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="text-left">
              <SheetTitle className="line-clamp-2">{book.book.title}</SheetTitle>
              {book.author?.name && (
                <SheetDescription>{book.author.name}</SheetDescription>
              )}
            </SheetHeader>

            <div className="mt-4 flex flex-col gap-4">
              <SignedIn>
                <div className="grid gap-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((option) => {
                      const active = status === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={active ? "default" : "outline"}
                          className="min-h-11"
                          aria-pressed={active}
                          disabled={pending !== null}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          {active && pending === "status" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            option.label
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </SignedIn>

              <div className="grid gap-1.5">
                <p className="text-sm font-medium text-muted-foreground">Your rating</p>
                <StarRating book={book.book as SelectBook} />
              </div>

              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="min-h-11 justify-start gap-3"
                  disabled={pending !== null}
                  onClick={() => {
                    setSheetOpen(false);
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="size-4" />
                  Edit details
                </Button>
                <ConfirmDelete bookTitle={book.book.title ?? title} onConfirm={confirmDelete}>
                  <Button
                    variant="ghost"
                    className="min-h-11 justify-start gap-3 text-destructive"
                    disabled={pending !== null}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </ConfirmDelete>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile: while editing, Save / Cancel replace the "⋯" trigger */}
      {hasStatus && isEditing && (
        <div className="relative z-10 grid auto-cols-fr grid-flow-col gap-2 md:hidden">
          <Button
            variant="outline"
            className="min-h-11"
            disabled={pending !== null}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button className="min-h-11" disabled={pending !== null} onClick={handleSave}>
            {pending === "save" ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      )}

      {/*
        relative z-10 keeps buttons above the stretched link.
        Rows with a status hide this block on mobile (their actions are in the
        sheet); rows without one still show the add button inline.
      */}
      <div
        className={cn(
          "relative z-10 grid auto-cols-fr grid-flow-col gap-2 md:flex md:shrink-0",
          hasStatus && "hidden md:flex"
        )}
      >
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
            <ConfirmDelete bookTitle={book.book?.title ?? title} onConfirm={confirmDelete}>
              <Button
                variant="ghost"
                className="min-h-11 text-destructive md:min-h-9"
                disabled={pending !== null}
              >
                {pending === "delete" ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
              </Button>
            </ConfirmDelete>
          </>
        )}
      </div>
    </article>
  );
}