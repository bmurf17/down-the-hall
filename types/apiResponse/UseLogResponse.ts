type UserActivity = {
  id: number;
  userId: number;
  bookId: number;
  updatedDate: string; // ISO date string
  action: string;
};

type BookDetails = {
  id: number;
  title: string;
  authorId: number;
  image: string;
  status: number;
  releaseYear: number;
  defaultPhysicalEditionId: number;
  description: string;
  seriesPosition: number;
  seriesLength: number;
  seriesName: string;
  pageCount: number;
  genres: string | null;
  hardcoverId: number;
  dateRead: string | null;
  updatedDate: string; // ISO date string
};

type AuthorDetails = {
  id: number;
  name: string;
  image: string;
};

type UserActivityLog = {
  userActivity: UserActivity;
  bookDetails: BookDetails;
  authorDetails: AuthorDetails;
};

export type UserActivityLogList = UserActivityLog[];
