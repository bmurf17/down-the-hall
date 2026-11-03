"use server";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

import { Pool } from "@neondatabase/serverless";
import db from "../lib/db";
import { author, book, users } from "../lib/schema";
import { PoolClient } from "pg";
import { logStatusString } from "@/types/enums/statusEnum";
import { currentUser, User } from "@clerk/nextjs/server";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on("error", (err) => console.error(err));

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
  const userId = user?.id || "";
  const userData = await db.select().from(users).where(eq(users.id, userId));

  if (userData.length === 0) {
    await db.insert(users).values({
      id: userId,
      image: user?.imageUrl,
      lastLoggedIn: new Date(),
      userName: user?.fullName,
    });
  }

  const authorData = await db
    .select()
    .from(author)
    .where(eq(author.name, authorName));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let authorId = authorData[0]?.id;

    // The author does not exist yet, so create them inside the same transaction.
    if (authorId === undefined) {
      const { rows } = await client.query(
        "INSERT INTO author (name, image) VALUES ($1, $2) RETURNING id",
        [authorName, authorImg]
      );
      authorId = (rows[0] as { id: number }).id;
    }

    const bookId = await insertQuery(
      // The neon client is structurally compatible with pg's PoolClient.
      client as unknown as PoolClient,
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
      userId,
      date_read
    );

    await client.query(
      "INSERT INTO user_activity_log (book_id, updated_date, action, user_id) VALUES ($1, $2, $3, $4)",
      [bookId, new Date(), logStatusString[status], userId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  revalidateTag("books");
  revalidateTag("userActivityLog");
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
  // `series_position` is a decimal column, so "empty"/"null" strings have to be
  // normalised to a real value instead of being sent as-is.
  const seriesPosition =
    series_position == null ||
    series_position === "" ||
    series_position === "null"
      ? 0
      : series_position;

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
      seriesPosition,
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
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify ownership before touching child rows. The book is deleted last so
    // foreign keys from notes/activity logs are already gone.
    const { rowCount } = await client.query(
      "SELECT 1 FROM book WHERE id = $1 AND user_id = $2",
      [id, user.id]
    );

    if (!rowCount) {
      throw new Error("Book not found");
    }

    await client.query("DELETE FROM book_note WHERE book_id = $1", [id]);
    await client.query("DELETE FROM user_activity_log WHERE book_id = $1", [
      id,
    ]);
    await client.query("DELETE FROM book WHERE id = $1 AND user_id = $2", [
      id,
      user.id,
    ]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // The cover is removed by scripts/cleanup-orphaned-images.ts once no book
  // references it anymore.
  revalidateTag("books");
  revalidateTag("userActivityLog");
};

export const editBook = async (
  id: number,
  title: string,
  status: number,
  rating: string,
  date_read?: Date,
  page_count?: number
) => {
  try {
    const user = await currentUser();

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const updateData: Partial<typeof book.$inferInsert> = {
      title: title,
      status: status,
      rating: rating,
    };

    if (date_read !== undefined) {
      updateData.dateRead = date_read.toISOString().slice(0, 10);
    }

    if (page_count !== null && page_count !== undefined) {
      updateData.pageCount = page_count;
    }

    const updated = await db
      .update(book)
      .set(updateData)
      .where(and(eq(book.id, id), eq(book.userId, user.id)))
      .returning({ id: book.id });

    if (updated.length === 0) {
      throw new Error("Book not found");
    }

    revalidateTag("books");
  } catch (error) {
    console.error("Error editing book:", error);
    throw error;
  }
};
