CREATE TYPE "field_type" AS ENUM('short_text', 'long_text', 'email', 'number', 'date', 'dropdown', 'single_select', 'multi_select');--> statement-breakpoint
CREATE TYPE "form_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TABLE "answers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"responseId" integer NOT NULL,
	"fieldId" integer NOT NULL,
	"valueText" text,
	"valueNumber" numeric,
	"valueDate" timestamp,
	"optionId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "answers_response_field_option_key" UNIQUE NULLS NOT DISTINCT("responseId","fieldId","optionId")
);
--> statement-breakpoint
CREATE TABLE "field_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "field_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fieldId" integer NOT NULL,
	"label" varchar(500) NOT NULL,
	"position" integer NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "form_fields_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"formId" integer NOT NULL,
	"type" "field_type" NOT NULL,
	"label" varchar(500) NOT NULL,
	"description" text,
	"placeholder" varchar(255),
	"required" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"archivedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ownerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL UNIQUE,
	"status" "form_status" DEFAULT 'draft'::"form_status" NOT NULL,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "responses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"formId" integer NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" varchar(512),
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "answers_responseId_idx" ON "answers" ("responseId");--> statement-breakpoint
CREATE INDEX "answers_fieldId_idx" ON "answers" ("fieldId");--> statement-breakpoint
CREATE INDEX "answers_optionId_idx" ON "answers" ("optionId");--> statement-breakpoint
CREATE INDEX "field_options_fieldId_idx" ON "field_options" ("fieldId");--> statement-breakpoint
CREATE INDEX "form_fields_formId_idx" ON "form_fields" ("formId");--> statement-breakpoint
CREATE INDEX "forms_ownerId_idx" ON "forms" ("ownerId");--> statement-breakpoint
CREATE INDEX "responses_formId_idx" ON "responses" ("formId");--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_responseId_responses_id_fkey" FOREIGN KEY ("responseId") REFERENCES "responses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_fieldId_form_fields_id_fkey" FOREIGN KEY ("fieldId") REFERENCES "form_fields"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_optionId_field_options_id_fkey" FOREIGN KEY ("optionId") REFERENCES "field_options"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "field_options" ADD CONSTRAINT "field_options_fieldId_form_fields_id_fkey" FOREIGN KEY ("fieldId") REFERENCES "form_fields"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_formId_forms_id_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_ownerId_users_id_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_formId_forms_id_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE CASCADE;