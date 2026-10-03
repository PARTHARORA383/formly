import useFields from "@/lib/zustand/form"
import type { UpdateFormInput } from "@/lib/zod/form"

export function buildUpdatePayload(): UpdateFormInput {
  const { title, description, settings, fields } = useFields.getState()

  return {
    title: title.trim(),
    // Empty means no description, which the API stores as null.
    description: description.trim() || null,
    settings,
    // position follows the array order, so the server stores what is on screen.
    fields: fields.map((field, position) => ({ ...field, position })),
  }
}
