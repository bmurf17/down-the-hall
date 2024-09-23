import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const author = pgTable("author", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  image: text("image"),
});

export const authorRelations = relations(author, ({ many }) => ({
  posts: many(book),
}));

export const book = pgTable("book", {
  id: serial("id").primaryKey().notNull(),
  userId: text("user_id"),
  title: text("title").notNull(),
  authorId: integer("author_id").references(() => author.id),
  image: text("image"),
  status: integer("status"),
  releaseYear: integer("release_year"),
  defaultPhysicalEditionId: integer("default_physical_edition_id"),
  description: text("description"),
  seriesPosition: integer("series_position"),
  seriesLength: integer("series_length"),
  seriesName: text("series_name"),
  pageCount: integer("page_count"),
  genres: text("genres").array(),
  hardcoverId: integer("hardcover_id"),
  dateRead: date("date_read"),
  updatedDate: date("date_updated"),
});

export const bookRelations = relations(book, ({ one, many }) => ({
  author: one(author, {
    fields: [book.authorId],
    references: [author.id],
  }),
  logs: many(userActivityLog),
  notes: many(bookNote),
}));

export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey().notNull(),
  userId: text("user_id"),
  bookId: integer("book_id").references(() => book.id),
  updatedDate: timestamp("updated_date"),
  action: text("action"),
});

export const bookNote = pgTable("book_note", {
  id: serial("id").primaryKey().notNull(),
  userId: text("user_id"),
  bookId: integer("book_id").references(() => book.id),
  updatedDate: timestamp("updated_date"),
  note: text("note"),
  pageNumber: integer("page_number"),
  series: text("series"),
});

export type SelectBook = typeof book.$inferSelect;
export type InsertBook = typeof book.$inferInsert;
export type SelectAuthor = typeof author.$inferSelect;
export type InsertAuthor = typeof author.$inferInsert;
export type SelectUserActivityLog = typeof userActivityLog.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLog.$inferInsert;
export type SelectBookNote = typeof bookNote.$inferSelect;
export type InsertBookNote = typeof bookNote.$inferInsert;
