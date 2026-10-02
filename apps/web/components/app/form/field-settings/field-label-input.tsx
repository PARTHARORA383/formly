"use client"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { LABEL_PLACEHOLDER } from "@/utils/constants"

type FieldLabelInputProps = {
  id: string
  value: string
  onChange: (label: string) => void
}

export function FieldLabelInput({ id, value, onChange }: FieldLabelInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Label</FieldLabel>
      <Input
        id={id}
        value={value}
        placeholder={LABEL_PLACEHOLDER}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}
