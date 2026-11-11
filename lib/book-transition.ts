export interface RectSnapshot {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface BookPalette {
  base: string;
  dark: string;
  ink: string;
  foil: string;
}

export interface BookPullRequest {
  href: string;
  bookId?: number;
  rect: RectSnapshot;
  image?: string | null;
  title: string;
  author?: string;
  palette: BookPalette;
}

export interface BookLandingSnapshot {
  href: string;
  target: RectSnapshot;
  timestamp: number;
}

export const BOOK_LANDING_STORAGE_KEY = "down-the-hall:book-landing";
