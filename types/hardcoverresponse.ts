export type HardCoverApiResponse = {
    data: {
      books: Book[];
    };
  };
  
  type Book = {
    id: number;
    image: Image | null;
    title: string;
    book_characters: any[];
    book_series: BookSeries[];
    description: string | null;
    dto: Dto;
    editions: Edition[];
  };
  
  type Image = {
    url: string;
  };
  
  type BookSeries = {
    position: number | null;
    details: string | null;
    series: Series;
  };
  
  type Series = {
    author: Author;
    books_count: number;
    name: string;
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
  