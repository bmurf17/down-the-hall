import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { BookCover } from "./BookCover";


interface Props {
  userData: userGridResponse;
  onSlideChange?: (index: number) => void;
}

export default function CardCarousel({ userData, onSlideChange }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const books = userData.books;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const i = api.selectedScrollSnap();
      setCurrent(i);
      onSlideChange?.(i);
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSlideChange]);

  return (
    <div className="w-full">
      <Carousel
        opts={{ align: "center", loop: books.length > 1 }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {books.map((book) => (
            <CarouselItem key={book.id} className="flex basis-full justify-center">
              <figure className="flex flex-col items-center gap-2">
                <BookCover src={book.image} alt={book.title} className="h-56 sm:h-72" />
                <figcaption className="line-clamp-2 max-w-64 text-center text-sm font-medium">
                  {book.title}
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {books.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="size-11" aria-label="Previous book" onClick={() => api?.scrollPrev()}>
            <ChevronLeft className="size-5" />
          </Button>
          <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {current + 1} / {books.length}
          </span>
          <Button variant="ghost" size="icon" className="size-11" aria-label="Next book" onClick={() => api?.scrollNext()}>
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
}