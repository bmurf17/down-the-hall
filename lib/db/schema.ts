
import { pgTable, serial, text } from 'drizzle-orm/pg-core';


export const user = pgTable("user_site", {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull()
})