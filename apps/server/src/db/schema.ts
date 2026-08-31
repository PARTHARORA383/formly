// db/schema.ts
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }),
    avatarUrl: varchar({ length: 2048 }),
    emailVerifiedAt: timestamp(),
    refreshTokenHash: varchar({ length: 255 }),
    createdAt: timestamp().notNull().defaultNow(),
});

export const magicLinksTable = pgTable("magic_links", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull().references(() => usersTable.id),
    tokenHash: varchar({ length: 255 }).notNull(),
    expiresAt: timestamp().notNull(),
    usedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
});