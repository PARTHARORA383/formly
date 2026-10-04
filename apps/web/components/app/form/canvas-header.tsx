"use client"

import { toast } from "sonner"
import { ZodError } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useForm, useUpdateForm } from "@/lib/query/form"
import type { UpdateFormInput } from "@/lib/zod/form"
import useFields from "@/lib/zustand/form"

// The row of actions above the canvas: Preview, Save draft and Publish. The
// form's title is edited in the Form tab of the settings panel. Everything that
// belongs to this row lives in this file; the pieces below are not used anywhere
// else.

// One place that turns the builder's state into the update request, so saving
// and publishing send exactly the same content.
function buildUpdatePayload(): UpdateFormInput {
  const { title, description, settings, fields } = useFields.getState()

  return {
    title: title.trim(),
    // Empty means no description, which the API stores as null.
    description: description.trim() || null,
    settings,
    // position follows the array order, so the server stores what is on screen.
    fields: fields.map((field, position) => ({ ...field, position })),
  }
}

// Zod errors carry a readable reason ("Every question needs a label"); anything
// else gets the fallback.
function errorMessage(error: unknown, fallback: string) {
  return error instanceof ZodError
    ? (error.issues[0]?.message ?? "Some questions are incomplete.")
    : fallback
}

// Opens the public page for this form in a new tab. The owner sees it as a
// preview even while it is unpublished. It shows the saved version, so unsaved
// edits only appear after a Save draft.
function PreviewButton({ publicId }: { publicId: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      title="Preview the saved form in a new tab"
      onClick={() => window.open(`/f/${publicId}`, "_blank", "noopener")}
    >
      Preview
    </Button>
  )
}

function SaveDraftButton({ publicId }: { publicId: string }) {
  const { data: form } = useForm(publicId)
  const { mutate, isPending } = useUpdateForm(publicId)
  const applySaved = useFields((state) => state.applySaved)

  // `form` only holds the button back until the form has loaded, so a save
  // can't send the empty title the store has before then.
  function save() {
    if (!form) return

    mutate(buildUpdatePayload(), {
      onSuccess: (saved) => {
        applySaved(saved.fields)
        toast.success("Draft saved")
      },
      onError: (error) => toast.error(errorMessage(error, "Could not save the draft. Please try again.")),
    })
  }

  return (
    <Button type="button" size="sm" variant="secondary" onClick={save} disabled={!form || isPending}>
      {isPending ? <Spinner variant="throbber" className="size-4" /> : "Save draft"}
    </Button>
  )
}

// Publishing is the normal update request with status set, so it also saves
// whatever is on screen: there is no state where the live form is out of step
// with what the owner just published. The same button takes it back down.
function PublishButton({ publicId }: { publicId: string }) {
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
        onError: (error) => toast.error(errorMessage(error, "Could not update the form. Please try again.")),
      }
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      // Always the brand button, so the one action that changes what the world
      // sees stands out in both states.
      variant="brand"
      onClick={toggle}
      disabled={!form || isPending}
    >
      {isPending ? <Spinner variant="throbber" className="size-4" /> : isPublished ? "Unpublish" : "Publish"}
    </Button>
  )
}

export function CanvasHeader({ publicId }: { publicId: string }) {
  return (
    // The same top padding and a 36px row as the settings panel's tab bar on the
    // right (pt-3, h-9 tabs), so the buttons sit level with the tabs.
    <div className="shrink-0 px-4 pt-3 pb-2">
      <div className="flex h-9 items-center justify-end gap-2">
        <PreviewButton publicId={publicId} />
        <SaveDraftButton publicId={publicId} />
        <PublishButton publicId={publicId} />
      </div>
    </div>
  )
}
