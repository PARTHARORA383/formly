"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import useFields from "@/lib/zustand/form"

export function AddQuestionButton() {
  const addField = useFields((state) => state.addField)

  return (
    <Button type="button" size="sm" onClick={() => addField()}>
      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
      Add question
    </Button>
  )
}
