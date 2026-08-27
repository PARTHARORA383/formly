import { integer, pgTable, varchar , timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }),
    avatarUrl: varchar({ length: 2048 }),
    createdAt: timestamp().notNull().defaultNow(),
});


