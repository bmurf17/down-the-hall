export type userGridResponse = {
  user: {
    id: string;
    userName: string | null;
    image: string | null;
    lastLoggedIn: Date | null;
  };
  books: {
    id: number;
    title: string;
    image: string | null;
    dateRead: string | null;
    rating: string | null;
    pageCount: number | null;
  }[];
};
