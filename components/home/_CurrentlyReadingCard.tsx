import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { Card } from "../ui/card";
import CardCarousel from "../shared/CardCarousel";
import { editBookToList } from "@/functions/editBook";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
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

  const { toast } = useToast();

  useEffect(() => {
    setLocalUserData({ ...userData });
  }, [userData]);

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

      toast({
        title: `Updated Reading Status for ${activeBook.title}`,
      });
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


  return (
  <Card className="bg-card p-4 text-card-foreground sm:p-6">
    <h2 className="mb-3 text-lg font-semibold">Currently Reading</h2>

    {hasBooks ? (
      <>
        <div className="relative w-full min-w-0">
          <CardCarousel userData={localUserData} onSlideChange={setActiveBookIndex} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button onClick={() => updateBook(1)} disabled={isPending} className="min-h-11">
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
  </Card>
  );
}
