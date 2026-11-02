"use server";

import { addBook } from "@/actions/bookActions";
import { addNote } from "@/actions/noteActions";
import { book, InsertBookNote } from "@/lib/schema";
import { Status } from "@/types/enums/statusEnum";
import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { and, eq } from "drizzle-orm";

export const addBookNote = async (
  noteToAdd: Omit<InsertBookNote, "id" | "updatedDate">,
  hardcoverId: number
) => {
  const userRightNow = await currentUser();

  if (!userRightNow?.id) {
    throw new Error("User not authenticated");
  }

  // Notes may only be attached to a book the signed-in user owns.
  const [ownedBook] = await db
    .select({ id: book.id })
    .from(book)
    .where(
      and(eq(book.id, noteToAdd.bookId ?? -1), eq(book.userId, userRightNow.id))
    )
    .limit(1);

  if (!ownedBook) {
    throw new Error("Book not found");
  }

  noteToAdd.userId = userRightNow.id;

  await addNote(noteToAdd, hardcoverId);
};
