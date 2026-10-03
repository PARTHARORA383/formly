"use client"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { IconTooltip } from "@/components/common/icon-tooltip"
import type { FieldOption } from "@/types/field"
import { CloseIcon, PlusIcon } from "@workspace/ui/icons"

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
            <IconTooltip
              icon={CloseIcon}
              tooltip="Remove option"
              side="top"
              // A choice field with nothing to choose from is unusable.
              disabled={value.length <= 1}
              onClick={() => remove(index)}
              className="size-8 shrink-0 hover:bg-muted"
            />
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={add}>
          <PlusIcon className="size-[18px]" />
          Add option
        </Button>
      </div>
    </Field>
  )
}
