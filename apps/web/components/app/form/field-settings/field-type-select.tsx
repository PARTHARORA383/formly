"use client"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { FIELD_TYPE_LIST, type FieldType } from "@/utils/constants"

type FieldTypeSelectProps = {
  id: string
  value: FieldType
  onChange: (type: FieldType) => void
}

const items = FIELD_TYPE_LIST.map(({ type, label }) => ({ value: type, label }))

export function FieldTypeSelect({ id, value, onChange }: FieldTypeSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Type</FieldLabel>
      {/* items maps each value to its label, so the trigger shows "Short text"
          rather than the raw "short_text". */}
      <Select
        value={value}
        items={items}
        onValueChange={(next) => {
          if (next) onChange(next as FieldType)
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FIELD_TYPE_LIST.map(({ type, label }) => (
            <SelectItem key={type} value={type}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
