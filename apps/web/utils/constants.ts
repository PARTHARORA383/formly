import type { IconComponent } from "@workspace/ui/icons"
import type { FormField, FieldOption } from "@/types/field"
import { CalendarIcon, CheckSquareIcon, SelectBoxIcon, HashIcon, LongTextIcon, MailIcon, RadioIcon, TextIcon } from "@workspace/ui/icons"

type FieldType = FormField["type"]

type FieldTypeDefinition = {
  label: string
  icon: IconComponent
  /** Choice types carry a list of options; everything else must not. */
  hasOptions: boolean
  /** Whether the input renders placeholder text (see field-input.tsx). */
  hasPlaceholder: boolean
}

/** Shown in any input whose question has no placeholder of its own. */
const DEFAULT_PLACEHOLDER = "Type your answer here..."

/** Shown where a question has no label yet. A hint, never a saved value. */
const LABEL_PLACEHOLDER = "Type your question here"

// One entry per field type. The settings panel and the elements list both read
// this, so adding a type means adding a line here.
const FIELD_TYPES: Record<FieldType, FieldTypeDefinition> = {
  short_text: { label: "Short text", icon: TextIcon, hasOptions: false, hasPlaceholder: true },
  long_text: { label: "Long text", icon: LongTextIcon, hasOptions: false, hasPlaceholder: true },
  email: { label: "Email", icon: MailIcon, hasOptions: false, hasPlaceholder: true },
  number: { label: "Number", icon: HashIcon, hasOptions: false, hasPlaceholder: true },
  date: { label: "Date", icon: CalendarIcon, hasOptions: false, hasPlaceholder: false },
  dropdown: { label: "Dropdown", icon: SelectBoxIcon, hasOptions: true, hasPlaceholder: true },
  single_select: { label: "Single select", icon: RadioIcon, hasOptions: true, hasPlaceholder: false },
  multi_select: { label: "Multi select", icon: CheckSquareIcon, hasOptions: true, hasPlaceholder: false },
}

const FIELD_TYPE_LIST = (Object.keys(FIELD_TYPES) as FieldType[]).map((type) => ({
  type,
  label: FIELD_TYPES[type].label,
  icon: FIELD_TYPES[type].icon,
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

export { FIELD_TYPES, FIELD_TYPE_LIST, ELEMENT_GROUPS, DEFAULT_PLACEHOLDER, LABEL_PLACEHOLDER, defaultOptions }
export type { FieldType }
