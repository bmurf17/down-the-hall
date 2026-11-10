import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { convertBookData } from "../../lib/books/convert-openlibrary";
import { buildTrendingBook } from "../../lib/books/convert-trending";
import type {
  GoogleBooksItem,
  HardcoverBook,
  OpenLibraryBook,
} from "../../lib/books/types";
import type { TrendingBookDetails } from "../../types/trending/trendingbookresponse";

function openLibraryBook(
  overrides: Partial<OpenLibraryBook> = {}
): OpenLibraryBook {
  return {
    key: "/works/OL1W",
    title: "The Hobbit",
    author_name: ["J. R. R. Tolkien"],
    first_publish_year: 1937,
    cover_i: 123,
    isbn: ["9780261102217"],
    ia: [],
    description: "A hobbit goes on an adventure.",
    pages: 310,
    genres: ["fantasy"],
    want_to_read_count: 100,
    ...overrides,
  };
}

function googleBooksItem(
  overrides: Partial<GoogleBooksItem["volumeInfo"]> = {}
): GoogleBooksItem {
  return {
    kind: "books#volume",
    id: "google-1",
    volumeInfo: {
      title: "The Hobbit",
      authors: ["J. R. R. Tolkien"],
      description: "A longer Google Books description of the adventure.",
      pageCount: 320,
      categories: ["Fiction", "Fantasy"],
      publishedDate: "1937-09-21",
      imageLinks: { thumbnail: "https://example.com/google.jpg" },
      ...overrides,
    },
  };
}

function hardcoverBook(overrides: Partial<HardcoverBook> = {}): HardcoverBook {
  return {
    id: 42,
    title: "The Hobbit",
    default_physical_edition_id: 7,
    pages: 300,
    release_year: 1937,
    description: "Hardcover description that is definitely the longest one.",
    cached_image: { url: "https://example.com/hardcover.jpg" },
    cached_contributors: [{ author: { name: "J. R. R. Tolkien" } }],
    genres: ["fantasy", "adventure"],
    book_series: [
      { series_id: 9, position: 1, featured: true },
      { series_id: 10, position: 2, featured: false },
    ],
    ...overrides,
  };
}

function trendingBook(
  overrides: Partial<TrendingBookDetails> = {}
): TrendingBookDetails {
  return {
    id: 42,
    users_count: 10,
    users_read_count: 5,
    default_physical_edition_id: 7,
    cached_image: { url: "https://example.com/cover.jpg" },
    cached_contributors: [
      { author: { name: "J. R. R. Tolkien", slug: "tolkien" } },
    ],
    title: "The Hobbit",
    pages: 310,
    genres: ["fantasy"],
    cached_tags: { Genre: [{ tag: "adventure" }] },
    book_series: [{ series_id: 9, details: "", position: 1, featured: true }],
    release_year: 1937,
    description: "A hobbit goes on an adventure.",
    contributions: [{ author_id: 3, contribution: "Author" }],
    ...overrides,
  } as TrendingBookDetails;
}

describe("convertBookData", () => {
  it("maps OpenLibrary data into the app's Book shape", async () => {
    const result = await convertBookData(openLibraryBook());

    assert.equal(result.book?.title, "The Hobbit");
    assert.equal(result.author?.name, "J. R. R. Tolkien");
    assert.equal(result.book?.pageCount, 310);
    assert.equal(result.book?.releaseYear, 1937);
    assert.equal(result.book?.seriesName, "");
    assert.equal(
      result.book?.image,
      "https://covers.openlibrary.org/b/id/123-L.jpg"
    );
    assert.deepEqual(result.book?.genres, ["fantasy"]);
  });

  it("prefers longer Google Books descriptions and merges genres", async () => {
    const result = await convertBookData(
      openLibraryBook({ description: "Short." }),
      { bookData: googleBooksItem(), matchedISBN: "9780261102217" }
    );

    assert.equal(
      result.book?.description,
      "A longer Google Books description of the adventure."
    );
    assert.deepEqual(result.book?.genres, ["fantasy", "fiction"]);
  });

  it("uses Google Books images and page counts as fallbacks", async () => {
    const result = await convertBookData(
      openLibraryBook({ cover_i: undefined, pages: undefined }),
      { bookData: googleBooksItem(), matchedISBN: "9780261102217" }
    );

    assert.equal(result.book?.image, "https://example.com/google.jpg");
    assert.equal(result.book?.pageCount, 320);
  });

  it("applies Hardcover ids, series and contributor data", async () => {
    const result = await convertBookData(openLibraryBook(), null, {
      bookData: { books: [hardcoverBook()] },
      seriesData: { series: [{ id: 9, name: "Middle-earth" }] },
    });

    assert.equal(result.book?.hardcoverId, 42);
    assert.equal(result.book?.defaultPhysicalEditionId, 7);
    assert.equal(result.book?.seriesName, "Middle-earth");
    assert.equal(result.book?.seriesPosition, "1");
    assert.equal(result.book?.pageCount, 300);
    assert.equal(result.book?.image, "https://example.com/hardcover.jpg");
    assert.deepEqual(result.book?.genres, ["fantasy", "adventure"]);
  });

  it("parses a stringified series object", async () => {
    const result = await convertBookData(
      openLibraryBook({
        series_name: JSON.stringify({
          name: "Middle-earth",
          position: "2",
        }),
        series_position: undefined,
      })
    );

    assert.equal(result.book?.seriesName, "Middle-earth");
    assert.equal(result.book?.seriesPosition, "2");
  });
});

describe("buildTrendingBook", () => {
  it("maps trending details and resolves the series name", () => {
    const result = buildTrendingBook(
      trendingBook(),
      { series: [{ id: 9, name: "Middle-earth" }] },
      "https://example.com/cover.jpg"
    );

    assert.equal(result.book?.title, "The Hobbit");
    assert.equal(result.book?.hardcoverId, 42);
    assert.equal(result.book?.seriesName, "Middle-earth");
    assert.equal(result.book?.seriesPosition, "1");
    assert.equal(result.book?.image, "https://example.com/cover.jpg");
    assert.deepEqual(result.book?.genres, ["fantasy", "adventure"]);
    assert.equal(result.author?.name, "J. R. R. Tolkien");
  });

  it("leaves the series name empty when there is no series match", () => {
    const result = buildTrendingBook(
      trendingBook({ book_series: [] }),
      { series: [{ id: 9, name: "Middle-earth" }] },
      "cover.jpg"
    );

    assert.equal(result.book?.seriesName, "");
    assert.equal(result.book?.seriesPosition, null);
  });
});
