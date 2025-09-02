import { Image } from "../trending/trendingbookresponse";

export interface BookSeries {
  __typename: "book_series";
  position: number | null;
  book: {
    __typename: "books";
    title: string;
    id: number;
    cached_image: Image;
    description: string;
    genres: string[];
    series: {
      series_id: number;
      details: string;
      position: number;
      featured: boolean;
    }[];
    release_year: number;
    page_count: number;
    contributions?: Array<{
      author?: {
        name: string;
        slug: string;
        id: number;
        cachedImage?: {
          url?: string;
        };
      };
    }>;
  };
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
