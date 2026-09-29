import {
  ArrowDown01Icon,
  Calendar01Icon,
  CheckmarkSquare01Icon,
  HashtagIcon,
  Mail01Icon,
  RadioButtonIcon,
  TextAlignLeftIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import type { FormField, FieldOption } from "@/types/field"

type FieldType = FormField["type"]

type FieldTypeDefinition = {
  label: string
  icon: IconSvgElement
  /** Choice types carry a list of options; everything else must not. */
  hasOptions: boolean
  /** Whether the input renders placeholder text (see field-input.tsx). */
  hasPlaceholder: boolean
}

// One entry per field type. The settings panel and the elements list both read
// this, so adding a type means adding a line here.
const FIELD_TYPES: Record<FieldType, FieldTypeDefinition> = {
  short_text: { label: "Short text", icon: TextFontIcon, hasOptions: false, hasPlaceholder: true },
  long_text: { label: "Long text", icon: TextAlignLeftIcon, hasOptions: false, hasPlaceholder: true },
  email: { label: "Email", icon: Mail01Icon, hasOptions: false, hasPlaceholder: true },
  number: { label: "Number", icon: HashtagIcon, hasOptions: false, hasPlaceholder: true },
  date: { label: "Date", icon: Calendar01Icon, hasOptions: false, hasPlaceholder: false },
  dropdown: { label: "Dropdown", icon: ArrowDown01Icon, hasOptions: true, hasPlaceholder: true },
  single_select: { label: "Single select", icon: RadioButtonIcon, hasOptions: true, hasPlaceholder: false },
  multi_select: { label: "Multi select", icon: CheckmarkSquare01Icon, hasOptions: true, hasPlaceholder: false },
}

const FIELD_TYPE_LIST = (Object.keys(FIELD_TYPES) as FieldType[]).map((type) => ({
  type,
  label: FIELD_TYPES[type].label,
}))

// How the elements list groups the types, in display order.
const ELEMENT_GROUPS: { label: string; types: FieldType[] }[] = [
  { label: "Text & input", types: ["short_text", "long_text", "email", "number", "date"] },
  { label: "Selection", types: ["dropdown", "single_select", "multi_select"] },
]

// What a choice field starts with when it has none, so a new dropdown or a
// question switched to one never shows an empty list.
function defaultOptions(): FieldOption[] {
  return [{ label: "Option 1" }, { label: "Option 2" }]
}

export { FIELD_TYPES, FIELD_TYPE_LIST, ELEMENT_GROUPS, defaultOptions }
export type { FieldType }
