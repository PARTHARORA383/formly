"use client"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Textarea } from "@workspace/ui/components/textarea"

type FieldDescriptionInputProps = {
  id: string
  value: string | null | undefined
  onChange: (description: string | null) => void
}

export function FieldDescriptionInput({ id, value, onChange }: FieldDescriptionInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Description</FieldLabel>
      <Textarea
        id={id}
        rows={2}
        placeholder="Optional helper text"
        value={value ?? ""}
        // Empty means "no description", not an empty string, so it clears cleanly.
        onChange={(e) => onChange(e.target.value || null)}
      />
    </Field>
  )
}
