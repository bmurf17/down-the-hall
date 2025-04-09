import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { UserIcon } from "lucide-react";
import { Card } from "../ui/card";
import CardCarousel from "../shared/CardCarousel";
import { editBookToList } from "@/functions/editBook";
import { Button } from "../ui/button";
import { useState } from "react";

interface Props {
  userData: userGridResponse;
}

export default function CurrentlyReadingCard({ userData }: Props) {
  const [activeBookIndex, setActiveBookIndex] = useState(0);

  const updateBook = async (status: number) => {
    if (userData.books.length === 0) return;

    const activeBook = userData.books[activeBookIndex];
    await editBookToList(activeBook.id, activeBook.title, status, "0");
  };

  return (
    <Card
      key={userData.user.id}
      className="p-6 bg-card text-card-foreground cursor-pointer h-full"
    >
      <div className="flex items-center gap-2 mb-4">Currently Reading </div>

      {userData.books.length > 0 ? (
        <div className="relative w-full">
          <CardCarousel
            userData={userData}
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
          disabled={userData.books.length === 0}
        >
          Finished
        </Button>
        <Button
          className="text-white"
          onClick={() => updateBook(3)}
          disabled={userData.books.length === 0}
        >
          Not Finishing
        </Button>
      </div>
    </Card>
  );
}
