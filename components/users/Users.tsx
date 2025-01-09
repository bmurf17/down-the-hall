import { Card } from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import Link from "next/link";

interface UserGridProps {
  users: userGridResponse[];
}
export default function UserGrid({ users }: UserGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((userData) => (
          <Link
            href={`/useractivitylog/${userData.user.id}`}
            className="h-full"
          >
            <Card
              key={userData.user.id}
              className="p-6 bg-card text-card-foreground cursor-pointer h-full"
            >
              <div className="flex items-center gap-2 mb-4">
                {userData.user.image ? (
                  <img
                    src={userData.user.image}
                    alt={userData.user.userName || "User"}
                    className="w-8 h-8 rounded-md"
                  />
                ) : (
                  <UserIcon className="w-8 h-8" />
                )}
                <span className="text-xl">
                  {userData.user.userName || "Anonymous User"}
                </span>
              </div>

              <p className="text mb-4 text-center">Currently Reading</p>

              {userData.books.length > 0 ? (
                <div className="relative w-full">
                  <Carousel
                    opts={{
                      align: "center",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {userData.books.map((book) => (
                        <CarouselItem
                          key={book.id}
                          className="basis-full flex justify-center items-center"
                        >
                          <div className="flex flex-col items-center">
                            <img
                              src={book.image || "/api/placeholder/200/300"}
                              alt={book.title}
                              className="h-64 w-auto object-contain rounded-md shadow-md"
                            />
                            <div className="mt-2 text-sm text-center">
                              <p className="font-medium truncate max-w-[12rem]">
                                {book.title}
                              </p>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {userData.books.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No books currently being read
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
