"use client"

import { toast } from "sonner"
import { ZodError } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import { buildUpdatePayload } from "@/lib/form-payload"
import { useForm, useUpdateForm } from "@/lib/query/form"
import useFields from "@/lib/zustand/form"

// Publishing is the normal update request with status set, so it also saves
// whatever is on screen: there is no state where the live form is out of step
// with what the owner just published. The same button takes it back down.
export function PublishButton({ publicId }: { publicId: string }) {
  const { data: form } = useForm(publicId)
  const { mutate, isPending } = useUpdateForm(publicId)
  const applySaved = useFields((state) => state.applySaved)

  const isPublished = form?.status === "published"

  function copyLink() {
    navigator.clipboard
      .writeText(`${window.location.origin}/f/${publicId}`)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Could not copy the link."))
  }

  function toggle() {
    if (!form) return

    const payload = buildUpdatePayload()

    // Only publishing is guarded: a form with no title or no questions is not
    // worth sharing. Taking one down is always allowed.
    if (!isPublished) {
      if (!payload.title) {
        toast.error("Give the form a title before publishing.")
        return
      }
      if (payload.fields.length === 0) {
        toast.error("Add at least one question before publishing.")
        return
      }
    }

    mutate(
      { ...payload, status: isPublished ? "draft" : "published" },
      {
        onSuccess: (saved) => {
          applySaved(saved.fields)

          if (isPublished) {
            toast.success("Form unpublished")
          } else {
            toast.success("Form published", { action: { label: "Copy link", onClick: copyLink } })
          }
        },
        onError: (error) =>
          toast.error(
            error instanceof ZodError
              ? (error.issues[0]?.message ?? "Some questions are incomplete.")
              : "Could not update the form. Please try again."
          ),
      }
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={isPublished ? "outline" : "default"}
      onClick={toggle}
      disabled={!form || isPending}
    >
      {isPending ? <Spinner variant="throbber" className="size-4" /> : isPublished ? "Unpublish" : "Publish"}
    </Button>
  )
}
