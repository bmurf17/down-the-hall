import React from "react";
import { Book } from "@/types/book";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SelectBook } from "@/lib/schema";

interface CompletedBooksListProps {
  books: SelectBook[];
}

export function CompletedBooksList({ books }: CompletedBooksListProps) {
  return (
    <div className="space-y-4 ">
      {books.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="mx-8"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {books.map((book, index) => (
              <CarouselItem
                key={book.title + " " + book.id}
                className="pl-2 md:pl-4 lg:basis-1/6 md:basis-1/4 basis-1/2"
              >
                <div className="p-1">
                  <img
                    src={book?.image || ""}
                    alt={`Book ${index + 1}`}
                    style={{ height: 200, minWidth: 116 }}
                    className="relative group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <p className="text-sm text-gray-500">No books completed yet.</p>
      )}
    </div>
  );
}
