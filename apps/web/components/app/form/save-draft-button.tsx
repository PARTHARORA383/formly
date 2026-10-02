"use client"

import { toast } from "sonner"
import { ZodError } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useForm, useUpdateForm } from "@/lib/query/form"
import useFields from "@/lib/zustand/form"

export function SaveDraftButton({ publicId }: { publicId: string }) {
  const { data: form } = useForm(publicId)
  const { mutate, isPending } = useUpdateForm(publicId)
  const applySaved = useFields((state) => state.applySaved)

  // The update endpoint needs the title, which the builder does not edit, so it
  // comes from the loaded form.
  function save() {
    if (!form) return

    const fields = useFields.getState().fields

    mutate(
      {
        title: form.title,
        description: form.description,
        // position follows the array order, so the server stores what is on screen.
        fields: fields.map((field, position) => ({ ...field, position })),
      },
      {
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
      }
    )
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={save} disabled={!form || isPending}>
      {isPending ? <Spinner variant="throbber" className="size-4" /> : "Save draft"}
    </Button>
  )
}
