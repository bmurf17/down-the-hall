"use client";

import { useEffect, useState } from "react";

const accentCache = new Map<string, string>();

/**
 * Pulls a muted average colour out of a cover image. Images that do not allow
 * canvas reads simply fall back to the theme accent instead of throwing.
 */
export function useCoverAccent(src?: string | null) {
  const [accent, setAccent] = useState<string | null>(() =>
    src ? accentCache.get(src) ?? null : null
  );

  useEffect(() => {
    if (!src) {
      setAccent(null);
      return;
    }

    const cached = accentCache.get(src);
    if (cached) {
      setAccent(cached);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    image.onload = () => {
      if (cancelled) return;

      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (!context) return;

        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);

        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;

        for (let index = 0; index < data.length; index += 4) {
          if (data[index + 3] < 128) continue;

          const luminance =
            data[index] * 0.299 +
            data[index + 1] * 0.587 +
            data[index + 2] * 0.114;

          // Ignore near-black and blown-out pixels; they make muddy averages.
          if (luminance < 24 || luminance > 238) continue;

          red += data[index];
          green += data[index + 1];
          blue += data[index + 2];
          count += 1;
        }

        if (count === 0) return;

        const colour = `rgb(${Math.round(red / count)} ${Math.round(
          green / count
        )} ${Math.round(blue / count)})`;

        accentCache.set(src, colour);
        if (!cancelled) setAccent(colour);
      } catch {
        // Cross-origin images without CORS headers taint the canvas.
      }
    };

    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return accent;
}
