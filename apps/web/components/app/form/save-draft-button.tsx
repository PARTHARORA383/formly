"use client"

import { toast } from "sonner"
import { ZodError } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useForm, useUpdateForm } from "@/lib/query/form"
import { buildUpdatePayload } from "@/lib/form-payload"
import useFields from "@/lib/zustand/form"

export function SaveDraftButton({ publicId }: { publicId: string }) {
  const { data: form } = useForm(publicId)
  const { mutate, isPending } = useUpdateForm(publicId)
  const applySaved = useFields((state) => state.applySaved)

  // Only used to hold the button back until the form has loaded, so a save
  // can't send the empty title the store has before then.
  function save() {
    if (!form) return

    mutate(buildUpdatePayload(), {
        onSuccess: (saved) => {
          applySaved(saved.fields)
          toast.success("Draft saved")
        },
        onError: (error) =>
          toast.error(
            error instanceof ZodError
              ? (error.issues[0]?.message ?? "Some questions are incomplete.")
              : "Could not save the draft. Please try again."
          ),
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={save} disabled={!form || isPending}>
      {isPending ? <Spinner variant="throbber" className="size-4" /> : "Save draft"}
    </Button>
  )
}
