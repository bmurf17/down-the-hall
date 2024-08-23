"use server";
import { asc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { Pool } from "@neondatabase/serverless";
import db from "../lib/db";
import { author, book } from "../lib/schema";
import { PoolClient } from "pg";

export const addBook = async (
  title: string,
  authorName: string,
  authorImg: string,
  status: number,
  image: string,
  release_year: string,
  default_physical_edition_id: number,
  description: string,
  series_position: number,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number,
  date_read?: Date
) => {
  // create a `Client` inside the request handler
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.on("error", (err) => console.error(err)); // deal with e.g. re-connect
  const client = await pool.connect();

  const authorData = await db
    .select()
    .from(author)
    .where(eq(author.name, authorName));

  //author does not exist so we need to start transaction to add them as well
  if (authorData.length == 0) {
    try {
      await client.query("BEGIN");
      const {
        rows: [{ id: authorId }],
      } = await client.query(
        "INSERT INTO author (name, image) VALUES ($1, $2) RETURNING id",
        [authorName, authorImg]
      );

      await insertQuery(
        client,
        title,
        authorId,
        status,
        image,
        release_year,
        default_physical_edition_id,
        description,
        series_position,
        series_length,
        series_name,
        hardcover_id,
        page_count,
        date_read
      );

      await client.query("COMMIT");

      revalidateTag("books");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
      return;
    }
  }

  await insertQuery(
    client,
    title,
    authorData[0].id,
    status,
    image,
    release_year,
    default_physical_edition_id,
    description,
    series_position,
    series_length,
    series_name,
    hardcover_id,
    page_count,
    date_read
  );

  revalidateTag("books");
};

const insertQuery = async (
  client: PoolClient,
  title: string,
  author_id: number,
  status: number,
  image: string,
  release_year: string,
  default_physical_edition_id: number,
  description: string,
  series_position: number,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number,
  date_read?: Date
) => {
  await client.query(
    "INSERT INTO book (title, author_id, image, status, release_year, default_physical_edition_id, description, series_position, series_length, series_name, hardcover_id, page_count, date_read, date_updated) VALUES ($1,$2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
    [
      title,
      author_id,
      image,
      status,
      release_year,
      default_physical_edition_id,
      description,
      series_position,
      series_length,
      series_name,
      hardcover_id,
      page_count,
      date_read,
      new Date(),
    ]
  );
};

export const deleteBook = async (id: number) => {
  await db.delete(book).where(eq(book.id, id));

  revalidateTag("books");
};

export const editBook = async (
  id: number,
  title: string,
  status: number,
  image: string,
  release_year: string,
  default_physical_edition_id: number,
  description: string,
  series_position: number,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number
) => {
  await db
    .update(book)
    .set({
      title: title,
      status: status,
    })
    .where(eq(book.id, id));

  revalidateTag("books");
};
