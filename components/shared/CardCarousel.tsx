import { userGridResponse } from "@/types/apiResponse/usersgridResponse";
import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "../ui/carousel";

interface Props {
  userData: userGridResponse;
  onSlideChange?: (index: number) => void;
  activeIndex?: number;
}

export default function CardCarousel({
  userData,
  onSlideChange,
  activeIndex = 0,
}: Props) {
  const [api, setApi] = useState<CarouselApi>();

  // Function to manually handle carousel navigation
  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (!api) return;

      if (direction === "prev") {
        api.scrollPrev();
      } else {
        api.scrollNext();
      }

      // Need to wait for the scroll to complete before getting the new index
      setTimeout(() => {
        if (onSlideChange) {
          onSlideChange(api.selectedScrollSnap());
        }
      }, 50);
    },
    [api, onSlideChange]
  );

  useEffect(() => {
    if (!api || !onSlideChange) return;

    // Set initial active slide
    onSlideChange(api.selectedScrollSnap());

    const onSelect = () => {
      onSlideChange(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSlideChange]);

  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      className="w-full"
      setApi={setApi}
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
                <p className="font-medium truncate max-w-48">{book.title}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {userData.books.length > 1 && (
        <>
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <button
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white border shadow-md"
              onClick={() => handleNavigate("prev")}
              aria-label="Previous slide"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button
              className="h-8 w-8 rounded-full flex items-center justify-center bg-white border shadow-md"
              onClick={() => handleNavigate("next")}
              aria-label="Next slide"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </>
      )}
    </Carousel>
  );
}
