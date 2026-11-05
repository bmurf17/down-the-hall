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
import { EmptyState } from "@/components/shared/EmptyState";
import { BookOpen } from "lucide-react";

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
                className="pl-2 md:pl-4 basis-auto"
              >
                <div className="p-1">
                  <img
                    src={book?.image || ""}
                    alt={`Book ${index + 1}`}
                    style={{ height: 200 }}
                    className="h-48 w-auto aspect-[2/3] object-cover relative group transition-all border border-gray-100/20 ring-accent hover:ring-1 hover:border-accent rounded-l-sm rounded-r-md shadow-md block"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No books completed yet"
          description="Finish a book and it will show up here."
        />
      )}
    </div>
  );
}
