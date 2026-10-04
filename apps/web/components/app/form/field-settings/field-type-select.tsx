"use client"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Field, FieldLabel } from "@workspace/ui/components/field"
import { FIELD_TYPES, FIELD_TYPE_LIST, type FieldType } from "@/utils/constants"
import { ChevronsUpDownIcon } from "@workspace/ui/icons"

type FieldTypeSelectProps = {
  id: string
  value: FieldType
  onChange: (type: FieldType) => void
}

// A dropdown menu rather than a select: each type shows its icon, matching
// the Elements panel, and the current one is marked with a tick.
export function FieldTypeSelect({ id, value, onChange }: FieldTypeSelectProps) {
  const current = FIELD_TYPES[value]

  return (
    <Field>
      <FieldLabel htmlFor={id}>Type</FieldLabel>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="h-8 w-full justify-between rounded-lg px-2.5 font-normal"
            />
          }
        >
          <span className="flex items-center gap-2">
            <current.icon className="size-[18px]" />
            {current.label}
          </span>
          <ChevronsUpDownIcon
            className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onChange(next as FieldType)}
          >
            {FIELD_TYPE_LIST.map(({ type, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={type} value={type}>
                <Icon className="size-[18px]" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  )
}
