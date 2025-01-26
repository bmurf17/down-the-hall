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
    dateRead: Date | null;
    rating: number | null;
  }[];
};
