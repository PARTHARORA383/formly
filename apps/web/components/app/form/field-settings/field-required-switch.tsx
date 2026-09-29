"use client"

import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Switch } from "@workspace/ui/components/switch"

type FieldRequiredSwitchProps = {
  id: string
  checked: boolean
  onChange: (required: boolean) => void
}

export function FieldRequiredSwitch({ id, checked, onChange }: FieldRequiredSwitchProps) {
  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>Required</FieldLabel>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </Field>
  )
}
