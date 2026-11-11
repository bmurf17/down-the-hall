import Link from "next/link";
import { Book } from "@/types/book";
import { cn } from "@/lib/utils";
import { useBookPull } from "../shared/BookPullProvider";

interface Props {
  books: Book[];
}

interface SpinePalette {
  base: string;
  dark: string;
  ink: string;
  foil: string;
}

const spinePalettes: SpinePalette[] = [
  { base: "#7a3030", dark: "#461717", ink: "#f6e8cc", foil: "#d8b55a" },
  { base: "#24445f", dark: "#122636", ink: "#ece2cc", foil: "#c9a94f" },
  { base: "#355c3d", dark: "#1b3320", ink: "#f1e7d2", foil: "#d4b463" },
  { base: "#83552d", dark: "#4d2f17", ink: "#f8eedb", foil: "#e2bd74" },
  { base: "#4f3457", dark: "#2b1b30", ink: "#f0e4d2", foil: "#c9a94f" },
  { base: "#15515c", dark: "#092f36", ink: "#f2e8d2", foil: "#d8b55a" },
  { base: "#684325", dark: "#3b2412", ink: "#f4e7cf", foil: "#d9b36c" },
  { base: "#775815", dark: "#453207", ink: "#f8efd9", foil: "#e7ca71" },
  { base: "#555b60", dark: "#303538", ink: "#f2ede4", foil: "#cfd2d4" },
];

// Each shelf row is a fixed height so the boards line up across wrapped rows.
const SHELF_ROW_HEIGHT = 208;
const SHELF_BOARD_HEIGHT = 12;

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function getSpineMetrics(book: Book) {
  const title = book.book?.title || "Untitled";
  const author = book.author?.name || "";
  const pageCount = book.book?.pageCount ?? 0;
  const hash = hashString(`${title}${author}`);

  const width = Math.min(
    52,
    30 + (hash % 9) + Math.min(14, Math.round(pageCount / 60))
  );
  const height = Math.min(
    184,
    140 + Math.round(Math.min(pageCount, 600) / 30) + (hash % 9)
  );

  return {
    title,
    author,
    width,
    height,
    palette: spinePalettes[hash % spinePalettes.length],
    fontSize: width >= 40 ? 11 : 10,
  };
}

function BookSpine({ book }: { book: Book }) {
  const bookObject = book.book;
  const pull = useBookPull();
  const hardcoverId = bookObject?.hardcoverId;
  const hasHardcoverId = typeof hardcoverId === "number" && hardcoverId > 0;
  const { title, author, width, height, palette, fontSize } =
    getSpineMetrics(book);
  const isPulling = Boolean(
    pull?.activeBookId && pull.activeBookId === bookObject?.id
  );

  const handleOpen = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks, mid-clicks, and keyboard shortcuts keep their
    // normal browser behaviour.
    if (
      !pull ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    pull.openBook({
      href: `/book/${hardcoverId}`,
      bookId: bookObject?.id,
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      image: bookObject?.image,
      title,
      author,
      palette,
    });
  };

  const spine = (
    <>
      <div
        className="pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 z-30 w-max max-w-56 -translate-x-1/2 translate-y-1 scale-95 rounded-md bg-popover px-3 py-2 text-left opacity-0 shadow-lg ring-1 ring-border transition duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      >
        <p className="font-serif text-sm font-semibold leading-tight text-foreground">
          {title}
        </p>
        {author ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{author}</p>
        ) : null}
      </div>

      <div
        className="relative w-full overflow-hidden rounded-[2px] shadow-[3px_4px_8px_rgba(12,7,3,0.55),inset_-2px_0_4px_rgba(0,0,0,0.25),inset_2px_0_3px_rgba(255,255,255,0.12)] transition-transform duration-300 ease-out group-hover:-translate-y-2 group-focus-visible:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        style={{
          height: `${height}px`,
          backgroundImage: `linear-gradient(90deg, ${palette.dark} 0%, ${palette.base} 16%, ${palette.base} 78%, ${palette.dark} 100%)`,
        }}
      >
        {/* Raised leather bands at the head and tail of the spine. */}
        <div className="absolute inset-x-0 top-1.5 h-1 bg-black/20 shadow-[0_1px_0_rgba(255,255,255,0.12)]" />
        <div className="absolute inset-x-0 bottom-1.5 h-1 bg-black/25 shadow-[0_-1px_0_rgba(255,255,255,0.1)]" />

        {/* Thin foil rules frame the title. */}
        <div
          className="absolute inset-x-1 top-4 h-px opacity-80"
          style={{ backgroundColor: palette.foil }}
        />
        <div
          className="absolute inset-x-1 bottom-4 h-px opacity-80"
          style={{ backgroundColor: palette.foil }}
        />

        {/* The rounded spine edges catch a little light. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-white/15 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-black/35 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center px-1 py-5">
          <span
            className="max-h-full overflow-hidden whitespace-nowrap font-serif font-semibold uppercase tracking-[0.1em] [writing-mode:vertical-rl] rotate-180"
            style={{ color: palette.ink, fontSize: `${fontSize}px` }}
          >
            {title}
            {author ? (
              <span className="font-normal opacity-70"> · {author}</span>
            ) : null}
          </span>
        </div>

        <div
          className="absolute bottom-2.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: palette.foil }}
        />
      </div>
    </>
  );

  return (
    <div
      className="flex h-52 shrink-0 items-end justify-center pb-3"
      style={{ width: `${width}px` }}
    >
      {hasHardcoverId ? (
        <Link
          href={`/book/${hardcoverId}`}
          onClick={handleOpen}
          aria-label={`${title}${author ? ` by ${author}` : ""}`}
          className={cn(
            "group relative block rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isPulling && "invisible"
          )}
          style={{ width: `${width}px` }}
        >
          {spine}
        </Link>
      ) : (
        <div
          className="group relative block rounded-[2px]"
          style={{ width: `${width}px` }}
        >
          {spine}
        </div>
      )}
    </div>
  );
}

export default function BookSpinesView({ books }: Props) {
  return (
    <div
      className="flex flex-wrap items-end gap-x-[3px] overflow-visible rounded-md px-2 shadow-[inset_0_0_30px_rgba(0,0,0,0.45)] ring-1 ring-[#4a2f1d]"
      style={{
        backgroundColor: "#2a1c13",
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${
          SHELF_ROW_HEIGHT - SHELF_BOARD_HEIGHT
        }px, #a47448 ${
          SHELF_ROW_HEIGHT - SHELF_BOARD_HEIGHT
        }px, #c99a69 ${SHELF_ROW_HEIGHT - 8}px, #8a5b34 ${
          SHELF_ROW_HEIGHT - 4
        }px, #5c3a21 ${SHELF_ROW_HEIGHT}px)`,
        backgroundSize: `100% ${SHELF_ROW_HEIGHT}px`,
      }}
    >
      {books.map((book) => (
        <BookSpine key={book?.book?.id} book={book} />
      ))}
    </div>
  );
}
