"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import type { FieldOption } from "@/types/field"

type FieldOptionsEditorProps = {
  value: FieldOption[]
  onChange: (options: FieldOption[]) => void
}

export function FieldOptionsEditor({ value, onChange }: FieldOptionsEditorProps) {
  function rename(index: number, label: string) {
    onChange(value.map((option, i) => (i === index ? { ...option, label } : option)))
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function add() {
    onChange([...value, { label: `Option ${value.length + 1}` }])
  }

  return (
    <Field>
      <FieldLabel>Options</FieldLabel>

      <div className="flex flex-col gap-2">
        {value.map((option, index) => (
          // Index as key is deliberate: order is an option's only identity
          // until it is saved, and the inputs are fully controlled.
          <div key={index} className="flex items-center gap-2">
            <Input
              aria-label={`Option ${index + 1}`}
              value={option.label}
              onChange={(e) => rename(index, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove option ${index + 1}`}
              // A choice field with nothing to choose from is unusable.
              disabled={value.length <= 1}
              onClick={() => remove(index)}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={add}>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
          Add option
        </Button>
      </div>
    </Field>
  )
}
