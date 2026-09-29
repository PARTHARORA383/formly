"use client"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

type FieldPlaceholderInputProps = {
  id: string
  value: string | null | undefined
  onChange: (placeholder: string | null) => void
}

export function FieldPlaceholderInput({ id, value, onChange }: FieldPlaceholderInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Placeholder</FieldLabel>
      <Input
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
    </Field>
  )
}
