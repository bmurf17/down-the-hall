"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "../lib/db";
import { book, author } from "../lib/schema";

export const getData = async () => {
    const data = await db.select().from(book);
    return data;
};

export const addBook = async (title: string, authorName: string, authorImg: string) => {
    
    await db.transaction(async (tx) => {
        const authorObject =  await tx.insert(author).values({
            name: authorName,
            image: authorImg
        }).returning({id: author.id});

        await tx.insert(book).values({
            title: title,
            authorId: authorObject[0].id || 1
        });
    })
    
    await db.insert(book).values({
        title: title,
    });
    revalidatePath("/");
};

export const deleteBook = async (id: number) => {
    await db.delete(book).where(eq(book.id, id));

    revalidatePath("/");
};

export const editBook = async (id: number, title: string) => {
    await db
        .update(book)
        .set({
            title: title,
        })
        .where(eq(book.id, id));

    revalidatePath("/");
};