ALTER TABLE "forms" ADD COLUMN "publicId" varchar(12) NOT NULL;--> statement-breakpoint
ALTER TABLE "form_fields" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_publicId_key" UNIQUE("publicId");