// db/schema.ts
import {
    boolean,
    index,
    integer,
    jsonb,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    varchar,
} from "drizzle-orm/pg-core";

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

export const formStatus = pgEnum("form_status", ["draft", "published", "closed"]);

export const fieldType = pgEnum("field_type", [
    "short_text",
    "long_text",
    "email",
    "number",
    "date",
    "dropdown",
    "single_select",
    "multi_select",
]);

export const formsTable = pgTable(
    "forms",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        ownerId: integer()
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        title: varchar({ length: 255 }).notNull(),
        description: text(),
        publicId: varchar({ length: 12 }).notNull().unique(),
        status: formStatus().notNull().default("draft"),
        // Submit button text, success message — read only with the form, never queried.
        settings: jsonb().notNull().default({}),
        publishedAt: timestamp(),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [index("forms_ownerId_idx").on(table.ownerId)],
);

export const formFieldsTable = pgTable(
    "form_fields",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        formId: integer()
            .notNull()
            .references(() => formsTable.id, { onDelete: "cascade" }),
        type: fieldType().notNull(),
        label: varchar({ length: 500 }).notNull(),
        description: text(),
        placeholder: varchar({ length: 255 }),
        required: boolean().notNull().default(false),
        // Derived from the field's index in the PUT payload.
        position: integer().notNull(),
        config: jsonb().notNull().default({}),
        archivedAt: timestamp(),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [index("form_fields_formId_idx").on(table.formId)],
);

export const fieldOptionsTable = pgTable(
    "field_options",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        fieldId: integer()
            .notNull()
            .references(() => formFieldsTable.id, { onDelete: "cascade" }),
        label: varchar({ length: 500 }).notNull(),
        position: integer().notNull(),
        // Soft delete: keeps answers that chose this option resolvable.
        archivedAt: timestamp(),
        createdAt: timestamp().notNull().defaultNow(),
    },
    (table) => [index("field_options_fieldId_idx").on(table.fieldId)],
);

export const responsesTable = pgTable(
    "responses",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        formId: integer()
            .notNull()
            .references(() => formsTable.id, { onDelete: "cascade" }),
        ipAddress: varchar({ length: 45 }),
        userAgent: varchar({ length: 512 }),
        submittedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [index("responses_formId_idx").on(table.formId)],
);

export const answersTable = pgTable(
    "answers",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        responseId: integer()
            .notNull()
            .references(() => responsesTable.id, { onDelete: "cascade" }),
        fieldId: integer()
            .notNull()
            .references(() => formFieldsTable.id, { onDelete: "cascade" }),
        // Exactly one of these is populated, chosen by the field's type.
        valueText: text(),
        valueNumber: numeric(),
        valueDate: timestamp(),
        optionId: integer().references(() => fieldOptionsTable.id, {
            onDelete: "cascade",
        }),
        createdAt: timestamp().notNull().defaultNow(),
    },
    (table) => [
        index("answers_responseId_idx").on(table.responseId),
        index("answers_fieldId_idx").on(table.fieldId),
        index("answers_optionId_idx").on(table.optionId),
        // One answer per field per response. NULLS NOT DISTINCT is what makes
        // this apply to non-choice fields too, where optionId is null.
        unique("answers_response_field_option_key")
            .on(table.responseId, table.fieldId, table.optionId)
            .nullsNotDistinct(),
    ],
);
