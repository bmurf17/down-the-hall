"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "../lib/db";
import { user } from "../lib/schema";
import { currentUser } from "@clerk/nextjs/server";

export const getData = async () => {
  const data = await db.select().from(user);
  return data;
};

export const addUser = async () => {
  const userRightNow = await currentUser();
  if (userRightNow) {
    const id = userRightNow?.id;
    await db
      .insert(user)
      .values({
        id: id,
        name: userRightNow?.fullName || "",
      })
      .onConflictDoNothing({ target: user.id });
  }

  revalidatePath("/");
};

export const deleteUser = async (id: string) => {
  await db.delete(user).where(eq(user.id, id));

  revalidatePath("/");
};

export const editUser = async (id: string, name: string) => {
  await db
    .update(user)
    .set({
      name: name,
    })
    .where(eq(user.id, id));

  revalidatePath("/");
};
