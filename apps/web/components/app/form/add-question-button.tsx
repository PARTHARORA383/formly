"use client"

import { Button } from "@workspace/ui/components/button"
import useFields from "@/lib/zustand/form"
import { PlusIcon } from "@workspace/ui/icons"

export function AddQuestionButton() {
  const addField = useFields((state) => state.addField)

  return (
    <Button type="button" size="sm" onClick={() => addField()}>
      <PlusIcon className="size-[18px]" />
      Add question
    </Button>
  )
}
