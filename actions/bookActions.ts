"use server";
import { asc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { Pool } from '@neondatabase/serverless';
import db from "../lib/db";
import { author, book } from "../lib/schema";


export const addBook = async (title: string, authorName: string, authorImg: string, status: number, image: string) => {
    // create a `Client` inside the request handler
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', err => console.error(err));  // deal with e.g. re-connect
    const client = await pool.connect();

    const authorData = await db.select().from(author).where(eq(author.name, authorName));

    //author does not exist so we need to start transaction to add them as well 
    if (authorData.length == 0) {
        try {
            await client.query('BEGIN');
            const { rows: [{ id: authorId }] } = await client.query('INSERT INTO author (name, image) VALUES ($1, $2) RETURNING id', [authorName, authorImg]);
            await client.query('INSERT INTO book (title, author_id, image, status) VALUES ($1,$2, $3, $4)', [title, authorId, image, status])
            await client.query('COMMIT');

            revalidateTag('books')
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;

        } finally {
            client.release();
            return;
        }
    }

    await client.query('INSERT INTO book (title, author_id, image, status) VALUES ($1,$2, $3, $4)', [title, authorData[0].id, image, status])
    revalidateTag('books')
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