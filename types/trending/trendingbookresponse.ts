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
  title: string;
  pages: number;
  genres: string[];
  book_series: {
    series_id: number;
    details: string;
    position: number;
    featured: boolean;
  }[];
  release_year: number;
  description: string;
  contributions: {
    author_id: number;
    contribution: string | null;
  }[];
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
