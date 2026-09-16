import { customAlphabet } from "nanoid";

// 12 chars, matching forms.publicId varchar(12)
const PUBLIC_ID_LENGTH = 12;
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", PUBLIC_ID_LENGTH);

// Immutable once set — this is what form URLs resolve against, so it stays
// stable no matter how often the title changes.
function generatePublicId(): string {
  return nanoid();
}

export { generatePublicId };
