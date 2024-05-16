import { defineConfig } from "drizzle-kit"
export default defineConfig({
    dialect: "postgresql", // "postgresql" | "mysql"
    dbCredentials: {
        url: process.env.DATABASE_URL || ""
    },
    schema: "./lib/schema.ts"
})