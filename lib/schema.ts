
import { InferModel, relations } from 'drizzle-orm';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';


export const user = pgTable("user_site", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull()
})



export const author = pgTable("author", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  image: text("image")
})

export const authorRelations = relations(author, ({ many }) => ({
  posts: many(book),
}));


export const book = pgTable("book", {
  id: serial("id").primaryKey().notNull(),
  title: text("title").notNull(),
  authorId: integer("authorId").references(() => author.id),
  image: text("image")
})

export const bookRelations = relations(book, ({ one }) => ({
  author: one(author, {
    fields: [book.authorId],
    references: [author.id],
  }),
}));

  export type SelectBook = typeof book.$inferSelect;
  export type InsertBook = typeof book.$inferSelect;