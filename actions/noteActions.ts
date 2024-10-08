import db from "@/lib/db";
import { bookNote, InsertBookNote } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

export const addNote = async (
  booknote: InsertBookNote,
  hardcover_id: number
) => {
  await db.insert(bookNote).values({
    bookId: booknote.bookId,
    note: booknote.note,
    pageNumber: booknote.pageNumber,
    series: booknote.series,
    updatedDate: new Date(),
    userId: booknote.userId,
  });

  revalidateTag(`userBook${hardcover_id}`);
};
