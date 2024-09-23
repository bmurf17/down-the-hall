import db from "@/lib/db";
import { bookNote, InsertBookNote } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";

export const addNote = async (book: InsertBookNote) => {
  console.log("HERE action");

  await db.insert(bookNote).values({
    bookId: 91,
    note: book.note,
    pageNumber: book.pageNumber,
    series: book.series,
    updatedDate: new Date(),
    userId: book.userId,
  });
};
