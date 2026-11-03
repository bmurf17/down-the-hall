"use server";
import { revalidateTag } from "next/cache";

import { Pool } from "@neondatabase/serverless";
import db from "../lib/db";
import { users } from "../lib/schema";
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

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // `onConflictDoNothing` makes concurrent first-adds safe without a prior read.
  await db
    .insert(users)
    .values({
      id: userId,
      image: user?.imageUrl,
      lastLoggedIn: new Date(),
      userName: user?.fullName,
    })
    .onConflictDoNothing();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Upsert the author inside the transaction. The unique index on
    // `lower(name)` makes concurrent creates safe; an existing author keeps its
    // image if one was already stored.
    const { rows: authorRows } = await client.query<{ id: number }>(
      `INSERT INTO author (name, image) VALUES ($1, $2)
       ON CONFLICT (lower(name))
       DO UPDATE SET image = COALESCE(author.image, EXCLUDED.image)
       RETURNING id`,
      [authorName, authorImg || null]
    );
    const authorId = authorRows[0].id;

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
  revalidateTag(`user-${userId}`);
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

  // Re-adding a book the reader already owns updates that row instead of
  // creating a duplicate. The partial unique index only covers real Hardcover
  // ids (search-placeholder rows with id 0 may repeat).
  const {
    rows: [{ id: book_id }],
  } = await client.query(
    `INSERT INTO book (title, author_id, image, status, release_year, default_physical_edition_id, description, series_position, series_length, series_name, hardcover_id, page_count, date_read, user_id, date_updated)
     VALUES ($1,$2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (user_id, hardcover_id) WHERE hardcover_id > 0
     DO UPDATE SET
       title = EXCLUDED.title,
       author_id = EXCLUDED.author_id,
       image = EXCLUDED.image,
       status = EXCLUDED.status,
       release_year = EXCLUDED.release_year,
       default_physical_edition_id = EXCLUDED.default_physical_edition_id,
       description = EXCLUDED.description,
       series_position = EXCLUDED.series_position,
       series_length = EXCLUDED.series_length,
       series_name = EXCLUDED.series_name,
       page_count = EXCLUDED.page_count,
       date_read = COALESCE(EXCLUDED.date_read, book.date_read),
       date_updated = EXCLUDED.date_updated
     RETURNING id`,
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
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock + verify ownership, and remember the previous status so a real
    // status change can be written to the activity feed.
    const { rows } = await client.query<{ status: number | null }>(
      "SELECT status FROM book WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, user.id]
    );

    if (rows.length === 0) {
      throw new Error("Book not found");
    }

    const previousStatus = rows[0].status;
    const values: unknown[] = [title, status, rating];
    const assignments = ["title = $1", "status = $2", "rating = $3"];

    if (date_read !== undefined) {
      values.push(date_read.toISOString().slice(0, 10));
      assignments.push(`date_read = $${values.length}`);
    }

    if (page_count !== null && page_count !== undefined) {
      values.push(page_count);
      assignments.push(`page_count = $${values.length}`);
    }

    // "Updated Date" sorting should reflect edits, not just inserts.
    values.push(new Date());
    assignments.push(`date_updated = $${values.length}`);

    values.push(id, user.id);

    await client.query(
      `UPDATE book SET ${assignments.join(", ")}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}`,
      values
    );

    if (previousStatus !== status) {
      await client.query(
        "INSERT INTO user_activity_log (book_id, updated_date, action, user_id) VALUES ($1, $2, $3, $4)",
        [id, new Date(), logStatusString[status], user.id]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error editing book:", error);
    throw error;
  } finally {
    client.release();
  }

  revalidateTag("books");
  revalidateTag("userActivityLog");
  revalidateTag(`user-${user.id}`);
};
