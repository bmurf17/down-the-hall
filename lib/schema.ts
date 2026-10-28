import { relations } from "drizzle-orm";
import {
  date,
  decimal,
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
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  authorId: integer("author_id").references(() => author.id),
  image: text("image"),
  status: integer("status"),
  releaseYear: integer("release_year"),
  defaultPhysicalEditionId: integer("default_physical_edition_id"),
  description: text("description"),
  seriesPosition: decimal("series_position"),
  seriesLength: integer("series_length"),
  seriesName: text("series_name"),
  pageCount: integer("page_count"),
  genres: text("genres").array(),
  hardcoverId: integer("hardcover_id"),
  dateRead: date("date_read"),
  updatedDate: date("date_updated"),
  rating: decimal("rating"),
});

export const bookRelations = relations(book, ({ one, many }) => ({
  user: one(users, {
    fields: [book.userId],
    references: [users.id],
  }),
  author: one(author, {
    fields: [book.authorId],
    references: [author.id],
  }),
  logs: many(userActivityLog),
  notes: many(bookNote),
}));

export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey().notNull(),
  userId: text("user_id").references(() => users.id),
  bookId: integer("book_id").references(() => book.id),
  updatedDate: timestamp("updated_date"),
  action: text("action"),
});

export const userActivityLogRelations = relations(
  userActivityLog,
  ({ one }) => ({
    user: one(users, {
      fields: [userActivityLog.userId],
      references: [users.id],
    }),
    book: one(book, {
      fields: [userActivityLog.bookId],
      references: [book.id],
    }),
  })
);

export const bookNote = pgTable("book_note", {
  id: serial("id").primaryKey().notNull(),
  userId: text("user_id").references(() => users.id),
  bookId: integer("book_id").references(() => book.id),
  updatedDate: timestamp("updated_date"),
  note: text("note"),
  pageNumber: integer("page_number"),
  series: text("series"),
});

export const bookNoteRelations = relations(bookNote, ({ one }) => ({
  user: one(users, {
    fields: [bookNote.userId],
    references: [users.id],
  }),
  book: one(book, {
    fields: [bookNote.bookId],
    references: [book.id],
  }),
}));

export const userGoals = pgTable("user_goal", {
  id: serial("id").primaryKey().notNull(),
  userId: text("user_id").references(() => users.id),
  timeFrame: integer("time_frame"),
  bookCount: integer("book_count"),
  goalYear: integer("goal_year"),
});

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, {
    fields: [userGoals.userId],
    references: [users.id],
  }),
}));

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  image: text("image"),
  userName: text("user_name"),
  lastLoggedIn: timestamp("last_logged_in"),
});

/**
 * Single-row table holding the app-wide Hardcover OAuth connection.
 *
 * Hardcover rotates refresh tokens on every use, so the newest pair has to be
 * persisted somewhere writable. `refresh_lock_expires_at` is a cross-instance
 * lease so two server instances never spend the same refresh token at once
 * (Hardcover treats that as replay and revokes the whole token chain).
 */
export const hardcoverOAuthToken = pgTable("hardcover_oauth_token", {
  id: integer("id").primaryKey().notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  scope: text("scope"),
  tokenType: text("token_type"),
  refreshLockExpiresAt: timestamp("refresh_lock_expires_at", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  goals: many(userGoals),
  books: many(book),
  activityLogs: many(userActivityLog),
  bookNotes: many(bookNote),
}));

export type SelectBook = typeof book.$inferSelect;
export type InsertBook = typeof book.$inferInsert;
export type SelectAuthor = typeof author.$inferSelect;
export type InsertAuthor = typeof author.$inferInsert;
export type SelectUserActivityLog = typeof userActivityLog.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLog.$inferInsert;
export type SelectBookNote = typeof bookNote.$inferSelect;
export type InsertBookNote = typeof bookNote.$inferInsert;
export type SelectGoal = typeof userGoals.$inferSelect;
export type InsertGoal = typeof userGoals.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectHardcoverOAuthToken =
  typeof hardcoverOAuthToken.$inferSelect;
export type InsertHardcoverOAuthToken =
  typeof hardcoverOAuthToken.$inferInsert;
