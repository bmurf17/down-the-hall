import { Image } from "../trending/trendingbookresponse";

export interface BookSeries {
  __typename: "book_series";
  position: number | null;
  book: {
    __typename: "books";
    title: string;
    id: number;
    cached_image: Image;
    dto_combined: BookDTO;
  };
}

export interface BookDTO {
  alternative_titles: string[];
  asin: string | null;
  audio_seconds: number | null;
  awards: any[]; // You might want to define a more specific type if you have award data
  characters: string[];
  collection_book_ids: number[];
  compilation: boolean;
  contributions: Contribution[];
  country_id: number;
  description: string | null;
  edition_format: string;
  edition_information: string;
  genres: string[];
  headline: string | null;
  identifiers: {
    isbn_10: string[];
    isbn_13: string[];
    openlibrary: string[];
    goodreads: string[];
    asin: string[];
    kindle_asin: string[];
    inventaire_id: string[];
    lccn: string[];
    ocaid: string[];
    oclc: string[];
  };
  image_ids: number[];
  image_id: number;
  isbn_10: string | null;
  isbn_13: string | null;
  isbn_10_ids: string[];
  isbn_13_ids: string[];
  language_id: number;
  literary_type_id: number;
  locations: string[];
  page_count: number;
  platform_external_id: string;
  platform_id: number;
  publishers: string[];
  raw_data: Record<string, any>;
  reading_format_id: number;
  release_date: string;
  release_year: number;
  series: SeriesInfo[];
  subjects: string[];
  times: string[];
  title: string;
  subtitle: string | null;
  urls: string[];
  version: number;
}

export interface Contribution {
  author_id: number;
  contribution: string | null;
}

export interface SeriesInfo {
  series_id: number;
  details: string | null;
  position: number | null;
  featured: boolean;
}

// For the array of book series:
export type BookSeriesArray = BookSeries[];
