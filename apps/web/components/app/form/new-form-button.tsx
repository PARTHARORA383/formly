"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useCreateForm } from "@/lib/query/form"

export function NewFormButton() {
  const router = useRouter()
  const { mutate, isPending } = useCreateForm()

  function createForm() {
    mutate(
      { title: "Untitled form" },
      {
        // publicId comes back from the server — the client can't know it in
        // advance, so navigation happens after the response.
        onSuccess: (form) => router.push(`/forms/${form.publicId}`),
        onError: () => toast.error("Couldn't create the form. Please try again."),
      }
    )
  }

  return (
    <Button onClick={createForm} disabled={isPending}>
      {isPending ? (
        <Spinner variant="throbber" className="size-4" />
      ) : (
        <>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
          New form
        </>
      )}
    </Button>
  )
}
