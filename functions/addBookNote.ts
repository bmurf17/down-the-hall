"use server";

import { addBook } from "@/actions/bookActions";
import { addNote } from "@/actions/noteActions";
import { InsertBookNote } from "@/lib/schema";
import { Status } from "@/types/statusEnum";
import { currentUser } from "@clerk/nextjs/server";

export const addBookNote = async (
  noteToAdd: Omit<InsertBookNote, "id" | "updatedDate">
) => {
  const userRightNow = await currentUser();

  noteToAdd.userId = userRightNow?.id;

  addNote(noteToAdd);
};
