import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { Card } from "../ui/card";
import CardCarousel from "../shared/CardCarousel";
import { editBookToList } from "@/functions/editBook";
import { Button } from "../ui/button";
import { ToastAction } from "../ui/toast";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userData: userGridResponse;
}

export default function CurrentlyReadingCard({ userData }: Props) {
  const [localUserData, setLocalUserData] = useState<userGridResponse>({
    ...userData,
  });
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [justFinished, setJustFinished] = useState<string | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout>>();

  const { toast } = useToast();

  useEffect(() => {
    setLocalUserData({ ...userData });
  }, [userData]);

  useEffect(() => {
    return () => clearTimeout(finishTimer.current);
  }, []);

  const updateBook = async (status: number) => {
    if (isPending || localUserData.books.length === 0) return;
    setIsPending(true);
    try {
      if (localUserData.books.length === 0) return;

      const activeBook = localUserData.books[activeBookIndex];

      await editBookToList(
        activeBook.id,
        activeBook.title,
        status,
        "0",
        activeBook.pageCount ?? undefined
      );

      const updatedBooks = localUserData.books.filter(
        (book) => book.id !== activeBook.id
      );

      let newIndex = activeBookIndex;
      if (newIndex >= updatedBooks.length && updatedBooks.length > 0) {
        newIndex = updatedBooks.length - 1;
      }

      setLocalUserData((prev) => ({
        ...prev,
        books: updatedBooks,
      }));

      setActiveBookIndex(newIndex);

      if (status === 1) {
        setJustFinished(activeBook.title);
        clearTimeout(finishTimer.current);
        finishTimer.current = setTimeout(() => setJustFinished(null), 1800);

        toast({
          title: `Finished ${activeBook.title}`,
          description: "Added to your activity feed.",
          action: (
            <ToastAction altText="View activity" asChild>
              <Link href={`/useractivitylog/${userData.user.id}`}>
                View activity
              </Link>
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: `Updated Reading Status for ${activeBook.title}`,
        });
      }
    } catch {
      toast({
        title: "Couldn't update book. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const hasBooks = localUserData.books.length > 0;
  const activeBook = localUserData.books[activeBookIndex];

  return (
    <Card className="relative overflow-hidden border-2 border-[#d8c7ad] bg-[#fbf7ee] p-4 text-card-foreground shadow-[0_10px_25px_-18px_rgba(45,30,15,0.8)] sm:p-6">
      {/* Checkout-card ruled paper. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, #d8c7ad 28px)",
        }}
      />

      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7358]">
              Down The Hall Library
            </p>
            <h2 className="mt-1 text-xl font-semibold">Currently Reading</h2>
          </div>
          <div
            aria-hidden
            className="rotate-[-7deg] rounded-sm border-2 border-secondary/70 px-2 py-1 text-center text-secondary/80"
          >
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em]">
              Due
            </span>
            <span className="block text-[11px] font-semibold leading-tight">
              21 days
            </span>
          </div>
        </div>

        {justFinished ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="motion-safe:animate-stamp-in rounded-full border-4 border-secondary bg-[#fbf7ee]/90 px-6 py-5 text-center text-secondary shadow-lg">
              <span className="block font-serif text-2xl font-bold uppercase tracking-wide">
                Finished
              </span>
              <span className="mt-1 block max-w-40 truncate text-xs font-medium">
                {justFinished}
              </span>
            </div>
          </div>
        ) : null}

        {hasBooks ? (
          <>
            <div className="relative w-full min-w-0">
              <CardCarousel
                userData={localUserData}
                onSlideChange={setActiveBookIndex}
              />
            </div>

            <div className="mt-3 border-t border-dashed border-[#c9b89d] pt-3">
              <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-wide text-[#806b52]">
                <span>Reading progress</span>
                <span>{activeBook?.pageCount ? `${activeBook.pageCount} pages` : "In progress"}</span>
              </div>
              <div
                aria-hidden
                className="relative mt-2 h-1.5 rounded-full bg-[#e6dac6]"
              >
                <div className="absolute left-0 top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-secondary/70" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                onClick={() => updateBook(1)}
                disabled={isPending}
                className="min-h-11"
              >
                Finished
              </Button>
              <Button
                variant="outline"
                onClick={() => updateBook(3)}
                disabled={isPending}
                className="min-h-11"
              >
                Not Finishing
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            No books currently being read
          </p>
        )}
      </div>
    </Card>
  );
}
