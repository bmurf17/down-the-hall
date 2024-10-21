import React, { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { Book } from "@/types/book";
import { SelectBook } from "@/lib/schema";
import { editBook } from "@/actions/bookActions";

interface Props {
  book: SelectBook;
}

export default function StarRating({ book }: Props) {
  const [rating, setRating] = useState(+(book?.rating ?? 0));
  const [hover, setHover] = useState(0);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const x = e.clientX - rect.left;
    setHover(index + (x < width / 2 ? 0.5 : 1));
  };

  const handleMouseLeave = () => {
    setHover(0);
  };

  const handleClick = (value: React.SetStateAction<number>) => {
    setRating(value);
    editBook(book.id, book.title, book.status || 0, value.toString());
  };

  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            className="relative w-8 h-8 focus:outline-none"
            onMouseMove={(e) => handleMouseMove(e, index - 1)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            key={index}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Star
                className={`w-7 h-7 ${
                  (hover || rating) >= index
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                } stroke-black stroke-[1.5px]`}
              />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="w-1/2 h-full overflow-hidden">
                {(hover || rating) >= index - 0.5 &&
                  (hover || rating) < index && (
                    <StarHalf className="w-7 h-7 text-yellow-400 fill-yellow-400 stroke-black stroke-[1.5px]" />
                  )}
              </div>
            </div>
          </button>
        ))}
      </div>
      <span className="ml-2 w-16 text-lg font-semibold">
        {hover || rating ? (hover || rating).toFixed(1) : "Rate"}
      </span>
    </div>
  );
}
