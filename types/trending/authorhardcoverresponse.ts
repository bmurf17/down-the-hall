// Define the type for a single author
interface TrendingAuthor {
  name: string;
  id: number;
}

// Define the type for the data property
export interface TrendingAuthorsData {
  authors: TrendingAuthor[];
}

// Define the type for the entire response
export interface TrendingAuthorsResponse {
  data: TrendingAuthorsData;
}
