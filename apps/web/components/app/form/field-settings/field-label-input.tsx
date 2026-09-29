"use client"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

type FieldLabelInputProps = {
  id: string
  value: string
  onChange: (label: string) => void
}

export function FieldLabelInput({ id, value, onChange }: FieldLabelInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Label</FieldLabel>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}
