"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { useFormDraft } from "@/lib/providers/form-draft-provider"
import { ELEMENT_GROUPS, FIELD_TYPES } from "@/utils/constants"

// Clicking an element adds a question of that type to the canvas.
export function ElementsPanel() {
  const { addField } = useFormDraft()

  return (
    <div className="flex flex-col gap-5 p-3">
      <h3 className="text-sm font-medium">Elements</h3>

      {ELEMENT_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{group.label}</p>

          {group.types.map((type) => {
            const { label, icon } = FIELD_TYPES[type]

            return (
              <Button
                key={type}
                type="button"
                variant="outline"
                className="justify-start gap-2"
                onClick={() => addField(type)}
              >
                <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
                {label}
              </Button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
