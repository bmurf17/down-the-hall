import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface Props {
  userData: userGridResponse;
}

export default function CardCarousel({ userData }: Props) {
  return (
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
          <CarouselPrevious className="left-2 carousel-control" />
          <CarouselNext className="right-2 carousel-control" />
        </>
      )}
    </Carousel>
  );
}
