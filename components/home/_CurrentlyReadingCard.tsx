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
  const { toast } = useToast();

  useEffect(() => {
    setLocalUserData({ ...userData });
  }, [userData]);

  const updateBook = async (status: number) => {
    if (localUserData.books.length === 0) return;

    const activeBook = localUserData.books[activeBookIndex];
    console.log("Updating book:", activeBook);

    await editBookToList(activeBook.id, activeBook.title, status, "0");

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
  };

  return (
    <Card
      key={localUserData.user.id}
      className="p-6 bg-card text-card-foreground cursor-pointer h-full"
    >
      <div className="flex items-center gap-2 mb-4">Currently Reading </div>

      {localUserData.books.length > 0 ? (
        <div className="relative w-full">
          <CardCarousel
            userData={localUserData}
            onSlideChange={setActiveBookIndex}
            activeIndex={activeBookIndex}
          />
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No books currently being read
        </div>
      )}

      <div className="flex items-center mt-8 gap-4 justify-center">
        <Button
          className="text-white"
          onClick={() => updateBook(2)}
          disabled={localUserData.books.length === 0}
        >
          Finished
        </Button>
        <Button
          className="text-white"
          onClick={() => updateBook(3)}
          disabled={localUserData.books.length === 0}
        >
          Not Finishing
        </Button>
      </div>
    </Card>
  );
}
