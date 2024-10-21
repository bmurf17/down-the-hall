import { SelectAuthor, SelectBook, SelectBookNote } from "@/lib/schema";

export interface Book {
  book: SelectBook | null;
  author: SelectAuthor | null;
  book_notes: SelectBookNote[] | null;
}
