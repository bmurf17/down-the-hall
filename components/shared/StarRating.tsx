"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { editBook } from "@/actions/bookActions";
import { useToast } from "@/hooks/use-toast";
import type { SelectBook } from "@/lib/schema";

interface Props {
  book: SelectBook;
}

const clamp = (v: number) => Math.min(5, Math.max(0, v));

export default function StarRating({ book }: Props) {
  const { toast } = useToast();
  const initial = Number(book.rating ?? 0) || 0;

  const [rating, setRating] = useState(initial);
  const [preview, setPreview] = useState<number | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(initial); // last value the server accepted
  const dragging = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const display = preview ?? rating;

  const save = async (value: number) => {
    setRating(value);
    try {
      await editBook(book.id, book.title, book.status || 0, value.toString());
      savedRef.current = value;
    } catch {
      setRating(savedRef.current); // roll back
      toast({ title: "Couldn't save rating", variant: "destructive" });
    }
  };

  // Pointer position -> 0.5 … 5 in half-star steps
  const valueFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return clamp(Math.ceil(ratio * 10) / 2) || 0.5;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPreview(valueFromX(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // mouse: hover preview. touch/pen: only while pressed.
    if (dragging.current || e.pointerType === "mouse") {
      setPreview(valueFromX(e.clientX));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const value = valueFromX(e.clientX);
    setPreview(null);
    if (value !== rating) save(value);
  };

  // fires when the browser takes over for a vertical scroll
  const onPointerCancel = () => {
    dragging.current = false;
    setPreview(null);
  };

  const onPointerLeave = () => {
    if (!dragging.current) setPreview(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = clamp(rating + 0.5);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = clamp(rating - 0.5);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 5;
    else return;

    e.preventDefault();
    setRating(next);
    clearTimeout(timer.current); // debounce so holding an arrow key isn't 10 requests
    timer.current = setTimeout(() => save(next), 600);
  };

  return (
    <div className="flex items-center gap-2">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={`Rating for ${book.title}`}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={rating}
        aria-valuetext={rating ? `${rating} out of 5 stars` : "Not rated"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        className="flex h-11 touch-pan-y select-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.min(1, Math.max(0, display - i)); // 0, 0.5 or 1
          return (
            <div key={i} className="relative flex w-8 items-center justify-center sm:w-9">
              <Star className="size-7 text-muted-foreground/40" aria-hidden />
              {/* filled star, clipped to the fill fraction */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
              >
                <Star className="size-7 fill-yellow-400 text-yellow-400" aria-hidden />
              </div>
            </div>
          );
        })}
      </div>

      <span className="min-w-10 text-sm font-medium tabular-nums text-muted-foreground">
        {display ? display.toFixed(1) : "Rate"}
      </span>
    </div>
  );
}