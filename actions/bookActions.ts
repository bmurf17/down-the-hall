"use server";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "../lib/db";
import { book, author } from "../lib/schema";
import { Pool } from '@neondatabase/serverless';


export const getData = async (status?: string) => {
    if (status && status?.length > 0) {
        const data = await db.select().from(book).innerJoin(author, eq(book.authorId, author.id)).where(eq(book.status, +status)).orderBy(asc(book.id));
        return data;
    }
    const data = await db.select().from(book).innerJoin(author, eq(book.authorId, author.id)).orderBy(asc(book.id));
    return data;
};

export const addBook = async (title: string, authorName: string, authorImg: string, status: number, image: string) => {
    console.log("Here")

    // create a `Client` inside the request handler
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', err => console.error(err));  // deal with e.g. re-connect
    const client = await pool.connect();


    try {
        await client.query('BEGIN');
        console.log("About to insert author")
        const { rows: [{ id: authorId }] } = await client.query('INSERT INTO author (name, image) VALUES ($1, $2) RETURNING id', [authorName, authorImg]);
        console.log("About to insert book")
        console.log(authorId)
        await client.query('INSERT INTO book (title, author_id, image, status) VALUES ($1,$2, $3, $4)', [title, authorId, image, status])
        await client.query('COMMIT');
    }catch (err) {
        await client.query('ROLLBACK');
        throw err;
      
      } finally {
        client.release();
      }

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