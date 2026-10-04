"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { HelpCircleIcon, LayoutBottomIcon } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from "@/components/kibo-ui/spinner"
import { EmptyState } from "@/components/common/empty-state"
import { FieldRenderer } from "@/components/app/form/field"
import { usePublicForm } from "@/lib/query/form"
import { FORM_FONTS, resolveFormFont } from "@/lib/form-fonts"
import type { AnswerValue } from "@/types/answer"
import type { FormField } from "@/types/field"

// The respondent's view is read at arm's length, so everything is larger than
// in the builder. The shared field components are sized from here rather than
// given a "large" mode, so the canvas preview keeps its compact look.
const READABLE = [
  // the question
  "[&_[data-slot=field-label]]:text-lg [&_[data-slot=field-label]]:font-medium",
  // its helper text
  "[&_[data-slot=field-description]]:text-sm",
  // option labels, and bigger radios and checkboxes with more air between them
  "[&_label:not([data-slot=field-label])]:text-base",
  "[&_[data-slot=radio-group-item]]:size-[18px] [&_[data-slot=checkbox]]:size-[18px]",
  "[&_[data-slot=radio-group]]:gap-3 [&_[data-slot=field-content]>div.flex-col]:gap-3",
  // text, number and date inputs, the dropdown, and long text
  "[&_input]:h-11 [&_input]:text-sm!",
  "[&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:text-sm",
  "[&_textarea]:min-h-11 [&_textarea]:text-sm!",
].join(" ")

function isEmpty(value: AnswerValue) {
  if (Array.isArray(value)) return value.length === 0
  return value === undefined || value.trim() === ""
}

// What a respondent sees. It reads the form from the public endpoint and keeps
// the answers in local state, keyed by field id. It deliberately does not use
// the builder's Zustand store: that one is for editing, this is for filling in.
export function PublicForm({ publicId }: { publicId: string }) {
  const { data: form, isPending, isError } = usePublicForm(publicId)
  const [answers, setAnswers] = React.useState<Record<number, AnswerValue>>({})
  const [errors, setErrors] = React.useState<Record<number, string>>({})

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner variant="throbber" className="size-5" />
      </div>
    )
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <EmptyState
          icon={HelpCircleIcon}
          title="Form not found"
          description="The link may be wrong, or the form is no longer available."
        />
      </div>
    )
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!form || form.preview) return

    // Required questions first; anything missing is marked and nothing is sent.
    const missing: Record<number, string> = {}
    for (const field of form.fields) {
      if (field.required && isEmpty(answers[field.id])) {
        missing[field.id] = "This question is required."
      }
    }
    setErrors(missing)
    if (Object.keys(missing).length > 0) return

    // TODO: POST the answers to the responses endpoint.
    toast.info("Sending answers is not connected yet.")
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      // The font the owner picked in the form settings. Controls inherit it.
      style={{ fontFamily: FORM_FONTS[resolveFormFont(form.settings?.fontFamily)].family }}
      className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-6 py-10"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium tracking-tight [overflow-wrap:anywhere]">
          {form.title || "Untitled form"}
        </h1>
        {form.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-line [overflow-wrap:anywhere]">
            {form.description}
          </p>
        )}
      </header>

      <div className={cn("flex flex-col gap-9", READABLE)}>
        {form.fields.map((field) => {
          // The public payload has no builder-only data; the renderer wants a
          // full FormField, so the missing pieces are filled with empty values.
          const renderable: FormField = { ...field, config: {} }

          return (
            <FieldRenderer
              key={field.id}
              field={renderable}
              value={answers[field.id]}
              onChange={(value) => {
                setAnswers((current) => ({ ...current, [field.id]: value }))
                setErrors((current) => {
                  if (!current[field.id]) return current
                  const { [field.id]: _cleared, ...rest } = current
                  return rest
                })
              }}
              error={errors[field.id]}
              className="gap-2.5"
            />
          )
        })}
      </div>

      <div>
        {/* The owner's preview of an unpublished form cannot be submitted, so
            it never ends up in their own responses. */}
        <Button
          type="submit"
          variant="brand"
          disabled={form.preview}
          title={form.preview ? "Submitting is switched off in preview" : undefined}
        >
          Submit form
        </Button>
      </div>

      <footer className="mt-auto flex justify-center pt-6">
        <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutBottomIcon fill="currentColor" className="size-3.5" />
          </span>
          Formly
        </a>
      </footer>
    </form>
  )
}
