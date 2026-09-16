import { customAlphabet } from "nanoid";

// 12 chars, matching forms.publicId varchar(12)
const PUBLIC_ID_LENGTH = 12;
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", PUBLIC_ID_LENGTH);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // strip special chars
    .replace(/[\s_]+/g, "-")    // spaces/underscores -> hyphen
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

// Immutable once set — this is what URLs resolve against.
function generatePublicId(): string {
  return nanoid();
}

// The slug always ends with the form's publicId, so the words in front of it
// are decoration. Renaming rebuilds the slug but keeps the same suffix, which
// is what lets an old URL still resolve to the form.
function buildSlug(title: string, publicId: string): string {
  const base = slugify(title) || "form";
  return `${base}-${publicId}`;
}

function parsePublicId(slug: string): string {
  return slug.slice(slug.lastIndexOf("-") + 1);
}

// "Customer Feedback Survey" -> "customer-feedback-survey-x7k2p9m4r1bd"

export { slugify, generatePublicId, buildSlug, parsePublicId };
