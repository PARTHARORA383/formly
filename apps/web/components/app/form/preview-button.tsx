"use client"

import { Button } from "@workspace/ui/components/button"
import { EyeIcon } from "@workspace/ui/icons"

// Opens the public page for this form in a new tab. The owner sees it as a
// preview even while it is unpublished. It shows the saved version, so unsaved
// edits only appear after a Save draft.
export function PreviewButton({ publicId }: { publicId: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      title="Preview the saved form in a new tab"
      onClick={() => window.open(`/f/${publicId}`, "_blank", "noopener")}
    >
      <EyeIcon className="size-[18px]" />
      Preview
    </Button>
  )
}
