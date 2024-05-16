
import { pgTable, serial, text } from 'drizzle-orm/pg-core';


export const userTable = pgTable("user_site", {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull()
})