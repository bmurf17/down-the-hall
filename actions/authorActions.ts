"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "../lib/db";
import { author } from "../lib/schema";

export const getData = async () => {
    const data = await db.select().from(author);
    return data;
};

export const addAuthor = async (name: string, img: string) => {
    await db.insert(author).values({
        name: name,
        image: img
    });
    revalidatePath("/");
};

export const deleteAuthor = async (id: number) => {
    await db.delete(author).where(eq(author.id, id));

    revalidatePath("/");
};

export const editAuthor = async (id: number, name: string, img: string) => {
    await db
        .update(author)
        .set({
            name: name,
            image: img
        })
        .where(eq(author.id, id));

    revalidatePath("/");
};