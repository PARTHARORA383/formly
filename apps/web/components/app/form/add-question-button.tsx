"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import { useFormDraft } from "@/lib/providers/form-draft-provider"

export function AddQuestionButton() {
  const { addField } = useFormDraft()

  return (
    <Button type="button" size="sm" onClick={() => addField()}>
      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
      Add question
    </Button>
  )
}
