export type HardCoverApiResponse = {
    data: {
      books: HardcoverBook[];
    };
  };
  
  export type HardcoverBook = {
    id: number;
    image: Image | null;
    title: string;
    book_characters: any[];
    book_series: BookSeries[];
    description: string | null;
    release_year: string;
    dto: Dto;
    editions: Edition[];
    default_physical_edition_id: number
  };
  
  type Image = {
    url: string;
  };
  
  type BookSeries = {
    position: number | null;
    details: string | null;
    series: Series;
    books_count: number;
    name: string;
  };
  
  type Series = {
    author: Author;
    name: string;
    books_count: number;
  };
  
  type Author = {
    name: string;
  };
  
  type Dto = {
    headline?: string;
    description?: string;
    series?: SeriesInfo[];
  };
  
  type SeriesInfo = {
    series_id: number;
    name: string;
    position: number | null;
    details: string | null;
    featured: boolean;
  };
  
  type Edition = {
    dto: EditionDto;
    pages: number | null;
    id: number
  };
  
  type EditionDto = {
    release_date?: string;
    image_id?: number;
    reading_format_id?: number;
    page_count?: number;
    edition_format?: string;
    title?: string;
    asin?: string;
    publisher_id?: number;
    contributions?: Contribution[];
    image_ids?: number[];
  };
  
  type Contribution = {
    contribution: any;
    author_id: number;
  };
  