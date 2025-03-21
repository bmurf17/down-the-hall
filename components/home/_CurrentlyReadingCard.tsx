import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { UserIcon } from "lucide-react";
import { Card } from "../ui/card";
import CardCarousel from "../shared/CardCarousel";
import { editBookToList } from "@/functions/editBook";
import { Button } from "../ui/button";

interface Props {
  userData: userGridResponse;
}

export default function CurrentlyReadingCard({ userData }: Props) {
  const updateBook = async (
    id: number,
    title: string,
    status: number,
    rating: string
  ) => {
    await editBookToList(id, title, status, rating);
  };

  return (
    <Card
      key={userData.user.id}
      className="p-6 bg-card text-card-foreground cursor-pointer h-full"
    >
      <div className="flex items-center gap-2 mb-4">Currently Reading </div>

      {userData.books.length > 0 ? (
        <div className="relative w-full">
          <CardCarousel userData={userData} />
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No books currently being read
        </div>
      )}

      <div className="flex items-center mt-8 gap-4 justify-center">
        <Button className="text-white">Finished</Button>
        <Button className="text-white">Not Finishing</Button>
      </div>
    </Card>
  );
}
