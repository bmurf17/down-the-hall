"use server";
import { asc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { Pool } from "@neondatabase/serverless";
import db from "../lib/db";
import { author, book, bookNote, userActivityLog, users } from "../lib/schema";
import { PoolClient } from "pg";
import { logStatusString } from "@/types/enums/statusEnum";
import { User } from "@clerk/nextjs/server";

export const addBook = async (
  title: string,
  authorName: string,
  authorImg: string,
  status: number,
  image: string,
  release_year: string,
  default_physical_edition_id: number,
  description: string,
  series_position: string,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number,
  user: User | null,
  date_read?: Date
) => {
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, user?.id || ""));

  if (userData.length === 0) {
    await db.insert(users).values({
      id: user?.id || "",
      image: user?.imageUrl,
      lastLoggedIn: new Date(),
      userName: user?.fullName,
    });
  }

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

      var book_id = await insertQuery(
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
        user?.id || "",
        date_read
      );

      await client.query("COMMIT");

      await db.insert(userActivityLog).values({
        bookId: book_id,
        updatedDate: new Date(),
        action: logStatusString[status],
        userId: user?.id || "",
      });

      revalidateTag("books");
    } catch (err) {
      console.log(err);
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
      return;
    }
  }

  try {
    var book_id = await insertQuery(
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
      user?.id || "",
      date_read
    );

    await db.insert(userActivityLog).values({
      bookId: book_id,
      updatedDate: new Date(),
      action: logStatusString[status],
      userId: user?.id || "",
    });
  } catch (err) {
    console.log(err);
  } finally {
    client.release();
  }

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
  series_position: string,
  series_length: number,
  series_name: string,
  hardcover_id: number,
  page_count: number,
  user_id: string,
  date_read?: Date
) => {
  const {
    rows: [{ id: book_id }],
  } = await client.query(
    "INSERT INTO book (title, author_id, image, status, release_year, default_physical_edition_id, description, series_position, series_length, series_name, hardcover_id, page_count, date_read, user_id, date_updated) VALUES ($1,$2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)  RETURNING id",
    [
      title,
      author_id,
      image,
      status,
      release_year || 0,
      default_physical_edition_id,
      description,
      series_position === "" ? 0 : series_position,
      series_length,
      series_name,
      hardcover_id,
      page_count,
      date_read,
      user_id,
      new Date(),
    ]
  );

  return book_id;
};

export const deleteBook = async (id: number) => {
  await db.delete(bookNote).where(eq(bookNote.bookId, id));

  await db.delete(userActivityLog).where(eq(userActivityLog.bookId, id));

  // Delete the book
  await db.delete(book).where(eq(book.id, id));

  revalidateTag("books");
};

export const editBook = async (
  id: number,
  title: string,
  status: number,
  rating: string,
  date_read?: Date
) => {
  try {
    const updateData: any = {
      title: title,
      status: status,
      rating: rating,
    };

    if (date_read !== undefined) {
      updateData.dateRead = date_read;
    }

    await db.update(book).set(updateData).where(eq(book.id, id));
    revalidateTag("books");
  } catch (error) {
    console.error("Error editing book:", error);
    throw error;
  }
};
