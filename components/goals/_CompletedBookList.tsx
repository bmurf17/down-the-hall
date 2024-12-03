import React from "react";
import { Book } from "@/types/book";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CompletedBooksListProps {
  books: Book[];
}

export function CompletedBooksList({ books }: CompletedBooksListProps) {
  const imageUrls: string[] = [
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/159698_The%20Sea%20of%20Monsters.jpeg?alt=media&token=0c9bc853-1e78-4bbe-8d78-9de734c44b67",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/434434_Caliban's%20War.jpeg?alt=media&token=6fc86a05-09ac-47e5-95e2-917e97b6d5fd",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427945_Dawnshard.jpeg?alt=media&token=85dc90d4-6360-49b3-91d6-3683f5213ecc",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427839_The%20Doors%20of%20Stone.jpeg?alt=media&token=50fa3c5b-07a8-420d-b2ce-51725907e069",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/325996_A%20Closed%20and%20Common%20Orbit.jpeg?alt=media&token=a2120f9c-ee09-4d97-a3d4-476f93b264cf",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/434434_Caliban's%20War.jpeg?alt=media&token=6fc86a05-09ac-47e5-95e2-917e97b6d5fd",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427945_Dawnshard.jpeg?alt=media&token=85dc90d4-6360-49b3-91d6-3683f5213ecc",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427839_The%20Doors%20of%20Stone.jpeg?alt=media&token=50fa3c5b-07a8-420d-b2ce-51725907e069",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/325996_A%20Closed%20and%20Common%20Orbit.jpeg?alt=media&token=a2120f9c-ee09-4d97-a3d4-476f93b264cf",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/434434_Caliban's%20War.jpeg?alt=media&token=6fc86a05-09ac-47e5-95e2-917e97b6d5fd",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427945_Dawnshard.jpeg?alt=media&token=85dc90d4-6360-49b3-91d6-3683f5213ecc",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/427839_The%20Doors%20of%20Stone.jpeg?alt=media&token=50fa3c5b-07a8-420d-b2ce-51725907e069",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/325996_A%20Closed%20and%20Common%20Orbit.jpeg?alt=media&token=a2120f9c-ee09-4d97-a3d4-476f93b264cf",
    "https://firebasestorage.googleapis.com/v0/b/booksite-2aa2a.appspot.com/o/434434_Caliban's%20War.jpeg?alt=media&token=6fc86a05-09ac-47e5-95e2-917e97b6d5fd",
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Completed Books</h3>

      {imageUrls.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {imageUrls.map((image, index) => (
              <CarouselItem
                key={image}
                className="pl-2 md:pl-4 md:basis-1/4 basis-1/2"
              >
                <div className="p-1">
                  <img
                    src={image + index}
                    alt={`Book ${index + 1}`}
                    height={100}
                    width={100}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <p className="text-sm text-gray-500">No images completed yet.</p>
      )}
    </div>
  );
}
