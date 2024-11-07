import {
  TrendingAuthorsData,
  TrendingAuthorsResponse,
} from "./authorhardcoverresponse";
import { SeriesListResponse } from "./seriesHardCoverResponse";

type CachedImageResponse = {
  url: string;
};

type CachedContributor = {
  author: {
    slug: string;
    name: string;
    cachedImage: {
      id: number;
      url: string;
      color: string;
      width: number;
      height: number;
      color_name: string;
    };
  };
  contribution: string | null;
};

type CachedContributors = CachedContributor[];

export type TrendingBookDetails = {
  id: number;
  users_count: number;
  users_read_count: number;
  default_physical_edition_id: number;
  cached_image: CachedImageResponse;
  cached_contributors: CachedContributors;
  dto_combined: {
    // Define the structure of dto_combined if needed, based on the [Object] placeholder
    alternative_titles: string[];
    asin: string | null;
    audio_seconds: number;
    awards: string[];
    book_category_id: number | null;
    characters: string[];
    collection_book_ids: number[];
    compilation: boolean;
    contributions: {
      author_id: number;
      contribution: string | null;
    }[];
    country_id: number;
    description: string;
    edition_format: string;
    edition_information: string;
    genres: string[];
    headline: string | null;
    identifiers: {
      goodreads: string[];
      openlibrary: string[];
      isbn_10: string[];
      isbn_13: string[];
      asin: string[];
      kindle_asin: string[];
      inventaire_id: string[];
      lccn: string[];
      ocaid: string[];
      oclc: string[];
    };
    image_ids: number[];
    image_id: number;
    isbn_10: string;
    isbn_13: string;
    language_id: number;
    literary_type_id: number;
    locations: string[];
    page_count: number | null;
    platform_external_id: string;
    platform_id: number;
    publisher_id: number;
    raw_data: Record<string, unknown>;
    reading_format_id: number;
    release_date: string;
    release_year: number;
    series: {
      series_id: number;
      details: string;
      position: number;
      featured: boolean;
    }[];
    subjects: string[];
    times: string[];
    title: string;
    subtitle: string | null;
    urls: string[];
    version: number;
  };
};

export type TrendingBookData = {
  [key: string]: TrendingBookDetails;
};

export type TrendingData = {
  bookData: TrendingBookData;
  seriesData: SeriesListResponse;
};

export type Image = {
  id: number;
  url: string;
};

export type TrendingImageData = {
  images: Image[];
};

export type TrendingImage = {
  data: TrendingImageData;
};
