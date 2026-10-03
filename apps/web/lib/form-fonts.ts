// The typefaces a form can be rendered in. Plain data, safe to import from
// client components; the font files themselves are loaded in font-loaders.ts.
const FORM_FONTS = {
  inter: { label: "Inter", note: "Clean and neutral", family: "var(--font-sans), sans-serif" },
  urbanist: { label: "Urbanist", note: "Rounded and friendly", family: "var(--font-urbanist), sans-serif" },
  playfair: { label: "Playfair Display", note: "Elegant serif", family: "var(--font-playfair), serif" },
  "space-grotesk": { label: "Space Grotesk", note: "Technical and sharp", family: "var(--font-space-grotesk), sans-serif" },
} as const

type FormFontId = keyof typeof FORM_FONTS

const DEFAULT_FORM_FONT: FormFontId = "inter"

// Whatever is stored may be missing or from a font that was later removed.
function resolveFormFont(id: unknown): FormFontId {
  return typeof id === "string" && id in FORM_FONTS ? (id as FormFontId) : DEFAULT_FORM_FONT
}

export { FORM_FONTS, DEFAULT_FORM_FONT, resolveFormFont }
export type { FormFontId }
