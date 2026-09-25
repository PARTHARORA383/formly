"use client"

import Link from "next/link"
import { Spinner } from "@/components/kibo-ui/spinner"
import { useForms } from "@/lib/query/form"

export function FormList() {
  const { data: forms, isPending, isError } = useForms()

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Spinner variant="throbber" className="size-5" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Couldn&apos;t load your forms. Please try again.
      </p>
    )
  }

  if (forms.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No forms yet. Create your first one.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {forms.map((form) => (
        <Link
          key={form.publicId}
          href={`/forms/${form.publicId}`}
          className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{form.title}</div>
            {form.description && (
              <div className="truncate text-xs text-muted-foreground">
                {form.description}
              </div>
            )}
          </div>
          <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            {form.status}
          </span>
        </Link>
      ))}
    </div>
  )
}
