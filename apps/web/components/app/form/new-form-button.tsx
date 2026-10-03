"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useCreateForm } from "@/lib/query/form"
import { PlusIcon } from "@workspace/ui/icons"

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
          <PlusIcon className="size-[18px]" />
          New form
        </>
      )}
    </Button>
  )
}
